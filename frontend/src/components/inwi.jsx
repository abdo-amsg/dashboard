import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, FileText, TrendingUp, Shield, AlertTriangle, Activity, BarChart3, ArrowLeft, Eye, Zap, Brain, Users, Server, RefreshCw, Calendar, Filter, Info, Clock, Download, FileImage, CheckCircle, XCircle, AlertCircle, HelpCircle, Settings, Maximize2, Minimize2 } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../contexts/AuthContext';

const SOCAnalyzerDashboard = ({returnToSelector}) => {
  const { user, isAuthenticated } = useAuth();
  const [selectedReport, setSelectedReport] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [timeFilter, setTimeFilter] = useState('24h');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshingChart, setRefreshingChart] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileValidation, setFileValidation] = useState({ isValid: null, message: '' });
  const fileInputRef = useRef(null);

  // Auto-refresh functionality
  useEffect(() => {
    const interval = setInterval(() => {
      if (analysisResult && !isLoading) {
        setLastUpdated(new Date());
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [analysisResult, isLoading]);

  // Enhanced blue color palette with more nuanced shades
  const colors = {
    primary: '#1e3a8a',      // Bleu foncé
    secondary: '#3b82f6',    // Bleu moyen
    accent: '#60a5fa',       // Bleu clair
    light: '#dbeafe',        // Bleu très clair
    dark: '#1e293b',         // Gris foncé
    medium: '#475569',       // Gris moyen
    lightGray: '#94a3b8',    // Gris clair
    success: '#059669',      // Vert bleuté
    warning: '#d97706',      // Orange
    danger: '#dc2626',       // Rouge
    gradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
    // Enhanced blue-focused chart palette with more nuanced shades
    chart: [
      '#1e3a8a', // Bleu foncé
      '#1e40af', // Bleu royal foncé
      '#1d4ed8', // Bleu royal
      '#2563eb', // Bleu vif
      '#3b82f6', // Bleu moyen
      '#60a5fa', // Bleu clair
      '#93c5fd', // Bleu pastel
      '#bfdbfe', // Bleu très clair
      '#dbeafe', // Bleu pâle
      '#eff6ff', // Bleu glacé
    ],
    // Gradient definitions for area charts
    blueGradients: [
      ['#1e3a8a', '#3b82f620'], // Dark blue to transparent medium blue
      ['#3b82f6', '#60a5fa20'], // Medium blue to transparent light blue
      ['#60a5fa', '#dbeafe20'], // Light blue to transparent very light blue
    ]
  };

  const reportTypes = [
    { value: 'realtime_alerts', label: 'Alertes Temps Réel', description: 'Alertes de sécurité actives et incidents', icon: AlertTriangle },
    { value: 'event_processing', label: 'Traitement d\'Événements', description: 'Métriques de traitement quotidien des événements', icon: Activity },
    { value: 'detection_efficiency', label: 'Efficacité de Détection', description: 'Taux de faux positifs et précision de détection', icon: Eye },
    { value: 'response_times', label: 'Temps de Réponse', description: 'Temps de réponse par niveau de gravité', icon: Zap },
    { value: 'system_status', label: 'État des Systèmes', description: 'Disponibilité des outils et systèmes SOC', icon: Server },
    { value: 'resource_allocation', label: 'Allocation des Ressources', description: 'Charge de travail et utilisation des ressources', icon: Users },
    { value: 'detection_rules', label: 'Règles de Détection', description: 'Règles actives et couverture MITRE ATT&CK', icon: Shield },
    { value: 'threat_intelligence', label: 'Threat Intelligence', description: 'IOCs, campagnes et indicateurs de menaces', icon: Brain }
  ];

  const timeFilters = [
    { value: '1h', label: '1 Heure' },
    { value: '6h', label: '6 Heures' },
    { value: '24h', label: '24 Heures' },
    { value: '7d', label: '7 Jours' },
    { value: '30d', label: '30 Jours' }
  ];

  // Notification system
  const addNotification = (type, message, duration = 5000) => {
    const id = Date.now();
    const notification = { id, type, message };
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // File validation
  const validateFile = (file) => {
    if (!file) {
      setFileValidation({ isValid: null, message: '' });
      return false;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel'];
    
    if (file.size > maxSize) {
      setFileValidation({ 
        isValid: false, 
        message: 'Le fichier est trop volumineux (max 10MB)' 
      });
      return false;
    }

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      setFileValidation({ 
        isValid: false, 
        message: 'Format de fichier non supporté. Utilisez un fichier CSV.' 
      });
      return false;
    }

    setFileValidation({ 
      isValid: true, 
      message: 'Fichier valide et prêt pour l\'analyse' 
    });
    return true;
  };

  // Enhanced progress tracking
  const simulateUploadProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
    return interval;
  };

  // Drag & Drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        addNotification('success', `Fichier "${droppedFile.name}" ajouté avec succès`);
      } else {
        addNotification('error', 'Fichier non valide. Veuillez sélectionner un fichier CSV.');
      }
    }
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        addNotification('success', `Fichier "${selectedFile.name}" sélectionné avec succès`);
      } else {
        addNotification('error', 'Fichier non valide. Veuillez sélectionner un fichier CSV.');
      }
    }
  };

  // Refresh handler (global or per-chart)
  const handleRefresh = async (chartKey = null) => {
    if (!analysisResult) return;
    if (chartKey) setRefreshingChart(chartKey);
    else setIsRefreshing(true);

    setLastUpdated(new Date());

    // Simulate refresh action (replace with real re-fetch if needed)
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshingChart(null);
    }, 2000);
  };

  // Analyze data (upload file to backend)
  const analyzeData = async () => {
    if (!file || !selectedReport) {
      addNotification('warning', 'Veuillez sélectionner un fichier et un type de rapport');
      return;
    }

    if (!validateFile(file)) {
      addNotification('error', 'Le fichier sélectionné n\'est pas valide');
      return;
    }

    setIsLoading(true);
    const progressInterval = simulateUploadProgress();

    try {
      addNotification('info', 'Début de l\'analyse des données...', 3000);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('reportType', selectedReport);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const accessToken = localStorage.getItem('accessToken');

      const endpoint = accessToken ? '/api/inwi/upload' : '/api/inwi/upload-test';
      const headers = accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {};

      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        body: formData,
        headers: headers
      });

      setUploadProgress(100);
      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (result.success && result.data) {
        const adaptedData = adaptBackendData(result.data, selectedReport);
        setAnalysisResult(adaptedData);
        setLastUpdated(new Date());
        addNotification('success', 'Analyse terminée avec succès !');
      } else {
        throw new Error('Données invalides reçues du serveur');
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      addNotification('error', `Erreur lors de l'analyse: ${error.message}`);
      clearInterval(progressInterval);
    } finally {
      setIsLoading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  // Adapt backend data to front labels and chartable format
  const adaptBackendData = (backendData, reportType) => {
    if (!backendData) return { kpis: {}, charts: {} };
    if (backendData.error) {
      throw new Error(backendData.error);
    }

    const kpiLabels = {
      realtime_alerts: {
        'critical_alerts': 'Alertes Critiques',
        'high_alerts': 'Alertes Hautes',
        'medium_alerts': 'Alertes Moyennes',
        'low_alerts': 'Alertes Basses',
        'recent_alerts_30min': 'Alertes Récentes (30min)',
        'total_active_alerts': 'Total Alertes Actives'
      },
      event_processing: {
        'events_per_day': 'Événements par Jour',
        'alerts_generated': 'Alertes Générées',
        'processing_rate': 'Taux de Traitement',
        'total_events_processed': 'Total Événements Traités'
      },
      detection_efficiency: {
        'false_positive_rate': 'Taux Faux Positifs',
        'detection_precision': 'Précision Détection',
        'true_positives': 'Vrais Positifs',
        'false_positives': 'Faux Positifs'
      },
      response_times: {
        'critical_response_time': 'Réponse Critique',
        'high_response_time': 'Réponse Haute',
        'medium_response_time': 'Réponse Moyenne',
        'low_response_time': 'Réponse Basse',
        'critical_improvement': 'Amélioration Critique',
        'high_improvement': 'Amélioration Haute'
      },
      system_status: {
        'operational_systems': 'Systèmes Opérationnels',
        'total_systems': 'Total Systèmes',
        'operational_percentage': 'Pourcentage Opérationnel',
        'systems_monitored': 'Systèmes Surveillés'
      },
      resource_allocation: {
        'current_load': 'Charge Actuelle',
        'active_analysts': 'Analystes Actifs',
        'resource_utilization': 'Utilisation Ressources',
        'analyst_efficiency': 'Efficacité Analystes'
      },
      detection_rules: {
        'active_rules': 'Règles Actives',
        'custom_rules': 'Règles Personnalisées',
        'mitre_coverage': 'Couverture MITRE',
        'new_rules_7d': 'Nouvelles Règles (7j)',
        'rule_efficiency': 'Efficacité Règles'
      },
      threat_intelligence: {
        'new_threats_identified': 'Nouvelles Menaces',
        'ip_indicators': 'Indicateurs IP',
        'domain_indicators': 'Indicateurs Domaine',
        'hash_indicators': 'Indicateurs Hash',
        'automation_rate': 'Taux Automatisation',
        'mttr_minutes': 'MTTR Moyen',
        'incidents_prevented_30d': 'Incidents Prévenus'
      }
    };

    const chartLabels = {
      realtime_alerts: {
        'severity_distribution': 'Distribution par Gravité',
        'alert_types': 'Types d\'Alertes',
        'hourly_distribution': 'Distribution Horaire'
      },
      event_processing: {
        'daily_events': 'Événements Quotidiens',
        'processing_efficiency': 'Efficacité de Traitement'
      },
      detection_efficiency: {
        'detection_trends': 'Tendances de Détection',
        'fp_rate_trends': 'Tendances Faux Positifs'
      },
      response_times: {
        'response_times_by_severity': 'Temps par Gravité',
        'improvement_trends': 'Tendances d\'Amélioration'
      },
      system_status: {
        'system_status': 'État des Systèmes',
        'system_availability': 'Disponibilité par Système'
      },
      resource_allocation: {
        'load_distribution': 'Distribution de Charge',
        'analyst_allocation': 'Allocation Analystes'
      },
      detection_rules: {
        'rule_types': 'Types de Règles',
        'top_mitre_techniques': 'Top Techniques MITRE'
      },
      threat_intelligence: {
        'indicator_types': 'Types d\'Indicateurs',
        'active_campaigns': 'Campagnes Actives',
        'threat_trends': 'Tendances Menaces'
      }
    };

    const adaptedKpis = {};
    if (backendData.kpis) {
      Object.entries(backendData.kpis).forEach(([key, value]) => {
        const label = kpiLabels[reportType]?.[key] || key.replace(/_/g, ' ').toUpperCase();
        adaptedKpis[label] = value;
      });
    }

    const adaptedCharts = {};
    if (backendData.charts) {
      Object.entries(backendData.charts).forEach(([key, value]) => {
        const label = chartLabels[reportType]?.[key] || key.replace(/_/g, ' ').toUpperCase();
        adaptedCharts[label] = value;
      });
    }

    return {
      kpis: adaptedKpis,
      charts: adaptedCharts
    };
  };

  // Export functions
  const exportToPDF = async () => {
    if (!analysisResult || !selectedReport) {
      alert('Aucune donnée à exporter. Veuillez d\'abord analyser un fichier.');
      return;
    }
    setIsExporting(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const accessToken = localStorage.getItem('accessToken');

      const endpoint = accessToken ? '/api/inwi/export/pdf' : '/api/inwi/export/pdf-test';
      const headers = {
        'Content-Type': 'application/json',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
      };

      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          analysisResult: analysisResult,
          reportType: selectedReport
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `rapport_soc_${selectedReport}_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      alert(`Erreur lors de l'export PDF: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPNG = async () => {
    if (!analysisResult || !selectedReport) {
      alert('Aucune donnée à exporter. Veuillez d\'abord analyser un fichier.');
      return;
    }

    setIsExporting(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const accessToken = localStorage.getItem('accessToken');

      const endpoint = accessToken ? '/api/inwi/export/png' : '/api/inwi/export/png-test';
      const headers = {
        'Content-Type': 'application/json',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
      };

      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          analysisResult: analysisResult,
          reportType: selectedReport
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `dashboard_soc_${selectedReport}_${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Erreur lors de l\'export PNG:', error);
      alert(`Erreur lors de l'export PNG: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Notification component
  const NotificationSystem = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => {
        const icons = {
          success: CheckCircle,
          error: XCircle,
          warning: AlertCircle,
          info: Info
        };
        const colors = {
          success: 'bg-green-50 border-green-200 text-green-800',
          error: 'bg-red-50 border-red-200 text-red-800',
          warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          info: 'bg-blue-50 border-blue-200 text-blue-800'
        };
        const IconComponent = icons[notification.type];
        
        return (
          <div
            key={notification.id}
            className={`flex items-center p-4 rounded-lg border shadow-lg backdrop-blur-sm transition-all duration-300 transform hover:scale-105 ${colors[notification.type]}`}
          >
            <IconComponent size={20} className="mr-3 flex-shrink-0" />
            <span className="text-sm font-medium flex-1">{notification.message}</span>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );

  // Progress bar component
  const ProgressBar = ({ progress, className = '' }) => (
    <div className={`w-full bg-gray-200 rounded-full h-2 overflow-hidden ${className}`}>
      <div 
        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );

  // Render alerts consolidated widget
  const renderAlertsWidget = () => {
    if (!analysisResult?.kpis || selectedReport !== 'realtime_alerts') return null;

    const alertData = [
      { name: 'Critiques', value: analysisResult.kpis['Alertes Critiques'] || 0, color: colors.danger },
      { name: 'Hautes', value: analysisResult.kpis['Alertes Hautes'] || 0, color: colors.warning },
      { name: 'Moyennes', value: analysisResult.kpis['Alertes Moyennes'] || 0, color: colors.secondary },
      { name: 'Basses', value: analysisResult.kpis['Alertes Basses'] || 0, color: colors.lightGray }
    ];

    const total = alertData.reduce((sum, item) => sum + (parseInt(item.value) || 0), 0);

    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 col-span-full lg:col-span-2">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-50 mr-4">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Centre d'Alertes SOC</h3>
              <p className="text-gray-600 text-sm">Vue consolidée des alertes de sécurité</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{total}</div>
            <div className="text-sm text-gray-500">Total Alertes</div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {alertData.map((alert, index) => (
            <div key={index} className="text-center p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
              <div
                className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: alert.color }}
              >
                {alert.value}
              </div>
              <div className="text-sm font-medium text-gray-700">{alert.name}</div>
              <div className="text-xs text-gray-500 mt-1">
                {total > 0 ? `${((parseInt(alert.value) || 0) / total * 100).toFixed(1)}%` : '0%'}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderKPICard = (title, value, IconComponent, trend, color = colors.primary, description = '') => (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 group relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-lg transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: `${color}15` }}>
            <IconComponent size={24} style={{ color }} />
          </div>
          {trend && (
            <div className={`text-sm font-semibold ${trend > 0 ? 'text-green-600' : 'text-red-600'} flex items-center transition-all duration-300 group-hover:scale-110`}>
              {trend > 0 ? '+' : ''}{trend}%
              <TrendingUp size={16} className={`ml-1 ${trend > 0 ? '' : 'rotate-180'}`} />
            </div>
          )}
        </div>
        
        <h3 className="text-gray-500 text-sm font-medium mb-1 group-hover:text-gray-600 transition-colors">
          {title}
        </h3>
        
        <div className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-blue-900 transition-colors">
          {value}
        </div>
        
        {description && (
          <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors leading-relaxed">
            {description}
          </p>
        )}
        
        {/* Progress indicator for numeric values */}
        {typeof value === 'number' && value > 0 && (
          <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000 group-hover:from-blue-600 group-hover:to-blue-700"
              style={{ width: `${Math.min(value, 100)}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );

  // Get optimal chart type based on data and title
  const getOptimalChartType = (title, reportType) => {
    const chartTypeMapping = {
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
    };

    return chartTypeMapping[title] || 'bar';
  };

  // Enhanced chart rendering helper with improved visuals
  const renderChart = (type, data, title, reportType) => {
    if (!data || typeof data !== 'object') return null;

    const optimalType = getOptimalChartType(title, reportType);
    const chartData = Object.entries(data).map(([key, value], index) => ({
      name: key,
      value: Number(value) || 0,
      fullName: key,
      // Assign a color from the enhanced blue palette
      color: colors.chart[index % colors.chart.length]
    }));

    const isTemporalData = title.includes('Tendances') || title.includes('Quotidiens') ||
                          title.includes('Distribution Horaire') || title.includes('Allocation') ||
                          title.includes('Distribution de Charge');

    const chartDescriptions = {
      'Distribution par Gravité': 'Répartition des alertes par niveau de criticité',
      'Types d\'Alertes': 'Classification des alertes par type de menace',
      'Distribution Horaire': 'Activité des alertes sur 24 heures',
      'Tendances de Détection': 'Évolution de la précision de détection',
      'Événements Quotidiens': 'Volume d\'événements traités par jour',
      'Temps par Gravité': 'Temps de réponse moyen par niveau d\'alerte'
    };

    // Common chart container and header
    const ChartContainer = ({ children }) => (
      <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-500 hover:transform hover:scale-[1.02] relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div>
            <h3 className="text-gray-900 text-xl font-bold mb-2">{title}</h3>
            <p className="text-gray-600 text-sm font-medium">{chartDescriptions[title] || 'Analyse des données'}</p>
          </div>
          <div className="flex items-center space-x-3">
            {isTemporalData && (
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="text-sm border-2 border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 font-semibold bg-white shadow-sm"
              >
                {timeFilters.map(filter => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() => handleRefresh(title)}
              disabled={refreshingChart === title}
              className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 hover:scale-110"
            >
              <RefreshCw size={18} className={refreshingChart === title ? 'animate-spin' : ''} />
            </button>
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Info size={16} className="text-blue-600" />
            </div>
          </div>
        </div>
        
        {children}
      </div>
    );

    // Enhanced tooltip style for all charts
    const enhancedTooltipStyle = {
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      border: '1px solid #e5e7eb',
      borderRadius: '16px',
      color: '#374151',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      fontSize: '14px',
      fontWeight: '500'
    };

    // Common CartesianGrid style
    const enhancedCartesianGrid = (
      <CartesianGrid 
        strokeDasharray="3 3" 
        stroke="#e5e7eb" 
        strokeOpacity={0.7} 
        vertical={false} 
      />
    );

    // Enhanced Legend style
    const enhancedLegendStyle = { 
      fontSize: '12px', 
      fontWeight: '600',
      marginTop: '10px'
    };

    switch (optimalType) {
      case 'pie':
        return (
          <ChartContainer>
            <ResponsiveContainer width="100%" height={380}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  innerRadius={60} // Added innerRadius for donut chart style
                  paddingAngle={2} // Added padding between segments
                  dataKey="value"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                  animationDuration={1500}
                  animationBegin={300}
                  animationEasing="ease-out"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={colors.chart[index % colors.chart.length]} 
                      stroke={colors.primary}
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [`${value} (${((value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%)`, props.payload.fullName]}
                  contentStyle={enhancedTooltipStyle}
                />
                <Legend 
                  wrapperStyle={enhancedLegendStyle}
                  formatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                  iconType="circle" // Changed icon type
                  iconSize={10} // Adjusted icon size
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        );

      case 'bar':
        return (
          <ChartContainer>
            <ResponsiveContainer width="100%" height={380}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                {enhancedCartesianGrid}
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80} 
                  tick={{ fontSize: 12, fill: colors.dark }}
                  tickLine={{ stroke: colors.medium }}
                  axisLine={{ stroke: colors.medium, strokeWidth: 1 }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: colors.dark }}
                  tickLine={{ stroke: colors.medium }}
                  axisLine={{ stroke: colors.medium, strokeWidth: 1 }}
                  tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                />
                <Tooltip 
                  formatter={(value, name, props) => [value, props.payload.fullName]}
                  contentStyle={enhancedTooltipStyle}
                />
                <Bar
                  dataKey="value"
                  fill={colors.secondary}
                  radius={[8, 8, 0, 0]} // Rounded bar tops
                  stroke={colors.primary}
                  strokeWidth={1}
                  animationDuration={1500}
                  animationBegin={300}
                  animationEasing="ease-out"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={colors.chart[index % colors.chart.length]} 
                      fillOpacity={0.9} // Slightly transparent
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        );

      case 'line':
        return (
          <ChartContainer>
            <ResponsiveContainer width="100%" height={380}>
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                {enhancedCartesianGrid}
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80} 
                  tick={{ fontSize: 12, fill: colors.dark }}
                  tickLine={{ stroke: colors.medium }}
                  axisLine={{ stroke: colors.medium, strokeWidth: 1 }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: colors.dark }}
                  tickLine={{ stroke: colors.medium }}
                  axisLine={{ stroke: colors.medium, strokeWidth: 1 }}
                  tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                />
                <Tooltip 
                  formatter={(value, name, props) => [value, props.payload.fullName]}
                  contentStyle={enhancedTooltipStyle}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={colors.primary}
                  strokeWidth={3}
                  dot={{ 
                    fill: 'white', 
                    strokeWidth: 2, 
                    r: 5, 
                    stroke: colors.primary 
                  }}
                  activeDot={{ 
                    r: 8, 
                    stroke: colors.primary, 
                    strokeWidth: 2, 
                    fill: colors.accent 
                  }}
                  animationDuration={1500}
                  animationBegin={300}
                  animationEasing="ease-out"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        );

      case 'area':
        return (
          <ChartContainer>
            <ResponsiveContainer width="100%" height={380}>
              <AreaChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                {enhancedCartesianGrid}
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80} 
                  tick={{ fontSize: 12, fill: colors.dark }}
                  tickLine={{ stroke: colors.medium }}
                  axisLine={{ stroke: colors.medium, strokeWidth: 1 }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: colors.dark }}
                  tickLine={{ stroke: colors.medium }}
                  axisLine={{ stroke: colors.medium, strokeWidth: 1 }}
                  tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                />
                <Tooltip 
                  formatter={(value, name, props) => [value, props.payload.fullName]}
                  contentStyle={enhancedTooltipStyle}
                />
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.primary} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={colors.primary} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={colors.primary}
                  strokeWidth={3}
                  fill="url(#colorValue)"
                  fillOpacity={1}
                  dot={{ 
                    fill: 'white', 
                    strokeWidth: 2, 
                    r: 5, 
                    stroke: colors.primary 
                  }}
                  activeDot={{ 
                    r: 8, 
                    stroke: colors.primary, 
                    strokeWidth: 2, 
                    fill: colors.accent 
                  }}
                  animationDuration={1500}
                  animationBegin={300}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        );

      default:
        return (
          <ChartContainer>
            <div className="flex items-center justify-center h-64 text-gray-500">
              Aucune visualisation disponible pour ces données
            </div>
          </ChartContainer>
        );
    }
  };

  // Main JSX render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
      {/* Notification System */}
      <NotificationSystem />
      
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, ${colors.primary} 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, ${colors.secondary} 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          animation: 'float 20s ease-in-out infinite'
        }}
      />

      <div className="relative p-6 pl-20" style={{ zIndex: 1 }}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-6">
            <button
                onClick={returnToSelector}
                className="absolute left-6 top-6 p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200"
            >
                <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-xl relative">
              <Shield size={40} className="text-white" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent mb-3">
            SOC Analyzer Dashboard
          </h1>
          <p className="text-gray-600 text-xl font-medium mb-4">
            INWI - Centre de Sécurité Opérationnelle
          </p>
          
          {/* Status bar */}
          <div className="flex items-center justify-center space-x-8 mt-6 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg max-w-4xl mx-auto">
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              <span className="text-gray-600">Système Opérationnel</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock size={16} className="mr-2" />
              Dernière mise à jour: {lastUpdated.toLocaleTimeString('fr-FR')}
            </div>
            {isAuthenticated && user && (
              <div className="flex items-center text-sm text-gray-600">
                <Users size={16} className="mr-2" />
                Connecté: {user.email}
              </div>
            )}
            <div className="flex items-center text-sm text-gray-600">
              <Server size={16} className="mr-2" />
              {analysisResult ? 'Données chargées' : 'En attente de données'}
            </div>
          </div>
        </div>

        {/* Config area */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Report type */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <h2 className="text-gray-900 text-xl font-semibold mb-4 flex items-center">
                <BarChart3 className="mr-3 text-blue-600" />
                Type de Rapport
              </h2>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Sélectionner un type de rapport</option>
                {reportTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {selectedReport && (
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <div className="flex items-start">
                    {React.createElement(reportTypes.find(r => r.value === selectedReport)?.icon || FileText, {
                      size: 20,
                      className: "text-blue-600 mt-0.5 mr-3 flex-shrink-0"
                    })}
                    <p className="text-blue-800 text-sm leading-relaxed">
                      {reportTypes.find(r => r.value === selectedReport)?.description}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Upload area */}
            <div
              className={`bg-white rounded-xl p-6 border-2 border-dashed shadow-lg hover:shadow-xl transition-all duration-300 ${dragActive ? 'border-blue-400 bg-blue-50 scale-105' : 'border-gray-300'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="text-center">
                <div className="relative mb-4">
                  <Upload size={48} className={`mx-auto transition-colors ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                  {file && fileValidation.isValid && (
                    <CheckCircle size={20} className="absolute -top-2 -right-2 text-green-500 bg-white rounded-full" />
                  )}
                  {file && fileValidation.isValid === false && (
                    <XCircle size={20} className="absolute -top-2 -right-2 text-red-500 bg-white rounded-full" />
                  )}
                </div>
                
                <p className="text-gray-900 text-lg font-medium mb-2">
                  {file ? file.name : 'Glissez votre fichier CSV ici'}
                </p>
                
                {file && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-1">
                      Taille: {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {fileValidation.message && (
                      <p className={`text-sm font-medium ${fileValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                        {fileValidation.message}
                      </p>
                    )}
                  </div>
                )}
                
                {!file && (
                  <p className="text-gray-500 text-sm mb-4">
                    ou cliquez pour sélectionner (max 10MB)
                  </p>
                )}
                
                {isLoading && uploadProgress > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progression</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <ProgressBar progress={uploadProgress} />
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    {file ? 'Changer le fichier' : 'Sélectionner un fichier'}
                  </button>
                  
                  {file && (
                    <button
                      onClick={() => {
                        setFile(null);
                        setFileValidation({ isValid: null, message: '' });
                        addNotification('info', 'Fichier supprimé');
                      }}
                      className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300"
                    >
                      <XCircle size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <h2 className="text-gray-900 text-xl font-semibold mb-4 flex items-center">
                <Filter className="mr-3 text-blue-600" />
                Contrôles
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filtre Temporel
                  </label>
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    {timeFilters.map(filter => (
                      <option key={filter.value} value={filter.value}>
                        {filter.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing || !analysisResult}
                  className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Actualisation...' : 'Actualiser'}
                </button>

                {/* Export buttons */}
                <div className="border-t pt-4 mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Exporter le Rapport
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={exportToPDF}
                      disabled={isExporting || !analysisResult}
                      className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <FileText size={16} className="mr-2" />
                      {isExporting ? 'Export...' : 'Exporter PDF'}
                    </button>
                    <button
                      onClick={exportToPNG}
                      disabled={isExporting || !analysisResult}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <FileImage size={16} className="mr-2" />
                      {isExporting ? 'Export...' : 'Exporter PNG'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Analyze button */}
          <div className="text-center mt-8">
            <div className="space-y-4">
              <button
                onClick={analyzeData}
                disabled={!file || !selectedReport || isLoading || fileValidation.isValid === false}
                className="px-12 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none text-lg relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                {isLoading ? (
                  <div className="flex items-center relative z-10">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Analyse en cours...
                  </div>
                ) : (
                  <span className="relative z-10 flex items-center justify-center">
                    <BarChart3 size={20} className="mr-2" />
                    Analyser les données
                  </span>
                )}
              </button>
              
              {/* Status indicators */}
              <div className="flex justify-center space-x-6 text-sm">
                <div className={`flex items-center ${file ? 'text-green-600' : 'text-gray-400'}`}>
                  {file ? <CheckCircle size={16} className="mr-1" /> : <XCircle size={16} className="mr-1" />}
                  Fichier
                </div>
                <div className={`flex items-center ${selectedReport ? 'text-green-600' : 'text-gray-400'}`}>
                  {selectedReport ? <CheckCircle size={16} className="mr-1" /> : <XCircle size={16} className="mr-1" />}
                  Type de rapport
                </div>
                <div className={`flex items-center ${fileValidation.isValid ? 'text-green-600' : fileValidation.isValid === false ? 'text-red-600' : 'text-gray-400'}`}>
                  {fileValidation.isValid ? <CheckCircle size={16} className="mr-1" /> : 
                   fileValidation.isValid === false ? <XCircle size={16} className="mr-1" /> : 
                   <HelpCircle size={16} className="mr-1" />}
                  Validation
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis results */}
        {analysisResult && (
          <div className="max-w-7xl mx-auto">
            {renderAlertsWidget()}

            {/* KPIs */}
            {analysisResult.kpis && Object.keys(analysisResult.kpis).length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8 mt-8">
                {Object.entries(analysisResult.kpis)
                  .filter(([key]) => selectedReport !== 'realtime_alerts' || !key.includes('Alertes'))
                  .map(([key, value], index) => {
                    const icons = [TrendingUp, Shield, Activity, Eye, Zap, Users, BarChart3, Brain, Server];
                    const descriptions = {
                      'Événements par Jour': 'Volume quotidien d\'événements de sécurité traités',
                      'Taux de Traitement': 'Pourcentage d\'événements traités avec succès',
                      'Précision Détection': 'Précision du système de détection des menaces',
                      'Réponse Critique': 'Temps moyen de réponse aux alertes critiques',
                      'Systèmes Opérationnels': 'Nombre de systèmes SOC actuellement opérationnels',
                      'Règles Actives': 'Nombre de règles de détection actuellement actives'
                    };

                    return (
                      <div key={key}>
                        {renderKPICard(
                          key,
                          value,
                          icons[index % icons.length],
                          Math.random() > 0.5 ? Math.floor(Math.random() * 20) : -Math.floor(Math.random() * 10),
                          colors.chart[index % colors.chart.length],
                          descriptions[key] || ''
                        )}
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Charts */}
            {analysisResult.charts && Object.keys(analysisResult.charts).length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {Object.entries(analysisResult.charts).map(([chartKey, chartData], index) => {
                  return (
                    <div key={chartKey}>
                      {renderChart(
                        null,
                        chartData,
                        chartKey,
                        selectedReport
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Inline styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }

        .animate-slide-in {
          animation: slideInRight 0.3s ease-out;
        }

        .animate-slide-out {
          animation: slideOutRight 0.3s ease-in;
        }

        .shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200px 100%;
          animation: shimmer 1.5s infinite;
        }

        select {
          background-color: #f9fafb;
          color: #374151;
          transition: all 0.2s ease;
        }

        select:focus {
          background-color: #ffffff;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        select option {
          background-color: white;
          color: #374151;
          padding: 8px;
        }

        .group:hover .group-hover\\:opacity-100 {
          opacity: 1;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Enhanced button hover effects */
        .btn-primary {
          position: relative;
          overflow: hidden;
        }

        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }

        .btn-primary:hover::before {
          left: 100%;
        }

        /* Loading skeleton */
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200px 100%;
          animation: shimmer 1.5s infinite;
        }

        /* Notification animations */
        .notification-enter {
          animation: slideInRight 0.3s ease-out;
        }

        .notification-exit {
          animation: slideOutRight 0.3s ease-in;
        }
      `}</style>
    </div>
  );
};

export default SOCAnalyzerDashboard;
