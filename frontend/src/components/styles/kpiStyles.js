import { colors } from './colors.js';

// Styles pour les cartes KPI
export const kpiCardStyles = {
  // Taille normale
  normal: {
    container: "bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1",
    header: "flex items-center justify-between mb-4",
    title: "text-sm font-medium text-gray-600 uppercase tracking-wide",
    value: "text-3xl font-bold text-gray-900 mb-2",
    change: {
      positive: "text-green-600 text-sm font-medium flex items-center",
      negative: "text-red-600 text-sm font-medium flex items-center",
      neutral: "text-gray-600 text-sm font-medium flex items-center"
    },
    footer: "text-xs text-gray-400 mt-auto pt-1 border-t border-gray-100"
  },

  // Taille large pour les KPI importants
  large: {
    container: "bg-white rounded-xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1",
    header: "flex items-center justify-between mb-6",
    title: "text-base font-medium text-gray-600 uppercase tracking-wide",
    value: "text-4xl font-bold text-gray-900 mb-3",
    change: {
      positive: "text-green-600 text-base font-medium flex items-center",
      negative: "text-red-600 text-base font-medium flex items-center",
      neutral: "text-gray-600 text-base font-medium flex items-center"
    },
    footer: "text-sm text-gray-400 mt-auto pt-2 border-t border-gray-100"
  },

  // Taille compacte
  compact: {
    container: "bg-white rounded-lg shadow-md border border-gray-100 p-4 hover:shadow-lg transition-all duration-300",
    header: "flex items-center justify-between mb-2",
    title: "text-xs font-medium text-gray-600 uppercase tracking-wide",
    value: "text-2xl font-bold text-gray-900 mb-1",
    change: {
      positive: "text-green-600 text-xs font-medium flex items-center",
      negative: "text-red-600 text-xs font-medium flex items-center",
      neutral: "text-gray-600 text-xs font-medium flex items-center"
    },
    footer: "text-xs text-gray-400 mt-1"
  }
};

// Styles pour les icônes des KPI
export const kpiIconStyles = {
  container: "p-3 rounded-lg",
  icon: "w-6 h-6",
  colors: {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
    red: "bg-red-100 text-red-600",
    purple: "bg-purple-100 text-purple-600",
    teal: "bg-teal-100 text-teal-600",
    pink: "bg-pink-100 text-pink-600",
    indigo: "bg-indigo-100 text-indigo-600"
  }
};

// Styles pour les grilles de KPI
export const kpiGridStyles = {
  // Grille 4 colonnes (desktop)
  fourColumns: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8",
  
  // Grille 3 colonnes
  threeColumns: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8",
  
  // Grille 2 colonnes
  twoColumns: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8",
  
  // Grille responsive adaptative
  responsive: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
};

// Styles pour les indicateurs de tendance
export const trendIndicatorStyles = {
  up: {
    container: "flex items-center text-green-600",
    icon: "w-4 h-4 mr-1",
    text: "text-sm font-medium"
  },
  down: {
    container: "flex items-center text-red-600",
    icon: "w-4 h-4 mr-1",
    text: "text-sm font-medium"
  },
  stable: {
    container: "flex items-center text-gray-600",
    icon: "w-4 h-4 mr-1",
    text: "text-sm font-medium"
  }
};

// Styles pour les badges de statut
export const statusBadgeStyles = {
  success: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800",
  warning: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800",
  error: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800",
  info: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800",
  neutral: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
};

export default {
  kpiCardStyles,
  kpiIconStyles,
  kpiGridStyles,
  trendIndicatorStyles,
  statusBadgeStyles
};