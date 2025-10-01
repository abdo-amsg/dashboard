import React, { useState } from 'react';
import { Shield, TrendingUp, Users, Settings, ChevronRight, BarChart3, Eye, Brain } from 'lucide-react';
import SOCAnalyzerDashboard from './inwi';
import CISODashboard from './CISODashboard';
import COMEXDashboard from './COMEXDashboard';

const DashboardLevelSelector = () => {
  const [selectedLevel, setSelectedLevel] = useState(null);

  const dashboardLevels = [
    {
      id: 1,
      title: 'Niveau 1 - Opérationnel',
      subtitle: 'SOC Analyst Dashboard',
      description: 'Dashboard pour les analystes SOC avec métriques opérationnelles en temps réel',
      icon: Shield,
      color: 'from-blue-500 to-blue-700',
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
    return <SOCAnalyzerDashboard returnToSelector={returnToSelector} />;
  }

  if (selectedLevel === 2) {
    return <CISODashboard returnToSelector={returnToSelector} />;
  }

  if (selectedLevel === 3) {
    return <COMEXDashboard returnToSelector={returnToSelector} />;
  }
  if (selectedLevel === null) {

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #1e3a8a 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, #3b82f6 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            animation: 'float 20s ease-in-out infinite'
          }}
        />

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
                    className={`relative bg-white rounded-2xl p-8 border border-gray-200 shadow-xl hover:shadow-2xl transition-all  transform hover:scale-105 group cursor-pointer ${level.comingSoon ? 'opacity-75' : ''
                      }`}
                    onClick={() => !level.comingSoon && setSelectedLevel(level.id)}
                  >
                    {/* Coming Soon Badge */}
                    {level.comingSoon && (
                      <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg transform rotate-12">
                        Bientôt
                      </div>
                    )}

                    {/* Background gradient effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${level.color} opacity-0 group-hover:opacity-5 transition-opacity  rounded-2xl`}></div>

                    <div className="relative z-10">
                      {/* Icon */}
                      <div className={`p-4 bg-gradient-to-br ${level.color} rounded-2xl shadow-lg mb-6 inline-block group-hover:scale-110 transition-transform `}>
                        <IconComponent size={40} className="text-white" />
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

                      {/* Features */}
                      <div className="mb-8">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                          Fonctionnalités incluses
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {level.features.map((feature, index) => (
                            <div key={index} className="flex items-center text-sm text-gray-600">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0"></div>
                              <span className="truncate">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        className={`w-full py-4 px-6 bg-gradient-to-r ${level.color} text-white font-semibold rounded-xl hover:shadow-lg transition-all  transform group-hover:scale-105 flex items-center justify-center ${level.comingSoon ? 'cursor-not-allowed opacity-50' : 'hover:shadow-xl'
                          }`}
                        disabled={level.comingSoon}
                      >
                        {level.comingSoon ? (
                          <>
                            <Settings size={20} className="mr-2" />
                            En développement
                          </>
                        ) : (
                          <>
                            Accéder au Dashboard
                            <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
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

        {/* Inline styles */}
        <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }

        .group:hover .group-hover\\:scale-110 {
          transform: scale(1.1);
        }

        .group:hover .group-hover\\:translate-x-1 {
          transform: translateX(0.25rem);
        }

        .group:hover .group-hover\\:text-blue-900 {
          color: #1e3a8a;
        }

        .group:hover .group-hover\\:text-blue-700 {
          color: #1d4ed8;
        }

        .group:hover .group-hover\\:scale-105 {
          transform: scale(1.05);
        }

        .group:hover .group-hover\\:opacity-5 {
          opacity: 0.05;
        }
      `}</style>
      </div>
    );
  }
};

export default DashboardLevelSelector;