import React, { useState } from 'react';
import { KPICards } from '../components/dashboard/KPICards';
import { GISMap } from '../components/map/GISMap';
import { HabitationRiskDrawer } from '../components/habitation/HabitationRiskDrawer';
import { Habitation, Shelter, RoadFeature, DashboardKPIs, AlertItem, EvacuationPlanResponse } from '../types';
import { AlertOctagon, ArrowRight, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react';
import { PageId } from '../components/layout/Sidebar';

interface CommandCenterProps {
  kpis: DashboardKPIs;
  habitations: Habitation[];
  shelters: Shelter[];
  roads: RoadFeature[];
  alerts: AlertItem[];
  selectedHabitationId: number | null;
  onSelectHabitation: (id: number) => void;
  activeRoute: EvacuationPlanResponse | null;
  onNavigate: (page: PageId) => void;
  onRecommendShelters: (habId: number) => void;
  onPlanRoute: (habId: number) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  kpis,
  habitations,
  shelters,
  roads,
  alerts,
  selectedHabitationId,
  onSelectHabitation,
  activeRoute,
  onNavigate,
  onRecommendShelters,
  onPlanRoute
}) => {
  const selectedHabitation = habitations.find(h => h.id === selectedHabitationId) || null;

  return (
    <div className="space-y-4">
      {/* Top KPI Cards */}
      <KPICards
        kpis={kpis}
        onCardClick={(metric) => {
          if (metric === 'critical_zones') {
            const firstCrit = habitations.find(h => h.risk_level === 'Critical');
            if (firstCrit) onSelectHabitation(firstCrit.id);
          } else if (metric === 'shelter_capacity') {
            onNavigate('shelter-relocation');
          } else if (metric === 'active_evacuations') {
            onNavigate('evacuation-routing');
          }
        }}
      />

      {/* Main Command Center GIS + Triage Drawer Workspace */}
      <div className="flex flex-col lg:flex-row gap-4 h-[620px] rounded-xl overflow-hidden">
        {/* Left Map Viewport */}
        <div className="flex-1 h-full min-h-[400px] relative rounded-xl overflow-hidden border border-slate-800 shadow-xl">
          <GISMap
            habitations={habitations}
            shelters={shelters}
            roads={roads}
            selectedHabitationId={selectedHabitationId}
            onSelectHabitation={onSelectHabitation}
            activeRoute={activeRoute}
            onPlanRouteForHabitation={onPlanRoute}
            onRecommendShelterForHabitation={onRecommendShelters}
          />
        </div>

        {/* Right Habitation Detail Drawer */}
        {selectedHabitation ? (
          <div className="w-full lg:w-96 shrink-0 h-full rounded-xl overflow-hidden border border-slate-800 shadow-xl">
            <HabitationRiskDrawer
              habitation={selectedHabitation}
              onClose={() => onSelectHabitation(0)}
              onRecommendShelters={onRecommendShelters}
              onPlanRoute={onPlanRoute}
            />
          </div>
        ) : (
          <div className="hidden lg:flex w-80 shrink-0 h-full rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-6 flex-col justify-center items-center text-center space-y-4">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
              <ShieldAlert className="h-8 w-8 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Habitation Intelligence Drawer</h3>
              <p className="text-xs text-slate-400 mt-1">
                Select any marker on the GIS map to inspect composite risk scoring, factor attribution, and trigger automated evacuation decisions.
              </p>
            </div>
            <div className="w-full pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1">
              <div>Critical Habitations: <span className="text-red-400 font-bold">{kpis.critical_zones_count}</span></div>
              <div>Population at Risk: <span className="text-orange-400 font-bold">{kpis.population_at_risk.toLocaleString()}</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Emergency Alert Ticker */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-md p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-400 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
              Live Priority Relocation Directives
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {alerts.length} Active System Advisories
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {alerts.slice(0, 3).map((alt) => (
            <div
              key={alt.id}
              onClick={() => {
                if (alt.habitation_id) onSelectHabitation(alt.habitation_id);
              }}
              className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-red-500/50 hover:bg-slate-900/90 transition cursor-pointer flex flex-col justify-between space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                  alt.severity === 'Critical' ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {alt.severity}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{alt.timestamp}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-200">{alt.title}</h4>
              <p className="text-[11px] text-slate-400 line-clamp-1">{alt.message}</p>
              <div className="flex items-center justify-between text-[10px] text-cyan-400 pt-1 border-t border-slate-800/60">
                <span className="truncate mr-2 font-medium">{alt.recommended_action}</span>
                <ArrowRight className="h-3 w-3 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
