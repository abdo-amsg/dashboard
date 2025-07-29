import { dashboardApi } from "../../../services/dashboardApi";

const Operational = {
  getKPIsData: async () => {
    try {
      const response = await dashboardApi.getDashboardKPIs();
      return response.kpis || [];
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error;
    }
  },

  getDashboardData: async () => {
    try {
      const kpis = await Operational.getKPIsData();
      const kpis_data = [];
      const charts = [];
      kpis.forEach(kpi => {
        if (kpi.reported_format.toLowerCase() === 'list') {
          kpis_data.push({
            title: kpi.title,
            last_calculated_date: kpi.last_calculated_date,
            threshold: kpi.threshold,
            top_items: kpi.current_value
          });
        } else if (kpi.reported_format.toLowerCase() === 'number') {
          kpis_data.push({
            title: kpi.title,
            current_value: kpi.current_value,
            previous_value: kpi.previous_value,
            progress: kpi.unit === '%' 
              ? kpi.current_value 
              : kpi.unit && kpi.unit.includes('/') 
                ? (kpi.current_value * 100) / Number(kpi.unit.split('/')[1]) 
                : 0,
            last_calculated_date: kpi.last_calculated_date,
            threshold: kpi.threshold,
            target: kpi.target,
            unit: kpi.unit,
            icon: 'shield'
          });
        } else if (
          kpi.reported_format &&
          typeof kpi.reported_format === 'string' &&
          kpi.reported_format.toLowerCase().includes('chart')
        ) {
          charts.push({
            title: kpi.title,
            threshold: kpi.threshold,
            type: kpi.reported_format.toLowerCase().replace('chart', '').trim(),
            data: kpi.current_value
          });
        }
      });

      return { kpis: kpis_data, charts };
    } catch (error) {
      console.error("Error processing dashboard data:", error);
      throw error;
    }
  }
};

export default Operational;