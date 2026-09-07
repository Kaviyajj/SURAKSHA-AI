import React from 'react';
import {
  X,
  AlertTriangle,
  Users,
  Shield,
  Navigation,
  Droplets,
  Mountain,
  Flame,
  Activity,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { Habitation } from '../../types';

interface HabitationRiskDrawerProps {
  habitation: Habitation | null;
  onClose: () => void;
  onRecommendShelters: (habId: number) => void;
  onPlanRoute: (habId: number) => void;
}

export const HabitationRiskDrawer: React.FC<HabitationRiskDrawerProps> = ({
  habitation,
  onClose,
  onRecommendShelters,
  onPlanRoute
}) => {
  if (!habitation) return null;

  const isCritical = habitation.risk_level === 'Critical';
  const isVeryHigh = habitation.risk_level === 'Very High';

  const getHazardIcon = (type: string) => {
    switch (type) {
      case 'Flood': return <Droplets className="h-4 w-4 text-cyan-400" />;
      case 'Landslide': return <Mountain className="h-4 w-4 text-amber-400" />;
      case 'Wildfire': return <Flame className="h-4 w-4 text-rose-400" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
    }
  };

  const getImpactBadge = (level: string) => {
    switch (level) {
      case 'Critical': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'High': return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'Medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div className="w-full lg:w-96 bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 h-full flex flex-col justify-between overflow-y-auto z-20 shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getHazardIcon(habitation.hazard_type)}
            <span className="text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase">
              {habitation.hazard_type} Vulnerability Profile
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2">
          <h2 className="text-lg font-black text-white">{habitation.name}</h2>
          <p className="text-xs text-slate-400">{habitation.district} • Lat {habitation.latitude.toFixed(3)}, Lon {habitation.longitude.toFixed(3)}</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-4">
        {/* Risk Score Hero Card */}
        <div className={`p-4 rounded-xl border relative overflow-hidden ${
          isCritical
            ? 'bg-gradient-to-br from-red-950/60 to-slate-900 border-red-500/50 glow-red'
            : isVeryHigh
            ? 'bg-gradient-to-br from-orange-950/60 to-slate-900 border-orange-500/50'
            : 'bg-slate-850/80 border-slate-700'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Composite Risk Score</span>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-3xl font-black font-mono" style={{ color: habitation.risk_color }}>
                  {habitation.risk_score}
                </span>
                <span className="text-xs text-slate-400 font-mono">/ 100</span>
              </div>
            </div>

            <div className="text-right">
              <span
                className="px-2.5 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider inline-block shadow-md"
                style={{
                  backgroundColor: `${habitation.risk_color}25`,
                  color: habitation.risk_color,
                  border: `1px solid ${habitation.risk_color}80`
                }}
              >
                {habitation.risk_level}
              </span>
              <p className="text-[10px] text-slate-400 mt-1">
                {isCritical ? '⚠️ Immediate Action Required' : 'Standard Monitoring'}
              </p>
            </div>
          </div>

          {/* Progress gauge bar */}
          <div className="w-full bg-slate-950/80 h-2 rounded-full overflow-hidden mt-3 p-0.5 border border-slate-800">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${habitation.risk_score}%`,
                backgroundColor: habitation.risk_color
              }}
            />
          </div>
        </div>

        {/* Demographic & Vulnerable Population Cards */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="flex items-center space-x-1 text-[11px] text-slate-400">
              <Users className="h-3.5 w-3.5 text-cyan-400" />
              <span>Total Population</span>
            </div>
            <div className="text-lg font-black font-mono text-white">
              {habitation.population.toLocaleString()}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-red-950/20 border border-red-500/30 space-y-1">
            <div className="flex items-center space-x-1 text-[11px] text-red-400">
              <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
              <span>Vulnerable Group</span>
            </div>
            <div className="text-lg font-black font-mono text-red-400">
              {habitation.vulnerable_population.toLocaleString()}
              <span className="text-[10px] text-slate-400 ml-1 font-normal">
                ({Math.round((habitation.vulnerable_population / habitation.population) * 100)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Demographic Breakdown Pills */}
        <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-slate-950/40 border border-slate-800/80 text-slate-300 font-mono">
          <span>Elderly: <strong className="text-amber-300">{habitation.elderly_count}</strong></span>
          <span>Children: <strong className="text-cyan-300">{habitation.children_count}</strong></span>
          <span>Assisted: <strong className="text-rose-300">{habitation.disabled_count}</strong></span>
        </div>

        {/* Natural Language Diagnostic Reason */}
        <div className="p-3 rounded-lg bg-slate-950/80 border border-cyan-500/30 space-y-1.5">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-cyan-300">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Why is this area vulnerable?</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {habitation.explanation}
          </p>
        </div>

        {/* Factor Breakdown Bars */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Factor Contributions</span>
            <span className="text-[10px] text-slate-400 font-mono">Weighted Attribution</span>
          </div>

          <div className="space-y-2">
            {habitation.factor_contributions.map((f, idx) => (
              <div key={idx} className="p-2 rounded bg-slate-950/50 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 font-medium">{f.name}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase font-mono ${getImpactBadge(f.impact_level)}`}>
                    {f.impact_level}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Metric: {f.raw_value} {f.unit}</span>
                  <span>Score: {f.normalized_score}/100</span>
                </div>

                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      f.normalized_score > 75 ? 'bg-red-500' : f.normalized_score > 50 ? 'bg-orange-500' : f.normalized_score > 25 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${f.normalized_score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-2 sticky bottom-0">
        <button
          onClick={() => onRecommendShelters(habitation.id)}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/20 transition"
        >
          <Shield className="h-4 w-4" />
          <span>Recommend Safe Shelters</span>
          <ArrowRight className="h-3.5 w-3.5 ml-auto" />
        </button>

        <button
          onClick={() => onPlanRoute(habitation.id)}
          className="w-full bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center space-x-2 transition"
        >
          <Navigation className="h-4 w-4 text-cyan-400" />
          <span>Plan Evacuation Corridor</span>
          <ArrowRight className="h-3.5 w-3.5 ml-auto" />
        </button>
      </div>
    </div>
  );
};
