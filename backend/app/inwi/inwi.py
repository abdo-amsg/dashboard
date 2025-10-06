from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Depends
import pandas as pd
import io
from datetime import datetime
import numpy as np
from typing import Dict, List, Any
from app.auth import models as auth_models
from app.auth.auth_routes import get_current_user
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Create router instead of FastAPI app
router = APIRouter()

class SOCAnalyzer:
    def __init__(self):
        self.report_types = {
            'realtime_alerts': self.analyze_realtime_alerts,
            'event_processing': self.analyze_event_processing,
            'detection_efficiency': self.analyze_detection_efficiency,
            'response_times': self.analyze_response_times,
            'system_status': self.analyze_system_status,
            'resource_allocation': self.analyze_resource_allocation,
            'detection_rules': self.analyze_detection_rules,
            'threat_intelligence': self.analyze_threat_intelligence
        }
    
    def analyze_realtime_alerts(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze real-time alerts data for SOC dashboard - Enhanced for 3 key KPIs"""
        try:
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df['minutes_ago'] = pd.to_numeric(df['minutes_ago'], errors='coerce')
            
            # Current active alerts by severity
            critical_alerts = len(df[df['severity'] == 'Critical'])
            high_alerts = len(df[df['severity'] == 'High'])
            medium_alerts = len(df[df['severity'] == 'Medium'])
            low_alerts = len(df[df['severity'] == 'Low'])
            
            # Recent alerts (last 30 minutes)
            recent_alerts = len(df[df['minutes_ago'] <= 30])
            
            # KPI 1: Distribution par Gravité - Enhanced with percentages and colors
            total_alerts = len(df)
            severity_distribution = []
            severity_colors = {
                'Critical': '#dc2626',  # Rouge foncé
                'High': '#ea580c',      # Orange foncé
                'Medium': '#d97706',    # Orange
                'Low': '#059669'        # Vert
            }
            
            for severity in ['Critical', 'High', 'Medium', 'Low']:
                count = len(df[df['severity'] == severity])
                percentage = (count / total_alerts * 100) if total_alerts > 0 else 0
                severity_distribution.append({
                    'name': severity,
                    'value': count,
                    'percentage': round(percentage, 1),
                    'color': severity_colors[severity]
                })
            
            # KPI 2: Types d'Alertes - Top 8 most frequent alert types
            alert_types_raw = df['alert_type'].value_counts().head(8)
            alert_types_distribution = []
            type_colors = ['#1e3a8a', '#1e40af', '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe']
            
            for i, (alert_type, count) in enumerate(alert_types_raw.items()):
                percentage = (count / total_alerts * 100) if total_alerts > 0 else 0
                alert_types_distribution.append({
                    'name': alert_type,
                    'value': count,
                    'percentage': round(percentage, 1),
                    'color': type_colors[i % len(type_colors)]
                })
            
            # KPI 3: Distribution Horaire - Enhanced hourly analysis
            df['hour'] = df['timestamp'].dt.hour
            hourly_data = []
            
            # Create complete 24-hour distribution
            for hour in range(24):
                count = len(df[df['hour'] == hour])
                percentage = (count / total_alerts * 100) if total_alerts > 0 else 0
                
                # Determine peak hours (higher activity)
                is_peak = count > (total_alerts / 24 * 1.5) if total_alerts > 0 else False
                
                hourly_data.append({
                    'hour': f"{hour:02d}:00",
                    'hour_num': hour,
                    'alerts': count,
                    'percentage': round(percentage, 1),
                    'is_peak': is_peak,
                    'color': '#dc2626' if is_peak else '#3b82f6'
                })
            
            # Calculate additional metrics
            peak_hours = [h for h in hourly_data if h['is_peak']]
            avg_hourly = total_alerts / 24 if total_alerts > 0 else 0
            
            return {
                'kpis': {
                    'critical_alerts': critical_alerts,
                    'high_alerts': high_alerts,
                    'medium_alerts': medium_alerts,
                    'low_alerts': low_alerts,
                    'recent_alerts_30min': recent_alerts,
                    'total_active_alerts': total_alerts,
                    'peak_hours_count': len(peak_hours),
                    'avg_hourly_alerts': round(avg_hourly, 1),
                    'most_common_type': alert_types_raw.index[0] if len(alert_types_raw) > 0 else 'N/A',
                    'severity_ratio_critical': round((critical_alerts / total_alerts * 100), 1) if total_alerts > 0 else 0
                },
                'charts': {
                    'severity_distribution': severity_distribution,
                    'alert_types': alert_types_distribution,
                    'hourly_distribution': hourly_data
                }
            }
        except Exception as e:
            logger.error(f"Error analyzing real-time alerts: {str(e)}")
            return {'error': f'Error analyzing real-time alerts: {str(e)}'}
    
    def analyze_event_processing(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze event processing metrics"""
        try:
            # Calculate daily events
            df['date'] = pd.to_datetime(df['date'])
            df['events_count'] = pd.to_numeric(df['events_count'], errors='coerce')
            df['alerts_generated'] = pd.to_numeric(df['alerts_generated'], errors='coerce')
            df['processing_rate'] = pd.to_numeric(df['processing_rate'], errors='coerce')
            
            total_events = df['events_count'].sum()
            total_alerts = df['alerts_generated'].sum()
            avg_processing_rate = df['processing_rate'].mean()
            
            # Daily averages
            daily_avg_events = df['events_count'].mean()
            
            # Processing efficiency over time
            daily_processing = df.groupby('date').agg({
                'events_count': 'sum',
                'alerts_generated': 'sum',
                'processing_rate': 'mean'
            }).to_dict('index')
            
            return {
                'kpis': {
                    'events_per_day': f"{daily_avg_events/1000000:.1f}M",
                    'alerts_generated': int(total_alerts),
                    'processing_rate': f"{avg_processing_rate:.1f}%",
                    'total_events_processed': int(total_events)
                },
                'charts': {
                    'daily_events': {str(date): data['events_count'] for date, data in daily_processing.items()},
                    'processing_efficiency': {str(date): data['processing_rate'] for date, data in daily_processing.items()}
                }
            }
        except Exception as e:
            return {'error': f'Error analyzing event processing: {str(e)}'}
    
    def analyze_detection_efficiency(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze detection efficiency metrics"""
        try:
            df['false_positive_rate'] = pd.to_numeric(df['false_positive_rate'], errors='coerce')
            df['detection_precision'] = pd.to_numeric(df['detection_precision'], errors='coerce')
            df['true_positives'] = pd.to_numeric(df['true_positives'], errors='coerce')
            df['false_positives'] = pd.to_numeric(df['false_positives'], errors='coerce')
            
            avg_false_positive_rate = df['false_positive_rate'].mean()
            avg_detection_precision = df['detection_precision'].mean()
            total_true_positives = df['true_positives'].sum()
            total_false_positives = df['false_positives'].sum()
            
            # Detection accuracy over time
            detection_trends = df.groupby('date').agg({
                'false_positive_rate': 'mean',
                'detection_precision': 'mean'
            }).to_dict('index')
            
            return {
                'kpis': {
                    'false_positive_rate': f"{avg_false_positive_rate:.1f}%",
                    'detection_precision': f"{avg_detection_precision:.1f}%",
                    'true_positives': int(total_true_positives),
                    'false_positives': int(total_false_positives)
                },
                'charts': {
                    'detection_trends': {str(date): data['detection_precision'] for date, data in detection_trends.items()},
                    'fp_rate_trends': {str(date): data['false_positive_rate'] for date, data in detection_trends.items()}
                }
            }
        except Exception as e:
            return {'error': f'Error analyzing detection efficiency: {str(e)}'}
    
    def analyze_response_times(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze response times for different alert severities"""
        try:
            df['critical_response_min'] = pd.to_numeric(df['critical_response_min'], errors='coerce')
            df['high_response_min'] = pd.to_numeric(df['high_response_min'], errors='coerce')
            df['medium_response_min'] = pd.to_numeric(df['medium_response_min'], errors='coerce')
            df['low_response_min'] = pd.to_numeric(df['low_response_min'], errors='coerce')
            
            avg_critical = df['critical_response_min'].mean()
            avg_high = df['high_response_min'].mean()
            avg_medium = df['medium_response_min'].mean()
            avg_low = df['low_response_min'].mean()
            
            # Calculate improvement percentages (mock data for trends)
            critical_improvement = -22  # vs Q2
            high_improvement = -18
            medium_improvement = -15
            low_improvement = -10
            
            response_distribution = {
                'Critical': avg_critical,
                'High': avg_high,
                'Medium': avg_medium,
                'Low': avg_low
            }
            
            return {
                'kpis': {
                    'critical_response_time': f"{avg_critical:.0f} min",
                    'high_response_time': f"{avg_high:.0f} min",
                    'medium_response_time': f"{avg_medium:.0f} min",
                    'low_response_time': f"{avg_low:.0f} min",
                    'critical_improvement': f"{critical_improvement}% vs Q2",
                    'high_improvement': f"{high_improvement}% vs Q2"
                },
                'charts': {
                    'response_times_by_severity': response_distribution,
                    'improvement_trends': {
                        'Critical': critical_improvement,
                        'High': high_improvement,
                        'Medium': medium_improvement,
                        'Low': low_improvement
                    }
                }
            }
        except Exception as e:
            return {'error': f'Error analyzing response times: {str(e)}'}
    
    def analyze_system_status(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze system status and availability"""
        try:
            # System status metrics
            systems_data = {}
            operational_systems = 0
            total_systems = len(df)
            
            for _, row in df.iterrows():
                system_name = row['system_name']
                status = row['status']
                availability = pd.to_numeric(row['availability_pct'], errors='coerce')
                
                systems_data[system_name] = {
                    'status': status,
                    'availability': availability
                }
                
                if status == 'Operational' or availability >= 99:
                    operational_systems += 1
            
            operational_percentage = (operational_systems / total_systems * 100) if total_systems > 0 else 0
            
            # Status distribution
            status_counts = df['status'].value_counts().to_dict()
            
            return {
                'kpis': {
                    'operational_systems': operational_systems,
                    'total_systems': total_systems,
                    'operational_percentage': f"{operational_percentage:.1f}%",
                    'systems_monitored': total_systems
                },
                'charts': {
                    'system_status': status_counts,
                    'system_availability': {row['system_name']: pd.to_numeric(row['availability_pct'], errors='coerce') 
                                          for _, row in df.iterrows()}
                }
            }
        except Exception as e:
            return {'error': f'Error analyzing system status: {str(e)}'}
    
    def analyze_resource_allocation(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze resource allocation and workload"""
        try:
            df['current_load_pct'] = pd.to_numeric(df['current_load_pct'], errors='coerce')
            df['active_analysts'] = pd.to_numeric(df['active_analysts'], errors='coerce')
            df['total_analysts'] = pd.to_numeric(df['total_analysts'], errors='coerce')
            
            avg_load = df['current_load_pct'].mean()
            total_active = df['active_analysts'].sum()
            total_capacity = df['total_analysts'].sum()
            
            # Resource utilization over time
            resource_trends = df.groupby('timestamp').agg({
                'current_load_pct': 'mean',
                'active_analysts': 'sum'
            }).to_dict('index')
            
            return {
                'kpis': {
                    'current_load': f"{avg_load:.0f}%",
                    'active_analysts': f"{total_active}/{total_capacity}",
                    'resource_utilization': f"{avg_load:.1f}%",
                    'analyst_efficiency': f"{(total_active/total_capacity*100):.0f}%" if total_capacity > 0 else "0%"
                },
                'charts': {
                    'load_distribution': {str(ts): data['current_load_pct'] for ts, data in resource_trends.items()},
                    'analyst_allocation': {str(ts): data['active_analysts'] for ts, data in resource_trends.items()}
                }
            }
        except Exception as e:
            return {'error': f'Error analyzing resource allocation: {str(e)}'}
    
    def analyze_detection_rules(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze detection rules and MITRE coverage"""
        try:
            df['active_rules'] = pd.to_numeric(df['active_rules'], errors='coerce')
            df['custom_rules'] = pd.to_numeric(df['custom_rules'], errors='coerce')
            df['mitre_coverage_pct'] = pd.to_numeric(df['mitre_coverage_pct'], errors='coerce')
            df['new_rules_7d'] = pd.to_numeric(df['new_rules_7d'], errors='coerce')
            
            total_active_rules = df['active_rules'].sum()
            total_custom_rules = df['custom_rules'].sum()
            avg_mitre_coverage = df['mitre_coverage_pct'].mean()
            new_rules_week = df['new_rules_7d'].sum()
            
            # Top MITRE techniques (exemples en dur)
            top_techniques = {
                'T1059 - Command & Script': 45,
                'T1053 - Scheduled Task/Job': 38,
                'T1078 - Valid Accounts': 32,
                'T1055 - Process Injection': 28,
                'T1003 - Credential Dumping': 25
            }
            
            return {
                'kpis': {
                    'active_rules': int(total_active_rules),
                    'custom_rules': int(total_custom_rules),
                    'mitre_coverage': f"{avg_mitre_coverage:.1f}%",
                    'new_rules_7d': f"+{int(new_rules_week)}",
                    'rule_efficiency': f"{(total_active_rules/(total_active_rules+50)*100):.1f}%" # Assuming some disabled rules
                },
                'charts': {
                    'rule_types': {
                        'Active': int(total_active_rules),
                        'Custom': int(total_custom_rules),
                        'MITRE-based': int(total_active_rules * 0.8)
                    },
                    'top_mitre_techniques': top_techniques
                }
            }
        except Exception as e:
            return {'error': f'Error analyzing detection rules: {str(e)}'}
    
    def analyze_threat_intelligence(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze threat intelligence data"""
        try:
            df['new_threats'] = pd.to_numeric(df['new_threats'], errors='coerce')
            df['ip_indicators'] = pd.to_numeric(df['ip_indicators'], errors='coerce')
            df['domain_indicators'] = pd.to_numeric(df['domain_indicators'], errors='coerce')
            df['hash_indicators'] = pd.to_numeric(df['hash_indicators'], errors='coerce')
            df['automation_rate'] = pd.to_numeric(df['automation_rate'], errors='coerce')
            df['mttr_min'] = pd.to_numeric(df['mttr_min'], errors='coerce')
            df['incidents_prevented'] = pd.to_numeric(df['incidents_prevented'], errors='coerce')
            
            total_new_threats = df['new_threats'].sum()
            total_ips = df['ip_indicators'].sum()
            total_domains = df['domain_indicators'].sum()
            total_hashes = df['hash_indicators'].sum()
            avg_automation = df['automation_rate'].mean()
            avg_mttr = df['mttr_min'].mean()
            total_prevented = df['incidents_prevented'].sum()
            
            # Active campaigns (from presentation)******** en dur
            active_campaigns = {
                'BlackCat Ransomware': 15,
                'APT29 Phishing': 12,
                'Qakbot Banking Trojan': 8,
                'Emotet Botnet': 6,
                'Cobalt Strike': 4
            }
            
            return {
                'kpis': {
                    'new_threats_identified': int(total_new_threats),
                    'ip_indicators': int(total_ips),
                    'domain_indicators': int(total_domains),
                    'hash_indicators': int(total_hashes),
                    'automation_rate': f"{avg_automation:.0f}%",
                    'mttr_minutes': f"{avg_mttr:.0f} min",
                    'incidents_prevented_30d': int(total_prevented)
                },
                'charts': {
                    'indicator_types': {
                        'IP Addresses': int(total_ips),
                        'Domains': int(total_domains),
                        'File Hashes': int(total_hashes)
                    },
                    'active_campaigns': active_campaigns,
                    'threat_trends': {
                        'Week 1': 5,
                        'Week 2': 8,
                        'Week 3': 12,
                        'Week 4': 15
                    }
                }
            }
        except Exception as e:
            return {'error': f'Error analyzing threat intelligence: {str(e)}'}
    


analyzer = SOCAnalyzer()

@router.post("/inwi/upload")
async def upload_file(
    file: UploadFile = File(...), 
    reportType: str = Form(...),
    current_user: auth_models.User = Depends(get_current_user)
):
    """Upload and analyze SOC report files"""
    try:
        logger.info(f"User {current_user.email} uploading file: {file.filename}")
        
        if not file:
            raise HTTPException(status_code=400, detail="No file provided")
        
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Only CSV files are supported")
        
        if reportType not in analyzer.report_types:
            raise HTTPException(status_code=400, detail="Invalid report type")
        
        # Validate file size (max 10MB)
        if file.size and file.size > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large (max 10MB)")
        
        # Read CSV file with error handling
        csv_content = await file.read()
        try:
            df = pd.read_csv(io.StringIO(csv_content.decode('utf-8')))
        except UnicodeDecodeError:
            # Try with different encoding
            df = pd.read_csv(io.StringIO(csv_content.decode('latin-1')))
        
        if df.empty:
            raise HTTPException(status_code=400, detail="CSV file is empty")
        
        # Analyze data based on report type
        analysis_result = analyzer.report_types[reportType](df)
        
        logger.info(f"Successfully analyzed {reportType} report for user {current_user.email}")
        
        return {
            'success': True,
            'reportType': reportType,
            'data': analysis_result,
            'filename': file.filename,
            'rows_processed': len(df)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing file {file.filename}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

@router.post("/inwi/upload-test")
async def upload_file_test(
    file: UploadFile = File(...), 
    reportType: str = Form(...)
):
    """Upload and analyze SOC report files - TEST VERSION WITHOUT AUTH"""
    try:
        logger.info(f"Test upload: {file.filename}")
        
        if not file:
            raise HTTPException(status_code=400, detail="No file provided")
        
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Only CSV files are supported")
        
        if reportType not in analyzer.report_types:
            raise HTTPException(status_code=400, detail="Invalid report type")
        
        # Validate file size (max 10MB)
        if file.size and file.size > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large (max 10MB)")
        
        # Read CSV file with error handling
        csv_content = await file.read()
        try:
            df = pd.read_csv(io.StringIO(csv_content.decode('utf-8')))
        except UnicodeDecodeError:
            # Try with different encoding
            df = pd.read_csv(io.StringIO(csv_content.decode('latin-1')))
        
        if df.empty:
            raise HTTPException(status_code=400, detail="CSV file is empty")
        
        # Analyze data based on report type
        analysis_result = analyzer.report_types[reportType](df)
        
        logger.info(f"Successfully analyzed {reportType} report (test mode)")
        
        return {
            'success': True,
            'reportType': reportType,
            'data': analysis_result,
            'filename': file.filename,
            'rows_processed': len(df)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing file {file.filename}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

@router.get("/inwi/health")
async def health_check():
    """Health check endpoint for INWI module"""
    return {
        'status': 'healthy', 
        'timestamp': datetime.now().isoformat(),
        'module': 'inwi_soc_analyzer',
        'supported_reports': list(analyzer.report_types.keys())
    }

@router.get("/inwi/report-types")
async def get_report_types():
    """Get available report types"""
    return {
        'report_types': [
            {'value': 'realtime_alerts', 'label': 'Real-time Alerts', 'description': 'Current active security alerts and incidents'},
            {'value': 'event_processing', 'label': 'Event Processing', 'description': 'Daily event processing and alert generation metrics'},
            {'value': 'detection_efficiency', 'label': 'Detection Efficiency', 'description': 'False positive rates and detection precision'},
            {'value': 'response_times', 'label': 'Response Times', 'description': 'Alert response times by severity level'},
            {'value': 'system_status', 'label': 'System Status', 'description': 'SOC tools and systems availability status'},
            {'value': 'resource_allocation', 'label': 'Resource Allocation', 'description': 'Analyst workload and resource utilization'},
            {'value': 'detection_rules', 'label': 'Detection Rules', 'description': 'Active rules and MITRE ATT&CK coverage'},
            {'value': 'threat_intelligence', 'label': 'Threat Intelligence', 'description': 'IOCs, campaigns, and threat indicators'}
        ]
    }
