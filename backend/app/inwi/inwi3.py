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
            df['asset_criticality'] = df.get('asset_criticality').fillna('Medium').astype(str)
            df['incident_count'] = pd.to_numeric(df.get('incident_count', 0), errors='coerce').fillna(0)
            df['vuln_severity'] = pd.to_numeric(df.get('vuln_severity', 0), errors='coerce').fillna(0)
            df['score_risk'] = pd.to_numeric(df.get('score_risk', 0), errors='coerce').fillna(0)
            df['patch_status'] = df.get('patch_status', 'unknown').fillna('unknown').astype(str)

            avg_risk_score = float(df['score_risk'].mean()) if len(df) else 0.0
            assets_high_critical = int((df['asset_criticality'].str.lower() == 'high').sum())
            avg_vuln_severity = float(df['vuln_severity'].mean()) if len(df) else 0.0
            incidents_total = int(df['incident_count'].sum())

            patched = df['patch_status'].str.lower().isin(['patched', 'up-to-date']).sum()
            total_assets = len(df)
            patch_coverage_pct = (patched / total_assets * 100) if total_assets > 0 else 0.0

            by_criticality = df['asset_criticality'].value_counts(dropna=False).to_dict()
            top_risky_assets = df.sort_values('score_risk', ascending=False).head(10)[['asset_id', 'score_risk']].to_dict('records')

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
                    'top_risky_assets': {r['asset_id']: r['score_risk'] for r in top_risky_assets}
                }
            }
        except Exception as e:
            return {'error': f'Error analyzing risk posture: {str(e)}'}

    def analyze_financial_costs(self, df: pd.DataFrame) -> Dict[str, Any]:
        try:
            df['duration_hours'] = pd.to_numeric(df.get('duration_hours', 0), errors='coerce').fillna(0)
            df['total_cost'] = pd.to_numeric(df.get('total_cost', 0), errors='coerce').fillna(0)
            df['cost_per_hour'] = pd.to_numeric(df.get('cost_per_hour', 0), errors='coerce').fillna(0)

            total_incidents = len(df)
            overall_cost = float(df['total_cost'].sum())
            avg_cost = float(df['total_cost'].mean()) if total_incidents > 0 else 0.0
            median_cost = float(df['total_cost'].median()) if total_incidents > 0 else 0.0
            top_cost_incidents = df.sort_values('total_cost', ascending=False).head(5)[['incident_id', 'total_cost']].to_dict('records')
            cost_by_unit = df.groupby('business_unit')['total_cost'].sum().to_dict()

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
            df['loss_expected'] = pd.to_numeric(df.get('loss_expected', 0), errors='coerce').fillna(0)
            df['loss_avoided'] = pd.to_numeric(df.get('loss_avoided', 0), errors='coerce').fillna(0)
            total_expected = float(df['loss_expected'].sum())
            total_avoided = float(df['loss_avoided'].sum())
            effectiveness = (total_avoided / total_expected * 100) if total_expected > 0 else 0.0
            by_threat = df.groupby('threat_type')['loss_avoided'].sum().to_dict()

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
            df['status'] = df.get('status', 'unknown').fillna('unknown').astype(str).str.lower()
            total_controls = len(df)
            compliant = int((df['status'] == 'compliant').sum())
            non_compliant = int((df['status'].isin(['non-compliant', 'failed'])).sum())
            unknown = total_controls - compliant - non_compliant
            compliance_pct = (compliant / total_controls * 100) if total_controls > 0 else 0.0
            by_framework = df.groupby('framework')['status'].apply(lambda s: s.value_counts().to_dict()).to_dict()

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
            df['maturity_score'] = pd.to_numeric(df.get('maturity_score', 0), errors='coerce').fillna(0)
            df['budget_planned'] = pd.to_numeric(df.get('budget_planned', 0), errors='coerce').fillna(0)
            df['budget_used'] = pd.to_numeric(df.get('budget_used', 0), errors='coerce').fillna(0)
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
                    'maturity_by_domain': df.set_index('domain')['maturity_score'].to_dict()
                }
            }
        except Exception as e:
            return {'error': f'Error analyzing security program: {str(e)}'}

    def analyze_incident_resolution(self, df: pd.DataFrame) -> Dict[str, Any]:
        try:
            df['created_at'] = pd.to_datetime(df.get('created_at'), errors='coerce')
            df['detected_at'] = pd.to_datetime(df.get('detected_at'), errors='coerce')
            df['resolved_at'] = pd.to_datetime(df.get('resolved_at'), errors='coerce')
            df['time_to_detect_hours'] = (df['detected_at'] - df['created_at']).dt.total_seconds() / 3600
            df['time_to_resolve_hours'] = (df['resolved_at'] - df['detected_at']).dt.total_seconds() / 3600

            avg_ttd = float(df['time_to_detect_hours'].mean()) if len(df) > 0 else 0.0
            avg_ttr = float(df['time_to_resolve_hours'].mean()) if len(df) > 0 else 0.0
            unresolved = int(df['status'].isin(['open', 'in_progress', 'pending']).sum())

            by_severity = df.groupby('severity').agg({'incident_id': 'count'}).to_dict()['incident_id']

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
            df['score_global'] = pd.to_numeric(df.get('score_global', 0), errors='coerce').fillna(0)
            avg_sector = df.groupby('sector')['score_global'].mean().to_dict()
            overall_avg = float(df['score_global'].mean()) if len(df) > 0 else 0.0

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
            df['count_incidents'] = pd.to_numeric(df.get('count_incidents', 0), errors='coerce').fillna(0)
            total_threats = len(df)
            total_incidents = int(df['count_incidents'].sum())
            by_threat_type = df.groupby('threat_type')['count_incidents'].sum().to_dict()
            top_threats = sorted(by_threat_type.items(), key=lambda t: t[1], reverse=True)[:10]

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
            df['probability_percent'] = pd.to_numeric(df.get('probability_percent', 0), errors='coerce').fillna(0)
            df['impact_value'] = pd.to_numeric(df.get('impact_value', 0), errors='coerce').fillna(0)
            df['exposure_amount'] = pd.to_numeric(df.get('exposure_amount', 0), errors='coerce').fillna(0)
            total_exposure = float(df['exposure_amount'].sum())
            avg_probability = float(df['probability_percent'].mean()) if len(df) > 0 else 0.0
            by_owner = df.groupby('asset_owner')['exposure_amount'].sum().to_dict()

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
            df['progress_percent'] = pd.to_numeric(df.get('progress_percent', 0), errors='coerce').fillna(0)
            df['security_coverage_percent'] = pd.to_numeric(df.get('security_coverage_percent', 0), errors='coerce').fillna(0)
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
                    'progress_by_initiative': df.set_index('initiative_name')['progress_percent'].to_dict()
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