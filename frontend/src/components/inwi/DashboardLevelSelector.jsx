import { useState } from "react";
import { Shield, Eye, TrendingUp, ArrowRight } from "lucide-react";
import { Card } from "../ui/card";
import {INWI} from "../ui/inwi";
import SOCAnalyzerDashboard from "./SOCDashboard";
import CISODashboard from "./CISODashboard";
import COMEXDashboard from "./COMEXDashboard";
import '../../styles/inwi.css'

const levels = [
  {
    id: 1,
    title: "Level 1 - Operational",
    subtitle: "SOC Analyst",
    description: "Real-time operational view",
    icon: Shield,
    gradient: "bg-gradient-level1",
    color: "text-level1-primary",
  },
  {
    id: 2,
    title: "Level 2 - Managerial",
    subtitle: "CISO",
    description: "Strategic security management",
    icon: Eye,
    gradient: "bg-gradient-level2",
    color: "text-level2-primary",
  },
  {
    id: 3,
    title: "Level 3 - Strategic",
    subtitle: "COMEX",
    description: "Executive view for general management",
    icon: TrendingUp,
    gradient: "bg-gradient-level3",
    color: "text-level3-primary",
  },
];

const DashboardLevelSelector = () => {
  const [selectedLevel, setSelectedLevel] = useState(null);

  const handleReturn = () => setSelectedLevel(null);

  // Render the appropriate dashboard based on selected level
  if (selectedLevel === 1) {
    return <SOCAnalyzerDashboard returnToSelector={handleReturn} />;
  }

  if (selectedLevel === 2) {
    return <CISODashboard returnToSelector={handleReturn}/>;
  }

  if (selectedLevel === 3) {
    return <COMEXDashboard returnToSelector={handleReturn}/>;
  }

  return (
    <div className="min-h-full bg-inwi-background p-8 relative overflow-hidden">
      {/* Pattern Background */}
      <div className="absolute inset-0 bg-pattern opacity-20 z-0"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center justify-center my-6">
            <INWI height={36} />
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text">
            Security Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Select your access level to view metrics appropriate for your role
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {levels.map((level, index) => {
            const Icon = level.icon;
            return (
              <Card
                key={level.id}
                className="group cursor-pointer overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] animate-fade-in-up backdrop-blur-sm border border-border"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => setSelectedLevel(level.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedLevel(level.id);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Sélectionner ${level.title}`}
              >
                <div className={`h-1 ${level.gradient} transition-all duration-300 group-hover:h-2 group-hover:opacity-100 opacity-90`} />

                <div className="p-7">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-foreground mb-2">
                        {level.title}
                      </h2>
                      <p className={`text-sm font-semibold ${level.color} flex items-center gap-1`}>
                        <span className="w-2 h-2 rounded-full bg-current opacity-70"></span>
                        {level.subtitle}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl bg-opacity-15 ${level.color} transition-all duration-300 group-hover:scale-110 group-hover:bg-opacity-20`}>
                      <Icon className={`h-7 w-7 ${level.color}`} />
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {level.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-border/30">
                    <span className={`font-medium flex items-center gap-2 ${level.color}`}>
                      Access the dashboard
                    </span>
                    <div className={`transition-all duration-300 group-hover:translate-x-2 ${level.color} flex items-center justify-center w-8 h-8 rounded-full bg-primary/10`}>
                      <ArrowRight size={24} />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>Your safety is our priority. All activities are monitored and recorded.</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardLevelSelector;