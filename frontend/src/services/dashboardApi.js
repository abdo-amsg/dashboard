import api from './api';

export const dashboardApi = {
  // ==================== KPI MANAGEMENT ====================

  // Get all KPIs for
  getAllKPIs: async (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.skip) searchParams.append('skip', params.skip);
    if (params.limit) searchParams.append('limit', params.limit);

    const response = await api.get(`/api/dashboard/kpis?${searchParams}`);
    return response.data;
  },

  // Get specific KPI
  getKPIById: async (kpiId) => {
    const response = await api.get(`/api/dashboard/kpis/${kpiId}`);
    return response.data;
  },

  // Create new KPI
  createKPI: async (kpiData) => {
    const response = await api.post('/api/dashboard/kpis', kpiData);
    return response.data;
  },

  // Update KPI
  updateKPI: async (kpiId, kpiData) => {
    const response = await api.put(`/api/dashboard/kpis/${kpiId}`, kpiData);
    return response.data;
  },

  // Delete KPI
  deleteKPI: async (kpiId) => {
    const response = await api.delete(`/api/dashboard/kpis/${kpiId}`);
    return response.data;
  },

  // ==================== TOOL MANAGEMENT ====================

  // Get all tools for
  getAllTools: async (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.skip) searchParams.append('skip', params.skip);
    if (params.limit) searchParams.append('limit', params.limit);
    if (params.category) searchParams.append('category', params.category);
    if (params.type) searchParams.append('type', params.type);

    const response = await api.get(`/api/dashboard/tools?${searchParams}`);
    return response.data;
  },

  // Get specific tool
  getToolById: async (toolId) => {
    const response = await api.get(`/api/dashboard/tools/${toolId}`);
    return response.data;
  },

  // Create new tool
  createTool: async (toolData) => {
    console.log('Creating tool with data:', toolData);
    const response = await api.post('/api/dashboard/tools', toolData);
    console.log('Tool created:', response);
    return response.data;
  },

  // Update tool
  updateTool: async (toolId, toolData) => {
    const response = await api.put(`/api/dashboard/tools/${toolId}`, toolData);
    return response.data;
  },

  // Delete tool
  deleteTool: async (toolId) => {
    const response = await api.delete(`/api/dashboard/tools/${toolId}`);
    return response.data;
  },

  // ==================== FILE MANAGEMENT ====================

  getFile: async (fileId) => {
    const response = await api.get(`/api/dashboard/files/${fileId}`);
    return response.data;
  },

  getLogs: async () => {

  },

  // ==================== DASHBOARD MANAGEMENT ====================

  // Get dashboard statistics
  getDashboardStats: async () => {
    const response = await api.get('/api/dashboard/stats');
    return response.data;
  },

  getDashboardKPIs: async () => {
    try {
      const response = await api.get('/api/dashboard/kpi-values/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard KPIs:', error);
      throw error;
    }
  },

};