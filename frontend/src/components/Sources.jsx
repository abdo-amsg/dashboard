import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Plus, Edit, Trash2, Settings, BarChart3, Shield, Eye, Lock, TrendingUp, Activity, Loader2 } from "lucide-react";
import {dashboardApi} from "../services/dashboardApi";
import {useAuth} from "../contexts/AuthContext";
import { toast } from 'react-toastify';
// KPI Form Component
function KPIForm({
  kpi,
  onSave,
  onCancel,
  open,
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    level: "",
    type: "",
    target: "",
    unit: "",
    frequency: "",
    formula: "",
    reporting_format: "",
    data_source: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (kpi) {
      setFormData(kpi)
    } else {
      setFormData({
        name: "",
        description: "",
        level: "",
        type: "",
        target: "",
        unit: "",
        frequency: "",
        formula: "",
        reporting_format: "",
        data_source: "",
      })
    }
  }, [kpi, open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (kpi?.id) {
        await dashboardApi.updateKPI(kpi.id, formData)
        toast.success("✅ KPI updated successfully")
      } else {
        await dashboardApi.createKPI(formData)
        toast.success("✅ KPI created successfully")
      }
      onSave()
    } catch (error) {
      toast.error(`❌ ${error.response?.data?.detail || "Error saving KPI"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field) => (value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card-background rounded-2xl shadow-2xl border-card-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-brand flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand" />
            {kpi ? "Edit KPI" : "Create New KPI"}
          </DialogTitle>
          <DialogDescription className="text-brand">
            {kpi ? "Update the KPI details below." : "Fill in the details to create a new KPI."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name" className="text-base font-semibold text-text-primary">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => handleChange("name")(e.target.value)}
                placeholder="Enter KPI name"
                className="bg-input-background border border-input-border focus:border-brand-light focus:ring-brand-light text-text-primary"
                required
              />
            </div>
            <div>
              <Label htmlFor="level" className="text-base font-semibold text-text-primary">
                Level
              </Label>
              <Select value={formData.level || ""} onValueChange={handleChange("level")}> 
                <SelectTrigger className="bg-input-background border border-input-border focus:border-brand-light focus:ring-brand-light text-text-primary">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent className='bg-card-background border-card-border'>
                  <SelectItem className='hover:bg-hover' value="Operational">Operational</SelectItem>
                  <SelectItem className='hover:bg-hover' value="Managerial">Managerial</SelectItem>
                  <SelectItem className='hover:bg-hover' value="Strategic">Strategic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="description" className="text-base font-semibold text-text-primary">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleChange("description")(e.target.value)}
              placeholder="Enter KPI description"
              className="bg-input-background border border-input-border focus:border-brand-light focus:ring-brand-light text-text-primary min-h-[80px]"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="type" className="text-base font-semibold text-text-primary">
                Type
              </Label>
              <Input
                id="type"
                value={formData.type || ""}
                onChange={(e) => handleChange("type")(e.target.value)}
                placeholder="e.g., Percentage, Count"
                className="bg-input-background border border-input-border focus:border-brand-light focus:ring-brand-light text-text-primary"
              />
            </div>
            <div>
              <Label htmlFor="target" className="text-base font-semibold text-text-primary">
                Target
              </Label>
              <Input
                id="target"
                value={formData.target || ""}
                onChange={(e) => handleChange("target")(e.target.value)}
                placeholder="Target value"
                className="bg-input-background border border-input-border focus:border-brand-light focus:ring-brand-light text-text-primary"
              />
            </div>
            <div>
              <Label htmlFor="unit" className="text-base font-semibold text-text-primary">
                Unit
              </Label>
              <Input
                id="unit"
                value={formData.unit || ""}
                onChange={(e) => handleChange("unit")(e.target.value)}
                placeholder="e.g., %, hours, count"
                className="bg-input-background border border-input-border focus:border-brand-light focus:ring-brand-light text-text-primary"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="frequency" className="text-base font-semibold text-text-primary">
                Frequency
              </Label>
              <Select value={formData.frequency || ""} onValueChange={handleChange("frequency")}> 
                <SelectTrigger className="bg-input-background border border-input-border focus:border-brand-light focus:ring-brand-light text-text-primary">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent className='bg-card-background border-card-border'>
                  <SelectItem className='hover:bg-hover' value="Real-time">Real-time</SelectItem>
                  <SelectItem className='hover:bg-hover' value="Hourly">Hourly</SelectItem>
                  <SelectItem className='hover:bg-hover' value="Daily">Daily</SelectItem>
                  <SelectItem className='hover:bg-hover' value="Weekly">Weekly</SelectItem>
                  <SelectItem className='hover:bg-hover' value="Monthly">Monthly</SelectItem>
                  <SelectItem className='hover:bg-hover' value="Quarterly">Quarterly</SelectItem>
                  <SelectItem className='hover:bg-hover' value="Annually">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="data_source" className="text-base font-semibold text-text-primary">
                Data Source
              </Label>
              <Input
                id="data_source"
                value={formData.data_source || ""}
                onChange={(e) => handleChange("data_source")(e.target.value)}
                placeholder="Data source"
                className="bg-input-background border border-input-border focus:border-brand-light focus:ring-brand-light text-text-primary"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="formula" className="text-base font-semibold text-text-primary">
              Formula
            </Label>
            <Textarea
              id="formula"
              value={formData.formula || ""}
              onChange={(e) => handleChange("formula")(e.target.value)}
              placeholder="Enter calculation formula"
              className="bg-input-background border border-input-border focus:border-brand-light focus:ring-brand-light text-text-primary"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-border text-brand hover:bg-hover bg-transparent"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-brand hover:bg-brand-light text-white">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save KPI"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Tool Form Component
function ToolForm({
  tool,
  onSave,
  onCancel,
  open,
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    category: "",
    vendor: "",
    version: "",
    configuration: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (tool) {
      setFormData(tool)
    } else {
      setFormData({
        name: "",
        description: "",
        type: "",
        category: "",
        vendor: "",
        version: "",
        configuration: "",
      })
    }
  }, [tool, open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (tool?.id) {
        await dashboardApi.updateTool(tool.id, formData)
        toast.success("✅ Tool updated successfully")
      } else {
        await dashboardApi.createTool(formData)
        toast.success("✅ Tool created successfully")
      }
      onSave()
    } catch (error) {
      toast.error(`❌ ${error.response?.data?.detail || "Error saving tool"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field) => (value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card-background rounded-2xl shadow-2xl border-card-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-danger flex items-center gap-2">
            <Shield className="w-6 h-6 text-danger" />
            {tool ? "Edit Security Tool" : "Add New Security Tool"}
          </DialogTitle>
          <DialogDescription className="text-danger">
            {tool ? "Update the tool details below." : "Fill in the details to add a new security tool."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name" className="text-base font-semibold text-text-primary">
                Tool Name
              </Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => handleChange("name")(e.target.value)}
                placeholder="Enter tool name"
                className="bg-input-background border border-input-border focus:border-danger focus:ring-danger-light text-text-primary"
                required
              />
            </div>
            <div>
              <Label htmlFor="category" className="text-base font-semibold text-text-primary">
                Category
              </Label>
              <Select value={formData.category || ""} onValueChange={handleChange("category")}> 
                <SelectTrigger className="bg-input-background border border-input-border focus:border-danger focus:ring-danger-light text-text-primary">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className='bg-card-background border-card-border'>
                  <SelectItem className='hover:bg-danger-light' value="Data Security">Data Security</SelectItem>
                  <SelectItem className='hover:bg-danger-light' value="IAM">Identity, Access, and Mobility Security</SelectItem>
                  <SelectItem className='hover:bg-danger-light' value="IAC">Infrastructure, Application, and Continuity Security</SelectItem>
                  <SelectItem className='hover:bg-danger-light' value="Perimeter Security">Perimeter Security</SelectItem>
                  <SelectItem className='hover:bg-danger-light' value="SMIR">Security Monitoring and Incident Response</SelectItem>
                  <SelectItem className='hover:bg-danger-light' value="SGOR">Security Governance, Organization, and Resources</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="description" className="text-base font-semibold text-text-primary">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleChange("description")(e.target.value)}
              placeholder="Enter tool description"
              className="bg-input-background border border-input-border focus:border-danger focus:ring-danger-light text-text-primary min-h-[80px]"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="type" className="text-base font-semibold text-text-primary">
                Type
              </Label>
              <Select value={formData.type || ""} onValueChange={handleChange("type")}> 
                <SelectTrigger className="bg-input-background border border-input-border focus:border-danger focus:ring-danger-light text-text-primary">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className='bg-card-background border-card-border'>
                  <SelectItem className='hover:bg-danger-light' value="Firewall">Firewall</SelectItem>
                  <SelectItem className='hover:bg-danger-light' value="Antivirus">Antivirus</SelectItem>
                  <SelectItem className='hover:bg-danger-light' value="Vulnerability Scanner">Vulnerability Scanner</SelectItem>
                  <SelectItem className='hover:bg-danger-light' value="WAF">WAF</SelectItem>
                  <SelectItem className='hover:bg-danger-light' value="SIEM">SIEM</SelectItem>
                  <SelectItem className='hover:bg-danger-light' value="Patch Management">Patch Management</SelectItem>
                  <SelectItem className='hover:bg-danger-light' value="Web Application Scanner">Web Application Scanner</SelectItem>
                  <SelectItem className='hover:bg-danger-light' value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="vendor" className="text-base font-semibold text-text-primary">
                Vendor
              </Label>
              <Input
                id="vendor"
                value={formData.vendor || ""}
                onChange={(e) => handleChange("vendor")(e.target.value)}
                placeholder="Tool vendor"
                className="bg-input-background border border-input-border focus:border-danger focus:ring-danger-light text-text-primary"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="version" className="text-base font-semibold text-text-primary">
              Version
            </Label>
            <Input
              id="version"
              value={formData.version || ""}
              onChange={(e) => handleChange("version")(e.target.value)}
              placeholder="Tool version"
              className="bg-input-background border border-input-border focus:border-danger focus:ring-danger-light text-text-primary"
            />
          </div>
          <div>
            <Label htmlFor="configuration" className="text-base font-semibold text-text-primary">
              Configuration
            </Label>
            <Textarea
              id="configuration"
              value={formData.configuration || ""}
              onChange={(e) => handleChange("configuration")(e.target.value)}
              placeholder="Tool configuration details"
              className="bg-input-background border border-input-border focus:border-danger focus:ring-danger-light text-text-primary"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-border text-danger hover:bg-danger-light bg-transparent"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-danger hover:bg-red-700 text-white">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Tool"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Main Sources Component
const Sources = () => {
  const [currentTab, setCurrentTab] = useState("kpis")
  const [kpis, setKpis] = useState([])
  const [tools, setTools] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Dialog states
  const [kpiDialogOpen, setKpiDialogOpen] = useState(false)
  const [toolDialogOpen, setToolDialogOpen] = useState(false)
  const [selectedKpi, setSelectedKpi] = useState(null)
  const [selectedTool, setSelectedTool] = useState(null)

  // Check if user is superuser
  const isSuperUser = user?.is_superuser || false

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [kpisRes, toolsRes, statsRes] = await Promise.all([
        dashboardApi.getAllKPIs(),
        dashboardApi.getAllTools(),
        dashboardApi.getDashboardStats(),
      ])

      setKpis(kpisRes)
      setTools(toolsRes)
      setStats(statsRes)
    } catch (error) {
      toast.error("❌ Failed to fetch dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteKpi = async (kpiId) => {
    if (!isSuperUser) {
      toast.error("❌ Only administrators can delete KPIs")
      return
    }

    if (!window.confirm("Are you sure you want to delete this KPI?")) return

    try {
      await dashboardApi.deleteKPI(kpiId)
      toast.success("✅ KPI deleted successfully")
      fetchData()
    } catch (error) {
      toast.error(`❌ ${error.response?.data?.detail || "Failed to delete KPI"}`)
    }
  }

  const handleDeleteTool = async (toolId) => {
    if (!isSuperUser) {
      toast.error("❌ Only administrators can delete tools")
      return
    }

    if (!window.confirm("Are you sure you want to delete this tool?")) return

    try {
      await dashboardApi.deleteTool(toolId)
      toast.success("✅ Tool deleted successfully")
      fetchData()
    } catch (error) {
      toast.error(`❌ ${error.response?.data?.detail || "Failed to delete tool"}`)
    }
  }

  const getLevelColor = (level) => {
    const colors = {
      operational: "bg-hover text-brand-dark border-border",
      managerial: "bg-amber-100 text-amber-800 border-amber-200",
      strategic: "bg-purple-100 text-purple-800 border-purple-200",
    }
    return colors[level?.toLowerCase()] || "bg-slate-100 text-text-primary border-slate-200"
  }

  const getCategoryColor = (category) => {
    const colors = {
      data: "bg-red-100 text-red-800 border-red-200",
      IAM: "bg-blue-100 text-blue-800 border-blue-200",
      "Sécurité des infrastructures, applicatifs et continuité": "bg-amber-100 text-amber-800 border-amber-200",
      "Security Perimeter": "bg-blue-100 text-blue-800 border-blue-200",
      "Monitoring de la sécurité et réponse aux incidents": "bg-purple-100 text-purple-800 border-purple-200",
      GOR: "bg-slate-100 text-text-primary border-slate-200",
    }
    return colors[category] || "bg-slate-100 text-text-primary border-slate-200"
  }

  const getTypeColor = (type) => {
    const colors = {
      Firewall: "bg-red-100 text-red-800 border-red-200",
      Antivirus: "bg-blue-100 text-blue-800 border-blue-200",
      "Vulnerability Scanner": "bg-amber-100 text-amber-800 border-amber-200",
      WAF: "bg-blue-100 text-blue-800 border-blue-200",
      "Web Application Scanner": "bg-purple-100 text-purple-800 border-purple-200",
      siem: "bg-slate-100 text-text-primary border-slate-200",
      endpoint_protection: "bg-blue-100 text-blue-800 border-blue-200",
      network_monitoring: "bg-blue-100 text-blue-800 border-blue-200",
      log_analysis: "bg-slate-100 text-text-primary border-slate-200",
      other: "bg-slate-100 text-text-primary border-slate-200",
    }
    return colors[type] || "bg-slate-100 text-text-primary border-slate-200"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand" />
          <p className="text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-main-background to-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-card-background rounded-xl shadow-sm border border-card-border p-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-hover rounded-lg">
                  <Settings className="w-6 h-6 text-brand" />
                </div>
                <h1 className="text-3xl font-bold text-text-primary">KPIs & Tools Dashboard</h1>
              </div>
              <p className="text-text-secondary text-lg">
                {isSuperUser
                  ? "Manage KPIs and Tools"
                  : "View KPIs and Tools"}
              </p>
            </div>

            {!isSuperUser && (
              <Alert className="max-w-md border-[var(--stat-card-color4)] bg-[var(--stat-card-background4)]">
                <Lock className="h-4 w-4 text-[var(--stat-card-color4)]" />
                <AlertDescription className="text-[var(--stat-card-color4)]">
                  Read-only access - Contact administrator to modify KPIs
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-card-border bg-card-background hover:shadow-md transition-shadow ">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium text-text-primary">Total KPIs</CardTitle>
                  <BarChart3 className="w-5 h-5 text-brand" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-text-primary">{stats.kpis.total}</div>
                <p className="text-sm text-text-secondary mt-1">Performance indicators</p>
              </CardContent>
            </Card>

            <Card className="border-card-border bg-card-background hover:shadow-md transition-shadow ">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-text-primary">Security Tools</CardTitle>
                  <Shield className="w-5 h-5 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-text-primary">{stats.tools.total}</div>
                <p className="text-sm text-text-secondary mt-1">Active security tools</p>
              </CardContent>
            </Card>

            <Card className="border-card-border bg-card-background hover:shadow-md transition-shadow ">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-text-primary">Logs Today</CardTitle>
                  <Activity className="w-5 h-5 text-highlight-background" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-text-primary">{stats.logs.today.toLocaleString()}</div>
                <p className="text-sm text-text-secondary mt-1">Log entries processed</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Card className="border-card-border bg-card-background shadow-sm">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <div className="border-b border-card-border">
              <TabsList className="grid w-full grid-cols-3 bg-card-background">
                <TabsTrigger value="kpis" className="data-[state=active]:bg-highlight data-[state=active]:text-brand">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  KPIs
                </TabsTrigger>
                <TabsTrigger value="tools" className="data-[state=active]:bg-danger-light data-[state=active]:text-danger">
                  <Shield className="w-4 h-4 mr-2" />
                  Security Tools
                </TabsTrigger>
                <TabsTrigger value="stats" className="data-[state=active]:bg-input-background data-[state=active]:text-text-primary">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Statistics
                </TabsTrigger>
              </TabsList>
            </div>

            {/* KPI Management Tab */}
            <TabsContent value="kpis" className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">Key Performance Indicators</h2>
                  <p className="text-text-secondary mt-1">Manage and monitor your KPIs</p>
                </div>
                {isSuperUser && (
                  <Button
                    onClick={() => {
                      setSelectedKpi(null)
                      setKpiDialogOpen(true)
                    }}
                    className="bg-brand hover:bg-brand-dark text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add KPI
                  </Button>
                )}
              </div>

              <div className="border border-card-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-main-background">
                      <TableHead className="font-semibold text-text-primary">Name</TableHead>
                      <TableHead className="font-semibold text-text-primary">Level</TableHead>
                      <TableHead className="font-semibold text-text-primary">Type</TableHead>
                      <TableHead className="font-semibold text-text-primary">Target</TableHead>
                      <TableHead className="font-semibold text-text-primary">Frequency</TableHead>
                      <TableHead className="font-semibold text-text-primary">Data Source</TableHead>
                      <TableHead className="font-semibold text-text-primary">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kpis &&
                      kpis.map((kpi) => (
                        <TableRow key={kpi.id} className="hover:bg-hover transition-colors">
                          <TableCell>
                            <div>
                              <div className="font-medium text-text-primary">{kpi.name}</div>
                              <div className="text-sm text-text-secondary mt-1">{kpi.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getLevelColor(kpi.level)}>{kpi.level}</Badge>
                          </TableCell>
                          <TableCell className="text-text-secondary">{kpi.type}</TableCell>
                          <TableCell>
                            <span className="font-medium text-text-primary">
                              {kpi.target} {kpi.unit}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-border text-text-secondary">
                              {kpi.frequency}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-text-secondary">{kpi.data_source || "N/A"}</TableCell>
                          <TableCell className="text-right">
                            {isSuperUser ? (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedKpi(kpi)
                                    setKpiDialogOpen(true)
                                  }}
                                  className="text-brand hover:text-brand-dark"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteKpi(kpi.id)}
                                  className="text-danger"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button variant="ghost" size="sm" className="text-text-secondary cursor-not-allowed">
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Tool Management Tab */}
            <TabsContent value="tools" className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">Security Tools</h2>
                  <p className="text-text-secondary mt-1">Manage your security infrastructure</p>
                </div>
                {isSuperUser && (
                  <Button
                    onClick={() => {
                      setSelectedTool(null)
                      setToolDialogOpen(true)
                    }}
                    className="bg-danger hover:bg-red-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Tool
                  </Button>
                )}
              </div>

              <div className="border border-card-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-card-background">
                      <TableHead className="font-semibold text-text-primary">Name</TableHead>
                      <TableHead className="font-semibold text-text-primary">Category</TableHead>
                      <TableHead className="font-semibold text-text-primary">Type</TableHead>
                      <TableHead className="font-semibold text-text-primary">Vendor</TableHead>
                      <TableHead className="font-semibold text-text-primary">Version</TableHead>
                      <TableHead className="font-semibold text-text-primary">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tools &&
                      tools.map((tool) => (
                        <TableRow key={tool.id} className="hover:bg-hover transition-colors">
                          <TableCell>
                            <div>
                              <div className="font-medium text-text-primary">{tool.name}</div>
                              <div className="text-sm text-text-secondary mt-1">{tool.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getCategoryColor(tool.category)}>
                              {tool.category?.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getTypeColor(tool.type)}>{tool.type?.replace("_", " ")}</Badge>
                          </TableCell>
                          <TableCell className="text-text-secondary">{tool.vendor || "N/A"}</TableCell>
                          <TableCell className="text-text-secondary">{tool.version || "N/A"}</TableCell>
                          <TableCell className="text-right">
                            {isSuperUser ? (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTool(tool)
                                    setToolDialogOpen(true)
                                  }}
                                  className="text-brand hover:text-brand-dark"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteTool(tool.id)}
                                  className="text-danger"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button variant="ghost" size="sm" className="text-text-secondary cursor-not-allowed">
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="stats" className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-text-primary">Dashboard Statistics</h2>
                <p className="text-text-secondary mt-1">Overview of your dashboard metrics</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-card-border">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-text-primary flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-brand" />
                      KPI Distribution by Level
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {stats &&
                      Object.entries(stats.kpis.by_level).map(([level, count]) => (
                        <div key={level} className="flex items-center justify-between p-3 bg-main-background rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-text-primary">{level} KPIs</span>
                          </div>
                          <span className="text-xl font-bold text-text-primary">{count}</span>
                        </div>
                      ))}
                  </CardContent>
                </Card>

                <Card className="border-card-border">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-text-primary flex items-center gap-2">
                      <Shield className="w-5 h-5 text-danger" />
                      Tools by Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {stats &&
                      Object.entries(stats.tools.by_category).map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between p-3 bg-main-background rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-text-primary">{category.replace("_", " ")}</span>
                          </div>
                          <span className="text-xl font-bold text-text-primary">{count}</span>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Dialogs */}
        <KPIForm
          kpi={selectedKpi}
          open={kpiDialogOpen}
          onSave={() => {
            setKpiDialogOpen(false)
            fetchData()
          }}
          onCancel={() => setKpiDialogOpen(false)}
        />

        <ToolForm
          tool={selectedTool}
          open={toolDialogOpen}
          onSave={() => {
            setToolDialogOpen(false)
            fetchData()
          }}
          onCancel={() => setToolDialogOpen(false)}
        />
      </div>
    </div>
  )
}

export default Sources
