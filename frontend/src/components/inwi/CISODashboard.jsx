import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { INWI_ICON } from '../ui/inwi';
import { Upload, Shield, AlertTriangle, CheckCircle, BarChart3, ArrowLeft, FileText, Loader2, Activity, Eye, Zap, Server, Users, Brain, Clock, Target, XCircle, Database, Gauge, TrendingUp, Info } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const CISODashboard = ({ returnToSelector }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [reportType, setReportType] = useState('ciso_incident_report');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);

  const REPORT_TYPES = [
    { value: 'ciso_incident_report', label: 'Incident Report', description: 'Incidents by criticality, SLA, MTTR, MTTD, MTTC', icon: AlertTriangle },
    { value: 'ciso_vulnerability_report', label: 'Vulnerability Report', description: 'Active, new, resolved vulnerabilities by criticality', icon: Shield },
    { value: 'ciso_system_availability', label: 'Tool Availability', description: 'Availability rate, outages, downtime', icon: Server },
    { value: 'ciso_detection_rules', label: 'Rules & Use Cases', description: 'Active/custom rules, MITRE ATT&CK coverage', icon: Eye },
    { value: 'ciso_threat_intelligence', label: 'Threat Intelligence', description: 'Collected IOCs, detected campaigns, utilization', icon: Brain },
    { value: 'ciso_awareness_training', label: 'Awareness & Training', description: 'Participation, scores, phishing simulations', icon: Users },
    { value: 'ciso_attack_surface', label: 'Attack Surface', description: 'Exposure score, exposed assets, Shadow IT', icon: Target },
    { value: 'ciso_security_projects', label: 'Security Projects', description: 'Progress, delays, on-time completion', icon: TrendingUp }
  ];

  const colors = {
    primary: '#4c1d95',
    secondary: '#7c3aed',
    accent: '#a855f7',
    light: '#f3e8ff',
    dark: '#1e293b',
    medium: '#475569',
    lightGray: '#94a3b8',
    success: '#059669',
    warning: '#d97706',
    danger: '#dc2626',
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
  }

  // Get authentication token
  const getAuthToken = () => {
    // Adapt as per your authentication system
    return localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken')
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null); // Reset error when new file is selected
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
      console.log('token: ', authToken);

      if (!authToken) {
        throw new Error('Missing authentication token. Please log in again.');
      }

      const response = await fetch('http://localhost:8000/api/inwi2/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          // Content-Type not needed for FormData; browser sets it
        },
        credentials: 'include', // Include cookies if needed
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
        console.log('results: ', result);
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
  };

  // Dynamic KPI mapping derived from backend response
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
    return Object.entries(analysisResult.data.kpis).map(([key, value]) => {
      const lower = key.toLowerCase();
      const match = Object.keys(iconMap).find((k) => lower.includes(k));
      const Icon = match ? iconMap[match] : BarChart3;
      return { label: key.replace(/_/g, ' '), value: String(value), icon: Icon };
    });
  }, [analysisResult]);

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
        'INCIDENTS BY CRITICALITY': 'Distribution of security incidents by criticality. Helps assess workload and priorities.',
        'MONTHLY TRENDS': 'Monthly evolution of security incidents. Identifies trends and patterns.',
        'RESPONSE METRICS': 'Incident response time metrics by severity.',
        'VULNERABILITY BY CRITICALITY': 'Distribution of vulnerabilities by criticality.',
        'PATCHING PERFORMANCE': 'Performance of vulnerability patching process.',
        'MONTHLY AVAILABILITY': 'Monthly availability of critical security systems.',
        'OUTAGES TREND': 'Trend of outages and service interruptions.',
        'AVAILABILITY VS TARGET': 'Comparison between actual availability and SLA targets.',
        'RULE MANAGEMENT TRENDS': 'Evolution of security rule management.',
        'MITRE COVERAGE BY TACTIC': 'Coverage of MITRE ATT&CK tactics by controls.',
        'COVERAGE EVOLUTION': 'Evolution of security coverage over time.',
        'IOC BY TYPE': 'Distribution of indicators of compromise by type.',
        'MONTHLY INTELLIGENCE': 'Threat intelligence collected monthly.',
        'TOP THREAT ACTORS': 'Top identified threat actors.',
        'MONTHLY PARTICIPATION': 'Monthly participation in awareness programs.',
        'PHISHING SIMULATION TRENDS': 'Phishing simulation results over time.',
        'DEPARTMENT COMPLETION': 'Training completion rate by department.',
        'EXPOSURE TRENDS': 'Evolution of exposure to security risks.',
        'ASSET EXPOSURE BY TYPE': 'Asset exposure by risk type.'
      };

      const tooltipText = chartTooltips[title] || 'Analyse des données de sécurité pour la gouvernance CISO.';

      return (
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-gray-900 text-xl font-bold mb-2">{title}</h3>
              <p className="text-gray-600 text-sm">CISO data analysis</p>
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
                  labelFormatter={(label) => `Category: ${label}`}
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
                  labelFormatter={(label) => `Item: ${label}`}
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
              No visualization available for these data
            </div>
          </ChartContainer>
        );
    }
  };

  return (
    <div className="min-h-full bg-level2-accent p-6 relative overflow-hidden">
      {/* Pattern Background */}
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
          <div className="flex items-center gap-3 bg-level2-muted p-3 rounded-md">
            <div className="p-3 bg-level2-primary/30 rounded-xl">
              <INWI_ICON color='level2-primary' />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">CISO Dashboard</h1>
              <p className="text-sm text-muted-foreground">Analyze your security reports for actionable insights</p>
            </div>
          </div>
          <div />
        </div>

        {/* Top Analysis Summary - Horizontal */}
        {analysisResult && (
          <Card className="bg-card/80 backdrop-blur-sm border-border mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <div className="text-xs text-muted-foreground">Report Type</div>
                    <div className="font-medium capitalize truncate">{(REPORT_TYPES.find(rt => rt.value === reportType)?.label) || reportType}</div>
                  </div>
                  <div className="p-2 rounded-md bg-level2-primary/10"><FileText className="h-5 w-5 text-level2-primary" /></div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <div className="text-xs text-muted-foreground">File</div>
                    <div className="font-medium text-sm truncate max-w-[220px]">{analysisResult.filename}</div>
                  </div>
                  <div className="p-2 rounded-md bg-level2-primary/10"><Upload className="h-5 w-5 text-level2-primary" /></div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <div className="text-xs text-muted-foreground">Rows Processed</div>
                    <div className="font-medium text-level2-primary">{analysisResult.rows_processed?.toLocaleString()}</div>
                  </div>
                  <div className="p-2 rounded-md bg-level2-primary/10"><Activity className="h-5 w-5 text-level2-primary" /></div>
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
          <div className="mb-6 p-4 bg-danger-light border border-danger rounded-lg">
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
          {/* Left Panel - File Upload & Configuration */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="size-5 text-level2-primary" />
                  Analysis Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Report Type Selection */}
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
                            ? 'border-level2-primary bg-level2-primary/10 text-level2-primary'
                            : 'border-border hover:border-level2-primary/50 hover:bg-primary/5'
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

                {/* File Upload Area */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Import CSV File</Label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${dragActive
                      ? 'border-level2-primary bg-level2-primary/10'
                      : 'border-border hover:border-level2-primary/50'
                      } ${selectedFile ? 'border-green-500 bg-level2-muted' : ''
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
                          className="mt-2 bg-level2-accent"
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

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleAnalyze}
                    disabled={!selectedFile || isAnalyzing}
                    className="flex-1 bg-level2-primary"
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
            {/* Quick Stats moved to top summary */}
          </div>

          {/* Right Panel - Analysis Results */}
          <div className="lg:col-span-3">
            {analysisResult ? (
              <div className="space-y-6">
                {/* KPI Cards from backend */}
                {dynamicKpis.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {dynamicKpis.map((kpi, idx) => {
                      const Icon = kpi.icon;
                      return (
                        <Card key={idx} className="bg-card/80 border-border">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm text-muted-foreground truncate">{kpi.label}</div>
                                <div className="text-2xl font-semibold mt-1">{kpi.value}</div>
                              </div>
                              <div className="p-2 rounded-lg bg-level2-primary/10">
                                <Icon className="h-5 w-5 text-level2-primary" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {/* Charts: render what is available */}
                {analysisResult.data?.charts && Object.keys(analysisResult.data.charts).length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                    {Object.entries(analysisResult.data.charts).map(([chartKey, chartData], index) => {
                      return (
                        <div key={chartKey}>
                          {renderChart(
                            null,
                            chartData,
                            chartKey,
                            reportType
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Empty State */
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default CISODashboard;