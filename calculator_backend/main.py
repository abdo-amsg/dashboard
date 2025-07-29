from fastapi import FastAPI, HTTPException, Depends, status, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator
import logging
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Union
from sqlalchemy.orm import Session
from sqlalchemy import text, select
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from contextlib import contextmanager
import asyncio
from functools import wraps
import traceback
from enum import Enum

from core.logging import setup_logger
from core.database import get_db
from core.database import KPI, KPIValue

# Configuration
class Config:
    DATABASE_RETRY_ATTEMPTS = 3
    DATABASE_RETRY_DELAY = 1.0
    MAX_KPI_BATCH_SIZE = 100
    DEFAULT_HISTORY_LIMIT = 10
    MAX_HISTORY_LIMIT = 1000
    DASHBOARD_SERVICE_URL = "http://backend:8000"

# Custom Exceptions
class KPIServiceError(Exception):
    """Base exception for KPI service"""
    def __init__(self, message: str, error_code: str = None):
        self.message = message
        self.error_code = error_code
        super().__init__(self.message)

class DatabaseError(KPIServiceError):
    """Database related errors"""
    pass

class CalculationError(KPIServiceError):
    """KPI calculation errors"""
    pass

class ValidationError(KPIServiceError):
    """Input validation errors"""
    pass

# Enums
class KPIType(str, Enum):
    COUNT = "count"
    AVERAGE = "average"
    LIST = "list"
    TREND = "trend"
    PERCENTAGE = "percentage"

# Pydantic Models
class KPIData(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    value: Union[str, Dict, List, int, float]
    description: Optional[str] = Field(None, max_length=500)
    type: KPIType
    unit: Optional[str] = Field(None, max_length=50)
    target: Optional[float] = None

    @field_validator('value')
    def validate_value(cls, v):
        if isinstance(v, (dict, list)):
            try:
                json.dumps(v)  # Ensure it's JSON serializable
            except (TypeError, ValueError):
                raise ValueError("Value must be JSON serializable")
        return v

class CalculationResponse(BaseModel):
    success: bool
    calculated_kpis: List[KPIData] = []
    message: str
    metadata: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.now)

class KPIHistoryResponse(BaseModel):
    success: bool
    kpi_name: str
    history: List[Dict[str, Any]]
    count: int
    metadata: Optional[Dict[str, Any]] = None

class LatestKPIsResponse(BaseModel):
    success: bool
    kpis: List[Dict[str, Any]]
    count: int
    last_updated: Optional[datetime] = None

class HealthResponse(BaseModel):
    status: str
    service: str
    timestamp: datetime
    version: str = "1.0.0"
    database_status: str = "unknown"

# Set up logging
logger = setup_logger(__name__, level=logging.DEBUG)

app = FastAPI(
    title="KPI Calculator Service",
    version="1.0.0",
    description="Enhanced KPI calculation and management service",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Error handlers
@app.exception_handler(KPIServiceError)
async def kpi_service_error_handler(request, exc: KPIServiceError):
    logger.error(f"KPI Service Error: {exc.message}", extra={"error_code": exc.error_code})
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "success": False,
            "message": exc.message,
            "error_code": exc.error_code,
            "timestamp": datetime.now().isoformat()
        }
    )

@app.exception_handler(DatabaseError)
async def database_error_handler(request, exc: DatabaseError):
    logger.error(f"Database Error: {exc.message}", extra={"error_code": exc.error_code})
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "Database operation failed",
            "error_code": exc.error_code or "DB_ERROR",
            "timestamp": datetime.now().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc: Exception):
    logger.error(f"Unexpected error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "An unexpected error occurred",
            "error_code": "INTERNAL_ERROR",
            "timestamp": datetime.now().isoformat()
        }
    )

# Utility functions
def retry_on_db_error(max_attempts: int = Config.DATABASE_RETRY_ATTEMPTS):
    """Decorator to retry database operations on failure"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_attempts):
                try:
                    return await func(*args, **kwargs)
                except SQLAlchemyError as e:
                    last_exception = e
                    if attempt < max_attempts - 1:
                        logger.warning(
                            f"Database operation failed (attempt {attempt + 1}/{max_attempts}): {str(e)}"
                        )
                        await asyncio.sleep(Config.DATABASE_RETRY_DELAY * (attempt + 1))
                    else:
                        logger.error(f"Database operation failed after {max_attempts} attempts")
                        raise DatabaseError(f"Database operation failed: {str(e)}", "DB_RETRY_EXHAUSTED")
                except Exception as e:
                    logger.error(f"Non-database error in database operation: {str(e)}")
                    raise
            
            if last_exception:
                raise DatabaseError(f"Database operation failed: {str(last_exception)}", "DB_OPERATION_FAILED")
        return wrapper
    return decorator

@contextmanager
def database_transaction(db: Session):
    """Context manager for database transactions with proper rollback"""
    try:
        yield db
        db.commit()
        logger.debug("Database transaction committed successfully")
    except Exception as e:
        db.rollback()
        logger.error(f"Database transaction rolled back due to error: {str(e)}")
        raise DatabaseError(f"Transaction failed: {str(e)}", "TRANSACTION_FAILED")

def validate_kpi_data(kpi_data: Dict[str, Any]) -> KPIData:
    """Validate and parse KPI data"""
    try:
        return KPIData(**kpi_data)
    except Exception as e:
        raise ValidationError(f"Invalid KPI data: {str(e)}", "VALIDATION_FAILED")

# Database operations
@retry_on_db_error()
async def store_kpis_batch(db: Session, calculated_kpis: List[KPIData]) -> int:
    """Store KPIs in batch with improved error handling"""
    
    if not calculated_kpis:
        logger.warning("No KPIs provided for batch storage")
        return 0
    
    if len(calculated_kpis) > Config.MAX_KPI_BATCH_SIZE:
        raise ValidationError(
            f"Batch size {len(calculated_kpis)} exceeds maximum {Config.MAX_KPI_BATCH_SIZE}",
            "BATCH_SIZE_EXCEEDED"
        )
    
    try:
        with database_transaction(db):
            # 1. Fetch KPI IDs in one query
            names = [kpi.name for kpi in calculated_kpis]
            rows = db.execute(
                select(KPI.name, KPI.id).where(KPI.name.in_(names))
            ).all()
            kpi_id_map = {name: id for name, id in rows}
            
            # Check for missing KPIs
            missing_kpis = set(names) - set(kpi_id_map.keys())
            if missing_kpis:
                logger.warning(f"Missing KPIs in database: {missing_kpis}")
            
            # 2. Build list of mappings
            now = datetime.now()
            records = []
            
            for kpi in calculated_kpis:
                kpi_id = kpi_id_map.get(kpi.name)
                if not kpi_id:
                    logger.warning(f"Skipping unknown KPI: {kpi.name}")
                    continue
                
                # Serialize value if it's not already a string
                value_str = kpi.value if isinstance(kpi.value, str) else json.dumps(kpi.value)
                
                records.append({
                    "kpi_id": kpi_id,
                    "value": value_str,
                    "timestamp": now,
                })
            
            if not records:
                logger.warning("No valid KPI records to store")
                return 0
            
            # 3. Bulk-insert with error handling
            try:
                db.bulk_insert_mappings(KPIValue, records)
                logger.info(f"Successfully prepared {len(records)} KPI records for storage")
            except IntegrityError as e:
                raise DatabaseError(f"Data integrity error during bulk insert: {str(e)}", "INTEGRITY_ERROR")
            except Exception as e:
                raise DatabaseError(f"Bulk insert failed: {str(e)}", "BULK_INSERT_FAILED")
            
            return len(records)
            
    except DatabaseError:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in store_kpis_batch: {str(e)}")
        raise DatabaseError(f"Batch storage failed: {str(e)}", "BATCH_STORAGE_FAILED")

@retry_on_db_error()
async def execute_kpi_query(db: Session, query: str, description: str) -> Any:
    """Execute a KPI calculation query with error handling"""
    try:
        logger.debug(f"Executing KPI query: {description}")
        result = db.execute(text(query))
        return result
    except SQLAlchemyError as e:
        logger.error(f"SQL error in {description}: {str(e)}")
        raise DatabaseError(f"Query execution failed for {description}: {str(e)}", "QUERY_FAILED")
    except Exception as e:
        logger.error(f"Unexpected error in {description}: {str(e)}")
        raise CalculationError(f"KPI calculation failed for {description}: {str(e)}", "CALCULATION_FAILED")

# KPI calculation functions
async def calculate_total_incidents(db: Session) -> Optional[KPIData]:
    """Calculate total incidents KPI"""
    try:
        result = await execute_kpi_query(
            db, 
            "SELECT public.get_total_incidents()", 
            "total incidents calculation"
        )
        total_incidents = result.scalar()
        
        if total_incidents is not None:
            return KPIData(
                name="Number of Incidents",
                value={"value": int(total_incidents)},
                description="Total number of high severity or critical incidents",
                type=KPIType.COUNT,
                unit="incidents"
            )
    except Exception as e:
        logger.error(f"Failed to calculate total incidents: {str(e)}")
        raise CalculationError(f"Total incidents calculation failed: {str(e)}", "INCIDENTS_CALC_FAILED")
    
    return None

async def calculate_average_cvss(db: Session) -> Optional[KPIData]:
    """Calculate average CVSS score KPI"""
    try:
        result = await execute_kpi_query(
            db,
            "SELECT public.get_average_cvss_score()",
            "average CVSS score calculation"
        )
        avg_cvss = result.scalar()
        
        if avg_cvss is not None:
            return KPIData(
                name="Average CVSS Score",
                value={"value": round(float(avg_cvss), 2)},
                description="Average CVSS base score across all vulnerabilities",
                type=KPIType.AVERAGE,
                unit="score",
                target=4.0  # Example target
            )
    except Exception as e:
        logger.error(f"Failed to calculate average CVSS: {str(e)}")
        raise CalculationError(f"Average CVSS calculation failed: {str(e)}", "CVSS_CALC_FAILED")
    
    return None

async def calculate_top_attack_types(db: Session, limit: int = 5) -> Optional[KPIData]:
    """Calculate top attack types KPI"""
    try:
        result = await execute_kpi_query(
            db,
            f"SELECT * FROM public.get_top_n_attack_types({limit})",
            "top attack types calculation"
        )
        attack_types_raw = result.fetchall()
        
        if attack_types_raw:
            attack_types = [
                {"name": row[0], "count": row[1]} 
                for row in attack_types_raw 
                if row[0] is not None and row[1] is not None
            ]
            
            if attack_types:
                return KPIData(
                    name="Top Attack Types",
                    value=attack_types,
                    description=f"Distribution of top {limit} attack types",
                    type=KPIType.LIST,
                    unit="types"
                )
    except Exception as e:
        logger.error(f"Failed to calculate top attack types: {str(e)}")
        raise CalculationError(f"Top attack types calculation failed: {str(e)}", "ATTACK_TYPES_CALC_FAILED")
    
    return None

async def calculate_top_vulnerabilities(db: Session, limit: int = 5) -> Optional[KPIData]:
    """Calculate top vulnerabilities KPI"""
    try:
        result = await execute_kpi_query(
            db,
            f"SELECT * FROM public.get_top_n_vulnerabilities({limit})",
            "top vulnerabilities calculation"
        )
        vulnerabilities_raw = result.fetchall()
        
        if vulnerabilities_raw:
            vulnerabilities = [
                {"name": row[0], "count": row[1]} 
                for row in vulnerabilities_raw 
                if row[0] is not None and row[1] is not None
            ]
            
            if vulnerabilities:
                return KPIData(
                    name="Top Vulnerabilities",
                    value=vulnerabilities,
                    description="Most common vulnerabilities detected",
                    type=KPIType.LIST,
                    unit="vulnerabilities"
                )
    except Exception as e:
        logger.error(f"Failed to calculate top vulnerabilities: {str(e)}")
        raise CalculationError(f"Top vulnerabilities calculation failed: {str(e)}", "VULNERABILITIES_CALC_FAILED")
    
    return None

async def calculate_average_detection_rule_performance(db: Session) -> Optional[KPIData]:
    """Calculate average detection rule performance KPI"""
    try:
        result = await execute_kpi_query(
            db,
            "SELECT public.get_average_detection_rule_performance()",
            "average detection rule performance calculation"
        )
        avg_performance = result.scalar()
        
        if avg_performance is not None:
            return KPIData(
                name="Detection Rule Performance",
                value={"value": round(float(avg_performance), 2)},
                description="Average performance percentage of detection rules",
                type=KPIType.AVERAGE,
                unit="percentage"
            )
    except Exception as e:
        logger.error(f"Failed to calculate average detection rule performance: {str(e)}")
        raise CalculationError(f"Average detection rule performance calculation failed: {str(e)}", "RULE_PERFORMANCE_CALC_FAILED")
    
    return None

async def calculate_detection_rule_performance(db: Session) -> Optional[KPIData]:
    """Calculate detection rule performance KPI"""
    try:
        result = await execute_kpi_query(
            db,
            "SELECT * FROM public.get_detection_rule_performance()",
            "detection rule performance calculation"
        )
        rule_performance_raw = result.fetchall()
        
        if rule_performance_raw:
            rule_performance = [
                {
                    "rule_name": row[0], 
                    "performance_percentage": float(row[1])
                } 
                for row in rule_performance_raw 
                if row[0] is not None and row[1] is not None
            ]
            
            if rule_performance:
                return KPIData(
                    name="Detection Rule Performance Trend",
                    value=rule_performance,
                    description="Performance percentage of detection rules ordered from lowest to highest",
                    type=KPIType.LIST,
                    unit="percentage"
                )
    except Exception as e:
        logger.error(f"Failed to calculate detection rule performance: {str(e)}")
        raise CalculationError(f"Detection rule performance calculation failed: {str(e)}", "RULE_PERFORMANCE_CALC_FAILED")
    
    return None

async def calculate_top_malware_types(db: Session, limit: int = 5) -> Optional[KPIData]:
    """Calculate top malware types KPI"""
    try:
        result = await execute_kpi_query(
            db,
            f"SELECT * FROM public.get_top_n_malware_type({limit})",
            "top malware types calculation"
        )
        malware_raw = result.fetchall()
        
        if malware_raw:
            malware_types = [
                {"name": row[0], "count": row[1]} 
                for row in malware_raw 
                if row[0] is not None and row[1] is not None
            ]
            
            if malware_types:
                return KPIData(
                    name="Top Malware Types",
                    value=malware_types,
                    description="Most common malware types detected",
                    type=KPIType.LIST,
                    unit="types"
                )
    except Exception as e:
        logger.error(f"Failed to calculate top malware types: {str(e)}")
        raise CalculationError(f"Top malware types calculation failed: {str(e)}", "MALWARE_CALC_FAILED")
    
    return None

async def calculate_quarantine_actions(db: Session) -> Optional[KPIData]:
    """Calculate successful quarantine actions KPI"""
    try:
        result = await execute_kpi_query(
            db,
            "SELECT public.get_successful_quarantine()",
            "quarantine actions calculation"
        )
        quarantine_count = result.scalar()
        
        if quarantine_count is not None:
            return KPIData(
                name="Successful Quarantine Actions",
                value={"value": int(quarantine_count)},
                description="Number of successfully quarantined threats",
                type=KPIType.COUNT,
                unit="actions"
            )
    except Exception as e:
        logger.error(f"Failed to calculate quarantine actions: {str(e)}")
        raise CalculationError(f"Quarantine actions calculation failed: {str(e)}", "QUARANTINE_CALC_FAILED")
    
    return None

async def calculate_cvss_trends(db: Session) -> Optional[KPIData]:
    """Calculate CVSS score trends KPI"""
    try:
        result = await execute_kpi_query(
            db,
            "SELECT * FROM public.get_average_cvss_score_trends()",
            "CVSS trends calculation"
        )
        cvss_trends_raw = result.fetchall()
        
        if cvss_trends_raw:
            cvss_trends = [
                {
                    "date": row[0].strftime("%Y-%m-%d"), 
                    "score": round(float(row[1]), 2)
                } 
                for row in cvss_trends_raw 
                if row[0] is not None and row[1] is not None
            ]
            
            if cvss_trends:
                return KPIData(
                    name="Average CVSS Score Trend",
                    value=cvss_trends,
                    description="Monthly average CVSS scores trend",
                    type=KPIType.TREND,
                    unit="score"
                )
    except Exception as e:
        logger.error(f"Failed to calculate CVSS trends: {str(e)}")
        raise CalculationError(f"CVSS trends calculation failed: {str(e)}", "CVSS_TRENDS_CALC_FAILED")
    
    return None

async def calculate_cvss_score_trends(db: Session) -> Optional[KPIData]:
    """Calculate CVSS score trends KPI"""
    try:
        result = await execute_kpi_query(
            db,
            "SELECT * FROM public.get_average_cvss_score_trends()",
            "CVSS trends calculation"
        )
        cvss_trends_raw = result.fetchall()
        
        if cvss_trends_raw:
            cvss_trends = [
                {
                    "date": row[0].strftime("%Y-%m-%d"), 
                    "score": round(float(row[1]), 2)
                } 
                for row in cvss_trends_raw 
                if row[0] is not None and row[1] is not None
            ]
            
            if cvss_trends:
                return  KPIData(
                    name="CVSS Base Score Trend",
                    value=cvss_trends,
                    description="Monthly average CVSS scores trend",
                    type=KPIType.TREND,
                    unit="score"
                )
    except Exception as e:
        logger.error(f"Failed to calculate CVSS trends: {str(e)}")
        raise CalculationError(f"CVSS trends calculation failed: {str(e)}", "CVSS_TRENDS_CALC_FAILED")
    
    return None

async def calculate_incident_trends(db: Session) -> Optional[KPIData]:
    """Calculate incident trends KPI"""
    try:
        result = await execute_kpi_query(
            db,
            "SELECT * FROM public.get_incident_trends()",
            "incident trends calculation"
        )
        incident_trends_raw = result.fetchall()
        
        if incident_trends_raw:
            incident_trends = [
                {
                    "date": row[0].strftime("%Y-%m-%d"), 
                    "count": int(row[1])
                } 
                for row in incident_trends_raw 
                if row[0] is not None and row[1] is not None
            ]
            
            if incident_trends:
                return KPIData(
                    name="Incident Trend",
                    value=incident_trends,
                    description="Monthly incident count trends",
                    type=KPIType.TREND,
                    unit="incidents"
                )
    except Exception as e:
        logger.error(f"Failed to calculate incident trends: {str(e)}")
        raise CalculationError(f"Incident trends calculation failed: {str(e)}", "INCIDENT_TRENDS_CALC_FAILED")
    
    return None

async def calculate_all_kpis(db: Session) -> List[KPIData]:
    """Calculate all KPIs with improved error handling"""
    calculated_kpis = []
    calculation_functions = [
        calculate_total_incidents,
        calculate_average_cvss,
        calculate_top_attack_types,
        calculate_top_vulnerabilities,
        calculate_top_malware_types,
        calculate_quarantine_actions,
        calculate_cvss_trends,
        calculate_cvss_score_trends,
        calculate_incident_trends,
        calculate_average_detection_rule_performance,
        calculate_detection_rule_performance,
    ]
    
    errors = []
    
    for calc_func in calculation_functions:
        try:
            kpi_data = await calc_func(db)
            print("********************** kpi data : \n",kpi_data)
            if kpi_data:
                calculated_kpis.append(kpi_data)
                logger.debug(f"Successfully calculated KPI: {kpi_data.name}")
        except Exception as e:
            error_msg = f"Failed to calculate KPI using {calc_func.__name__}: {str(e)}"
            errors.append(error_msg)
            logger.error(error_msg, exc_info=True)
            # Continue with other calculations instead of failing completely
    
    if errors and not calculated_kpis:
        # All calculations failed
        raise CalculationError(
            f"All KPI calculations failed: {'; '.join(errors)}", 
            "ALL_CALCULATIONS_FAILED"
        )
    elif errors:
        # Some calculations failed but we have results
        logger.warning(f"Some KPI calculations failed: {'; '.join(errors)}")
    
    logger.info(f"Successfully calculated {len(calculated_kpis)} KPIs")
    return calculated_kpis

# API endpoints
@app.post("/calculate", response_model=CalculationResponse)
async def calculate(db: Session = Depends(get_db)):
    """Calculate KPIs from processed findings with enhanced error handling"""
    start_time = datetime.now()
    
    try:
        logger.info("Starting KPI calculation...")
        
        # Calculate KPIs
        calculated_kpis = await calculate_all_kpis(db)
        
        if not calculated_kpis:
            logger.warning("No KPIs were calculated")
            return CalculationResponse(
                success=False,
                calculated_kpis=[],
                message="No KPIs could be calculated - insufficient data or all calculations failed",
                metadata={"calculation_time": str(datetime.now() - start_time)}
            )

        # Store KPI values in the database
        try:
            logger.info(f"Storing {len(calculated_kpis)} calculated KPIs to database...")
            stored_count = await store_kpis_batch(db, calculated_kpis)
            logger.info(f"Successfully stored {stored_count} KPI values to database")
        except Exception as e:
            logger.error(f"Error storing KPI values: {str(e)}")
            # Return calculation results even if storage fails
            return CalculationResponse(
                success=False,
                calculated_kpis=calculated_kpis,
                message=f"KPIs calculated but storage failed: {str(e)}",
                metadata={
                    "calculation_time": str(datetime.now() - start_time),
                    "storage_error": str(e)
                }
            )

        calculation_time = datetime.now() - start_time
        return CalculationResponse(
            success=True,
            calculated_kpis=calculated_kpis,
            message=f"Successfully calculated and stored {stored_count} KPIs",
            metadata={
                "calculation_time": str(calculation_time),
                "stored_count": stored_count,
                "calculated_count": len(calculated_kpis)
            }
        )

    except (DatabaseError, CalculationError, ValidationError):
        # Re-raise known exceptions to be handled by exception handlers
        raise
    except Exception as e:
        logger.error(f"Unexpected error in calculation endpoint: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Calculation service error: {str(e)}"
        )

@app.get("/kpis/latest", response_model=LatestKPIsResponse)
async def get_latest_kpis(db: Session = Depends(get_db)):
    """Get the latest calculated KPI values with enhanced error handling"""
    try:
        logger.debug("Fetching latest KPI values...")
        
        # Get all KPIs with their latest values
        try:
            result = db.execute(text("""
                SELECT k.name, k.description, kv.value, kv.timestamp, k.unit, k.target
                FROM kpis k
                LEFT JOIN LATERAL (
                    SELECT kv2.value, kv2.timestamp
                    FROM kpi_values kv2
                    WHERE kv2.kpi_id = k.id
                    ORDER BY kv2.timestamp DESC
                    LIMIT 1
                ) kv ON true
                ORDER BY k.name
            """)).fetchall()
        except SQLAlchemyError as e:
            logger.error(f"Database error fetching latest KPIs: {str(e)}")
            raise DatabaseError(f"Failed to fetch latest KPIs: {str(e)}", "LATEST_KPIS_FETCH_FAILED")
        
        kpis = []
        last_updated = None
        
        for row in result:
            timestamp = row[3]
            if timestamp and (not last_updated or timestamp > last_updated):
                last_updated = timestamp
                
            kpi_data = {
                "name": row[0],
                "description": row[1],
                "value": row[2],
                "timestamp": timestamp.isoformat() if timestamp else None,
                "unit": row[4],
                "target": row[5]
            }
            kpis.append(kpi_data)
        
        logger.info(f"Successfully fetched {len(kpis)} latest KPI values")
        
        return LatestKPIsResponse(
            success=True,
            kpis=kpis,
            count=len(kpis),
            last_updated=last_updated
        )
        
    except (DatabaseError, CalculationError):
        raise
    except Exception as e:
        logger.error(f"Error fetching latest KPIs: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch latest KPIs: {str(e)}"
        )

@app.get("/kpis/{kpi_name}/history", response_model=KPIHistoryResponse)
async def get_kpi_history(
    kpi_name: str, 
    limit: int = Query(Config.DEFAULT_HISTORY_LIMIT, ge=1, le=Config.MAX_HISTORY_LIMIT, description="Number of historical records to retrieve"),
    db: Session = Depends(get_db)
):
    """Get historical values for a specific KPI with enhanced validation"""
    
    if not kpi_name or len(kpi_name.strip()) == 0:
        raise ValidationError("KPI name cannot be empty", "INVALID_KPI_NAME")
    
    kpi_name = kpi_name.strip()
    
    try:
        logger.debug(f"Fetching history for KPI: {kpi_name} (limit: {limit})")
        
        # Execute query with parameters
        try:
            rows = db.execute(text("""
                SELECT kv.value, kv.timestamp
                FROM kpi_values kv
                JOIN kpis k ON kv.kpi_id = k.id
                WHERE k.name = :kpi_name
                ORDER BY kv.timestamp DESC
                LIMIT :limit
            """), {"kpi_name": kpi_name, "limit": limit}).fetchall()
        except SQLAlchemyError as e:
            logger.error(f"Database error fetching KPI history for {kpi_name}: {str(e)}")
            raise DatabaseError(f"Failed to fetch KPI history: {str(e)}", "KPI_HISTORY_FETCH_FAILED")
        
        history = []
        for row in rows:
            history.append({
                "value": row[0],
                "timestamp": row[1].isoformat()
            })
        
        logger.info(f"Successfully fetched {len(history)} history records for KPI: {kpi_name}")
        
        return KPIHistoryResponse(
            success=True,
            kpi_name=kpi_name,
            history=history,
            count=len(history),
            metadata={"limit_used": limit}
        )
        
    except (DatabaseError, CalculationError):
        raise
    except Exception as e:
        logger.error(f"Error fetching KPI history for {kpi_name}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch KPI history: {str(e)}"
        )

@app.get("/health", response_model=HealthResponse)
async def health_check(db: Session = Depends(get_db)):
    """Enhanced health check endpoint"""
    timestamp = datetime.now()
    
    # Check database connectivity
    database_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
        logger.debug("Database health check passed")
    except Exception as e:
        database_status = "unhealthy"
        logger.error(f"Database health check failed: {str(e)}")
    
    return HealthResponse(
        status="healthy" if database_status == "healthy" else "degraded",
        service="calculator_backend",
        timestamp=timestamp,
        database_status=database_status
    )

@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "service": "KPI Calculator Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "calculate": "/calculate",
            "latest_kpis": "/kpis/latest",
            "kpi_history": "/kpis/{kpi_name}/history",
            "health": "/health",
            "docs": "/docs"
        },
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    
    # Configure uvicorn logging
    log_config = uvicorn.config.LOGGING_CONFIG
    log_config["formatters"]["default"]["fmt"] = "%(asctime)s [%(name)s] %(levelprefix)s %(message)s"
    log_config["formatters"]["access"]["fmt"] = '%(asctime)s [%(name)s] %(levelprefix)s %(client_addr)s - "%(request_line)s" %(status_code)s'
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8002,
        log_config=log_config,
        access_log=True
    )