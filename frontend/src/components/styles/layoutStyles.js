// Styles pour la mise en page générale du dashboard

// Styles pour les conteneurs principaux
export const containerStyles = {
  main: "min-h-screen bg-gray-50",
  content: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",
  section: "mb-12"
};

// Styles pour les en-têtes de section
export const sectionHeaderStyles = {
  container: "mb-6",
  title: "text-2xl font-bold text-gray-900 mb-2",
  subtitle: "text-gray-600",
  titleLarge: "text-3xl font-bold text-gray-900 mb-3",
  subtitleLarge: "text-lg text-gray-600"
};

// Styles pour les grilles de graphiques
export const chartGridStyles = {
  // Grille responsive standard
  responsive: "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8",
  
  // Grille 2 colonnes
  twoColumns: "grid grid-cols-1 lg:grid-cols-2 gap-8",
  
  // Grille 3 colonnes
  threeColumns: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8",
  
  // Grille 4 colonnes
  fourColumns: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
};

// Styles pour les animations
export const animationStyles = {
  fadeIn: "fade-slide-in",
  slideUp: "transform transition-all duration-300 hover:-translate-y-1",
  scaleHover: "transform transition-all duration-300 hover:scale-105",
  shadowHover: "transition-shadow duration-300 hover:shadow-xl"
};

// Styles pour les boutons
export const buttonStyles = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200",
  secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200",
  success: "bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200",
  danger: "bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200",
  outline: "border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
};

// Styles pour les onglets/navigation
export const tabStyles = {
  container: "flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6",
  tab: {
    active: "flex-1 py-2 px-4 text-sm font-medium text-blue-600 bg-white rounded-md shadow-sm transition-all duration-200",
    inactive: "flex-1 py-2 px-4 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-all duration-200"
  }
};

// Styles pour les cartes de contenu
export const cardStyles = {
  base: "bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden",
  header: "px-6 py-4 border-b border-gray-100",
  body: "p-6",
  footer: "px-6 py-4 bg-gray-50 border-t border-gray-100",
  
  // Variantes
  elevated: "bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden",
  flat: "bg-white rounded-lg border border-gray-200 overflow-hidden",
  gradient: "bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 overflow-hidden"
};

// Styles pour les alertes/notifications
export const alertStyles = {
  success: "bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg",
  warning: "bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg",
  error: "bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg",
  info: "bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg"
};

// Styles pour le résumé des métriques
export const metricsummaryStyles = {
  container: "mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100",
  header: "flex items-center justify-between",
  title: "text-lg font-semibold text-gray-900",
  subtitle: "text-gray-600 text-sm",
  button: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
};

// Styles pour les états de chargement
export const loadingStyles = {
  spinner: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600",
  skeleton: "animate-pulse bg-gray-200 rounded",
  overlay: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
};

// Styles pour les formulaires
export const formStyles = {
  input: "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500",
  label: "block text-sm font-medium text-gray-700 mb-1",
  select: "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500",
  checkbox: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
};

export default {
  containerStyles,
  sectionHeaderStyles,
  chartGridStyles,
  animationStyles,
  buttonStyles,
  tabStyles,
  cardStyles,
  alertStyles,
  metricsummaryStyles,
  loadingStyles,
  formStyles
};