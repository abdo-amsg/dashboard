# inwi3.py
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Depends
import pandas as pd
import io
from datetime import datetime
from typing import Dict, Any
import logging
from app.auth.auth_routes import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)

class Inwi3StrategicAnalyzer:
    def __init__(self):
        self.report_types = {
            'strategic_risk_posture': self.analyze_risk_posture,
            'financial_impact_costs': self.analyze_financial_costs,
            'financial_impact_avoided': self.analyze_financial_avoided,
            'regulatory_compliance': self.analyze_compliance,
            'security_program': self.analyze_security_program,
            'incident_resolution': self.analyze_incident_resolution,
            'benchmark_sector': self.analyze_benchmark,
            'threat_landscape': self.analyze_threats,
            'exposure_risk': self.analyze_exposure,
            'strategic_alignment': self.analyze_alignment
        }

    # Helper: safe parse
    def _to_num(self, s):
        try:
            return pd.to_numeric(s, errors='coerce')
        except:
            return pd.Series(dtype='float64')

    # === Analyseurs (intacts) ===
    def analyze_risk_posture(self, df: pd.DataFrame) -> Dict[str, Any]:
        try:
            # Safely handle missing columns and convert numeric criticality to text
            if 'asset_criticality' not in df.columns:
                df['asset_criticality'] = 'Medium'
            else:
                # Convert numeric criticality to text categories
                df['asset_criticality'] = df['asset_criticality'].fillna(3)
                df['asset_criticality'] = pd.to_numeric(df['asset_criticality'], errors='coerce').fillna(3)
                df['asset_criticality'] = df['asset_criticality'].map({
                    5: 'High',
                    4: 'Medium-High', 
                    3: 'Medium',
                    2: 'Low-Medium',
                    1: 'Low'
                }).fillna('Medium').astype(str)
            
            if 'incident_count' not in df.columns:
                df['incident_count'] = 0
            else:
                df['incident_count'] = pd.to_numeric(df['incident_count'], errors='coerce').fillna(0)
            
            if 'vuln_severity' not in df.columns:
                df['vuln_severity'] = 0
            else:
                df['vuln_severity'] = pd.to_numeric(df['vuln_severity'], errors='coerce').fillna(0)
            
            if 'score_risk' not in df.columns:
                df['score_risk'] = 0
            else:
                df['score_risk'] = pd.to_numeric(df['score_risk'], errors='coerce').fillna(0)
            
            if 'patch_status' not in df.columns:
                df['patch_status'] = 'unknown'
            else:
                df['patch_status'] = df['patch_status'].fillna('unknown').astype(str)

            avg_risk_score = float(df['score_risk'].mean()) if len(df) else 0.0
            assets_high_critical = int((df['asset_criticality'].isin(['High', 'Medium-High'])).sum())
            avg_vuln_severity = float(df['vuln_severity'].mean()) if len(df) else 0.0
            incidents_total = int(df['incident_count'].sum())

            patched = df['patch_status'].str.lower().isin(['patched', 'up-to-date']).sum()
            total_assets = len(df)
            patch_coverage_pct = (patched / total_assets * 100) if total_assets > 0 else 0.0

            by_criticality = df['asset_criticality'].value_counts(dropna=False).to_dict()
            
            # Handle missing columns for charts
            if 'asset_id' in df.columns:
                top_risky_assets = df.sort_values('score_risk', ascending=False).head(10)[['asset_id', 'score_risk']].to_dict('records')
                top_risky_dict = {r['asset_id']: r['score_risk'] for r in top_risky_assets}
            else:
                top_risky_dict = {'Unknown': avg_risk_score}

            return {
                'kpis': {
                    'avg_risk_score': round(avg_risk_score, 1),
                    'assets_high_critical': assets_high_critical,
                    'avg_vuln_severity': round(avg_vuln_severity, 1),
                    'incidents_total': incidents_total,
                    'patch_coverage_pct': f"{patch_coverage_pct:.1f}%"
                },
                'charts': {
                    'assets_by_criticality': by_criticality,
                    'top_risky_assets': top_risky_dict
                }
            }
        except Exception as e:
            return {'error': f'Error analyzing risk posture: {str(e)}'}

    def analyze_financial_costs(self, df: pd.DataFrame) -> Dict[str, Any]:
        try:
            # Safely handle missing columns
            if 'duration_hours' not in df.columns:
                df['duration_hours'] = 0
            else:
                df['duration_hours'] = pd.to_numeric(df['duration_hours'], errors='coerce').fillna(0)
            
            if 'total_cost' not in df.columns:
                df['total_cost'] = 0
            else:
                df['total_cost'] = pd.to_numeric(df['total_cost'], errors='coerce').fillna(0)
            
            if 'cost_per_hour' not in df.columns:
                df['cost_per_hour'] = 0
            else:
                df['cost_per_hour'] = pd.to_numeric(df['cost_per_hour'], errors='coerce').fillna(0)

            total_incidents = len(df)
            overall_cost = float(df['total_cost'].sum())
            avg_cost = float(df['total_cost'].mean()) if total_incidents > 0 else 0.0
            median_cost = float(df['total_cost'].median()) if total_incidents > 0 else 0.0
            
            # Handle missing columns for charts
            if 'incident_id' in df.columns:
                top_cost_incidents = df.sort_values('total_cost', ascending=False).head(5)[['incident_id', 'total_cost']].to_dict('records')
            else:
                top_cost_incidents = []
            
            if 'business_unit' in df.columns:
                cost_by_unit = df.groupby('business_unit')['total_cost'].sum().to_dict()
            else:
                cost_by_unit = {'Unknown': overall_cost}

            return {
                'kpis': {
                    'total_incidents': int(total_incidents),
                    'overall_cost': f"{overall_cost:.2f}",
                    'avg_cost': f"{avg_cost:.2f}",
                    'median_cost': f"{median_cost:.2f}"
                },
                'charts': {
                    'top_cost_incidents': {r['incident_id']: r['total_cost'] for r in top_cost_incidents},
                    'cost_by_business_unit': cost_by_unit
                }
            }
        except Exception as e:
            return {'error': f'Error analyzing financial costs: {str(e)}'}

    def analyze_financial_avoided(self, df: pd.DataFrame) -> Dict[str, Any]:
        try:
            # Safely handle missing columns
            if 'loss_expected' not in df.columns:
                df['loss_expected'] = 0
            else:
                df['loss_expected'] = pd.to_numeric(df['loss_expected'], errors='coerce').fillna(0)
            
            if 'loss_avoided' not in df.columns:
                df['loss_avoided'] = 0
            else:
                df['loss_avoided'] = pd.to_numeric(df['loss_avoided'], errors='coerce').fillna(0)
            total_expected = float(df['loss_expected'].sum())
            total_avoided = float(df['loss_avoided'].sum())
            effectiveness = (total_avoided / total_expected * 100) if total_expected > 0 else 0.0
            
            # Handle missing columns for charts
            if 'threat_type' in df.columns:
                by_threat = df.groupby('threat_type')['loss_avoided'].sum().to_dict()
            else:
                by_threat = {'Unknown': total_avoided}

            return {
                'kpis': {
                    'total_expected_loss': f"{total_expected:.2f}",
                    'total_avoided_loss': f"{total_avoided:.2f}",
                    'mitigation_effectiveness_pct': f"{effectiveness:.1f}%"
                },
                'charts': {
                    'avoided_by_threat': by_threat
                }
            }
        except Exception as e:
            return {'error': f'Error analyzing avoided losses: {str(e)}'}

    def analyze_compliance(self, df: pd.DataFrame) -> Dict[str, Any]:
        try:
            # Handle different column names for status
            status_col = None
            if 'status' in df.columns:
                status_col = 'status'
            elif 'remediation_status' in df.columns:
                status_col = 'remediation_status'
            elif 'compliance_status' in df.columns:
                status_col = 'compliance_status'
            
            if status_col:
                df['status'] = df[status_col].fillna('unknown').astype(str).str.lower()
            else:
                df['status'] = 'unknown'
                
            total_controls = len(df)
            compliant = int((df['status'].isin(['completed', 'compliant', 'passed'])).sum())
            non_compliant = int((df['status'].isin(['non-compliant', 'failed', 'planning'])).sum())
            in_progress = int((df['status'].isin(['in progress', 'ongoing'])).sum())
            unknown = total_controls - compliant - non_compliant - in_progress
            compliance_pct = (compliant / total_controls * 100) if total_controls > 0 else 0.0
            
            # Handle missing columns for charts
            if 'regulation' in df.columns:
                by_framework = df.groupby('regulation')['status'].apply(lambda s: s.value_counts().to_dict()).to_dict()
            elif 'framework' in df.columns:
                by_framework = df.groupby('framework')['status'].apply(lambda s: s.value_counts().to_dict()).to_dict()
            else:
                by_framework = {'Unknown': {'compliant': compliant, 'non-compliant': non_compliant, 'in_progress': in_progress, 'unknown': unknown}}

            return {
                'kpis': {
                    'total_controls': total_controls,
                    'compliant_controls': compliant,
                    'non_compliant_controls': non_compliant,
                    'compliance_pct': f"{compliance_pct:.1f}%"
                },
                'charts': {
                    'status_by_framework': by_framework
                }
            }
        except Exception as e:
            return {'error': f'Error analyzing compliance: {str(e)}'}

    def analyze_security_program(self, df: pd.DataFrame) -> Dict[str, Any]:
        try:
            # Handle different column names for maturity score
            if 'maturity_score' in df.columns:
                df['maturity_score'] = pd.to_numeric(df['maturity_score'], errors='coerce').fillna(0)
            elif 'current_maturity' in df.columns:
                df['maturity_score'] = pd.to_numeric(df['current_maturity'], errors='coerce').fillna(0)
            else:
                df['maturity_score'] = 0
            
            # Handle different column names for budget
            if 'budget_planned' in df.columns:
                df['budget_planned'] = pd.to_numeric(df['budget_planned'], errors='coerce').fillna(0)
            elif 'investment_required' in df.columns:
                df['budget_planned'] = pd.to_numeric(df['investment_required'], errors='coerce').fillna(0)
            else:
                df['budget_planned'] = 0
            
            # Calculate budget used from progress percentage
            if 'budget_used' in df.columns:
                df['budget_used'] = pd.to_numeric(df['budget_used'], errors='coerce').fillna(0)
            elif 'progress_percentage' in df.columns:
                progress = pd.to_numeric(df['progress_percentage'], errors='coerce').fillna(0) / 100
                df['budget_used'] = df['budget_planned'] * progress
            else:
                df['budget_used'] = 0
            total_domains = len(df)
            avg_maturity = float(df['maturity_score'].mean()) if total_domains > 0 else 0.0
            total_budget_planned = float(df['budget_planned'].sum())
            total_budget_used = float(df['budget_used'].sum())
            budget_util_pct = (total_budget_used / total_budget_planned * 100) if total_budget_planned > 0 else 0.0

            return {
                'kpis': {
                    'avg_maturity_score': round(avg_maturity, 1),
                    'total_budget_planned': f"{total_budget_planned:.2f}",
                    'total_budget_used': f"{total_budget_used:.2f}",
                    'budget_utilization_pct': f"{budget_util_pct:.1f}%"
                },
                'charts': {
                    'maturity_by_domain': df.set_index('domain')['maturity_score'].to_dict() if 'domain' in df.columns else {'Unknown': avg_maturity}
                }
            }
        except Exception as e:
            return {'error': f'Error analyzing security program: {str(e)}'}

    def analyze_incident_resolution(self, df: pd.DataFrame) -> Dict[str, Any]:
        try:
            # Handle different column formats for time data
            if 'detection_time_hours' in df.columns and 'resolution_time_hours' in df.columns:
                # Direct time columns (COMEX format)
                df['time_to_detect_hours'] = pd.to_numeric(df['detection_time_hours'], errors='coerce').fillna(0)
                df['time_to_resolve_hours'] = pd.to_numeric(df['resolution_time_hours'], errors='coerce').fillna(0)
            else:
                # Calculate from timestamps (legacy format)
                if 'created_at' in df.columns:
                    df['created_at'] = pd.to_datetime(df['created_at'], errors='coerce')
                else:
                    df['created_at'] = pd.NaT
                
                if 'detected_at' in df.columns:
                    df['detected_at'] = pd.to_datetime(df['detected_at'], errors='coerce')
                else:
                    df['detected_at'] = pd.NaT
                
                if 'resolved_at' in df.columns:
                    df['resolved_at'] = pd.to_datetime(df['resolved_at'], errors='coerce')
                else:
                    df['resolved_at'] = pd.NaT
                
                df['time_to_detect_hours'] = (df['detected_at'] - df['created_at']).dt.total_seconds() / 3600
                df['time_to_resolve_hours'] = (df['resolved_at'] - df['detected_at']).dt.total_seconds() / 3600

            avg_ttd = float(df['time_to_detect_hours'].mean()) if len(df) > 0 else 0.0
            avg_ttr = float(df['time_to_resolve_hours'].mean()) if len(df) > 0 else 0.0
            
            # Handle missing status column
            if 'status' in df.columns:
                unresolved = int(df['status'].str.lower().isin(['open', 'in_progress', 'pending', 'investigating']).sum())
            else:
                unresolved = 0

            # Handle missing columns for charts
            if 'severity' in df.columns and 'incident_id' in df.columns:
                by_severity = df.groupby('severity').agg({'incident_id': 'count'}).to_dict()['incident_id']
            elif 'severity' in df.columns:
                by_severity = df['severity'].value_counts().to_dict()
            else:
                by_severity = {'Unknown': len(df)}

            return {
                'kpis': {
                    'avg_time_to_detect_hours': round(avg_ttd, 1),
                    'avg_time_to_resolve_hours': round(avg_ttr, 1),
                    'unresolved_incidents': unresolved
                },
                'charts': {
                    'incidents_by_severity': by_severity
                }
            }
        except Exception as e:
            return {'error': f'Error analyzing incident resolution: {str(e)}'}

    def analyze_benchmark(self, df: pd.DataFrame) -> Dict[str, Any]:
        try:
            # Safely handle missing columns
            if 'score_global' not in df.columns:
                df['score_global'] = 0
            else:
                df['score_global'] = pd.to_numeric(df['score_global'], errors='coerce').fillna(0)
            overall_avg = float(df['score_global'].mean()) if len(df) > 0 else 0.0
            
            # Handle missing columns for charts
            if 'sector' in df.columns:
                avg_sector = df.groupby('sector')['score_global'].mean().to_dict()
            else:
                avg_sector = {'Unknown': overall_avg}

            return {
                'kpis': {
                    'overall_avg_score': round(overall_avg, 1)
                },
                'charts': {
                    'avg_score_by_sector': avg_sector
                }
            }
        except Exception as e:
            return {'error': f'Error analyzing benchmark: {str(e)}'}

    def analyze_threats(self, df: pd.DataFrame) -> Dict[str, Any]:
        try:
            # Safely handle missing columns
            if 'count_incidents' not in df.columns:
                df['count_incidents'] = 0
            else:
                df['count_incidents'] = pd.to_numeric(df['count_incidents'], errors='coerce').fillna(0)
            total_threats = len(df)
            total_incidents = int(df['count_incidents'].sum())
            
            # Handle missing columns for charts
            if 'threat_type' in df.columns:
                by_threat_type = df.groupby('threat_type')['count_incidents'].sum().to_dict()
                top_threats = sorted(by_threat_type.items(), key=lambda t: t[1], reverse=True)[:10]
            else:
                top_threats = [('Unknown', total_incidents)]

            return {
                'kpis': {
                    'total_threats': total_threats,
                    'total_incidents_related': total_incidents
                },
                'charts': {
                    'incidents_by_threat_type': dict(top_threats)
                }
            }
        except Exception as e:
            return {'error': f'Error analyzing threats: {str(e)}'}

    def analyze_exposure(self, df: pd.DataFrame) -> Dict[str, Any]:
        try:
            # Safely handle missing columns
            if 'probability_percent' not in df.columns:
                df['probability_percent'] = 0
            else:
                df['probability_percent'] = pd.to_numeric(df['probability_percent'], errors='coerce').fillna(0)
            
            if 'impact_value' not in df.columns:
                df['impact_value'] = 0
            else:
                df['impact_value'] = pd.to_numeric(df['impact_value'], errors='coerce').fillna(0)
            
            if 'exposure_amount' not in df.columns:
                df['exposure_amount'] = 0
            else:
                df['exposure_amount'] = pd.to_numeric(df['exposure_amount'], errors='coerce').fillna(0)
            total_exposure = float(df['exposure_amount'].sum())
            avg_probability = float(df['probability_percent'].mean()) if len(df) > 0 else 0.0
            
            # Handle missing columns for charts
            if 'asset_owner' in df.columns:
                by_owner = df.groupby('asset_owner')['exposure_amount'].sum().to_dict()
            else:
                by_owner = {'Unknown': total_exposure}

            return {
                'kpis': {
                    'total_exposure_amount': f"{total_exposure:.2f}",
                    'avg_probability_percent': f"{avg_probability:.1f}%"
                },
                'charts': {
                    'exposure_by_owner': by_owner
                }
            }
        except Exception as e:
            return {'error': f'Error analyzing exposure: {str(e)}'}

    def analyze_alignment(self, df: pd.DataFrame) -> Dict[str, Any]:
        try:
            # Safely handle missing columns
            if 'progress_percent' not in df.columns:
                df['progress_percent'] = 0
            else:
                df['progress_percent'] = pd.to_numeric(df['progress_percent'], errors='coerce').fillna(0)
            
            if 'security_coverage_percent' not in df.columns:
                df['security_coverage_percent'] = 0
            else:
                df['security_coverage_percent'] = pd.to_numeric(df['security_coverage_percent'], errors='coerce').fillna(0)
            avg_progress = float(df['progress_percent'].mean()) if len(df) > 0 else 0.0
            avg_coverage = float(df['security_coverage_percent'].mean()) if len(df) > 0 else 0.0
            initiatives_at_risk = int((df['progress_percent'] < 50).sum())

            return {
                'kpis': {
                    'avg_progress_percent': f"{avg_progress:.1f}%",
                    'avg_security_coverage_percent': f"{avg_coverage:.1f}%",
                    'initiatives_at_risk': initiatives_at_risk
                },
                'charts': {
                    'progress_by_initiative': df.set_index('initiative_name')['progress_percent'].to_dict() if 'initiative_name' in df.columns else {'Unknown': avg_progress}
                }
            }
        except Exception as e:
            return {'error': f'Error analyzing strategic alignment: {str(e)}'}

analyzer = Inwi3StrategicAnalyzer()

# === Upload endpoints ===

@router.post("/inwi3/upload-test")
async def upload_inwi3_test(file: UploadFile = File(...), reportType: str = Form(...)):
    """Upload libre pour tests (pas d'auth)."""
    return await _process_upload(file, reportType)


@router.post("/inwi3/upload")
async def upload_inwi3(
    file: UploadFile = File(...),
    reportType: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload sécurisé avec authentification (Bearer token)."""
    return await _process_upload(file, reportType)


async def _process_upload(file: UploadFile, reportType: str):
    try:
        if not file:
            raise HTTPException(status_code=400, detail="No file provided")
        if not file.filename.lower().endswith('.csv'):
            raise HTTPException(status_code=400, detail="Only CSV files are supported")
        if reportType not in analyzer.report_types:
            raise HTTPException(status_code=400, detail="Invalid report type")

        content = await file.read()
        try:
            df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        except UnicodeDecodeError:
            df = pd.read_csv(io.StringIO(content.decode('latin-1')))

        if df.empty:
            raise HTTPException(status_code=400, detail="CSV file is empty")

        result = analyzer.report_types[reportType](df)
        return {
            'success': True,
            'reportType': reportType,
            'data': result,
            'filename': file.filename,
            'rows_processed': len(df)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("processing error")
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

# === Healthcheck ===

@router.get("/inwi3/health")
async def health_inwi3():
    return {
        'status': 'healthy',
        'module': 'inwi3_strategic',
        'timestamp': datetime.utcnow().isoformat(),
        'supported_reports': list(analyzer.report_types.keys())
    }