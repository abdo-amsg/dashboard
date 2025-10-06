// Palette de couleurs pour le dashboard inwi SOC
export const colors = {
  // Couleurs principales
  primary: {
    blue: '#3B82F6',
    indigo: '#6366F1',
    purple: '#8B5CF6',
    teal: '#14B8A6',
    emerald: '#10B981',
    orange: '#F59E0B',
    red: '#EF4444',
    pink: '#EC4899'
  },

  // Couleurs pour les graphiques
  chart: [
    '#3B82F6', // Bleu
    '#10B981', // Emerald
    '#F59E0B', // Orange
    '#EF4444', // Rouge
    '#8B5CF6', // Violet
    '#14B8A6', // Teal
    '#EC4899', // Rose
    '#6366F1'  // Indigo
  ],

  // Couleurs de sévérité
  severity: {
    critical: '#DC2626',
    high: '#EA580C',
    medium: '#D97706',
    low: '#65A30D',
    info: '#2563EB'
  },

  // Couleurs de statut
  status: {
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    info: '#2563EB',
    neutral: '#6B7280'
  },

  // Couleurs de fond
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    accent: '#F3F4F6',
    gradient: {
      blue: 'from-blue-50 to-indigo-50',
      green: 'from-green-50 to-emerald-50',
      orange: 'from-orange-50 to-amber-50',
      red: 'from-red-50 to-pink-50'
    }
  },

  // Couleurs de texte
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    muted: '#9CA3AF',
    white: '#FFFFFF'
  },

  // Couleurs de bordure
  border: {
    light: '#E5E7EB',
    medium: '#D1D5DB',
    dark: '#9CA3AF'
  }
};

export default colors;