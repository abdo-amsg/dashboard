from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import FileResponse
from pydantic import BaseModel
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.backends.backend_pdf import PdfPages
from werkzeug.utils import secure_filename
import seaborn as sns
import pandas as pd
import numpy as np
from datetime import datetime
import io
import base64
import json
from typing import Dict, List, Any, Optional
import tempfile
import os
from pathlib import Path
from app.auth import models as auth_models
from app.auth.auth_routes import get_current_user
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()

# Pydantic models for request validation
class ExportRequest(BaseModel):
    analysisResult: Dict[str, Any]
    reportType: str

number_regex = r'[\d.]+'

class DashboardExporter:
    def __init__(self):
        # Set matplotlib style for professional reports
        try:
            plt.style.use('seaborn-v0_8-whitegrid')
        except Exception:
            # Fallback to default style if seaborn style is not available
            plt.style.use('default')
        
        # Set color palette
        try:
            sns.set_palette("Blues_r")
        except Exception:
            pass
        
        # Color scheme matching frontend
        self.colors = {
            'primary': '#1e3a8a',
            'secondary': '#3b82f6', 
            'accent': '#60a5fa',
            'success': '#059669',
            'warning': '#d97706',
            'danger': '#dc2626',
            'dark': '#1e293b',
            'medium': '#475569',
            'light': '#f8fafc'
        }
        
        # Report type labels in French
        self.report_labels = {
            'realtime_alerts': 'Alertes Temps Réel',
            'event_processing': 'Traitement d\'Événements',
            'detection_efficiency': 'Efficacité de Détection',
            'response_times': 'Temps de Réponse',
            'system_status': 'État des Systèmes',
            'resource_allocation': 'Allocation des Ressources',
            'detection_rules': 'Règles de Détection',
            'threat_intelligence': 'Threat Intelligence'
        }

    def create_kpi_summary_chart(self, kpis: Dict[str, Any], title: str) -> plt.Figure:
        """Create a summary chart for KPIs"""
        fig, ax = plt.subplots(figsize=(12, 8))
        
        # Prepare data for visualization
        labels = []
        values = []
        colors_list = []
        
        for i, (key, value) in enumerate(kpis.items()):
            labels.append(key)
            # Extract numeric value if it's a string with units
            if isinstance(value, str):
                # Try to extract number from string
                import re
                numbers = re.findall(number_regex, str(value))
                if numbers:
                    values.append(float(numbers[0]))
                else:
                    values.append(0)
            else:
                values.append(float(value) if value is not None else 0)
            
            # Cycle through colors
            color_keys = list(self.colors.keys())
            colors_list.append(self.colors[color_keys[i % len(color_keys)]])
        
        # Create horizontal bar chart
        bars = ax.barh(labels, values, color=colors_list, alpha=0.8)
        
        # Customize chart
        ax.set_title(f'KPIs - {title}', fontsize=16, fontweight='bold', pad=20)
        ax.set_xlabel('Valeurs', fontsize=12)
        
        # Add value labels on bars
        for i, (bar, value) in enumerate(zip(bars, values)):
            width = bar.get_width()
            ax.text(width + max(values) * 0.01, bar.get_y() + bar.get_height()/2, 
                   f'{kpis[labels[i]]}', ha='left', va='center', fontweight='bold')
        
        # Style the plot
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.grid(True, alpha=0.3)
        
        plt.tight_layout()
        return fig

    def create_alerts_widget(self, kpis: Dict[str, Any]) -> plt.Figure:
        """Create consolidated alerts widget matching frontend"""
        fig, ax = plt.subplots(figsize=(12, 8))
        
        # Extract alert data
        alert_data = [
            {'name': 'Critiques', 'value': kpis.get('Alertes Critiques', 0), 'color': self.colors['danger']},
            {'name': 'Hautes', 'value': kpis.get('Alertes Hautes', 0), 'color': self.colors['warning']},
            {'name': 'Moyennes', 'value': kpis.get('Alertes Moyennes', 0), 'color': self.colors['secondary']},
            {'name': 'Basses', 'value': kpis.get('Alertes Basses', 0), 'color': self.colors['medium']}
        ]
        
        # Convert values to numeric
        for item in alert_data:
            if isinstance(item['value'], str):
                import re
                numbers = re.findall(number_regex, str(item['value']))
                item['value'] = int(float(numbers[0])) if numbers else 0
            else:
                item['value'] = int(item['value']) if item['value'] is not None else 0
        
        total = sum(item['value'] for item in alert_data)
        
        # Create a 2x2 grid layout
        fig.suptitle('Centre d\'Alertes SOC', fontsize=20, fontweight='bold', y=0.95)
        fig.text(0.5, 0.88, 'Vue consolidée des alertes de sécurité', ha='center', fontsize=14, style='italic')
        fig.text(0.5, 0.82, f'Total Alertes: {total}', ha='center', fontsize=16, fontweight='bold')
        
        # Create 2x2 subplot grid for alert boxes
        gs = fig.add_gridspec(2, 2, hspace=0.3, wspace=0.3, top=0.75, bottom=0.1, left=0.1, right=0.9)
        
        for i, alert in enumerate(alert_data):
            row = i // 2
            col = i % 2
            ax_sub = fig.add_subplot(gs[row, col])
            
            # Create circular indicator
            circle = plt.Circle((0.5, 0.7), 0.25, color=alert['color'], alpha=0.8)
            ax_sub.add_patch(circle)
            
            # Add value in circle
            ax_sub.text(0.5, 0.7, str(alert['value']), ha='center', va='center', 
                       fontsize=24, fontweight='bold', color='white')
            
            # Add label
            ax_sub.text(0.5, 0.3, alert['name'], ha='center', va='center', 
                       fontsize=16, fontweight='bold', color=self.colors['dark'])
            
            # Add percentage
            percentage = (alert['value'] / total * 100) if total > 0 else 0
            ax_sub.text(0.5, 0.1, f'{percentage:.1f}%', ha='center', va='center', 
                       fontsize=12, color=self.colors['medium'])
            
            # Remove axes
            ax_sub.set_xlim(0, 1)
            ax_sub.set_ylim(0, 1)
            ax_sub.axis('off')
        
        # Remove main axes
        ax.axis('off')
        
        return fig

    def get_optimal_chart_type(self, title: str) -> str:
        """Get optimal chart type based on data and title - matching frontend logic"""
        chart_type_mapping = {
            'Distribution par Gravité': 'pie',
            'Types d\'Alertes': 'pie',
            'Distribution Horaire': 'bar',
            'Tendances de Détection': 'line',
            'Tendances Faux Positifs': 'line',
            'Événements Quotidiens': 'area',
            'Efficacité de Traitement': 'line',
            'Temps par Gravité': 'bar',
            'Tendances d\'Amélioration': 'line',
            'État des Systèmes': 'pie',
            'Distribution de Charge': 'area',
            'Allocation Analystes': 'bar',
            'Types de Règles': 'pie',
            'Types d\'Indicateurs': 'pie',
            'Campagnes Actives': 'bar',
            'Top Techniques MITRE': 'bar',
            'Disponibilité par Système': 'bar'
        }
        return chart_type_mapping.get(title, 'bar')

    def create_chart_from_data(self, chart_data: Dict[str, Any], chart_title: str) -> plt.Figure:
        """Create a chart from data dictionary - matching frontend visualizations exactly"""
        fig, ax = plt.subplots(figsize=(12, 8))
        
        if not chart_data:
            ax.text(0.5, 0.5, 'Aucune donnée disponible', ha='center', va='center', 
                   transform=ax.transAxes, fontsize=16, color=self.colors['medium'])
            ax.set_title(chart_title, fontsize=16, fontweight='bold', color=self.colors['dark'])
            return fig
        
        # Get optimal chart type based on title (matching frontend logic)
        chart_type = self.get_optimal_chart_type(chart_title)
        
        labels = list(chart_data.keys())
        values = list(chart_data.values())
        
        # Convert string values to numeric if possible
        numeric_values = []
        for v in values:
            if isinstance(v, str):
                import re
                numbers = re.findall(number_regex, str(v))
                if numbers:
                    numeric_values.append(float(numbers[0]))
                else:
                    numeric_values.append(0)
            else:
                numeric_values.append(float(v) if v is not None else 0)
        
        # Enhanced blue color palette matching frontend
        chart_colors = [
            '#1e3a8a', '#1e40af', '#1d4ed8', '#2563eb', '#3b82f6', 
            '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff'
        ]
        
        if chart_type == 'pie':
            # Donut-style pie chart matching frontend
            _, texts, autotexts = ax.pie(
                numeric_values, 
                labels=labels, 
                autopct='%1.1f%%',
                colors=chart_colors[:len(labels)],
                startangle=90,
                pctdistance=0.85,
                wedgeprops={"width":0.5, "edgecolor":'white', "linewidth":2}  # Donut style
            )
            
            # Style the text
            for autotext in autotexts:
                autotext.set_color('white')
                autotext.set_fontweight('bold')
                autotext.set_fontsize(10)
            
            for text in texts:
                text.set_fontsize(9)
                text.set_color(self.colors['dark'])
                
            # Add center text for donut
            centre_circle = plt.Circle((0,0), 0.50, fc='white', linewidth=2, edgecolor=self.colors['primary'])
            ax.add_artist(centre_circle)
            
            # Add total in center
            total = sum(numeric_values)
            ax.text(0, 0, f'Total\n{total}', ha='center', va='center', 
                   fontsize=14, fontweight='bold', color=self.colors['primary'])
                   
        elif chart_type == 'bar':
            # Bar chart with rounded tops matching frontend
            bars = ax.bar(labels, numeric_values, 
                         color=chart_colors[:len(labels)], 
                         alpha=0.9,
                         edgecolor=self.colors['primary'],
                         linewidth=1)
            
            ax.set_ylabel('Valeurs', fontsize=12, color=self.colors['dark'])
            
            # Add value labels on bars
            for bar, value in zip(bars, values):
                height = bar.get_height()
                ax.text(bar.get_x() + bar.get_width()/2., height + max(numeric_values) * 0.01,
                       f'{value}', ha='center', va='bottom', fontweight='bold', 
                       fontsize=10, color=self.colors['dark'])
            
            # Rotate x-axis labels if they're long
            if any(len(str(label)) > 10 for label in labels):
                plt.xticks(rotation=45, ha='right')
                
            # Style axes
            ax.tick_params(colors=self.colors['dark'])
            ax.grid(True, alpha=0.3, color=self.colors['medium'])
            
        elif chart_type == 'line':
            # Line chart matching frontend style
            ax.plot(labels, numeric_values, 
                   color=self.colors['primary'], 
                   linewidth=3,
                   marker='o', 
                   markersize=8, 
                   markerfacecolor='white',
                   markeredgecolor=self.colors['primary'],
                   markeredgewidth=2)
            
            ax.set_ylabel('Valeurs', fontsize=12, color=self.colors['dark'])
            
            # Rotate x-axis labels if they're long
            if any(len(str(label)) > 10 for label in labels):
                plt.xticks(rotation=45, ha='right')
                
            # Style axes
            ax.tick_params(colors=self.colors['dark'])
            ax.grid(True, alpha=0.3, color=self.colors['medium'])
            
        elif chart_type == 'area':
            # Area chart with gradient matching frontend
            ax.fill_between(range(len(labels)), numeric_values, 
                           color=self.colors['primary'], alpha=0.3)
            ax.plot(range(len(labels)), numeric_values, 
                   color=self.colors['primary'], 
                   linewidth=3,
                   marker='o', 
                   markersize=8, 
                   markerfacecolor='white',
                   markeredgecolor=self.colors['primary'],
                   markeredgewidth=2)
            
            ax.set_xticks(range(len(labels)))
            ax.set_xticklabels(labels)
            ax.set_ylabel('Valeurs', fontsize=12, color=self.colors['dark'])
            
            # Rotate x-axis labels if they're long
            if any(len(str(label)) > 10 for label in labels):
                plt.xticks(rotation=45, ha='right')
                
            # Style axes
            ax.tick_params(colors=self.colors['dark'])
            ax.grid(True, alpha=0.3, color=self.colors['medium'])
        
        # Common styling
        ax.set_title(chart_title, fontsize=16, fontweight='bold', pad=20, color=self.colors['dark'])
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.spines['left'].set_color(self.colors['medium'])
        ax.spines['bottom'].set_color(self.colors['medium'])
        
        plt.tight_layout()
        return fig

    def export_to_pdf(self, analysis_data: Dict[str, Any], report_type: str, filename: str = None) -> str:
        """Export dashboard analysis to PDF"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            safe_report_type = secure_filename(report_type)
            filename = f"dashboard_soc_{safe_report_type}_{timestamp}.png"
        
        # Create temporary file
        temp_dir = tempfile.gettempdir()
        pdf_path = os.path.join(temp_dir, filename)
        
        with PdfPages(pdf_path) as pdf:
            # Title page
            fig = plt.figure(figsize=(11, 8.5))
            fig.suptitle('Rapport SOC Dashboard', fontsize=24, fontweight='bold', y=0.8)
            
            # Add report info
            plt.text(0.5, 0.6, f'Type de Rapport: {self.report_labels.get(report_type, report_type)}', 
                    ha='center', va='center', fontsize=16, transform=fig.transFigure)
            plt.text(0.5, 0.5, f'Généré le: {datetime.now().strftime("%d/%m/%Y à %H:%M")}', 
                    ha='center', va='center', fontsize=14, transform=fig.transFigure)
            plt.text(0.5, 0.4, 'Dashboard SOC - Analyse de Sécurité', 
                    ha='center', va='center', fontsize=12, transform=fig.transFigure, style='italic')
            
            plt.axis('off')
            pdf.savefig(fig, bbox_inches='tight')
            plt.close(fig)
            
            # KPIs page - special handling for alerts
            if 'kpis' in analysis_data and analysis_data['kpis']:
                if report_type == 'realtime_alerts':
                    # Create special alerts widget for realtime alerts
                    alerts_fig = self.create_alerts_widget(analysis_data['kpis'])
                    pdf.savefig(alerts_fig, bbox_inches='tight')
                    plt.close(alerts_fig)
                
                # Always create KPI summary chart
                kpi_fig = self.create_kpi_summary_chart(
                    analysis_data['kpis'], 
                    self.report_labels.get(report_type, report_type)
                )
                pdf.savefig(kpi_fig, bbox_inches='tight')
                plt.close(kpi_fig)
            
            # Charts pages
            if 'charts' in analysis_data and analysis_data['charts']:
                for chart_name, chart_data in analysis_data['charts'].items():
                    if chart_data:
                        chart_fig = self.create_chart_from_data(chart_data, chart_name)
                        pdf.savefig(chart_fig, bbox_inches='tight')
                        plt.close(chart_fig)
        
        return pdf_path

    def export_to_png(self, analysis_data: Dict[str, Any], report_type: str, filename: str = None) -> str:
        """Export dashboard analysis to PNG (summary view)"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            safe_report_type = secure_filename(report_type)
            filename = f"dashboard_soc_{safe_report_type}_{timestamp}.png"
        # Create temporary file
        temp_dir = tempfile.gettempdir()
        png_path = os.path.join(temp_dir, filename)
        
        # Create a comprehensive dashboard view
        fig = plt.figure(figsize=(16, 12))
        
        # Title
        fig.suptitle(f'Dashboard SOC - {self.report_labels.get(report_type, report_type)}', 
                    fontsize=20, fontweight='bold', y=0.95)
        
        # Subtitle with timestamp
        plt.figtext(0.5, 0.91, f'Généré le {datetime.now().strftime("%d/%m/%Y à %H:%M")}', 
                   ha='center', fontsize=12, style='italic')
        
        # Layout: 2x2 grid for main content
        gs = fig.add_gridspec(3, 2, height_ratios=[1, 1, 1], hspace=0.3, wspace=0.3)
        
        # KPIs summary (top row, full width)
        if 'kpis' in analysis_data and analysis_data['kpis']:
            ax_kpi = fig.add_subplot(gs[0, :])
            
            kpi_items = list(analysis_data['kpis'].items())[:6]  # Limit to 6 KPIs
            labels = [item[0] for item in kpi_items]
            values = []
            
            for _, value in kpi_items:
                if isinstance(value, str):
                    import re
                    numbers = re.findall(number_regex, str(value))
                    if numbers:
                        values.append(float(numbers[0]))
                    else:
                        values.append(0)
                else:
                    values.append(float(value) if value is not None else 0)
            
            bars = ax_kpi.bar(range(len(labels)), values, color=self.colors['primary'], alpha=0.8)
            ax_kpi.set_xticks(range(len(labels)))
            ax_kpi.set_xticklabels(labels, rotation=45, ha='right')
            ax_kpi.set_title('Indicateurs Clés de Performance (KPIs)', fontweight='bold', pad=20)
            ax_kpi.grid(True, alpha=0.3)
            
            # Add value labels
            for bar, original_value in zip(bars, [item[1] for item in kpi_items]):
                height = bar.get_height()
                ax_kpi.text(bar.get_x() + bar.get_width()/2., height + max(values) * 0.01,
                           f'{original_value}', ha='center', va='bottom', fontweight='bold', fontsize=10)
        
        # Charts (bottom rows) - using same chart types as frontend
        if 'charts' in analysis_data and analysis_data['charts']:
            chart_items = list(analysis_data['charts'].items())[:4]  # Limit to 4 charts
            
            for i, (chart_name, chart_data) in enumerate(chart_items):
                row = 1 + i // 2
                col = i % 2
                ax = fig.add_subplot(gs[row, col])
                
                if chart_data:
                    # Get optimal chart type matching frontend
                    chart_type = self.get_optimal_chart_type(chart_name)
                    
                    labels = list(chart_data.keys())[:5]  # Limit to 5 items per chart
                    values = []
                    
                    for label in labels:
                        value = chart_data[label]
                        if isinstance(value, str):
                            import re
                            numbers = re.findall(number_regex, str(value))
                            if numbers:
                                values.append(float(numbers[0]))
                            else:
                                values.append(0)
                        else:
                            values.append(float(value) if value is not None else 0)
                    
                    # Enhanced blue color palette
                    chart_colors = [
                        '#1e3a8a', '#1e40af', '#1d4ed8', '#2563eb', '#3b82f6'
                    ]
                    
                    if chart_type == 'pie':
                        # Donut-style pie chart matching frontend
                        _, _, autotexts = ax.pie(
                            values, 
                            labels=labels, 
                            autopct='%1.1f%%',
                            colors=chart_colors[:len(labels)],
                            startangle=90,
                            pctdistance=0.85,
                            wedgeprops={'width':0.5, 'edgecolor':'white', 'linewidth':1}
                        )
                        for autotext in autotexts:
                            autotext.set_color('white')
                            autotext.set_fontweight('bold')
                            autotext.set_fontsize(8)
                        
                        # Add center circle for donut effect
                        centre_circle = plt.Circle((0,0), 0.50, fc='white', linewidth=1, edgecolor=self.colors['primary'])
                        ax.add_artist(centre_circle)
                        
                    elif chart_type == 'line':
                        # Line chart matching frontend style
                        ax.plot(range(len(labels)), values, 
                               color=self.colors['primary'], 
                               linewidth=2,
                               marker='o', 
                               markersize=6, 
                               markerfacecolor='white',
                               markeredgecolor=self.colors['primary'],
                               markeredgewidth=1)
                        ax.set_xticks(range(len(labels)))
                        ax.set_xticklabels(labels, rotation=45, ha='right', fontsize=8)
                        ax.grid(True, alpha=0.3)
                        
                    elif chart_type == 'area':
                        # Area chart with gradient
                        ax.fill_between(range(len(labels)), values, 
                                       color=self.colors['primary'], alpha=0.3)
                        ax.plot(range(len(labels)), values, 
                               color=self.colors['primary'], 
                               linewidth=2,
                               marker='o', 
                               markersize=6, 
                               markerfacecolor='white',
                               markeredgecolor=self.colors['primary'],
                               markeredgewidth=1)
                        ax.set_xticks(range(len(labels)))
                        ax.set_xticklabels(labels, rotation=45, ha='right', fontsize=8)
                        ax.grid(True, alpha=0.3)
                        
                    else:
                        # Bar chart matching frontend style
                        bars = ax.bar(labels, values, 
                                     color=chart_colors[:len(labels)], 
                                     alpha=0.9,
                                     edgecolor=self.colors['primary'],
                                     linewidth=0.5)
                        ax.set_xticklabels(labels, rotation=45, ha='right', fontsize=8)
                        ax.grid(True, alpha=0.3)
                        
                        # Add value labels on bars
                        for bar, value in zip(bars, values):
                            height = bar.get_height()
                            if height > 0:
                                ax.text(bar.get_x() + bar.get_width()/2., height + max(values) * 0.01,
                                       f'{int(value)}', ha='center', va='bottom', 
                                       fontweight='bold', fontsize=8)
                
                ax.set_title(chart_name, fontweight='bold', fontsize=10)
        
        plt.tight_layout()
        plt.savefig(png_path, dpi=300, bbox_inches='tight', facecolor='white')
        plt.close(fig)
        
        return png_path

# Create exporter instance
exporter = DashboardExporter()

@router.post("/inwi/export/pdf")
async def export_dashboard_pdf(
    data: ExportRequest,
    current_user: auth_models.User = Depends(get_current_user)
):
    """Export dashboard analysis to PDF"""
    try:
        logger.info(f"User {current_user.email} exporting dashboard to PDF")
        
        analysis_data = data.analysisResult
        report_type = data.reportType
        
        # Generate PDF
        pdf_path = exporter.export_to_pdf(analysis_data, report_type)
        
        # Return file
        return FileResponse(
            path=pdf_path,
            media_type='application/pdf',
            filename=os.path.basename(pdf_path),
            headers={"Content-Disposition": f"attachment; filename={os.path.basename(pdf_path)}"}
        )
        
    except Exception as e:
        logger.error(f"Error exporting to PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Export error: {str(e)}")

@router.post("/inwi/export/png")
async def export_dashboard_png(
    data: ExportRequest,
    current_user: auth_models.User = Depends(get_current_user)
):
    """Export dashboard analysis to PNG"""
    try:
        logger.info(f"User {current_user.email} exporting dashboard to PNG")
        
        analysis_data = data.analysisResult
        report_type = data.reportType
        
        # Generate PNG
        png_path = exporter.export_to_png(analysis_data, report_type)
        
        # Return file
        return FileResponse(
            path=png_path,
            media_type='image/png',
            filename=os.path.basename(png_path),
            headers={"Content-Disposition": f"attachment; filename={os.path.basename(png_path)}"}
        )
        
    except Exception as e:
        logger.error(f"Error exporting to PNG: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Export error: {str(e)}")

@router.post("/inwi/export/pdf-test")
async def export_dashboard_pdf_test(data: ExportRequest):
    """Export dashboard analysis to PDF - TEST VERSION WITHOUT AUTH"""
    try:
        logger.info("Test export to PDF")
        
        analysis_data = data.analysisResult
        report_type = data.reportType
        
        # Generate PDF
        pdf_path = exporter.export_to_pdf(analysis_data, report_type)
        
        # Return file
        return FileResponse(
            path=pdf_path,
            media_type='application/pdf',
            filename=os.path.basename(pdf_path),
            headers={"Content-Disposition": f"attachment; filename={os.path.basename(pdf_path)}"}
        )
        
    except Exception as e:
        logger.error(f"Error exporting to PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Export error: {str(e)}")

@router.post("/inwi/export/png-test")
async def export_dashboard_png_test(data: ExportRequest):
    """Export dashboard analysis to PNG - TEST VERSION WITHOUT AUTH"""
    try:
        logger.info("Test export to PNG")
        
        analysis_data = data.analysisResult
        report_type = data.reportType
        
        # Generate PNG
        png_path = exporter.export_to_png(analysis_data, report_type)
        
        # Return file
        return FileResponse(
            path=png_path,
            media_type='image/png',
            filename=os.path.basename(png_path),
            headers={"Content-Disposition": f"attachment; filename={os.path.basename(png_path)}"}
        )
        
    except Exception as e:
        logger.error(f"Error exporting to PNG: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Export error: {str(e)}")