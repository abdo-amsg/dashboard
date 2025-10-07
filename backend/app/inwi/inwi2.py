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

class CISOAnalyzer:
    def __init__(self):
        self.report_types = {
            'ciso_incident_report': self.analyze_incident_report,
            'ciso_vulnerability_report': self.analyze_vulnerability_report,
            'ciso_system_availability': self.analyze_system_availability,
            'ciso_detection_rules': self.analyze_detection_rules,
            'ciso_threat_intelligence': self.analyze_threat_intelligence,
            'ciso_awareness_training': self.analyze_awareness_training,
            'ciso_attack_surface': self.analyze_attack_surface,
            'ciso_security_projects': self.analyze_security_projects
        }
    
    def analyze_incident_report(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze incident reports for CISO dashboard"""
        try:
            df['date'] = pd.to_datetime(df['date'])
            df['incidents_critical'] = pd.to_numeric(df['incidents_critical'], errors='coerce')
            df['incidents_high'] = pd.to_numeric(df['incidents_high'], errors='coerce')
            df['incidents_medium'] = pd.to_numeric(df['incidents_medium'], errors='coerce')
            df['incidents_low'] = pd.to_numeric(df['incidents_low'], errors='coerce')
            df['sla_compliance_rate'] = pd.to_numeric(df['sla_compliance_rate'], errors='coerce')
            df['mttr_hours'] = pd.to_numeric(df['mttr_hours'], errors='coerce')
            df['mttd_hours'] = pd.to_numeric(df['mttd_hours'], errors='coerce')
            df['mttc_hours'] = pd.to_numeric(df['mttc_hours'], errors='coerce')
            
            # Total incidents by criticality
            total_critical = df['incidents_critical'].sum()
            total_high = df['incidents_high'].sum()
            total_medium = df['incidents_medium'].sum()
            total_low = df['incidents_low'].sum()
            total_incidents = total_critical + total_high + total_medium + total_low
            
            # Average metrics
            avg_sla_compliance = df['sla_compliance_rate'].mean()
            avg_mttr = df['mttr_hours'].mean()
            avg_mttd = df['mttd_hours'].mean()
            avg_mttc = df['mttc_hours'].mean()
            
            # Monthly distribution
            monthly_incidents = df.groupby(df['date'].dt.to_period('M')).agg({
                'incidents_critical': 'sum',
                'incidents_high': 'sum',
                'incidents_medium': 'sum',
                'incidents_low': 'sum'
            }).to_dict('index')
            
            return {
                'kpis': {
                    'total_incidents': int(total_incidents),
                    'critical_incidents': int(total_critical),
                    'high_incidents': int(total_high),
                    'sla_compliance': f"{avg_sla_compliance:.1f}%",
                    'mttr': f"{avg_mttr:.1f}h",
                    'mttd': f"{avg_mttd:.1f}h",
                    'mttc': f"{avg_mttc:.1f}h"
                },
                'charts': {
                    'incidents_by_criticality': {
                        'Critical': int(total_critical),
                        'High': int(total_high),
                        'Medium': int(total_medium),
                        'Low': int(total_low)
                    },
                    'monthly_trends': {str(period): data['incidents_critical'] + data['incidents_high'] + data['incidents_medium'] + data['incidents_low'] 
                                     for period, data in monthly_incidents.items()},
                    'response_metrics': {
                        'MTTR': avg_mttr,
                        'MTTD': avg_mttd,
                        'MTTC': avg_mttc
                    }
                }
            }
        except Exception as e:
            return {'error': f'Error analyzing incident report: {str(e)}'}
    
    def analyze_vulnerability_report(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze vulnerability reports for CISO dashboard"""
        try:
            df['date'] = pd.to_datetime(df['date'])
            df['total_active_vulnerabilities'] = pd.to_numeric(df['total_active_vulnerabilities'], errors='coerce')
            df['new_vulnerabilities'] = pd.to_numeric(df['new_vulnerabilities'], errors='coerce')
            df['resolved_vulnerabilities'] = pd.to_numeric(df['resolved_vulnerabilities'], errors='coerce')
            df['critical_vulns'] = pd.to_numeric(df['critical_vulns'], errors='coerce')
            df['high_vulns'] = pd.to_numeric(df['high_vulns'], errors='coerce')
            df['medium_vulns'] = pd.to_numeric(df['medium_vulns'], errors='coerce')
            df['low_vulns'] = pd.to_numeric(df['low_vulns'], errors='coerce')
            df['avg_patching_time_days'] = pd.to_numeric(df['avg_patching_time_days'], errors='coerce')
            
            # Current state
            current_active = df['total_active_vulnerabilities'].iloc[-1] if len(df) > 0 else 0
            total_new = df['new_vulnerabilities'].sum()
            total_resolved = df['resolved_vulnerabilities'].sum()
            avg_patching_time = df['avg_patching_time_days'].mean()
            
            # Latest criticality breakdown
            latest_critical = df['critical_vulns'].iloc[-1] if len(df) > 0 else 0
            latest_high = df['high_vulns'].iloc[-1] if len(df) > 0 else 0
            latest_medium = df['medium_vulns'].iloc[-1] if len(df) > 0 else 0
            latest_low = df['low_vulns'].iloc[-1] if len(df) > 0 else 0
            
            # Monthly trends
            monthly_vulns = df.groupby(df['date'].dt.to_period('M')).agg({
                'new_vulnerabilities': 'sum',
                'resolved_vulnerabilities': 'sum'
            }).to_dict('index')
            
            return {
                'kpis': {
                    'active_vulnerabilities': int(current_active),
                    'new_vulnerabilities': int(total_new),
                    'resolved_vulnerabilities': int(total_resolved),
                    'critical_vulnerabilities': int(latest_critical),
                    'avg_patching_time': f"{avg_patching_time:.1f} days",
                    'resolution_rate': f"{(total_resolved/(total_new+1)*100):.1f}%"
                },
                'charts': {
                    'vulnerability_by_criticality': {
                        'Critical': int(latest_critical),
                        'High': int(latest_high),
                        'Medium': int(latest_medium),
                        'Low': int(latest_low)
                    },
                    'monthly_trends': {str(period): {'new': data['new_vulnerabilities'], 'resolved': data['resolved_vulnerabilities']} 
                                     for period, data in monthly_vulns.items()},
                    'patching_performance': {
                        'Target': 30,
                        'Current': avg_patching_time
                    }
                }
            }
        except Exception as e:
            return {'error': f'Error analyzing vulnerability report: {str(e)}'}
    
    def analyze_system_availability(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze system availability for CISO dashboard"""
        try:
            df['date'] = pd.to_datetime(df['date'])
            df['availability_rate'] = pd.to_numeric(df['availability_rate'], errors='coerce')
            df['downtime_minutes'] = pd.to_numeric(df['downtime_minutes'], errors='coerce')
            df['outages_count'] = pd.to_numeric(df['outages_count'], errors='coerce')
            
            # Overall metrics
            avg_availability = df['availability_rate'].mean()
            total_downtime = df['downtime_minutes'].sum()
            total_outages = df['outages_count'].sum()
            avg_downtime_per_outage = total_downtime / total_outages if total_outages > 0 else 0
            
            # Monthly availability trends
            monthly_availability = df.groupby(df['date'].dt.to_period('M')).agg({
                'availability_rate': 'mean',
                'outages_count': 'sum'
            }).to_dict('index')
            
            # SLA compliance (assuming 99.9% target)
            sla_target = 99.9
            sla_compliance = (avg_availability >= sla_target)
            
            return {
                'kpis': {
                    'overall_availability': f"{avg_availability:.2f}%",
                    'total_downtime_hours': f"{total_downtime/60:.1f}h",
                    'monthly_outages': int(total_outages),
                    'avg_downtime_per_outage': f"{avg_downtime_per_outage:.0f} min",
                    'sla_compliance': "✓ Compliant" if sla_compliance else "✗ Non-compliant",
                    'uptime_target': f"{sla_target}%"
                },
                'charts': {
                    'monthly_availability': {str(period): data['availability_rate'] for period, data in monthly_availability.items()},
                    'outages_trend': {str(period): data['outages_count'] for period, data in monthly_availability.items()},
                    'availability_vs_target': {
                        'Current': avg_availability,
                        'Target': sla_target
                    }
                }
            }
        except Exception as e:
            return {'error': f'Error analyzing system availability: {str(e)}'}
    
    def analyze_detection_rules(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze detection rules and coverage for CISO dashboard"""
        try:
            df['date'] = pd.to_datetime(df['date'])
            df['total_active_rules'] = pd.to_numeric(df['total_active_rules'], errors='coerce')
            df['custom_rules_pct'] = pd.to_numeric(df['custom_rules_pct'], errors='coerce')
            df['new_rules_added'] = pd.to_numeric(df['new_rules_added'], errors='coerce')
            df['rules_disabled'] = pd.to_numeric(df['rules_disabled'], errors='coerce')
            df['mitre_coverage_pct'] = pd.to_numeric(df['mitre_coverage_pct'], errors='coerce')
            
            # Current metrics
            current_active_rules = df['total_active_rules'].iloc[-1] if len(df) > 0 else 0
            current_custom_pct = df['custom_rules_pct'].iloc[-1] if len(df) > 0 else 0
            total_new_rules = df['new_rules_added'].sum()
            total_disabled_rules = df['rules_disabled'].sum()
            current_mitre_coverage = df['mitre_coverage_pct'].iloc[-1] if len(df) > 0 else 0
            
            # Monthly rule management trends
            monthly_rules = df.groupby(df['date'].dt.to_period('M')).agg({
                'new_rules_added': 'sum',
                'rules_disabled': 'sum',
                'mitre_coverage_pct': 'mean'
            }).to_dict('index')
            
            # MITRE ATT&CK coverage by tactic (example data)
            mitre_tactics_coverage = {
                'Initial Access': 85,
                'Execution': 92,
                'Persistence': 78,
                'Privilege Escalation': 88,
                'Defense Evasion': 75,
                'Credential Access': 90,
                'Discovery': 82,
                'Lateral Movement': 87,
                'Collection': 79,
                'Exfiltration': 83
            }
            
            return {
                'kpis': {
                    'active_rules': int(current_active_rules),
                    'custom_rules_percentage': f"{current_custom_pct:.1f}%",
                    'new_rules_monthly': int(total_new_rules),
                    'disabled_rules': int(total_disabled_rules),
                    'mitre_coverage': f"{current_mitre_coverage:.1f}%",
                    'rule_efficiency': f"{((current_active_rules-total_disabled_rules)/current_active_rules*100):.1f}%" if current_active_rules > 0 else "0%"
                },
                'charts': {
                    'rule_management_trends': {str(period): {'added': data['new_rules_added'], 'disabled': data['rules_disabled']} 
                                             for period, data in monthly_rules.items()},
                    'mitre_coverage_by_tactic': mitre_tactics_coverage,
                    'coverage_evolution': {str(period): data['mitre_coverage_pct'] for period, data in monthly_rules.items()}
                }
            }
        except Exception as e:
            return {'error': f'Error analyzing detection rules: {str(e)}'}
    
    def analyze_threat_intelligence(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze threat intelligence for CISO dashboard"""
        try:
            df['date'] = pd.to_datetime(df['date'])
            df['new_iocs'] = pd.to_numeric(df['new_iocs'], errors='coerce')
            df['active_ips'] = pd.to_numeric(df['active_ips'], errors='coerce')
            df['active_domains'] = pd.to_numeric(df['active_domains'], errors='coerce')
            df['active_hashes'] = pd.to_numeric(df['active_hashes'], errors='coerce')
            df['campaigns_detected'] = pd.to_numeric(df['campaigns_detected'], errors='coerce')
            df['ioc_utilization_rate'] = pd.to_numeric(df['ioc_utilization_rate'], errors='coerce')
            
            # Totals and current state
            total_new_iocs = df['new_iocs'].sum()
            current_active_ips = df['active_ips'].iloc[-1] if len(df) > 0 else 0
            current_active_domains = df['active_domains'].iloc[-1] if len(df) > 0 else 0
            current_active_hashes = df['active_hashes'].iloc[-1] if len(df) > 0 else 0
            total_campaigns = df['campaigns_detected'].sum()
            avg_utilization = df['ioc_utilization_rate'].mean()
            
            # Monthly IOC trends
            monthly_iocs = df.groupby(df['date'].dt.to_period('M')).agg({
                'new_iocs': 'sum',
                'campaigns_detected': 'sum'
            }).to_dict('index')
            
            # Top threat actors (example data)
            top_threat_actors = {
                'APT29 (Cozy Bear)': 15,
                'Lazarus Group': 12,
                'APT28 (Fancy Bear)': 10,
                'FIN7': 8,
                'Carbanak': 6
            }
            
            return {
                'kpis': {
                    'new_iocs_collected': int(total_new_iocs),
                    'active_ip_indicators': int(current_active_ips),
                    'active_domain_indicators': int(current_active_domains),
                    'active_hash_indicators': int(current_active_hashes),
                    'campaigns_detected': int(total_campaigns),
                    'ioc_utilization_rate': f"{avg_utilization:.1f}%"
                },
                'charts': {
                    'ioc_by_type': {
                        'IP Addresses': int(current_active_ips),
                        'Domains': int(current_active_domains),
                        'File Hashes': int(current_active_hashes)
                    },
                    'monthly_intelligence': {str(period): {'iocs': data['new_iocs'], 'campaigns': data['campaigns_detected']} 
                                           for period, data in monthly_iocs.items()},
                    'top_threat_actors': top_threat_actors
                }
            }
        except Exception as e:
            return {'error': f'Error analyzing threat intelligence: {str(e)}'}
    
    def analyze_awareness_training(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze security awareness and training for CISO dashboard"""
        try:
            df['date'] = pd.to_datetime(df['date'])
            df['training_participation_rate'] = pd.to_numeric(df['training_participation_rate'], errors='coerce')
            df['average_score'] = pd.to_numeric(df['average_score'], errors='coerce')
            df['phishing_failure_rate'] = pd.to_numeric(df['phishing_failure_rate'], errors='coerce')
            df['employees_trained'] = pd.to_numeric(df['employees_trained'], errors='coerce')
            df['total_employees'] = pd.to_numeric(df['total_employees'], errors='coerce')
            
            # Current metrics
            avg_participation = df['training_participation_rate'].mean()
            avg_score = df['average_score'].mean()
            current_phishing_failure = df['phishing_failure_rate'].iloc[-1] if len(df) > 0 else 0
            total_trained = df['employees_trained'].sum()
            total_employees = df['total_employees'].iloc[-1] if len(df) > 0 else 0
            
            # Monthly training trends
            monthly_training = df.groupby(df['date'].dt.to_period('M')).agg({
                'training_participation_rate': 'mean',
                'average_score': 'mean',
                'phishing_failure_rate': 'mean'
            }).to_dict('index')
            
            # Training completion by department (example data)
            dept_completion = {
                'IT': 95,
                'Finance': 88,
                'HR': 92,
                'Sales': 78,
                'Operations': 85,
                'Management': 98
            }
            
            return {
                'kpis': {
                    'participation_rate': f"{avg_participation:.1f}%",
                    'average_training_score': f"{avg_score:.0f}/100",
                    'phishing_failure_rate': f"{current_phishing_failure:.1f}%",
                    'employees_trained': f"{total_trained}/{total_employees}",
                    'training_compliance': f"{(total_trained/total_employees*100):.1f}%" if total_employees > 0 else "0%",
                    'security_awareness_level': "Good" if avg_score >= 80 else "Needs Improvement"
                },
                'charts': {
                    'monthly_participation': {str(period): data['training_participation_rate'] for period, data in monthly_training.items()},
                    'phishing_simulation_trends': {str(period): data['phishing_failure_rate'] for period, data in monthly_training.items()},
                    'department_completion': dept_completion
                }
            }
        except Exception as e:
            return {'error': f'Error analyzing awareness training: {str(e)}'}
    
    def analyze_attack_surface(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze attack surface for CISO dashboard"""
        try:
            df['date'] = pd.to_datetime(df['date'])
            df['exposure_score'] = pd.to_numeric(df['exposure_score'], errors='coerce')
            df['exposed_assets'] = pd.to_numeric(df['exposed_assets'], errors='coerce')
            df['critical_services_exposed'] = pd.to_numeric(df['critical_services_exposed'], errors='coerce')
            df['shadow_it_detected'] = pd.to_numeric(df['shadow_it_detected'], errors='coerce')
            df['total_assets'] = pd.to_numeric(df['total_assets'], errors='coerce')
            
            # Current state
            current_exposure_score = df['exposure_score'].iloc[-1] if len(df) > 0 else 0
            current_exposed_assets = df['exposed_assets'].iloc[-1] if len(df) > 0 else 0
            current_critical_exposed = df['critical_services_exposed'].iloc[-1] if len(df) > 0 else 0
            total_shadow_it = df['shadow_it_detected'].sum()
            current_total_assets = df['total_assets'].iloc[-1] if len(df) > 0 else 0
            
            # Exposure trends
            monthly_exposure = df.groupby(df['date'].dt.to_period('M')).agg({
                'exposure_score': 'mean',
                'exposed_assets': 'mean',
                'shadow_it_detected': 'sum'
            }).to_dict('index')
            
            # Asset categories exposure (example data)
            asset_exposure = {
                'Web Applications': 25,
                'Databases': 8,
                'Network Services': 15,
                'Cloud Resources': 12,
                'IoT Devices': 18,
                'Legacy Systems': 6
            }
            
            # Risk level assessment
            risk_level = "High" if current_exposure_score > 70 else "Medium" if current_exposure_score > 40 else "Low"
            
            return {
                'kpis': {
                    'exposure_score': f"{current_exposure_score:.0f}/100",
                    'exposed_assets': int(current_exposed_assets),
                    'critical_services_exposed': int(current_critical_exposed),
                    'shadow_it_detected': int(total_shadow_it),
                    'exposure_percentage': f"{(current_exposed_assets/current_total_assets*100):.1f}%" if current_total_assets > 0 else "0%",
                    'risk_level': risk_level
                },
                'charts': {
                    'exposure_trends': {str(period): data['exposure_score'] for period, data in monthly_exposure.items()},
                    'asset_exposure_by_type': asset_exposure,
                    'shadow_it_trends': {str(period): data['shadow_it_detected'] for period, data in monthly_exposure.items()}
                }
            }
        except Exception as e:
            return {'error': f'Error analyzing attack surface: {str(e)}'}
    
    def analyze_security_projects(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze security projects for CISO dashboard"""
        try:
            df['date'] = pd.to_datetime(df['date'])
            df['projects_progress_pct'] = pd.to_numeric(df['projects_progress_pct'], errors='coerce')
            df['projects_delayed_pct'] = pd.to_numeric(df['projects_delayed_pct'], errors='coerce')
            df['projects_completed_pct'] = pd.to_numeric(df['projects_completed_pct'], errors='coerce')
            df['budget_utilization_pct'] = pd.to_numeric(df['budget_utilization_pct'], errors='coerce')
            df['total_projects'] = pd.to_numeric(df['total_projects'], errors='coerce')
            
            # Current metrics
            avg_progress = df['projects_progress_pct'].mean()
            avg_delayed = df['projects_delayed_pct'].mean()
            avg_completed = df['projects_completed_pct'].mean()
            avg_budget_utilization = df['budget_utilization_pct'].mean()
            current_total_projects = df['total_projects'].iloc[-1] if len(df) > 0 else 0
            
            # Monthly project trends
            monthly_projects = df.groupby(df['date'].dt.to_period('M')).agg({
                'projects_progress_pct': 'mean',
                'projects_delayed_pct': 'mean',
                'projects_completed_pct': 'mean'
            }).to_dict('index')
            
            # Project categories (example data)
            project_categories = {
                'Infrastructure Security': 35,
                'Compliance & Governance': 25,
                'Incident Response': 20,
                'Security Awareness': 15,
                'Threat Intelligence': 5
            }
            
            # Project health assessment
            project_health = "Good" if avg_delayed < 20 and avg_progress > 70 else "At Risk" if avg_delayed < 40 else "Critical"
            
            return {
                'kpis': {
                    'average_progress': f"{avg_progress:.1f}%",
                    'projects_delayed': f"{avg_delayed:.1f}%",
                    'projects_completed_on_time': f"{avg_completed:.1f}%",
                    'budget_utilization': f"{avg_budget_utilization:.1f}%",
                    'total_active_projects': int(current_total_projects),
                    'project_health': project_health
                },
                'charts': {
                    'project_status_trends': {str(period): {'progress': data['projects_progress_pct'], 'delayed': data['projects_delayed_pct']} 
                                            for period, data in monthly_projects.items()},
                    'project_categories': project_categories,
                    'completion_trends': {str(period): data['projects_completed_pct'] for period, data in monthly_projects.items()}
                }
            }
        except Exception as e:
            return {'error': f'Error analyzing security projects: {str(e)}'}


analyzer = CISOAnalyzer()

@router.post("/inwi2/upload")
async def upload_file(
    file: UploadFile = File(...), 
    report_type: str = Form(...),
    current_user: auth_models.User = Depends(get_current_user)
):
    """Upload and analyze CISO-level SOC report files"""
    try:
        logger.info(f"User {current_user.email} uploading CISO file: {file.filename}")
        
        if not file:
            raise HTTPException(status_code=400, detail="No file provided")
        
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Only CSV files are supported")
        
        if report_type not in analyzer.report_types:
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
        analysis_result = analyzer.report_types[report_type](df)
        
        logger.info(f"Successfully analyzed {report_type} report for user {current_user.email}")
        
        return {
            'success': True,
            'report_type': report_type,
            'data': analysis_result,
            'filename': file.filename,
            'rows_processed': len(df)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing CISO file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

@router.post("/inwi2/upload-test")
async def upload_file_test(
    file: UploadFile = File(...), 
    report_type: str = Form(...)
):
    """Upload and analyze CISO-level SOC report files - TEST VERSION WITHOUT AUTH"""
    try:
        logger.info(f"Test upload CISO: {file.filename}")
        
        if not file:
            raise HTTPException(status_code=400, detail="No file provided")
        
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Only CSV files are supported")
        
        if report_type not in analyzer.report_types:
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
        analysis_result = analyzer.report_types[report_type](df)
        
        logger.info(f"Successfully analyzed {report_type} report (CISO test mode)")
        
        return {
            'success': True,
            'report_type': report_type,
            'data': analysis_result,
            'filename': file.filename,
            'rows_processed': len(df)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing CISO file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

@router.get("/inwi2/health")
async def health_check():
    """Health check endpoint for INWI2 CISO module"""
    return {
        'status': 'healthy', 
        'timestamp': datetime.now().isoformat(),
        'module': 'inwi2_ciso_analyzer',
        'level': 'CISO/Pilotage',
        'supported_reports': list(analyzer.report_types.keys())
    }

@router.get("/inwi2/report-types")
async def get_report_types():
    """Get available CISO-level report types"""
    return {
        'report_types': [
            {'value': 'ciso_incident_report', 'label': 'Rapport d\'Incidents', 'description': 'Incidents par criticité, SLA, MTTR, MTTD, MTTC'},
            {'value': 'ciso_vulnerability_report', 'label': 'Rapport de Vulnérabilités', 'description': 'Vulnérabilités actives, nouvelles, résolues par criticité'},
            {'value': 'ciso_system_availability', 'label': 'Disponibilité des Outils', 'description': 'Taux de disponibilité, pannes, temps d\'indisponibilité'},
            {'value': 'ciso_detection_rules', 'label': 'Règles & Use Cases', 'description': 'Règles actives, personnalisées, couverture MITRE ATT&CK'},
            {'value': 'ciso_threat_intelligence', 'label': 'Threat Intelligence', 'description': 'IOCs collectés, campagnes détectées, ratio d\'utilisation'},
            {'value': 'ciso_awareness_training', 'label': 'Sensibilisation & Formation', 'description': 'Participation, scores, simulations phishing'},
            {'value': 'ciso_attack_surface', 'label': 'Surface d\'Exposition', 'description': 'Score d\'exposition, actifs exposés, Shadow IT'},
            {'value': 'ciso_security_projects', 'label': 'Projets Sécurité', 'description': 'Avancement, retards, projets terminés dans les délais'}
        ]
    }