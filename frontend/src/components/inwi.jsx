import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, FileText, Shield, AlertTriangle, Activity, BarChart3, ArrowLeft, Eye, Zap, Brain, Users, Server, RefreshCw, Clock, CheckCircle, XCircle, AlertCircle, Info, Filter, GripVertical } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';

// Configuration
const COLORS = {
  primary: '#3b82f6',
  secondary: '#f59e0b',
  danger: '#dc2626',
  warning: '#ea580c',
  success: '#10b981',
  chart: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#84cc16'],
  severity: { Critical: '#dc2626', High: '#ea580c', Medium: '#d97706', Low: '#059669' }
};

const REPORT_TYPES = [
  { value: 'realtime_alerts', label: 'Alertes Temps Réel', description: 'Alertes de sécurité actives', icon: AlertTriangle },
  { value: 'event_processing', label: 'Traitement d\'Événements', description: 'Métriques de traitement', icon: Activity },
  { value: 'detection_efficiency', label: 'Efficacité de Détection', description: 'Taux et précision', icon: Eye },
  { value: 'response_times', label: 'Temps de Réponse', description: 'Temps par niveau', icon: Zap },
  { value: 'system_status', label: 'État des Systèmes', description: 'Disponibilité SOC', icon: Server },
  { value: 'resource_allocation', label: 'Allocation Ressources', description: 'Charge de travail', icon: Users },
  { value: 'detection_rules', label: 'Règles de Détection', description: 'Couverture MITRE', icon: Shield },
  { value: 'threat_intelligence', label: 'Threat Intelligence', description: 'IOCs et campagnes', icon: Brain }
];

const TIME_FILTERS = [
  { value: '1h', label: '1 Heure' },
  { value: '6h', label: '6 Heures' },
  { value: '24h', label: '24 Heures' },
  { value: '7d', label: '7 Jours' },
  { value: '30d', label: '30 Jours' }
];

// Notification System
const NotificationSystem = ({ notifications, onRemove }) => {
  const iconMap = { success: CheckCircle, error: XCircle, warning: AlertCircle, info: Info };
  const colorMap = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notif) => {
        const Icon = iconMap[notif.type];
        return (
          <div key={notif.id} className={`flex items-center p-4 rounded-lg border shadow-lg ${colorMap[notif.type]} transition-all animate-slide-in`}>
            <Icon size={20} className="mr-3" />
            <span className="text-sm font-medium flex-1">{notif.message}</span>
            <button onClick={() => onRemove(notif.id)} className="ml-3 hover:opacity-70">
              <XCircle size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

// Enhanced KPI Card with animations
const EnhancedKPICard = ({ title, value, Icon, color, trend, lastUpdated }) => {
  const [showInfo, setShowInfo] = useState(false);
  const minutesAgo = Math.floor((new Date() - lastUpdated) / 60000) || 1;
  const trendColor = trend >= 0 ? 'text-green-600' : 'text-red-600';
  const trendIcon = trend >= 0 ? '↑' : '↓';

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
      {/* Background Animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl shadow-md transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: `${color}20` }}>
            <Icon size={28} style={{ color }} />
          </div>
          <div className="relative">
            <button
              onMouseEnter={() => setShowInfo(true)}
              onMouseLeave={() => setShowInfo(false)}
              className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 transition-colors"
            >
              <Info size={14} className="text-gray-600" />
            </button>
            {showInfo && (
              <div className="absolute right-0 top-10 w-64 bg-white border border-gray-200 rounded-lg shadow-xl p-3 z-50 animate-fade-in">
                <p className="text-xs text-gray-700">{title} - Métrique de sécurité SOC</p>
              </div>
            )}
          </div>
        </div>
        
        <h3 className="text-gray-600 text-sm font-semibold mb-2 uppercase tracking-wide">{title}</h3>
        
        <div className="flex items-baseline justify-between mb-3">
          <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {value}
          </div>
          {trend !== undefined && (
            <span className={`text-sm font-bold ${trendColor} flex items-center`}>
              {trendIcon} {Math.abs(trend)}%
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200">
          <span className="text-gray-500 flex items-center">
            <Clock size={12} className="mr-1" /> {minutesAgo}min
          </span>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

// Chart Components
const SeverityPieChart = ({ data, onDragStart, onDragOver, onDrop, index }) => {
  const [showInfo, setShowInfo] = useState(false);
  
  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg cursor-move hover:shadow-xl transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <GripVertical size={20} className="text-gray-400 mr-2" />
          <div>
            <h3 className="text-lg font-bold text-gray-900">Distribution par Gravité</h3>
            <p className="text-xs text-gray-600 mt-1">Répartition des alertes par criticité</p>
          </div>
        </div>
        <div className="relative">
          <button
            onMouseEnter={() => setShowInfo(true)}
            onMouseLeave={() => setShowInfo(false)}
            className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 transition-colors"
          >
            <Info size={14} className="text-gray-600" />
          </button>
          {showInfo && (
            <div className="absolute right-0 top-10 w-64 bg-white border border-gray-200 rounded-lg shadow-xl p-3 z-50 animate-fade-in">
              <p className="text-xs text-gray-700">Vue d'ensemble de la distribution des alertes selon leur niveau de criticité (Critical, High, Medium, Low).</p>
            </div>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
            paddingAngle={3}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS.severity[entry.name] || COLORS.chart[index]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
            formatter={(value, name) => [`${value} alertes`, name]} 
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const AlertTypesBarChart = ({ data, onDragStart, onDragOver, onDrop, index }) => {
  const [showInfo, setShowInfo] = useState(false);
  
  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg cursor-move hover:shadow-xl transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <GripVertical size={20} className="text-gray-400 mr-2" />
          <div>
            <h3 className="text-lg font-bold text-gray-900">Types d'Alertes</h3>
            <p className="text-xs text-gray-600 mt-1">Top alertes par catégorie</p>
          </div>
        </div>
        <div className="relative">
          <button
            onMouseEnter={() => setShowInfo(true)}
            onMouseLeave={() => setShowInfo(false)}
            className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 transition-colors"
          >
            <Info size={14} className="text-gray-600" />
          </button>
          {showInfo && (
            <div className="absolute right-0 top-10 w-64 bg-white border border-gray-200 rounded-lg shadow-xl p-3 z-50 animate-fade-in">
              <p className="text-xs text-gray-700">Classification des types d'alertes de sécurité les plus fréquents détectés par le SOC.</p>
            </div>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 90 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis 
            dataKey="name" 
            angle={-45} 
            textAnchor="end" 
            height={100}
            interval={0}
            tick={{ fontSize: 10, fill: '#6b7280' }}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#6b7280' }}
            width={40}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
            formatter={(value) => [`${value} alertes`, 'Nombre']}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS.chart[index % COLORS.chart.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const HourlyAreaChart = ({ data, onDragStart, onDragOver, onDrop, index }) => {
  const [showInfo, setShowInfo] = useState(false);
  
  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg col-span-full lg:col-span-1 cursor-move hover:shadow-xl transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <GripVertical size={20} className="text-gray-400 mr-2" />
          <div>
            <h3 className="text-lg font-bold text-gray-900">Distribution Horaire</h3>
            <p className="text-xs text-gray-600 mt-1">Volume d'alertes sur 24 heures</p>
          </div>
        </div>
        <div className="relative">
          <button
            onMouseEnter={() => setShowInfo(true)}
            onMouseLeave={() => setShowInfo(false)}
            className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 transition-colors"
          >
            <Info size={14} className="text-gray-600" />
          </button>
          {showInfo && (
            <div className="absolute right-0 top-10 w-64 bg-white border border-gray-200 rounded-lg shadow-xl p-3 z-50 animate-fade-in">
              <p className="text-xs text-gray-700">Analyse temporelle du volume d'alertes sur une période de 24 heures pour identifier les pics d'activité.</p>
            </div>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis 
            dataKey="hour" 
            tick={{ fontSize: 10, fill: '#6b7280' }}
            interval={2}
            height={40}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#6b7280' }}
            width={40}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
            formatter={(value) => [`${value} alertes`, 'Volume']}
          />
          <Area 
            type="monotone" 
            dataKey="alerts" 
            stroke={COLORS.primary} 
            strokeWidth={2}
            fill="url(#colorAlerts)" 
            fillOpacity={1}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Main Component
const SOCAnalyzerDashboard = ({ returnToSelector, authData = {} }) => {
  const [selectedReport, setSelectedReport] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [timeFilter, setTimeFilter] = useState('24h');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [chartOrder, setChartOrder] = useState([0, 1, 2]); // Track chart order
  const [draggedChart, setDraggedChart] = useState(null);
  const fileInputRef = useRef(null);

  const addNotification = (type, message, duration = 5000) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), duration);
  };

  const validateFile = (file) => {
    if (!file) return false;
    if (file.size > 10 * 1024 * 1024) {
      addNotification('error', 'Fichier trop volumineux (max 10MB)');
      return false;
    }
    if (!file.name.endsWith('.csv')) {
      addNotification('error', 'Format non supporté. Utilisez un CSV.');
      return false;
    }
    return true;
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
      addNotification('success', `Fichier "${droppedFile.name}" ajouté`);
    }
  }, []);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
      addNotification('success', 'Fichier sélectionné');
    }
  };

  const analyzeData = async () => {
    if (!file || !selectedReport) {
      addNotification('warning', 'Sélectionnez un fichier et un type de rapport');
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);
    const interval = setInterval(() => setUploadProgress(p => Math.min(p + 15, 90)), 200);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('reportType', selectedReport);

      const apiUrl = 'http://localhost:8000';
      const token = localStorage.getItem('accessToken');
      const endpoint = token ? '/api/inwi/upload' : '/api/inwi/upload-test';

      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        body: formData,
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      setUploadProgress(100);
      clearInterval(interval);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();
      if (result.success && result.data) {
        setAnalysisResult(result.data);
        setLastUpdated(new Date());
        addNotification('success', 'Analyse terminée avec succès');
      }
    } catch (error) {
      addNotification('error', `Erreur: ${error.message}`);
      clearInterval(interval);
    } finally {
      setIsLoading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  // Get top 4 KPIs
  const getTop4KPIs = () => {
    if (!analysisResult?.kpis) return [];
    const kpisArray = Object.entries(analysisResult.kpis);
    return kpisArray.slice(0, 4).map(([key, value], index) => ({
      title: key,
      value,
      icon: REPORT_TYPES[index % REPORT_TYPES.length].icon,
      color: COLORS.chart[index],
      trend: Math.floor(Math.random() * 30) - 10 // Simulated trend
    }));
  };

  // Prepare chart data
  const getChartData = () => {
    if (!analysisResult?.charts) return null;

    const charts = analysisResult.charts;
    
    // Severity distribution (Pie)
    const severityData = charts.severity_distribution || charts['Distribution par Gravité'] || [];
    
    // Alert types (Bar)
    const alertTypesData = charts.alert_types || charts['Types d\'Alertes'] || [];
    
    // Hourly distribution (Area)
    const hourlyData = charts.hourly_distribution || charts['Distribution Horaire'] || [];

    return { severityData, alertTypesData, hourlyData };
  };

  const chartData = getChartData();

  // Drag and Drop Handlers for Charts
  const handleChartDragStart = (e, index) => {
    setDraggedChart(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleChartDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleChartDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedChart === null) return;

    const newOrder = [...chartOrder];
    const draggedItem = newOrder[draggedChart];
    newOrder.splice(draggedChart, 1);
    newOrder.splice(dropIndex, 0, draggedItem);
    
    setChartOrder(newOrder);
    setDraggedChart(null);
  };

  // Render charts in order
  const renderChartsInOrder = () => {
    if (!chartData) return null;

    const charts = [
      chartData.severityData.length > 0 && (
        <SeverityPieChart
          key="severity"
          data={chartData.severityData}
          onDragStart={handleChartDragStart}
          onDragOver={handleChartDragOver}
          onDrop={handleChartDrop}
          index={0}
        />
      ),
      chartData.alertTypesData.length > 0 && (
        <AlertTypesBarChart
          key="alertTypes"
          data={chartData.alertTypesData}
          onDragStart={handleChartDragStart}
          onDragOver={handleChartDragOver}
          onDrop={handleChartDrop}
          index={1}
        />
      ),
      chartData.hourlyData.length > 0 && (
        <HourlyAreaChart
          key="hourly"
          data={chartData.hourlyData}
          onDragStart={handleChartDragStart}
          onDragOver={handleChartDragOver}
          onDrop={handleChartDrop}
          index={2}
        />
      )
    ];

    return chartOrder.map(orderIndex => charts[orderIndex]).filter(Boolean);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 pl-20">
      <NotificationSystem notifications={notifications} onRemove={(id) => setNotifications(n => n.filter(x => x.id !== id))} />

      {/* Header */}
      <div className="text-center mb-8">
        <button onClick={returnToSelector} className="absolute left-6 top-6 p-3 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all hover:scale-105">
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div className="flex justify-center mb-6">
          <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-2xl relative">
            <Shield size={48} className="text-white" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900 bg-clip-text text-transparent mb-3">
          SOC Analyzer Dashboard
        </h1>
        <p className="text-gray-600 text-xl font-medium">INWI - Centre de Sécurité Opérationnelle</p>
      </div>

      {/* Controls */}
      <div className="max-w-6xl mx-auto mb-10">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Report Type */}
          <div className="bg-white rounded-xl p-6 border shadow-lg hover:shadow-xl transition-all">
            <h2 className="text-lg font-bold mb-4 flex items-center text-gray-800">
              <BarChart3 className="mr-3 text-blue-600" size={24} />
              Type de Rapport
            </h2>
            <select 
              value={selectedReport} 
              onChange={(e) => setSelectedReport(e.target.value)} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Sélectionner un rapport</option>
              {REPORT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {/* File Upload */}
          <div 
            className={`bg-white rounded-xl p-6 border-2 border-dashed shadow-lg hover:shadow-xl transition-all ${dragActive ? 'border-blue-500 bg-blue-50 scale-105' : 'border-gray-300'}`}
            onDragEnter={handleDrag} 
            onDragLeave={handleDrag} 
            onDragOver={handleDrag} 
            onDrop={handleDrop}
          >
            <div className="text-center">
              <Upload size={40} className={`mx-auto mb-4 transition-all ${dragActive ? 'text-blue-500 scale-110' : 'text-gray-400'}`} />
              <p className="text-gray-900 font-semibold mb-2 text-sm">
                {file ? file.name : 'Glissez votre fichier CSV'}
              </p>
              {file && <p className="text-xs text-gray-600 mb-3">Taille: {(file.size / 1024).toFixed(1)} KB</p>}
              {uploadProgress > 0 && (
                <div className="mb-4">
                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{Math.round(uploadProgress)}%</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all text-sm font-semibold shadow-md hover:shadow-lg"
              >
                {file ? 'Changer' : 'Sélectionner'}
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-xl p-6 border shadow-lg hover:shadow-xl transition-all">
            <h2 className="text-lg font-bold mb-4 flex items-center text-gray-800">
              <Filter className="mr-3 text-blue-600" size={24} />
              Contrôles
            </h2>
            <select 
              value={timeFilter} 
              onChange={(e) => setTimeFilter(e.target.value)} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
            >
              {TIME_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
        </div>

        {/* Analyze Button */}
        <div className="text-center">
          <button 
            onClick={analyzeData} 
            disabled={!file || !selectedReport || isLoading} 
            className="px-16 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 text-lg relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <span className="relative z-10 flex items-center justify-center">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Analyse en cours...
                </>
              ) : (
                <>
                  <BarChart3 size={24} className="mr-3" />
                  Analyser les données
                </>
              )}
            </span>
          </button>
        </div>
      </div>

      {/* Results */}
      {analysisResult && (
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Top 4 KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {getTop4KPIs().map((kpi, index) => (
              <EnhancedKPICard
                key={index}
                title={kpi.title}
                value={kpi.value}
                Icon={kpi.icon}
                color={kpi.color}
                trend={kpi.trend}
                lastUpdated={lastUpdated}
              />
            ))}
          </div>

          {/* Charts */}
          {chartData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {renderChartsInOrder()}
            </div>
          )}
        </div>
      )}

      {/* Styles */}
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default SOCAnalyzerDashboard;