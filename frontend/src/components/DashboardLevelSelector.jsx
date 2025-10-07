import React, { useState } from 'react';
import { Shield, TrendingUp, Users, Settings, ChevronRight, BarChart3, Eye, Brain, Sparkles, Zap, Target } from 'lucide-react';
import SOCAnalyzerDashboard from './inwi';
import CISODashboard from './CISODashboard';
import COMEXDashboard from './COMEXDashboard';
import AuthWrapper from './AuthWrapper';

const DashboardLevelSelector = () => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [animationPhase, setAnimationPhase] = useState(0);

  // Animation removed to prevent chart flickering

  const dashboardLevels = [
    {
      id: 1,
      title: 'Niveau 1 - Opérationnel',
      subtitle: 'SOC Analyst Dashboard',
      description: 'Dashboard pour les analystes SOC avec métriques opérationnelles en temps réel',
      icon: Shield,
      color: 'from-blue-500 to-blue-700',
      accentColor: 'blue',
      bgPattern: 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
      features: [
        'Alertes temps réel',
        'Traitement d\'événements',
        'Efficacité de détection',
        'Temps de réponse',
        'État des systèmes',
        'Allocation des ressources',
        'Règles de détection',
        'Threat Intelligence'
      ]
    },
    {
      id: 2,
      title: 'Niveau 2 - Pilotage',
      subtitle: 'CISO Dashboard',
      description: 'Dashboard exécutif pour les responsables sécurité avec KPIs stratégiques',
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-700',
      accentColor: 'purple',
      bgPattern: 'radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)',
      features: [
        'Rapport d\'incidents',
        'Gestion des vulnérabilités',
        'Disponibilité des outils',
        'Règles & Use Cases',
        'Threat Intelligence',
        'Sensibilisation & Formation',
        'Surface d\'exposition',
        'Projets sécurité'
      ]
    },
    {
      id: 3,
      title: 'Niveau 3 - Stratégique',
      subtitle: 'COMEX Dashboard',
      description: 'Dashboard stratégique pour la direction avec indicateurs business et KPIs COMEX',
      icon: Users,
      color: 'from-green-500 to-green-700',
      accentColor: 'green',
      bgPattern: 'radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.3) 0%, transparent 50%)',
      features: [
        'Posture de Risque Cyber',
        'Impact Financier',
        'Conformité Réglementaire',
        'Programme Sécurité',
        'Benchmark Sectoriel',
        'Paysage des Menaces',
        'Exposition au Risque',
        'Alignement Stratégique'
      ]
    }
  ];

  const returnToSelector = () => {
    setSelectedLevel(null);
  };

  if (selectedLevel === 1) {
    return (
      <AuthWrapper>
        <SOCAnalyzerDashboard returnToSelector={returnToSelector} />
      </AuthWrapper>
    );
  }

  if (selectedLevel === 2) {
    return (
      <AuthWrapper>
        <CISODashboard returnToSelector={returnToSelector} />
      </AuthWrapper>
    );
  }

  if (selectedLevel === 3) {
    return <COMEXDashboard returnToSelector={returnToSelector} />;
  }
  if (selectedLevel === null) {

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Enhanced Background pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #1e3a8a 2px, transparent 2px),
                           radial-gradient(circle at 75% 75%, #3b82f6 1px, transparent 1px),
                           radial-gradient(circle at 50% 10%, #8b5cf6 1px, transparent 1px)`,
            backgroundSize: '60px 60px, 40px 40px, 80px 80px',
            animation: 'float 25s ease-in-out infinite'
          }}
        />
        
        {/* Enhanced floating geometric shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
            style={{
              top: '10%',
              left: '10%',
              animation: 'float 20s ease-in-out infinite',
              animationDelay: '0s'
            }}
          />
          <div 
            className="absolute w-48 h-48 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl"
            style={{
              top: '60%',
              right: '15%',
              animation: 'float 25s ease-in-out infinite reverse',
              animationDelay: '5s'
            }}
          />
          <div 
            className="absolute w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl"
            style={{
              bottom: '20%',
              left: '20%',
              animation: 'float 30s ease-in-out infinite',
              animationDelay: '10s'
            }}
          />
          
          {/* Additional floating particles */}
          <div 
            className="absolute w-16 h-16 bg-gradient-to-br from-yellow-400/30 to-orange-400/30 rounded-full blur-xl"
            style={{
              top: '30%',
              left: '70%',
              animation: 'float 18s ease-in-out infinite',
              animationDelay: '3s'
            }}
          />
          <div 
            className="absolute w-20 h-20 bg-gradient-to-br from-indigo-400/25 to-cyan-400/25 rounded-full blur-xl"
            style={{
              bottom: '40%',
              right: '60%',
              animation: 'float 22s ease-in-out infinite reverse',
              animationDelay: '7s'
            }}
          />
          <div 
            className="absolute w-12 h-12 bg-gradient-to-br from-rose-400/35 to-pink-400/35 rounded-full blur-lg"
            style={{
              top: '80%',
              left: '40%',
              animation: 'float 16s ease-in-out infinite',
              animationDelay: '12s'
            }}
          />
        </div>

        <div className="relative p-6" style={{ zIndex: 1 }}>
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center items-center mb-6">
              <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-xl relative">
                <BarChart3 size={48} className="text-white" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent mb-3">
              INWI Security Dashboard
            </h1>
            <p className="text-gray-600 text-xl font-medium mb-4">
              Sélectionnez votre niveau d'accès au dashboard
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
          </div>

          {/* Dashboard Level Cards */}
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
              {dashboardLevels.map((level) => {
                const IconComponent = level.icon;
                return (
                  <div
                    key={level.id}
                    className={`relative bg-white rounded-3xl p-8 border-2 border-gray-100 shadow-2xl hover:shadow-3xl transition-all duration-700 transform group cursor-pointer overflow-hidden ${
                      level.comingSoon ? 'opacity-75' : ''
                    } ${
                      hoveredCard === level.id 
                        ? 'scale-110 -translate-y-4 z-20 border-opacity-50' 
                        : hoveredCard !== null 
                          ? 'scale-95 opacity-75' 
                          : 'hover:scale-105 hover:-translate-y-2'
                    }`}
                    onClick={() => !level.comingSoon && setSelectedLevel(level.id)}
                    onMouseEnter={() => setHoveredCard(level.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{
                      background: hoveredCard === level.id 
                        ? `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%), ${level.bgPattern}`
                        : 'white',
                      borderColor: hoveredCard === level.id 
                        ? level.accentColor === 'blue' ? '#3b82f6' 
                        : level.accentColor === 'purple' ? '#8b5cf6' 
                        : '#10b981'
                        : '#f3f4f6'
                    }}
                  >
                    {/* Coming Soon Badge */}
                    {level.comingSoon && (
                      <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg transform rotate-12">
                        Bientôt
                      </div>
                    )}

                    {/* Animated background elements */}
                    <div className="absolute inset-0 overflow-hidden rounded-3xl">
                      <div 
                        className={`absolute w-32 h-32 bg-gradient-to-br ${level.color} opacity-10 rounded-full blur-xl transition-all duration-1000`}
                        style={{
                          transform: hoveredCard === level.id 
                            ? `translate(30px, 15px) scale(1.2)`
                            : `translate(20px, 10px) scale(1)`,
                          animation: hoveredCard === level.id ? 'float 3s ease-in-out infinite' : 'none'
                        }}
                      />
                      <div 
                        className={`absolute w-24 h-24 bg-gradient-to-br ${level.color} opacity-5 rounded-full blur-lg transition-all duration-1000`}
                        style={{
                          right: '20px',
                          bottom: '20px',
                          transform: hoveredCard === level.id 
                            ? `translate(-15px, -8px) scale(1.3)`
                            : 'translate(-10px, -5px) scale(1)',
                          animation: hoveredCard === level.id ? 'float 3s ease-in-out infinite reverse' : 'none'
                        }}
                      />
                    </div>

                    <div className="relative z-10">
                      {/* Icon with enhanced animation */}
                      <div className={`p-5 bg-gradient-to-br ${level.color} rounded-3xl shadow-2xl mb-6 inline-block group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative overflow-hidden ${hoveredCard === level.id ? 'glow-effect' : ''}`}>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        {hoveredCard === level.id && (
                          <div className="absolute inset-0 shimmer-effect"></div>
                        )}
                        <IconComponent size={44} className="text-white relative z-10" />
                        {hoveredCard === level.id && (
                          <div className="absolute top-1 right-1">
                            <Sparkles size={16} className="text-white animate-pulse" />
                          </div>
                        )}
                      </div>

                      {/* Title and Subtitle */}
                      <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-900 transition-colors">
                        {level.title}
                      </h2>
                      <h3 className="text-lg font-semibold text-gray-600 mb-4 group-hover:text-blue-700 transition-colors">
                        {level.subtitle}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {level.description}
                      </p>

                      {/* Features with enhanced styling */}
                      <div className={`mb-8 transition-all duration-500 ${hoveredCard === level.id ? 'transform scale-105' : ''}`}>
                        <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide flex items-center">
                          <Zap size={16} className={`mr-2 text-yellow-500 ${hoveredCard === level.id ? 'animate-pulse' : ''}`} />
                          Fonctionnalités incluses
                        </h4>
                        <div className="grid grid-cols-1 gap-3 max-h-48 overflow-hidden transition-all duration-700">
                          {level.features.slice(0, hoveredCard === level.id ? level.features.length : 4).map((feature, index) => (
                            <div 
                              key={index} 
                              className={`flex items-center text-sm text-gray-600 p-2 rounded-lg transition-all duration-500 ${
                                hoveredCard === level.id ? 'bg-gray-50 transform translate-x-2 shadow-sm' : ''
                              }`}
                              style={{
                                transitionDelay: hoveredCard === level.id ? `${index * 80}ms` : '0ms',
                                opacity: hoveredCard === level.id || index < 4 ? 1 : 0,
                                transform: hoveredCard === level.id || index < 4 ? 'translateY(0)' : 'translateY(-10px)'
                              }}
                            >
                              <div className={`w-2 h-2 bg-gradient-to-r ${level.color} rounded-full mr-3 flex-shrink-0 transition-all duration-300 ${
                                hoveredCard === level.id ? 'scale-150 animate-pulse' : ''
                              }`}></div>
                              <span className={`font-medium transition-colors duration-300 ${
                                hoveredCard === level.id ? 'text-gray-800' : ''
                              }`}>{feature}</span>
                            </div>
                          ))}
                          {hoveredCard !== level.id && level.features.length > 4 && (
                            <div className="text-xs text-gray-400 italic pl-5 transition-opacity duration-300">
                              +{level.features.length - 4} autres fonctionnalités...
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Enhanced Action Button */}
                      <button
                        className={`w-full py-4 px-6 bg-gradient-to-r ${level.color} text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 flex items-center justify-center relative overflow-hidden group ${level.comingSoon ? 'cursor-not-allowed opacity-50' : ''
                          }`}
                        disabled={level.comingSoon}
                      >
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        <div className="relative z-10 flex items-center">
                          {level.comingSoon ? (
                            <>
                              <Settings size={20} className="mr-2 animate-spin" />
                              En développement
                            </>
                          ) : (
                            <>
                              <Target size={20} className="mr-2" />
                              Accéder au Dashboard
                              <ChevronRight size={20} className="ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                            </>
                          )}
                        </div>
                        {!level.comingSoon && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info Section */}
          <div className="max-w-4xl mx-auto mt-16 text-center">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Architecture Multi-Niveaux
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Notre solution de dashboard sécurité propose une approche structurée en trois niveaux,
                adaptée aux différents rôles et responsabilités au sein de votre organisation.
                Chaque niveau offre des métriques et des visualisations spécifiques aux besoins de ses utilisateurs.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="p-3 bg-blue-100 rounded-full inline-block mb-3">
                    <Eye size={24} className="text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Opérationnel</h4>
                  <p className="text-sm text-gray-600">Surveillance temps réel et réponse aux incidents</p>
                </div>

                <div className="text-center">
                  <div className="p-3 bg-purple-100 rounded-full inline-block mb-3">
                    <TrendingUp size={24} className="text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Pilotage</h4>
                  <p className="text-sm text-gray-600">Gestion et optimisation des processus sécurité</p>
                </div>

                <div className="text-center">
                  <div className="p-3 bg-green-100 rounded-full inline-block mb-3">
                    <Brain size={24} className="text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Stratégique</h4>
                  <p className="text-sm text-gray-600">Vision globale et prise de décision exécutive</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default DashboardLevelSelector;