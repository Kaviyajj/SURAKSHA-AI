import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Shield,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Zap,
  Hospital,
  Activity,
  Droplets
} from 'lucide-react';
import { Habitation, Shelter, ShelterAllocationResponse } from '../types';
import { api } from '../services/api';
import { PageId } from '../components/layout/Sidebar';

interface ShelterRelocationProps {
  shelters: Shelter[];
  habitations: Habitation[];
  selectedHabitationId: number | null;
  onSelectHabitation: (id: number) => void;
  onNavigate: (page: PageId) => void;
  onPlanRouteForShelter: (habId: number, shelterId: number) => void;
}

export const ShelterRelocation: React.FC<ShelterRelocationProps> = ({
  shelters,
  habitations,
  selectedHabitationId,
  onSelectHabitation,
  onNavigate,
  onPlanRouteForShelter
}) => {
  const [targetHabId, setTargetHabId] = useState<number>(selectedHabitationId || 1);
  const [targetPop, setTargetPop] = useState<number>(3850);
  const [allocation, setAllocation] = useState<ShelterAllocationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Sync with selected habitation
  useEffect(() => {
    if (selectedHabitationId) {
      setTargetHabId(selectedHabitationId);
      const hab = habitations.find(h => h.id === selectedHabitationId);
      if (hab) {
        setTargetPop(hab.population);
      }
    }
  }, [selectedHabitationId, habitations]);

  // Load shelter recommendation
  const handleCalculateAllocation = async (habId: number, pop: number) => {
    setLoading(true);
    try {
      const res = await api.getShelterRecommendation(habId, pop);
      setAllocation(res);
    } catch (err) {
      console.error("Failed to load shelter allocation:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetHabId) {
      handleCalculateAllocation(targetHabId, targetPop);
    }
  }, [targetHabId]);

  const currentHab = habitations.find(h => h.id === targetHabId) || habitations[0];
  const totalCapacity = shelters.reduce((acc, s) => acc + s.total_capacity, 0);
  const totalOccupied = shelters.reduce((acc, s) => acc + s.current_occupancy, 0);
  const totalAvailable = Math.max(0, totalCapacity - totalOccupied);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-bold uppercase">
            <Building2 className="h-4 w-4" />
            <span>Relief Logistics & Carrying Capacity</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Shelter & Relocation Intelligence</h1>
          <p className="text-xs text-slate-400">
            Multi-criteria suitability scoring and automated multi-shelter knapsack overflow distribution
          </p>
        </div>

        {/* Global Capacity Ticker */}
        <div className="flex items-center space-x-3 bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-xs font-mono">
          <div>
            <span className="text-slate-400 block text-[10px]">TOTAL CAPACITY</span>
            <span className="text-white font-bold">{totalCapacity.toLocaleString()}</span>
          </div>
          <div className="border-l border-slate-800 pl-3">
            <span className="text-slate-400 block text-[10px]">CURRENT OCCUPIED</span>
            <span className="text-amber-400 font-bold">{totalOccupied.toLocaleString()}</span>
          </div>
          <div className="border-l border-slate-800 pl-3">
            <span className="text-slate-400 block text-[10px]">AVAILABLE QUOTA</span>
            <span className="text-emerald-400 font-bold">{totalAvailable.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Relocation Recommendation & Overflow Simulator Workspace */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-[#090d16] space-y-5 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Automated Multi-Shelter Relocation Engine
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any habitation to compute optimal shelter capacity allocation and overflow partitioning.
            </p>
          </div>

          {/* Habitation Selector & Pop Input */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">TARGET HABITATION</label>
              <select
                value={targetHabId}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setTargetHabId(id);
                  const h = habitations.find(item => item.id === id);
                  if (h) setTargetPop(h.population);
                }}
                className="bg-slate-950 border border-slate-700 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 font-mono"
              >
                {habitations.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.risk_score} - {h.risk_level})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">TARGET EVACUEES</label>
              <input
                type="number"
                value={targetPop}
                onChange={(e) => setTargetPop(Number(e.target.value))}
                className="bg-slate-950 border border-slate-700 text-xs text-white rounded-lg px-3 py-1.5 w-28 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <button
              onClick={() => handleCalculateAllocation(targetHabId, targetPop)}
              disabled={loading}
              className="mt-4 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center space-x-1.5 transition shadow-md shadow-cyan-500/20"
            >
              <Activity className="h-3.5 w-3.5" />
              <span>{loading ? 'Optimizing...' : 'Re-compute Plan'}</span>
            </button>
          </div>
        </div>

        {/* Decision Summary Banner */}
        {allocation && (
          <div className={`p-4 rounded-xl border ${
            allocation.is_overflow
              ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
              : 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
          }`}>
            <div className="flex items-start space-x-3">
              {allocation.is_overflow ? (
                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider font-mono">
                  {allocation.is_overflow ? 'MULTI-SHELTER OVERFLOW PROTOCOL ACTIVATED' : 'SINGLE-SHELTER CAPACITY SUFFICIENT'}
                </h4>
                <p className="text-xs leading-relaxed text-slate-200">
                  {allocation.decision_summary}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Ranked Recommendations & Partition Breakdown */}
        {allocation && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Shelter Suitability Ranking & Population Partitioning
              </h3>
              <span className="text-[11px] font-mono text-cyan-400">
                Total Allocated: {allocation.total_allocated.toLocaleString()} / {allocation.affected_population.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {allocation.distribution_plan.map((item) => (
                <div
                  key={item.shelter_id}
                  className={`p-4 rounded-xl border backdrop-blur-md transition-all space-y-2.5 ${
                    item.allocated_population > 0
                      ? 'bg-slate-900/90 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-950/60 border-slate-800 opacity-70'
                  }`}
                >
                  {/* Rank & Suitability */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-cyan-300">
                      RANK #{item.rank}
                    </span>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-black font-mono text-cyan-400">
                        {item.suitability_score}%
                      </span>
                      <span className="text-[10px] text-slate-400">suitability</span>
                    </div>
                  </div>

                  {/* Name & Type */}
                  <div>
                    <h4 className="text-xs font-bold text-white truncate">{item.shelter_name}</h4>
                    <p className="text-[10px] text-slate-400">{item.shelter_type} • {item.distance_km} km ({item.estimated_travel_time_min} min)</p>
                  </div>

                  {/* Quota Gauge */}
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-[11px] font-mono space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Available Seats:</span>
                      <span className="font-bold text-emerald-400">{item.available_capacity.toLocaleString()}</span>
                    </div>
                    {item.allocated_population > 0 && (
                      <div className="flex justify-between text-cyan-300 font-bold border-t border-slate-800 pt-1">
                        <span>Assigned Intake:</span>
                        <span className="text-white bg-cyan-600/30 px-1.5 py-0.5 rounded border border-cyan-500/40">
                          {item.allocated_population.toLocaleString()} Evacuees
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Reason */}
                  <p className="text-[11px] text-slate-400 line-clamp-2 italic">
                    {item.reason}
                  </p>

                  {/* Action */}
                  <button
                    onClick={() => {
                      onPlanRouteForShelter(currentHab.id, item.shelter_id);
                      onNavigate('evacuation-routing');
                    }}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold py-1.5 px-2 rounded-lg flex items-center justify-center space-x-1.5 transition"
                  >
                    <Navigation className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Plan Safe Route Here</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 10 Designated Shelters Inventory Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            All Monitored Relief Centers ({shelters.length} Facilities)
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            Regional Carrying Capacity Registry
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {shelters.map((s) => {
            const avail = Math.max(0, s.total_capacity - s.current_occupancy);
            const occPct = Math.round((s.current_occupancy / s.total_capacity) * 100);
            return (
              <div
                key={s.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-md space-y-2.5 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-cyan-300">
                    {s.shelter_type}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    s.hazard_risk <= 12 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {s.hazard_risk_level}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white">{s.name}</h4>
                  <p className="text-[10px] text-slate-400">
                    Lat {s.latitude.toFixed(3)}, Lon {s.longitude.toFixed(3)}
                  </p>
                </div>

                {/* Capacity Progress Bar */}
                <div className="space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-300">
                    <span>Occupancy: {s.current_occupancy} / {s.total_capacity}</span>
                    <span className="text-white font-bold">{occPct}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full ${
                        occPct > 80 ? 'bg-red-500' : occPct > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${occPct}%` }}
                    />
                  </div>
                </div>

                {/* Facilities & Amenities */}
                <div className="grid grid-cols-2 gap-1 pt-1 border-t border-slate-800/80 text-[10px] text-slate-400">
                  <div className="flex items-center space-x-1">
                    <Hospital className="h-3 w-3 text-cyan-400" />
                    <span>Hospital: {s.medical_distance} km</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Navigation className="h-3 w-3 text-amber-400" />
                    <span>Road: {s.road_accessibility}%</span>
                  </div>
                  <div className="flex items-center space-x-1 text-emerald-400">
                    {s.has_generator && <span>⚡ Backup Power</span>}
                  </div>
                  <div className="flex items-center space-x-1 text-cyan-400">
                    {s.has_medical_staff && <span>🩺 Medical Staff</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
