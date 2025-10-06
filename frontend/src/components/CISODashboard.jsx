import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, FileText, TrendingUp, Shield, AlertTriangle, Activity, BarChart3, Eye, Zap, Brain, Users, Server, RefreshCw, Calendar, Filter, Info, Clock, Download, FileImage, CheckCircle, XCircle, AlertCircle, HelpCircle, Settings, ArrowLeft, Target, TrendingDown } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CISODashboard = ({ returnToSelector, authData = {} }) => {
  // Utiliser les données d'auth passées en props
  const { user = null, isAuthenticated = false } = authData;
  const [selectedReport, setSelectedReport] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [timeFilter, setTimeFilter] = useState('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshingChart, setRefreshingChart] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const [isExporting, setIsExporting] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileValidation, setFileValidation] = useState({ isValid: null, message: '' });
  const fileInputRef = useRef(null);

  // Removed auto-refresh functionality to prevent chart flickering

  // Enhanced color palette for CISO level (more professional/executive)
  const colors = {
    primary: '#4c1d95',      // Purple foncé
    secondary: '#7c3aed',    // Purple moyen
    accent: '#a855f7',       // Purple clair
    light: '#f3e8ff',        // Purple très clair
    dark: '#1e293b',         // Gris foncé
    medium: '#475569',       // Gris moyen
    lightGray: '#94a3b8',    // Gris clair
    success: '#059669',      // Vert
    warning: '#d97706',      // Orange
    danger: '#dc2626',       // Rouge
    gradient: 'linear-gradient(135deg, #faf5ff 0%, #e9d5ff 50%, #d8b4fe 100%)',
    // CISO-focused chart palette with professional colors
    chart: [
      '#4c1d95', // Purple foncé
      '#5b21b6', // Purple royal foncé
      '#6d28d9', // Purple royal
      '#7c3aed', // Purple vif
      '#8b5cf6', // Purple moyen
      '#a855f7', // Purple clair
      '#c084fc', // Purple pastel
      '#d8b4fe', // Purple très clair
      '#e9d5ff', // Purple pâle
      '#f3e8ff', // Purple glacé
    ]
  };

  const reportTypes = [
    { value: 'ciso_incident_report', label: 'Rapport d\'Incidents', description: 'Incidents par criticité, SLA, MTTR, MTTD, MTTC', icon: AlertTriangle },
    { value: 'ciso_vulnerability_report', label: 'Rapport de Vulnérabilités', description: 'Vulnérabilités actives, nouvelles, résolues par criticité', icon: Shield },
    { value: 'ciso_system_availability', label: 'Disponibilité des Outils', description: 'Taux de disponibilité, pannes, temps d\'indisponibilité', icon: Server },
    { value: 'ciso_detection_rules', label: 'Règles & Use Cases', description: 'Règles actives, personnalisées, couverture MITRE ATT&CK', icon: Eye },
    { value: 'ciso_threat_intelligence', label: 'Threat Intelligence', description: 'IOCs collectés, campagnes détectées, ratio d\'utilisation', icon: Brain },
    { value: 'ciso_awareness_training', label: 'Sensibilisation & Formation', description: 'Participation, scores, simulations phishing', icon: Users },
    { value: 'ciso_attack_surface', label: 'Surface d\'Exposition', description: 'Score d\'exposition, actifs exposés, Shadow IT', icon: Target },
    { value: 'ciso_security_projects', label: 'Projets Sécurité', description: 'Avancement, retards, projets terminés dans les délais', icon: TrendingUp }
  ];

  const timeFilters = [
    { value: '7d', label: '7 Jours' },
    { value: '30d', label: '30 Jours' },
    { value: '90d', label: '3 Mois' },
    { value: '6m', label: '6 Mois' },
    { value: '1y', label: '1 Année' }
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

  // Refresh handler
  const handleRefresh = async (chartKey = null) => {
    if (!analysisResult) return;
    if (chartKey) setRefreshingChart(chartKey);
    else setIsRefreshing(true);

    setLastUpdated(new Date());

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
      addNotification('info', 'Début de l\'analyse des données CISO...', 3000);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('reportType', selectedReport);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const accessToken = localStorage.getItem('accessToken');

      const endpoint = accessToken ? '/api/inwi2/upload' : '/api/inwi2/upload-test';
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
        addNotification('success', 'Analyse CISO terminée avec succès !');
      } else {
        throw new Error('Données invalides reçues du serveur');
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse CISO:', error);
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
      ciso_incident_report: {
        'total_incidents': 'Total Incidents',
        'critical_incidents': 'Incidents Critiques',
        'high_incidents': 'Incidents Hauts',
        'sla_compliance': 'Conformité SLA',
        'mttr': 'MTTR Moyen',
        'mttd': 'MTTD Moyen',
        'mttc': 'MTTC Moyen'
      },
      ciso_vulnerability_report: {
        'active_vulnerabilities': 'Vulnérabilités Actives',
        'new_vulnerabilities': 'Nouvelles Vulnérabilités',
        'resolved_vulnerabilities': 'Vulnérabilités Résolues',
        'critical_vulnerabilities': 'Vulnérabilités Critiques',
        'avg_patching_time': 'Temps Moyen de Patching',
        'resolution_rate': 'Taux de Résolution'
      },
      ciso_system_availability: {
        'overall_availability': 'Disponibilité Globale',
        'total_downtime_hours': 'Temps d\'Arrêt Total',
        'monthly_outages': 'Pannes Mensuelles',
        'avg_downtime_per_outage': 'Temps d\'Arrêt Moyen',
        'sla_compliance': 'Conformité SLA',
        'uptime_target': 'Objectif Disponibilité'
      },
      ciso_detection_rules: {
        'active_rules': 'Règles Actives',
        'custom_rules_percentage': 'Pourcentage Règles Personnalisées',
        'new_rules_monthly': 'Nouvelles Règles Mensuelles',
        'disabled_rules': 'Règles Désactivées',
        'mitre_coverage': 'Couverture MITRE',
        'rule_efficiency': 'Efficacité des Règles'
      },
      ciso_threat_intelligence: {
        'new_iocs_collected': 'Nouveaux IOCs Collectés',
        'active_ip_indicators': 'Indicateurs IP Actifs',
        'active_domain_indicators': 'Indicateurs Domaine Actifs',
        'active_hash_indicators': 'Indicateurs Hash Actifs',
        'campaigns_detected': 'Campagnes Détectées',
        'ioc_utilization_rate': 'Taux d\'Utilisation IOC'
      },
      ciso_awareness_training: {
        'participation_rate': 'Taux de Participation',
        'average_training_score': 'Score Moyen Formation',
        'phishing_failure_rate': 'Taux d\'Échec Phishing',
        'employees_trained': 'Employés Formés',
        'training_compliance': 'Conformité Formation',
        'security_awareness_level': 'Niveau Sensibilisation'
      },
      ciso_attack_surface: {
        'exposure_score': 'Score d\'Exposition',
        'exposed_assets': 'Actifs Exposés',
        'critical_services_exposed': 'Services Critiques Exposés',
        'shadow_it_detected': 'Shadow IT Détecté',
        'exposure_percentage': 'Pourcentage d\'Exposition',
        'risk_level': 'Niveau de Risque'
      },
      ciso_security_projects: {
        'average_progress': 'Progression Moyenne',
        'projects_delayed': 'Projets en Retard',
        'projects_completed_on_time': 'Projets Terminés à Temps',
        'budget_utilization': 'Utilisation Budget',
        'total_active_projects': 'Total Projets Actifs',
        'project_health': 'Santé des Projets'
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
        const label = key.replace(/_/g, ' ').toUpperCase();
        adaptedCharts[label] = value;
      });
    }

    return {
      kpis: adaptedKpis,
      charts: adaptedCharts
    };
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
          info: 'bg-purple-50 border-purple-200 text-purple-800'
        };
        const IconComponent = icons[notification.type];

        return (
          <div
            key={notification.id}
            className={`flex items-center p-4 rounded-lg border shadow-lg backdrop-blur-sm transition-all  transform hover:scale-105 ${colors[notification.type]}`}
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
        className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all  ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );

  const renderKPICard = (title, value, IconComponent, trend, color = colors.primary, description = '') => {
    const [showTooltip, setShowTooltip] = useState(false);
    
    // CISO KPI descriptions
    const kpiDescriptions = {
      'INCIDENTS CRITIQUES': 'Nombre d\'incidents de sécurité de niveau critique nécessitant une réponse immédiate.',
      'TEMPS MOYEN RÉSOLUTION': 'Délai moyen pour résoudre complètement un incident de sécurité.',
      'TAUX CONFORMITÉ': 'Pourcentage de conformité aux politiques de sécurité de l\'organisation.',
      'VULNÉRABILITÉS CRITIQUES': 'Nombre de vulnérabilités critiques identifiées et non corrigées.',
      'COUVERTURE MITRE': 'Pourcentage de couverture des techniques MITRE ATT&CK par nos contrôles.',
      'DISPONIBILITÉ SYSTÈMES': 'Pourcentage de disponibilité des systèmes critiques de sécurité.'
    };

    const tooltipText = kpiDescriptions[title] || description || 'Métrique de sécurité importante pour la gouvernance CISO.';

    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}15` }}>
            <IconComponent size={24} style={{ color }} />
          </div>
          <div className="flex items-center space-x-2">
            {trend && (
              <div className={`text-sm font-semibold ${trend > 0 ? 'text-green-600' : 'text-red-600'} flex items-center`}>
                {trend > 0 ? '+' : ''}{trend}%
                <TrendingUp size={16} className={`ml-1 ${trend > 0 ? '' : 'rotate-180'}`} />
              </div>
            )}
            
            {/* Info icon with tooltip */}
            <div className="relative">
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="p-1 rounded-full bg-gray-100 hover:bg-purple-100"
              >
                <Info size={14} className="text-gray-500" />
              </button>
              
              {/* Simple tooltip */}
              {showTooltip && (
                <div className="absolute right-0 top-8 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
                  <div className="text-sm text-gray-700">
                    {tooltipText}
                  </div>
                  {/* Arrow */}
                  <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        <h3 className="text-gray-500 text-sm font-medium mb-1">
          {title}
        </h3>

        <div className="text-2xl font-bold text-gray-900 mb-1">
          {value}
        </div>

        {description && (
          <p className="text-xs text-gray-500">
            {description}
          </p>
        )}
      </div>
    );
  };

  // Get optimal chart type based on data and title
  const getOptimalChartType = (title, reportType) => {
    const chartTypeMapping = {
      'INCIDENTS BY CRITICALITY': 'pie',
      'MONTHLY TRENDS': 'line',
      'RESPONSE METRICS': 'bar',
      'VULNERABILITY BY CRITICALITY': 'pie',
      'PATCHING PERFORMANCE': 'bar',
      'MONTHLY AVAILABILITY': 'line',
      'OUTAGES TREND': 'bar',
      'AVAILABILITY VS TARGET': 'bar',
      'RULE MANAGEMENT TRENDS': 'line',
      'MITRE COVERAGE BY TACTIC': 'bar',
      'COVERAGE EVOLUTION': 'line',
      'IOC BY TYPE': 'pie',
      'MONTHLY INTELLIGENCE': 'line',
      'TOP THREAT ACTORS': 'bar',
      'MONTHLY PARTICIPATION': 'line',
      'PHISHING SIMULATION TRENDS': 'line',
      'DEPARTMENT COMPLETION': 'bar',
      'EXPOSURE TRENDS': 'line',
      'ASSET EXPOSURE BY TYPE': 'pie',
      'SHADOW IT TRENDS': 'bar',
      'PROJECT STATUS TRENDS': 'line',
      'PROJECT CATEGORIES': 'pie',
      'COMPLETION TRENDS': 'line'
    };

    return chartTypeMapping[title] || 'bar';
  };

  // Enhanced chart rendering helper
  const renderChart = (type, data, title, reportType) => {
    if (!data || typeof data !== 'object') return null;

    const optimalType = getOptimalChartType(title, reportType);
    let chartData;

    // Handle different data structures
    if (Array.isArray(data)) {
      chartData = data;
    } else if (typeof data === 'object') {
      chartData = Object.entries(data).map(([key, value], index) => ({
        name: key,
        value: Number(value) || 0,
        fullName: key,
        color: colors.chart[index % colors.chart.length]
      }));
    } else {
      return null;
    }

    // Simple chart container with tooltips
    const ChartContainer = ({ children }) => {
      const [showChartTooltip, setShowChartTooltip] = useState(false);
      
      // CISO Chart descriptions for tooltips
      const chartTooltips = {
        'INCIDENTS BY CRITICALITY': 'Répartition des incidents de sécurité par niveau de criticité. Permet d\'évaluer la charge de travail et les priorités.',
        'MONTHLY TRENDS': 'Évolution mensuelle des incidents de sécurité. Aide à identifier les tendances et patterns.',
        'RESPONSE METRICS': 'Métriques de temps de réponse aux incidents par niveau de gravité.',
        'VULNERABILITY BY CRITICALITY': 'Distribution des vulnérabilités par niveau de criticité dans l\'infrastructure.',
        'PATCHING PERFORMANCE': 'Performance du processus de correction des vulnérabilités.',
        'MONTHLY AVAILABILITY': 'Disponibilité mensuelle des systèmes de sécurité critiques.',
        'OUTAGES TREND': 'Tendance des pannes et interruptions de service.',
        'AVAILABILITY VS TARGET': 'Comparaison entre la disponibilité réelle et les objectifs SLA.',
        'RULE MANAGEMENT TRENDS': 'Évolution de la gestion des règles de sécurité.',
        'MITRE COVERAGE BY TACTIC': 'Couverture des tactiques MITRE ATT&CK par nos contrôles de sécurité.',
        'COVERAGE EVOLUTION': 'Évolution de la couverture de sécurité dans le temps.',
        'IOC BY TYPE': 'Répartition des indicateurs de compromission par type.',
        'MONTHLY INTELLIGENCE': 'Intelligence de menaces collectée mensuellement.',
        'TOP THREAT ACTORS': 'Principaux acteurs de menaces identifiés.',
        'MONTHLY PARTICIPATION': 'Participation mensuelle aux programmes de sensibilisation.',
        'PHISHING SIMULATION TRENDS': 'Résultats des simulations de phishing dans le temps.',
        'DEPARTMENT COMPLETION': 'Taux de completion des formations par département.',
        'EXPOSURE TRENDS': 'Évolution de l\'exposition aux risques de sécurité.',
        'ASSET EXPOSURE BY TYPE': 'Exposition des actifs par type de risque.'
      };

      const tooltipText = chartTooltips[title] || 'Analyse des données de sécurité pour la gouvernance CISO.';

      return (
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-gray-900 text-xl font-bold mb-2">{title}</h3>
              <p className="text-gray-600 text-sm">Analyse des données CISO</p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Info icon with tooltip */}
              <div className="relative">
                <button
                  onMouseEnter={() => setShowChartTooltip(true)}
                  onMouseLeave={() => setShowChartTooltip(false)}
                  className="p-1 rounded-full bg-gray-100 hover:bg-purple-100"
                >
                  <Info size={14} className="text-gray-500" />
                </button>
                
                {/* Chart tooltip */}
                {showChartTooltip && (
                  <div className="absolute right-0 top-8 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
                    <div className="text-sm text-gray-700">
                      {tooltipText}
                    </div>
                    {/* Arrow */}
                    <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {children}
        </div>
      );
    };

    // Enhanced tooltip style
    const enhancedTooltipStyle = {
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      border: '1px solid #e5e7eb',
      borderRadius: '16px',
      color: '#374151',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      fontSize: '14px',
      fontWeight: '500'
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
                  innerRadius={60}
                  paddingAngle={2}
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
                  formatter={(value, name, props) => {
                    const total = chartData.reduce((sum, item) => sum + item.value, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    return [`${value} (${percentage}%)`, props.payload.fullName || name];
                  }}
                  labelFormatter={(label) => `Catégorie: ${label}`}
                  contentStyle={{
                    ...enhancedTooltipStyle,
                    padding: '12px 16px',
                    lineHeight: '1.5',
                    border: '1px solid #d8b4fe'
                  }}
                  cursor={{ fill: 'rgba(147, 51, 234, 0.1)' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', fontWeight: '600', marginTop: '10px' }}
                  formatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                  iconType="circle"
                  iconSize={10}
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
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.7} vertical={false} />
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
                  formatter={(value, name, props) => {
                    const formattedValue = value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value;
                    return [formattedValue, props.payload.fullName || name];
                  }}
                  labelFormatter={(label) => `Élément: ${label}`}
                  contentStyle={{
                    ...enhancedTooltipStyle,
                    padding: '12px 16px',
                    lineHeight: '1.5',
                    border: '1px solid #d8b4fe'
                  }}
                  cursor={{ fill: 'rgba(147, 51, 234, 0.1)' }}
                />
                <Bar
                  dataKey="value"
                  fill={colors.secondary}
                  radius={[8, 8, 0, 0]}
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
                      fillOpacity={0.9}
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
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.7} vertical={false} />
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
                  formatter={(value, name, props) => {
                    const formattedValue = value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value;
                    return [formattedValue, props.payload.fullName || name];
                  }}
                  labelFormatter={(label) => `Élément: ${label}`}
                  contentStyle={{
                    ...enhancedTooltipStyle,
                    padding: '12px 16px',
                    lineHeight: '1.5',
                    border: '1px solid #d8b4fe'
                  }}
                  cursor={{ fill: 'rgba(147, 51, 234, 0.1)' }}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 relative overflow-hidden">
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

      <div className="relative p-6" style={{ zIndex: 1 }}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-6">
            <button
              onClick={returnToSelector}
              className="absolute left-6 top-6 p-3 bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>

            <div className="p-6 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl shadow-xl relative">
              <TrendingUp size={40} className="text-white" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full"></div>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-900 to-purple-600 bg-clip-text text-transparent mb-3">
            CISO Dashboard
          </h1>
          <p className="text-gray-600 text-xl font-medium mb-4">
            INWI - Niveau 2 Pilotage & Management
          </p>

          {/* Status bar */}
          <div className="flex items-center justify-center space-x-8 mt-6 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg max-w-4xl mx-auto">
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
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
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-gray-900 text-xl font-semibold mb-4 flex items-center">
                <BarChart3 className="mr-3 text-purple-600" />
                Type de Rapport CISO
              </h2>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="">Sélectionner un type de rapport</option>
                {reportTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {selectedReport && (
                <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
                  <div className="flex items-start">
                    {React.createElement(reportTypes.find(r => r.value === selectedReport)?.icon || FileText, {
                      size: 20,
                      className: "text-purple-600 mt-0.5 mr-3 flex-shrink-0"
                    })}
                    <p className="text-purple-800 text-sm leading-relaxed">
                      {reportTypes.find(r => r.value === selectedReport)?.description}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Upload area */}
            <div
              className={`bg-white rounded-xl p-6 border-2 border-dashed shadow-lg hover:shadow-xl transition-all  ${dragActive ? 'border-purple-400 bg-purple-50 scale-105' : 'border-gray-300'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="text-center">
                <div className="relative mb-4">
                  <Upload size={48} className={`mx-auto transition-colors ${dragActive ? 'text-purple-500' : 'text-gray-400'}`} />
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
                      Taille: {file.size ? (file.size / 1024 / 1024).toFixed(2) : '0.00'} MB
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
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
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
                      className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
                    >
                      <XCircle size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-gray-900 text-xl font-semibold mb-4 flex items-center">
                <Filter className="mr-3 text-purple-600" />
                Contrôles
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Période d'Analyse
                  </label>
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
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
                  className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all  disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Actualisation...' : 'Actualiser'}
                </button>
              </div>
            </div>
          </div>

          {/* Analyze button */}
          <div className="text-center mt-8">
            <div className="space-y-4">
              <button
                onClick={analyzeData}
                disabled={!file || !selectedReport || isLoading || fileValidation.isValid === false}
                className="px-12 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Analyse CISO en cours...
                  </div>
                ) : (
                  <span className="flex items-center justify-center">
                    <TrendingUp size={20} className="mr-2" />
                    Analyser les données CISO
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
            {/* KPIs */}
            {analysisResult.kpis && Object.keys(analysisResult.kpis).length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {Object.entries(analysisResult.kpis).map(([key, value], index) => {
                  const icons = [TrendingUp, Shield, Activity, Eye, Zap, Users, BarChart3, Brain, Server, Target];
                  const descriptions = {
                    'Total Incidents': 'Nombre total d\'incidents de sécurité traités',
                    'Conformité SLA': 'Pourcentage de conformité aux accords de niveau de service',
                    'Vulnérabilités Actives': 'Nombre de vulnérabilités actuellement non corrigées',
                    'Disponibilité Globale': 'Taux de disponibilité moyen des systèmes critiques',
                    'Règles Actives': 'Nombre de règles de détection actuellement déployées',
                    'Taux de Participation': 'Pourcentage d\'employés ayant suivi les formations'
                  };

                  return (
                    <div key={key}>
                      {renderKPICard(
                        key,
                        value,
                        icons[index % icons.length],
                        Math.random() > 0.5 ? Math.floor(Math.random() * 15) : -Math.floor(Math.random() * 8),
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
      `}</style>
    </div>
  );
};

export default CISODashboard;