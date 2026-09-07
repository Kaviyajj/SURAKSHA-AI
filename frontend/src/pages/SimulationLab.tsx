import React, { useState } from 'react';
import {
  Sliders,
  Droplets,
  Waves,
  AlertTriangle,
  Flame,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertOctagon,
  Shield,
  FileText
} from 'lucide-react';
import { Habitation, Shelter, RoadFeature, SimulationResponse } from '../types';
import { api } from '../services/api';
import { PageId } from '../components/layout/Sidebar';

interface SimulationLabProps {
  habitations: Habitation[];
  shelters: Shelter[];
  roads: RoadFeature[];
  onNavigate: (page: PageId) => void;
  onSelectHabitation: (id: number) => void;
}

export const SimulationLab: React.FC<SimulationLabProps> = ({
  habitations,
  shelters,
  roads,
  onNavigate,
  onSelectHabitation
}) => {
  const [rainfallPct, setRainfallPct] = useState<number>(30);
  const [riverDeltaM, setRiverDeltaM] = useState<number>(2);
  const [blockageLevel, setBlockageLevel] = useState<string>('Moderate');
  const [scenarioName, setScenarioName] = useState<string>('Monsoon Basin Surge (+30% Rain, +2m River)');
  const [simulationResult, setSimulationResult] = useState<SimulationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const presets = [
    {
      name: 'Heavy Monsoon Surge',
      rain: 30,
      river: 2,
      blockage: 'Moderate',
      desc: 'Simulates intensive monsoon precipitation with overflowing river banks.'
    },
    {
      name: 'Catastrophic Cloudburst Wave',
      rain: 50,
      river: 3,
      blockage: 'Severe',
      desc: 'Simulates extreme dam release compounded with widespread ghat landslides.'
    },
    {
      name: 'Hillside Landslide Trigger',
      rain: 20,
      river: 1,
      blockage: 'Minor',
      desc: 'Simulates saturated hillside slopes causing isolated arterial slips.'
    }
  ];

  const handleRunSimulation = async (
    rain = rainfallPct,
    river = riverDeltaM,
    block = blockageLevel,
    name = scenarioName
  ) => {
    setLoading(true);
    try {
      const res = await api.runSimulation({
        scenario_name: name,
        rainfall_delta_pct: rain,
        river_level_delta_m: river,
        road_blockage_level: block
      });
      setSimulationResult(res);
    } catch (err) {
      console.error("Failed to run simulation:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-purple-400 font-bold uppercase">
            <Sliders className="h-4 w-4" />
            <span>Parametric Stress Testing & Scenario Engine</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">What-If Disaster Simulation Lab</h1>
          <p className="text-xs text-slate-400">
            Real-time parametric recalculation across all 50 habitations, red-zone expansions, and evacuation capacities
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('reports')}
            className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center space-x-1.5 transition shadow-lg shadow-purple-500/20"
          >
            <FileText className="h-4 w-4" />
            <span>Generate Action Directive</span>
          </button>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {presets.map((p, idx) => (
          <div
            key={idx}
            onClick={() => {
              setRainfallPct(p.rain);
              setRiverDeltaM(p.river);
              setBlockageLevel(p.blockage);
              setScenarioName(p.name);
              handleRunSimulation(p.rain, p.river, p.blockage, p.name);
            }}
            className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/70 hover:border-purple-500/50 hover:bg-slate-900 transition cursor-pointer space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">{p.name}</span>
              <span className="text-[10px] font-mono font-bold text-purple-400">PRESET #{idx + 1}</span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-1">{p.desc}</p>
            <div className="flex items-center space-x-3 text-[10px] text-cyan-300 font-mono pt-1">
              <span>Rain: +{p.rain}%</span>
              <span>River: +{p.river}m</span>
              <span>Block: {p.blockage}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Controls Card */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-[#090d16] space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Sliders className="h-4 w-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Simulation Parameters Matrix
            </h2>
          </div>
          <span className="text-xs font-mono text-purple-300 font-semibold">{scenarioName}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Rainfall Control */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-cyan-300">
                <Droplets className="h-4 w-4 text-cyan-400" />
                <span>Precipitation Deluge</span>
              </div>
              <span className="text-sm font-black font-mono text-white bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/40">
                +{rainfallPct}%
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1 pt-1">
              {[0, 10, 20, 30, 50].map((val) => (
                <button
                  key={val}
                  onClick={() => setRainfallPct(val)}
                  className={`text-xs py-1.5 rounded font-mono font-bold transition ${
                    rainfallPct === val
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  +{val}%
                </button>
              ))}
            </div>
          </div>

          {/* 2. River Level Control */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-blue-300">
                <Waves className="h-4 w-4 text-blue-400" />
                <span>River Level Inundation</span>
              </div>
              <span className="text-sm font-black font-mono text-white bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/40">
                +{riverDeltaM}m
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1 pt-1">
              {[0, 1, 2, 3].map((val) => (
                <button
                  key={val}
                  onClick={() => setRiverDeltaM(val)}
                  className={`text-xs py-1.5 rounded font-mono font-bold transition ${
                    riverDeltaM === val
                      ? 'bg-blue-500 text-slate-950 shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  +{val}m
                </button>
              ))}
            </div>
          </div>

          {/* 3. Road Blockage Severity */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-300">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span>Road Network Blockage</span>
              </div>
              <span className="text-sm font-black font-mono text-white bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
                {blockageLevel}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1 pt-1">
              {['None', 'Minor', 'Moderate', 'Severe'].map((val) => (
                <button
                  key={val}
                  onClick={() => setBlockageLevel(val)}
                  className={`text-[11px] py-1.5 rounded font-mono font-bold transition ${
                    blockageLevel === val
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Run Simulation Master Action */}
        <div className="pt-2">
          <button
            onClick={() => handleRunSimulation()}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-black py-3.5 px-6 rounded-xl text-sm flex items-center justify-center space-x-2 shadow-xl shadow-purple-500/25 transition-all transform hover:-translate-y-0.5"
          >
            <Sliders className="h-4 w-4 text-white" />
            <span>{loading ? 'CALCULATING PARAMETRIC ESCALATION...' : 'RUN WHAT-IF DISASTER SIMULATION'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Before vs After Comparative Analytics Results */}
      {simulationResult && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl border border-purple-500/40 bg-purple-950/20 text-purple-200 flex items-start space-x-3">
            <AlertOctagon className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono">
                SIMULATION RESULTS: {simulationResult.scenario_name}
              </h3>
              <p className="text-xs leading-relaxed text-slate-200 mt-1">
                {simulationResult.actionable_summary}
              </p>
            </div>
          </div>

          {/* Before vs After Metric Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Critical Zones Delta */}
            <div className="p-4 rounded-xl border border-red-500/40 bg-slate-900/90 backdrop-blur-md space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">CRITICAL ZONES</span>
              <div className="flex items-center justify-between font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">BEFORE</span>
                  <span className="text-xl font-bold text-slate-300">{simulationResult.before_critical_count}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500" />
                <div>
                  <span className="text-[10px] text-red-400 block">AFTER</span>
                  <span className="text-2xl font-black text-red-400">{simulationResult.after_critical_count}</span>
                </div>
                <div className="bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-1 rounded text-xs font-bold">
                  +{simulationResult.critical_delta} Zones
                </div>
              </div>
            </div>

            {/* 2. Population at Acute Risk Delta */}
            <div className="p-4 rounded-xl border border-orange-500/40 bg-slate-900/90 backdrop-blur-md space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">POPULATION AT RISK</span>
              <div className="flex items-center justify-between font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">BEFORE</span>
                  <span className="text-xl font-bold text-slate-300">{simulationResult.before_pop_at_risk.toLocaleString()}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500" />
                <div>
                  <span className="text-[10px] text-orange-400 block">AFTER</span>
                  <span className="text-2xl font-black text-orange-400">{simulationResult.after_pop_at_risk.toLocaleString()}</span>
                </div>
                <div className="bg-orange-500/20 text-orange-300 border border-orange-500/40 px-2 py-1 rounded text-xs font-bold">
                  +{simulationResult.pop_at_risk_delta.toLocaleString()}
                </div>
              </div>
            </div>

            {/* 3. Available Shelter Capacity */}
            <div className="p-4 rounded-xl border border-emerald-500/40 bg-slate-900/90 backdrop-blur-md space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">AVAILABLE SHELTER SEATS</span>
              <div className="flex items-center justify-between font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">BEFORE</span>
                  <span className="text-xl font-bold text-slate-300">{simulationResult.before_shelter_capacity_available.toLocaleString()}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500" />
                <div>
                  <span className="text-[10px] text-emerald-400 block">AFTER</span>
                  <span className="text-2xl font-black text-emerald-400">{simulationResult.after_shelter_capacity_available.toLocaleString()}</span>
                </div>
                <div className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-1 rounded text-xs font-bold">
                  {simulationResult.after_shelter_capacity_available > 0 ? 'Surplus' : 'Deficit'}
                </div>
              </div>
            </div>
          </div>

          {/* Escalated Habitations Transitions Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl space-y-2">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Escalated Habitations Risk Log ({simulationResult.escalations.length} Habitations Escaped Baselines)
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Parametric Trigger Attribution</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 font-mono">
                <thead className="bg-slate-950/60 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Habitation</th>
                    <th className="py-2.5 px-3">Escalation Transition</th>
                    <th className="py-2.5 px-3">Score Shift</th>
                    <th className="py-2.5 px-3">Population</th>
                    <th className="py-2.5 px-3">Primary Trigger</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {simulationResult.escalations.map((esc) => (
                    <tr key={esc.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-4 font-sans font-bold text-white text-xs">{esc.name}</td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40">
                          {esc.escalation_type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-cyan-300">
                        {esc.previous_risk_score} → <strong className="text-white">{esc.simulated_risk_score}</strong>
                      </td>
                      <td className="py-2.5 px-3 text-slate-200">
                        {esc.population.toLocaleString()} ({esc.vulnerable_population} vuln)
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 font-sans text-[11px]">{esc.primary_trigger}</td>
                      <td className="py-2.5 px-4 text-right font-sans">
                        <button
                          onClick={() => {
                            onSelectHabitation(esc.id);
                            onNavigate('command-center');
                          }}
                          className="bg-cyan-600/30 hover:bg-cyan-600 text-cyan-200 hover:text-white border border-cyan-500/40 text-[10px] font-bold px-2 py-0.5 rounded transition"
                        >
                          View Map
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
