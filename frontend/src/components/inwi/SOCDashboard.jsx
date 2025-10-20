import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { INWI_ICON } from '../ui/inwi';
import { Upload, Shield, AlertTriangle, CheckCircle, BarChart3, ArrowLeft, FileText, Loader2, Activity, Eye, Zap, Server, Users, Brain, Clock, Target, XCircle, Database, Gauge, GripVertical } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const SOCAnalyzerDashboard = ({ returnToSelector }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [reportType, setReportType] = useState('realtime_alerts');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [draggedKpi, setDraggedKpi] = useState(null);
  const [draggedChart, setDraggedChart] = useState(null);
  const [error, setError] = useState(null);
  const [kpiOrder, setKpiOrder] = useState([]);
  const [chartOrder, setChartOrder] = useState([]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    },
    dragging: {
      scale: 1.05,
      rotateZ: 2,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    },
    hover: {
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const dropZoneVariants = {
    idle: { scale: 1 },
    active: {
      scale: 1.02,
      backgroundColor: "rgba(59, 130, 246, 0.05)",
      borderColor: "#3b82f6",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const REPORT_TYPES = [
    { value: 'realtime_alerts', label: 'Real-time Alerts', description: 'Active security alerts', icon: AlertTriangle },
    { value: 'event_processing', label: 'Event Processing', description: 'Processing metrics', icon: Activity },
    { value: 'detection_efficiency', label: 'Detection Efficiency', description: 'Rates and precision', icon: Eye },
    { value: 'response_times', label: 'Response Times', description: 'Times by level', icon: Zap },
    { value: 'system_status', label: 'System Status', description: 'SOC availability', icon: Server },
    { value: 'resource_allocation', label: 'Resource Allocation', description: 'Workload metrics', icon: Users },
    { value: 'detection_rules', label: 'Detection Rules', description: 'MITRE coverage', icon: Shield },
    { value: 'threat_intelligence', label: 'Threat Intelligence', description: 'IOCs and campaigns', icon: Brain }
  ];

  const getAuthToken = () => {
    return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    } else {
      setError('Please select a valid file');
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('report_type', reportType);

    try {
      const authToken = getAuthToken();

      if (!authToken) {
        throw new Error('Missing authentication token. Please log in again.');
      }

      const response = await fetch('http://localhost:8000/api/inwi/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        credentials: 'include',
      });

      if (response.status === 401) {
        throw new Error('Unauthorized. Please verify your credentials.');
      }

      if (response.status === 403) {
        throw new Error('Forbidden. You do not have the required permissions.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        setAnalysisResult(result);
      } else {
        throw new Error(result.message || 'Error analyzing the file');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Error analyzing the file');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
    setError(null);
    setKpiOrder([]);
    setChartOrder([]);
  };

  const dynamicKpis = useMemo(() => {
    if (!analysisResult?.data?.kpis) return [];
    const iconMap = {
      critical: AlertTriangle,
      high: Activity,
      medium: Clock,
      low: CheckCircle,
      availability: Server,
      rules: Shield,
      mitre: Target,
      false: XCircle,
      detection: Eye,
      precision: Target,
      response: Zap,
      analysts: Users,
      load: Gauge,
      threat: Brain,
      campaign: Target,
      source: Database,
    };
    const kpis = Object.entries(analysisResult.data.kpis).map(([key, value], index) => {
      const lower = key.toLowerCase();
      const match = Object.keys(iconMap).find((k) => lower.includes(k));
      const Icon = match ? iconMap[match] : BarChart3;
      return { id: `kpi-${index}`, label: key.replace(/_/g, ' '), value: String(value), icon: Icon };
    });

    // Initialize order if not set
    if (kpiOrder.length === 0) {
      setKpiOrder(kpis.map(kpi => kpi.id));
    }

    return kpis;
  }, [analysisResult, kpiOrder.length]);

  const chartData = useMemo(() => {
    if (!analysisResult?.data?.charts) return [];
    const charts = analysisResult.data.charts;
    const buildPairs = (obj) => Object.entries(obj || {}).map(([name, value]) => ({ name, value }));

    const chartsList = [
      { id: 'severity', data: charts.severity_distribution, title: 'Severity distribution', type: 'pie' },
      { id: 'alerts', data: charts.alert_types || buildPairs(charts.rule_types), title: 'Alert types / Rules', type: 'bar' },
      { id: 'hourly', data: charts.hourly_distribution, title: 'Hourly distribution', type: 'line' },
      { id: 'daily', data: buildPairs(charts.daily_events), title: 'Daily events', type: 'bar' },
      { id: 'processing', data: buildPairs(charts.processing_efficiency), title: 'Processing efficiency', type: 'line' },
      { id: 'detection', data: buildPairs(charts.detection_trends), title: 'Detection precision trend', type: 'line' },
      { id: 'fp', data: buildPairs(charts.fp_rate_trends), title: 'False positive rate trend', type: 'line' },
      { id: 'response', data: buildPairs(charts.response_times_by_severity), title: 'Response time by severity', type: 'bar' },
      { id: 'systemStatus', data: buildPairs(charts.system_status), title: 'System status', type: 'bar' },
      { id: 'availability', data: buildPairs(charts.system_availability), title: 'Availability by system', type: 'line' },
      { id: 'load', data: buildPairs(charts.load_distribution), title: 'Workload', type: 'line' },
      { id: 'analyst', data: buildPairs(charts.analyst_allocation), title: 'Analyst allocation', type: 'bar' },
      { id: 'mitre', data: buildPairs(charts.top_mitre_techniques), title: 'Top MITRE techniques', type: 'bar' },
      { id: 'indicators', data: buildPairs(charts.indicator_types), title: 'Indicator types', type: 'pie' },
      { id: 'campaigns', data: buildPairs(charts.active_campaigns), title: 'Active campaigns', type: 'bar' },
      { id: 'threats', data: buildPairs(charts.threat_trends), title: 'Threat trend', type: 'line' },
    ].filter(chart => chart.data && chart.data.length > 0);

    if (chartOrder.length === 0 && chartsList.length > 0) setChartOrder(chartsList.map(c => c.id));
    return chartsList;
  }, [analysisResult]);

  const COLORS = ['#0ea5e9', '#22c55e', '#a78bfa', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#e879f9'];

  const currentReportType = REPORT_TYPES.find(rt => rt.value === reportType);

  const handleKpiDragStart = (e, index) => {
    setDraggedKpi(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleKpiDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleKpiDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedKpi === null) return;

    const newOrder = [...kpiOrder];
    const draggedItem = newOrder[draggedKpi];
    newOrder.splice(draggedKpi, 1);
    newOrder.splice(dropIndex, 0, draggedItem);

    setKpiOrder(newOrder);
    setDraggedKpi(null);
  };

  // Chart Drag handlers avec animations
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

  // Get ordered KPIs
  const orderedKpis = useMemo(() => {
    if (kpiOrder.length === 0) return dynamicKpis;
    return kpiOrder.map(id => dynamicKpis.find(kpi => kpi.id === id)).filter(Boolean);
  }, [dynamicKpis, kpiOrder]);

  // Get ordered charts
  const orderedCharts = useMemo(() => {
    if (chartOrder.length === 0) return chartData;
    return chartOrder.map(id => chartData.find(chart => chart.id === id)).filter(Boolean);
  }, [chartData, chartOrder]);

  const renderChart = (chart) => {
    const commonProps = {
      width: "100%",
      height: "100%"
    };

    switch (chart.type) {
      case 'pie':
        return (
          <ResponsiveContainer {...commonProps}>
            <PieChart>
              <Pie data={chart.data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                {chart.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" hide={chart.data.length > 10} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill={COLORS[chartData.indexOf(chart) % COLORS.length]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.data[0]?.hour !== undefined ? "hour" : "name"} />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey={chart.data[0]?.alerts !== undefined ? "alerts" : "value"}
                stroke={COLORS[chartData.indexOf(chart) % COLORS.length]}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  const SkeletonKPI = () => (
    <div className="bg-purple-200/50 rounded-xl p-4 h-24 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="w-2/3 h-4 bg-purple-300/50 rounded"></div>
        <div className="w-8 h-8 bg-purple-300/50 rounded-lg"></div>
      </div>
      <div className="w-1/2 h-8 bg-purple-300/50 rounded mt-2"></div>
    </div>
  );

  const SkeletonChart = () => (
    <div className="bg-purple-200/50 rounded-xl animate-pulse">
      <div className="p-4 border-b border-purple-300/50">
        <div className="w-1/2 h-5 bg-purple-300/50 rounded"></div>
      </div>
      <div className="p-4 h-72"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-level1-accent p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-pattern opacity-20 z-0"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={returnToSelector}
            className="p-3 bg-inwi-background rounded-lg shadow-sm border border-border"
          >
            <ArrowLeft size={24} className="text-text-secondary" />
          </button>
          <div className="flex items-center gap-3 bg-level1-muted p-3 rounded-md">
            <div className="p-3 bg-primary/10 rounded-xl">
              <INWI_ICON />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">SOC Analyzer Dashboard</h1>
              <p className="text-sm text-muted-foreground">Analyze your security reports for actionable insights</p>
            </div>
          </div>
          <div />
        </div>

        {/* Top Analysis Summary */}
        {analysisResult && (
          <Card className="bg-card/80 backdrop-blur-sm border-border mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <div className="text-xs text-muted-foreground">Report Type</div>
                    <div className="font-medium capitalize truncate">{currentReportType?.label}</div>
                  </div>
                  <div className="p-2 rounded-md bg-primary/10"><FileText className="h-5 w-5 text-primary" /></div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <div className="text-xs text-muted-foreground">File</div>
                    <div className="font-medium text-sm truncate max-w-[220px]">{analysisResult.filename}</div>
                  </div>
                  <div className="p-2 rounded-md bg-primary/10"><Upload className="h-5 w-5 text-primary" /></div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <div className="text-xs text-muted-foreground">Rows Processed</div>
                    <div className="font-medium text-primary">{analysisResult.rows_processed?.toLocaleString()}</div>
                  </div>
                  <div className="p-2 rounded-md bg-primary/10"><Activity className="h-5 w-5 text-primary" /></div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <div className="text-xs text-muted-foreground">Status</div>
                    <div className="font-medium text-green-600">Success</div>
                  </div>
                  <div className="p-2 rounded-md bg-green-100"><CheckCircle className="h-5 w-5 text-green-600" /></div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error alert */}
        {error && (
          <div className="mb-6 p-4 bg-danger-light border border-danger-light rounded-lg">
            <div className="flex items-center gap-2 text-danger">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-bold">Error: {error}</span>
            </div>
            <p className="text-sm text-danger mt-1">
              Tip: Check your connection and authentication credentials
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="size-5 text-primary" />
                  Analysis Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">SOC Report Type</Label>
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {REPORT_TYPES.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          onClick={() => setReportType(type.value)}
                          className={`w-full p-3 rounded-lg border-2 text-left transition-all duration-200 ${reportType === type.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50 hover:bg-primary/5'
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm">{type.label}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {type.description}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Import CSV File</Label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${dragActive
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                      } ${selectedFile ? 'border-green-500 bg-level1-muted' : ''
                      }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Upload className={`h-8 w-8 mx-auto mb-3 ${selectedFile ? 'text-green-500' : 'text-muted-foreground'
                      }`} />

                    {selectedFile ? (
                      <div className="space-y-2">
                        <p className="font-medium text-green-600">File selected</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {selectedFile.size < 1024 * 1024 ? (selectedFile.size / 1024).toFixed(2) + 'KB' : (selectedFile.size / 1024 / 1024).toFixed(2) + 'MB'}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 bg-level1-accent"
                          onClick={() => document.getElementById('file-upload').click()}
                        >
                          Change files
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="font-medium">Drag and drop your CSV file</p>
                        <p className="text-sm text-muted-foreground">Up to 10MB supported</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => document.getElementById('file-upload').click()}
                        >
                          Browse files
                        </Button>
                      </div>
                    )}

                    <Input
                      id="file-upload"
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleAnalyze}
                    disabled={!selectedFile || isAnalyzing}
                    className="flex-1"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analyze data
                      </>
                    )}
                  </Button>
                </div>

                {analysisResult && (
                  <Button
                    variant="outline"
                    onClick={resetAnalysis}
                    className="w-full"
                  >
                    New Analysis
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-3">
            <AnimatePresence>
              {isAnalyzing ? (
                <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6  bg-card/80 backdrop-blur-sm border-border h-full p-8 rounded-md">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => <SkeletonKPI key={i} />)}
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => <SkeletonChart key={i} />)}
                  </div>
                </motion.div>
              ) : analysisResult ? (
                <div className="space-y-6 bg-card/80 backdrop-blur-sm border-border h-full p-8 rounded-md">
                  {/* Draggable KPI Cards */}
                  {orderedKpis.length > 0 && (
                    <motion.div
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {orderedKpis.map((kpi, idx) => {
                        const Icon = kpi.icon;
                        const isDragging = draggedKpi === idx;

                        return (
                          <motion.div
                            key={kpi.id}
                            variants={itemVariants}
                            initial="hidden"
                            animate={isDragging ? "dragging" : "visible"}
                            whileHover="hover"
                            whileTap="dragging"
                            layout
                            transition={{
                              type: "spring",
                              stiffness: 350,
                              damping: 25
                            }}
                          >
                            <motion.div
                              variants={dropZoneVariants}
                              animate={draggedKpi !== null && draggedKpi !== idx ? "active" : "idle"}
                            >
                              <Card
                                className="bg-card/80 border-border cursor-grab active:cursor-grabbing relative"
                                draggable
                                onDragStart={(e) => handleKpiDragStart(e, idx)}
                                onDragOver={handleKpiDragOver}
                                onDrop={(e) => handleKpiDrop(e, idx)}
                              >
                                {isDragging && (
                                  <motion.div
                                    className="absolute inset-0 bg-primary/5 border-2 border-primary rounded-lg"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                  />
                                )}
                                <CardContent className="p-2 relative z-10">
                                  <div className="flex flex-col gap-2">
                                    <div className="flex flex-row items-center gap-2">
                                      <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                      >
                                        <GripVertical size={16} className="text-text-secondary mt-1 flex-shrink-0" />
                                      </motion.div>
                                      <div className="text-sm text-muted-foreground truncate">{kpi.label}</div>
                                      <motion.div
                                        className="p-2 rounded-lg bg-primary/10 ml-auto"
                                        whileHover={{ scale: 1.05 }}
                                      >
                                        <Icon className="h-5 w-5 text-primary" />
                                      </motion.div>
                                    </div>
                                    <motion.div
                                      className="text-xl font-semibold px-4"
                                      initial={{ scale: 0.8 }}
                                      animate={{ scale: 1 }}
                                      transition={{ delay: 0.1 }}
                                    >
                                      {kpi.value}
                                    </motion.div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}

                  {/* Draggable Charts avec animations */}
                  <motion.div
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {orderedCharts.map((chart, idx) => {
                      const isDragging = draggedChart === idx;

                      return (
                        <motion.div
                          key={chart.id}
                          variants={itemVariants}
                          initial="hidden"
                          animate={isDragging ? "dragging" : "visible"}
                          whileHover="hover"
                          whileTap="dragging"
                          layout
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 25
                          }}
                        >
                          <motion.div
                            variants={dropZoneVariants}
                            animate={draggedChart !== null && draggedChart !== idx ? "active" : "idle"}
                          >
                            <Card
                              className="bg-card/80 border-border cursor-grab active:cursor-grabbing relative overflow-hidden"
                              draggable
                              onDragStart={(e) => handleChartDragStart(e, idx)}
                              onDragOver={handleChartDragOver}
                              onDrop={(e) => handleChartDrop(e, idx)}
                            >
                              {isDragging && (
                                <motion.div
                                  className="absolute inset-0 bg-primary/5 border-2 border-primary rounded-lg z-20"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                />
                              )}
                              <CardHeader className="flex flex-row items-center gap-2 relative z-10">
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <GripVertical size={20} className="text-gray-400" />
                                </motion.div>
                                <CardTitle className="text-sm">{chart.title}</CardTitle>
                              </CardHeader>
                              <CardContent className="h-72 relative z-10">
                                {renderChart(chart)}
                              </CardContent>
                            </Card>
                          </motion.div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
              ) : (
                <Card className="bg-card/80 backdrop-blur-sm border-border h-full">
                  <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <BarChart3 className="h-16 w-16 text-muted-foreground/40 mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No analysis in progress
                    </h3>
                    <p className="text-muted-foreground max-w-md mb-4">
                      Select a SOC report type and import a CSV file to start the analysis.
                    </p>
                  </CardContent>
                </Card>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SOCAnalyzerDashboard;