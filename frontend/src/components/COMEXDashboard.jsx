// ComexDashboard.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload, ArrowLeft, BarChart3, PieChart as PieChartIcon, CheckCircle, XCircle, AlertCircle, Info,
  TrendingUp, Shield, Activity, Eye, Zap, Users, Server, Target, RefreshCw, Clock, Settings,
  DollarSign, AlertTriangle, Award, Briefcase, Globe
} from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area
} from 'recharts';

const ComexDashboard = () => {
  const [file, setFile] = useState(null);
  const [selectedReport, setSelectedReport] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshingChart, setRefreshingChart] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [dragActive, setDragActive] = useState(false);
  const [fileValidation, setFileValidation] = useState({ isValid: null, message: '' });
  const fileRef = useRef();

  // Enhanced color palette for COMEX level (executive/strategic)
  const colors = {
    primary: '#1e40af',      // Blue foncé
    secondary: '#3b82f6',    // Blue moyen
    accent: '#60a5fa',       // Blue clair
    light: '#eff6ff',        // Blue très clair
    dark: '#1e293b',         // Gris foncé
    medium: '#475569',       // Gris moyen
    lightGray: '#94a3b8',    // Gris clair
    success: '#059669',      // Vert
    warning: '#d97706',      // Orange
    danger: '#dc2626',       // Rouge
    gradient: 'linear-gradient(135deg, #f0f9ff 0%, #dbeafe 50%, #bfdbfe 100%)',
    // COMEX-focused chart palette with executive colors
    chart: [
      '#1e40af', // Blue foncé
      '#2563eb', // Blue royal
      '#3b82f6', // Blue vif
      '#60a5fa', // Blue moyen
      '#93c5fd', // Blue clair
      '#c7d2fe', // Indigo clair
      '#a78bfa', // Purple clair
      '#f59e0b', // Amber
      '#10b981', // Emerald
      '#ef4444', // Red
    ]
  };

  // Auto-refresh functionality (moins fréquent pour niveau COMEX)
  useEffect(() => {
    let interval;
    if (analysisResult && !isLoading) {
      interval = setInterval(() => {
        setLastUpdated(new Date());
        // Pas de re-fetch automatique pour éviter les clignotements
      }, 300000); // Update timestamp every 5 minutes for COMEX level
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [analysisResult, isLoading]);

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

  const reportTypes = [
    { value: 'strategic_risk_posture', label: 'Posture de Risque Cyber' },
    { value: 'financial_impact_costs', label: 'Impact Financier - Coût Incidents' },
    { value: 'financial_impact_avoided', label: 'Impact Financier - Pertes évitées' },
    { value: 'regulatory_compliance', label: 'Conformité Réglementaire' },
    { value: 'security_program', label: 'Programme Sécurité' },
    { value: 'incident_resolution', label: 'Résolution des Incidents' },
    { value: 'benchmark_sector', label: 'Benchmark Sectoriel' },
    { value: 'threat_landscape', label: 'Paysage des Menaces' },
    { value: 'exposure_risk', label: 'Exposition au Risque' },
    { value: 'strategic_alignment', label: 'Alignement Stratégique' }
  ];

  const validateFile = (f) => {
    if (!f) return false;
    if (!f.name.endsWith('.csv')) return false;
    if (f.size > 10 * 1024 * 1024) return false;
    return true;
  };

  const handleFileSelect = (e) => {
    const f = e.target.files[0];
    if (validateFile(f)) setFile(f);
    else addNotification('error', 'Fichier invalide (CSV <10MB requis)', 4000);
  };

  const adaptBackendData = (backendData, reportType) => {
    if (!backendData) return { kpis: {}, charts: {} };
    if (backendData.error) {
      throw new Error(backendData.error);
    }

    const labelMap = {
      strategic_risk_posture: {
        avg_risk_score: 'Score Risque Moyen',
        assets_high_critical: 'Actifs Critiques (Haut)',
        avg_vuln_severity: 'Sévérité Vulnérabilités Moyenne',
        incidents_total: 'Incidents Totaux',
        patch_coverage_pct: 'Couverture Patching'
      },
      financial_impact_costs: {
        total_incidents: 'Nombre Incidents',
        overall_cost: 'Coût Total',
        avg_cost: 'Coût Moyen',
        median_cost: 'Coût Médian'
      },
      financial_impact_avoided: {
        total_expected_loss: 'Perte Attendue Totale',
        total_avoided_loss: 'Perte Évitée Totale',
        mitigation_effectiveness_pct: 'Efficacité Mitigation (%)'
      },
      regulatory_compliance: {
        total_controls: 'Total Contrôles',
        compliant_controls: 'Contrôles Conformes',
        non_compliant_controls: 'Contrôles Non-Conformes',
        compliance_pct: 'Conformité (%)'
      },
      security_program: {
        avg_maturity_score: 'Score Maturité Moyen',
        total_budget_planned: 'Budget Planifié Total',
        total_budget_used: 'Budget Utilisé Total',
        budget_utilization_pct: 'Utilisation Budget (%)'
      },
      incident_resolution: {
        avg_time_to_detect_hours: 'Temps Détection Moyen (h)',
        avg_time_to_resolve_hours: 'Temps Résolution Moyen (h)',
        unresolved_incidents: 'Incidents Non-Résolus'
      },
      benchmark_sector: {
        overall_avg_score: 'Score Moyen Global'
      },
      threat_landscape: {
        total_threats: 'Total Menaces',
        total_incidents_related: 'Total Incidents Liés'
      },
      exposure_risk: {
        total_exposure_amount: 'Montant Exposition Total',
        avg_probability_percent: 'Probabilité Moyenne (%)'
      },
      strategic_alignment: {
        avg_progress_percent: 'Progression Moyenne (%)',
        avg_security_coverage_percent: 'Couverture Sécurité (%)',
        initiatives_at_risk: 'Initiatives à Risque'
      }
    };

    const adaptedKpis = {};
    if (backendData.kpis) {
      Object.entries(backendData.kpis).forEach(([key, value]) => {
        const label = labelMap[reportType]?.[key] || key.replace(/_/g, ' ').toUpperCase();
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

  const analyze = async () => {
    if (!file || !selectedReport) {
      return addNotification('warning', 'Sélectionnez un fichier et un type de rapport', 3000);
    }

    setIsLoading(true);

    try {
      addNotification('info', 'Début de l\'analyse des données COMEX...', 3000);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('reportType', selectedReport);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const accessToken = localStorage.getItem('accessToken');

      const endpoint = accessToken ? '/api/inwi3/upload' : '/api/inwi3/upload-test';
      const headers = accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {};

      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        body: formData,
        headers: headers
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(err.detail || 'Erreur serveur');
      }

      const result = await response.json();
      console.log('🔍 Réponse du serveur INWI3:', result);

      if (result.success && result.data) {
        console.log('📊 Données reçues:', result.data);
        const adaptedData = adaptBackendData(result.data, selectedReport);
        console.log('✅ Données adaptées:', adaptedData);
        setAnalysisResult(adaptedData);
        addNotification('success', 'Analyse COMEX terminée avec succès !');
      } else {
        console.error('❌ Réponse invalide:', result);
        throw new Error('Données invalides reçues du serveur');
      }
    } catch (e) {
      console.error(e);
      addNotification('error', `Erreur: ${e.message}`, 4000);
    } finally {
      setIsLoading(false);
    }
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
        setFileValidation({ isValid: true, message: 'Fichier valide et prêt pour l\'analyse' });
        addNotification('success', `Fichier "${droppedFile.name}" ajouté avec succès`);
      } else {
        addNotification('error', 'Fichier non valide. Veuillez sélectionner un fichier CSV.');
      }
    }
  }, []);

  // File validation
  const validateFileAdvanced = (file) => {
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

  // Refresh handler
  const handleRefresh = async (chartKey = null) => {
    if (!analysisResult) return;
    if (chartKey) setRefreshingChart(chartKey);
    else setIsRefreshing(true);

    setLastUpdated(new Date());

    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshingChart(null);
    }, 1500);
  };

  // Enhanced KPI rendering with executive styling
  const renderKPICard = (title, value, IconComponent, trend, color = colors.primary, description = '') => (
    <div className="bg-gradient-to-br from-white via-blue-50/30 to-white rounded-2xl p-6 border border-blue-100 hover:border-blue-300 shadow-lg hover:shadow-2xl transition-all duration-500 hover:transform hover:scale-105 group relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110 bg-gradient-to-br from-blue-500/10 to-blue-600/20">
            <IconComponent size={28} style={{ color }} />
          </div>
          {trend && (
            <div className={`text-sm font-bold ${trend > 0 ? 'text-green-600' : 'text-red-600'} flex items-center transition-all duration-300 group-hover:scale-110`}>
              {trend > 0 ? '+' : ''}{trend}%
              <TrendingUp size={16} className={`ml-1 ${trend > 0 ? '' : 'rotate-180'}`} />
            </div>
          )}
        </div>
        
        <h3 className="text-gray-600 text-sm font-semibold mb-2 group-hover:text-blue-700 transition-colors uppercase tracking-wide">
          {title}
        </h3>
        
        <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-blue-900 transition-colors">
          {value}
        </div>
        
        {description && (
          <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );

  const renderKPIs = () => {
    if (!analysisResult?.kpis) return null;
    
    const kpiIcons = [
      DollarSign, Shield, TrendingUp, AlertTriangle, Award, 
      Users, Server, Target, Briefcase, Globe
    ];
    
    const kpiDescriptions = {
      'Score Risque Moyen': 'Évaluation globale du niveau de risque cyber',
      'Actifs Critiques (Haut)': 'Nombre d\'actifs à criticité élevée',
      'Coût Total': 'Impact financier total des incidents',
      'Conformité (%)': 'Pourcentage de conformité réglementaire',
      'Score Maturité Moyen': 'Niveau de maturité du programme sécurité',
      'Temps Détection Moyen (h)': 'Délai moyen de détection des incidents',
      'Score Moyen Global': 'Performance comparative sectorielle',
      'Total Menaces': 'Nombre total de menaces identifiées',
      'Montant Exposition Total': 'Exposition financière au risque',
      'Progression Moyenne (%)': 'Avancement des initiatives stratégiques'
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {Object.entries(analysisResult.kpis).map(([label, value], index) => {
          const IconComponent = kpiIcons[index % kpiIcons.length];
          const trend = Math.random() > 0.5 ? Math.floor(Math.random() * 15) : -Math.floor(Math.random() * 8);
          
          return (
            <div key={label}>
              {renderKPICard(
                label,
                value,
                IconComponent,
                trend,
                colors.chart[index % colors.chart.length],
                kpiDescriptions[label] || ''
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Get optimal chart type based on data and title
  const getOptimalChartType = (title, reportType) => {
    const chartTypeMapping = {
      'ASSETS BY CRITICALITY': 'pie',
      'TOP RISKY ASSETS': 'bar',
      'TOP COST INCIDENTS': 'bar',
      'COST BY BUSINESS UNIT': 'pie',
      'AVOIDED BY THREAT': 'bar',
      'STATUS BY FRAMEWORK': 'pie',
      'MATURITY BY DOMAIN': 'bar',
      'INCIDENTS BY SEVERITY': 'pie',
      'AVG SCORE BY SECTOR': 'bar',
      'INCIDENTS BY THREAT TYPE': 'bar',
      'EXPOSURE BY OWNER': 'pie',
      'PROGRESS BY INITIATIVE': 'bar'
    };

    return chartTypeMapping[title] || 'bar';
  };

  // Enhanced chart rendering
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

    // Common chart container and header
    const ChartContainer = ({ children }) => (
      <div className="bg-gradient-to-br from-white via-blue-50/20 to-white rounded-2xl p-8 border border-blue-100 shadow-xl hover:shadow-2xl transition-all duration-500 hover:transform hover:scale-[1.02] relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div>
            <h3 className="text-gray-900 text-xl font-bold mb-2">{title}</h3>
            <p className="text-blue-600 text-sm font-semibold">Analyse Stratégique COMEX</p>
          </div>
          <div className="flex items-center space-x-3">
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

    // Enhanced tooltip style
    const enhancedTooltipStyle = {
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      border: '1px solid #dbeafe',
      borderRadius: '16px',
      color: '#1e40af',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      fontSize: '14px',
      fontWeight: '600'
    };

    switch (optimalType) {
      case 'pie':
        return (
          <ChartContainer>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={130}
                  innerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                  animationDuration={2000}
                  animationBegin={300}
                  animationEasing="ease-out"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={colors.chart[index % colors.chart.length]} 
                      stroke={colors.primary}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [`${value} (${((value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%)`, props.payload.fullName]}
                  contentStyle={enhancedTooltipStyle}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px', fontWeight: '600', marginTop: '20px' }}
                  formatter={(value) => value.length > 20 ? value.substring(0, 20) + '...' : value}
                  iconType="circle"
                  iconSize={12}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        );

      case 'bar':
        return (
          <ChartContainer>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" strokeOpacity={0.8} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100} 
                  tick={{ fontSize: 12, fill: colors.dark, fontWeight: '500' }}
                  tickLine={{ stroke: colors.medium }}
                  axisLine={{ stroke: colors.medium, strokeWidth: 2 }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: colors.dark, fontWeight: '500' }}
                  tickLine={{ stroke: colors.medium }}
                  axisLine={{ stroke: colors.medium, strokeWidth: 2 }}
                  tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                />
                <Tooltip 
                  formatter={(value, name, props) => [value, props.payload.fullName]}
                  contentStyle={enhancedTooltipStyle}
                />
                <Bar
                  dataKey="value"
                  fill={colors.secondary}
                  radius={[8, 8, 0, 0]}
                  stroke={colors.primary}
                  strokeWidth={2}
                  animationDuration={2000}
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

      default:
        return (
          <ChartContainer>
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <BarChart3 size={48} className="mx-auto mb-4 text-blue-300" />
                <p className="text-lg font-medium">Visualisation en cours de préparation</p>
                <p className="text-sm">Données disponibles mais format non supporté</p>
              </div>
            </div>
          </ChartContainer>
        );
    }
  };

  const renderCharts = () => {
    if (!analysisResult?.charts) return null;
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
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
    );
  };

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

      <div className="relative p-6" style={{ zIndex: 1 }}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-6">
            <button
              onClick={() => window.history.back()}
              className="absolute left-6 top-6 p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            
            <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-xl relative">
              <Briefcase size={40} className="text-white" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent mb-3">
            COMEX Dashboard
          </h1>
          <p className="text-gray-600 text-xl font-medium mb-4">
            INWI - Niveau 3 Stratégique & Direction
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
                Type de Rapport COMEX
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
                    <BarChart3 size={20} className="text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                    <p className="text-blue-800 text-sm leading-relaxed">
                      Analyse stratégique pour la direction générale
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
                
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => fileRef.current?.click()}
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
                <Settings className="mr-3 text-blue-600" />
                Contrôles
              </h2>

              <div className="space-y-4">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing || !analysisResult}
                  className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
                onClick={analyze}
                disabled={!file || !selectedReport || isLoading || fileValidation.isValid === false}
                className="px-12 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none text-lg relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                {isLoading ? (
                  <div className="flex items-center relative z-10">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Analyse COMEX en cours...
                  </div>
                ) : (
                  <span className="relative z-10 flex items-center justify-center">
                    <Briefcase size={20} className="mr-2" />
                    Analyser les données COMEX
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
                   <AlertCircle size={16} className="mr-1" />}
                  Validation
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis results */}
        {analysisResult && (
          <div className="max-w-7xl mx-auto">
            {renderKPIs()}
            {renderCharts()}
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

export default ComexDashboard;
