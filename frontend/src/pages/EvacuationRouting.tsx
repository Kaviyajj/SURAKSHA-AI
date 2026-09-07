import React, { useState, useEffect } from 'react';
import {
  Navigation,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Sparkles,
  ArrowRight,
  Compass,
  CornerDownRight,
  ShieldAlert
} from 'lucide-react';
import { Habitation, Shelter, RoadFeature, EvacuationPlanResponse } from '../types';
import { api } from '../services/api';
import { GISMap } from '../components/map/GISMap';
import { PageId } from '../components/layout/Sidebar';

interface EvacuationRoutingProps {
  habitations: Habitation[];
  shelters: Shelter[];
  roads: RoadFeature[];
  selectedHabitationId: number | null;
  selectedShelterId?: number | null;
  activeRoute: EvacuationPlanResponse | null;
  onSetRoute: (route: EvacuationPlanResponse | null) => void;
  onNavigate: (page: PageId) => void;
}

export const EvacuationRouting: React.FC<EvacuationRoutingProps> = ({
  habitations,
  shelters,
  roads,
  selectedHabitationId,
  selectedShelterId,
  activeRoute,
  onSetRoute,
  onNavigate
}) => {
  const [originId, setOriginId] = useState<number>(selectedHabitationId || 1);
  const [destId, setDestId] = useState<number>(selectedShelterId || 1);
  const [avoidBlocked, setAvoidBlocked] = useState<boolean>(true);
  const [avoidHazard, setAvoidHazard] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const handlePlanRoute = async () => {
    setLoading(true);
    try {
      const plan = await api.planEvacuationRoute({
        habitation_id: originId,
        shelter_id: destId,
        avoid_blocked_roads: avoidBlocked,
        consider_hazard_proximity: avoidHazard
      });
      onSetRoute(plan);
    } catch (err) {
      console.error("Failed to plan evacuation route:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handlePlanRoute();
  }, [originId, destId, avoidBlocked, avoidHazard]);

  const originHab = habitations.find(h => h.id === originId) || habitations[0];
  const destShelter = shelters.find(s => s.id === destId) || shelters[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-bold uppercase">
            <Navigation className="h-4 w-4" />
            <span>Hazard-Aware Navigation & Corridor Routing</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Evacuation Route Optimization</h1>
          <p className="text-xs text-slate-400">
            Graph Dijkstra algorithm with active road blockage bypass and hazard proximity penalization
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('command-center')}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center space-x-1.5 transition border border-slate-700"
          >
            <Shield className="h-4 w-4 text-cyan-400" />
            <span>Command Center Map</span>
          </button>
        </div>
      </div>

      {/* Control Configuration Bar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 backdrop-blur-md grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        {/* Origin */}
        <div>
          <label className="text-[10px] font-mono text-slate-400 block mb-1">ORIGIN HABITATION</label>
          <select
            value={originId}
            onChange={(e) => setOriginId(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 font-mono"
          >
            {habitations.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.risk_level})
              </option>
            ))}
          </select>
        </div>

        {/* Destination */}
        <div>
          <label className="text-[10px] font-mono text-slate-400 block mb-1">DESTINATION RELIEF SHELTER</label>
          <select
            value={destId}
            onChange={(e) => setDestId(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 font-mono"
          >
            {shelters.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.available_capacity} seats)
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic Road Constraint Toggles */}
        <div className="flex flex-col space-y-2">
          <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={avoidBlocked}
              onChange={(e) => setAvoidBlocked(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>Avoid Inundated / Blocked Roads</span>
          </label>

          <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={avoidHazard}
              onChange={(e) => setAvoidHazard(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>Penalize Hazard Zones</span>
          </label>
        </div>

        {/* Submit */}
        <div>
          <button
            onClick={handlePlanRoute}
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition shadow-lg shadow-cyan-500/20"
          >
            <Compass className="h-4 w-4 text-slate-950" />
            <span>{loading ? 'Routing...' : 'Re-calculate Corridor'}</span>
          </button>
        </div>
      </div>

      {/* Main Routing Layout: Left Map + Right Turn-by-Turn Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Map View */}
        <div className="lg:col-span-2 h-[520px] rounded-xl overflow-hidden border border-slate-800 shadow-xl relative">
          <GISMap
            habitations={habitations}
            shelters={shelters}
            roads={roads}
            selectedHabitationId={originId}
            onSelectHabitation={setOriginId}
            activeRoute={activeRoute}
          />
        </div>

        {/* Right Turn-by-Turn Route Diagnostics */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 backdrop-blur-md p-4 flex flex-col justify-between space-y-4 overflow-y-auto max-h-[520px]">
          {activeRoute ? (
            <>
              {/* Corridor Metrics */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                    Route Intelligence
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                    {activeRoute.safety_tier}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">DISTANCE</span>
                    <span className="text-base font-black text-white">{activeRoute.total_distance_km} km</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">EST. TIME</span>
                    <span className="text-base font-black text-cyan-400">{activeRoute.estimated_travel_time_min} min</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">SAFETY</span>
                    <span className="text-base font-black text-emerald-400">{activeRoute.route_safety_score}%</span>
                  </div>
                </div>

                {/* Blocked Roads Avoided Badge */}
                <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>
                    Successfully bypassed <strong>{activeRoute.blocked_roads_avoided} blocked/inundated road sections</strong> in the river valley.
                  </span>
                </div>

                {/* Explanation */}
                <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  "{activeRoute.explanation}"
                </p>

                {/* Turn-by-Turn Steps */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">
                    Turn-by-Turn Convoys Navigation
                  </span>

                  <div className="space-y-2">
                    {activeRoute.turn_by_turn.map((step, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1 text-xs">
                        <div className="flex items-start space-x-2">
                          <span className="font-mono font-bold text-cyan-400 text-[11px] mt-0.5">
                            {idx + 1}.
                          </span>
                          <div className="flex-1">
                            <p className="text-slate-200 font-medium">{step.instruction}</p>
                            <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-mono mt-1">
                              <span>Segment: {step.distance_km} km</span>
                              <span>Est: {step.duration_min} min</span>
                            </div>
                            {step.hazard_warning && (
                              <p className="text-[10px] text-amber-400 font-medium mt-1">
                                ⚠️ {step.hazard_warning}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              Select origin and destination to calculate evacuation corridor.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
