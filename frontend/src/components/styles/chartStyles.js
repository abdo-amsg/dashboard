import { colors } from './colors.js';

// Styles pour les conteneurs de graphiques
export const chartContainerStyles = {
  base: "bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300",
  header: "flex items-center justify-between mb-4",
  title: "text-lg font-semibold text-gray-900",
  subtitle: "text-sm text-gray-500 mt-1"
};

// Styles pour les tooltips
export const tooltipStyles = {
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  },
  label: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: '14px'
  },
  value: {
    color: '#FFFFFF',
    fontSize: '13px'
  }
};

// Styles pour les légendes
export const legendStyles = {
  container: {
    paddingTop: '16px'
  },
  item: {
    fontSize: '12px',
    color: '#6B7280'
  }
};

// Styles spécifiques pour les graphiques en secteurs (pie)
export const pieChartStyles = {
  container: {
    width: '100%',
    height: 300
  },
  cell: {
    stroke: '#FFFFFF',
    strokeWidth: 2
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    fill: '#374151'
  }
};

// Styles spécifiques pour les graphiques en barres
export const barChartStyles = {
  container: {
    width: '100%',
    height: 300
  },
  margin: {
    top: 20,
    right: 30,
    left: 20,
    bottom: 5
  },
  bar: {
    fill: colors.primary.blue,
    radius: [4, 4, 0, 0]
  },
  xAxis: {
    fontSize: '12px',
    fill: '#6B7280'
  },
  yAxis: {
    fontSize: '12px',
    fill: '#6B7280'
  }
};

// Styles spécifiques pour les graphiques linéaires
export const lineChartStyles = {
  container: {
    width: '100%',
    height: 300
  },
  margin: {
    top: 20,
    right: 30,
    left: 20,
    bottom: 5
  },
  line: {
    stroke: colors.primary.blue,
    strokeWidth: 3,
    dot: false
  },
  area: {
    fill: 'url(#colorGradient)',
    fillOpacity: 0.3
  }
};

// Styles spécifiques pour les graphiques en aires
export const areaChartStyles = {
  container: {
    width: '100%',
    height: 300
  },
  margin: {
    top: 20,
    right: 30,
    left: 20,
    bottom: 5
  },
  area: {
    fill: colors.primary.blue,
    fillOpacity: 0.6,
    stroke: colors.primary.blue,
    strokeWidth: 2
  }
};

// Gradients pour les graphiques
export const chartGradients = {
  blue: {
    id: 'colorGradient',
    x1: '0',
    y1: '0',
    x2: '0',
    y2: '1',
    stops: [
      { offset: '5%', stopColor: colors.primary.blue, stopOpacity: 0.8 },
      { offset: '95%', stopColor: colors.primary.blue, stopOpacity: 0.1 }
    ]
  }
};

export default {
  chartContainerStyles,
  tooltipStyles,
  legendStyles,
  pieChartStyles,
  barChartStyles,
  lineChartStyles,
  areaChartStyles,
  chartGradients
};