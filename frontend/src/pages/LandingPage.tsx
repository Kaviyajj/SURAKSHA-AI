import React from 'react';
import {
  Shield,
  Radio,
  ArrowRight,
  Activity,
  Building2,
  Navigation,
  Sliders,
  Bot,
  Droplets,
  Mountain,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { PageId } from '../components/layout/Sidebar';

interface LandingPageProps {
  onNavigate: (page: PageId) => void;
  onSelectHabitation?: (id: number) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const workflowSteps = [
    {
      step: '01',
      title: 'DETECT',
      subtitle: 'Multi-Sensor Ingestion',
      desc: 'Monitors real-time rainfall grids, river hydrographs, terrain slopes, and road blockages.',
      icon: Radio,
      color: 'from-cyan-500 to-blue-600',
      border: 'border-cyan-500/30'
    },
    {
      step: '02',
      title: 'ASSESS',
      subtitle: 'Explainable AI Risk Engine',
      desc: 'Calculates composite 0–100 vulnerability scores and generates natural language hazard reasoning.',
      icon: Activity,
      color: 'from-amber-500 to-orange-600',
      border: 'border-amber-500/30'
    },
    {
      step: '03',
      title: 'DECIDE',
      subtitle: 'Shelter Knapsack Allocation',
      desc: 'Ranks safe shelters and automatically partitions population overflow across relief camps.',
      icon: Building2,
      color: 'from-emerald-500 to-teal-600',
      border: 'border-emerald-500/30'
    },
    {
      step: '04',
      title: 'SIMULATE',
      subtitle: 'What-If Disaster Lab',
      desc: 'Simulates +50% rainfall and rising rivers, recalculating red zones and evacuation corridors.',
      icon: Sliders,
      color: 'from-purple-500 to-indigo-600',
      border: 'border-purple-500/30'
    },
    {
      step: '05',
      title: 'ACT',
      subtitle: 'SOP RAG & Action Directives',
      desc: 'Generates NDMA-compliant operational action plans and turn-by-turn safe convoy routes.',
      icon: Navigation,
      color: 'from-rose-500 to-red-600',
      border: 'border-rose-500/30'
    }
  ];

  const disasterTypes = [
    {
      type: 'Monsoon Flood & Inundation',
      tag: 'Flood',
      desc: 'Predicts river overflow, low-lying backwater surge, and bridge culvert submergence.',
      metric: '18 Lowland Settlements Monitored',
      icon: Droplets,
      color: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/40'
    },
    {
      type: 'Hillside Landslide & Debris Flow',
      tag: 'Landslide',
      desc: 'Evaluates steep slope shear stress (>25°), soil saturation, and ghat road slip risks.',
      metric: '16 Ghat Habitations Monitored',
      icon: Mountain,
      color: 'text-amber-400 bg-amber-950/40 border-amber-500/40'
    },
    {
      type: 'Wildfire & Forest Interface',
      tag: 'Wildfire',
      desc: 'Monitors dry scrub moisture index, buffer perimeter, and tribal hamlet escape tracks.',
      metric: '16 Forest Fringe Enclaves Monitored',
      icon: Flame,
      color: 'text-rose-400 bg-rose-950/40 border-rose-500/40'
    }
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative rounded-2xl overflow-hidden border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-[#090d16] p-8 sm:p-12 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.15),rgba(255,255,255,0))]"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-1.5 rounded-full text-xs font-mono text-cyan-300 shadow-sm">
            <Shield className="h-4 w-4 text-cyan-400" />
            <span>AI-POWERED DISASTER INTELLIGENCE & EMERGENCY RELOCATION SYSTEM</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white font-sans leading-tight">
            SURAKSHA<span className="text-cyan-400">-AI</span>
          </h1>

          <p className="text-xl sm:text-2xl font-bold text-slate-200 tracking-wide">
            "From Hazard Detection to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Human-Safe Decisions</span>."
          </p>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            A comprehensive decision-support command center engineered for Disaster Management Authorities. 
            Identify vulnerable habitations, understand explainable risks, allocate safe relief capacity, 
            optimize evacuation corridors around blocked roadways, and simulate catastrophic escalation in real time.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('command-center')}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black px-6 py-3.5 rounded-xl text-sm flex items-center space-x-2 shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <Zap className="h-4 w-4 text-slate-950" />
              <span>Launch Command Center</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => onNavigate('simulation-lab')}
              className="bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-700 font-bold px-6 py-3.5 rounded-xl text-sm flex items-center space-x-2 transition"
            >
              <Sliders className="h-4 w-4 text-amber-400" />
              <span>Explore What-If Simulation</span>
            </button>
          </div>
        </div>
      </section>

      {/* Workflow Cadence Section */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">Operational Doctrine</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">The 5-Stage Decision Pipeline</h2>
          <p className="text-xs sm:text-sm text-slate-400">Deterministic decision intelligence from telemetry to field dispatch</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {workflowSteps.map((wf) => {
            const Icon = wf.icon;
            return (
              <div
                key={wf.step}
                className={`p-4 rounded-xl border bg-slate-900/70 backdrop-blur-md space-y-3 relative overflow-hidden transition hover:border-cyan-500/50 hover:bg-slate-850 ${wf.border}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-400">{wf.step}</span>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${wf.color} text-white shadow-md`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-black text-white tracking-wide">{wf.title}</h3>
                  <p className="text-[11px] font-semibold text-cyan-300">{wf.subtitle}</p>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {wf.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Multi-Hazard Support Matrix */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">Multi-Hazard Coverage</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Disaster Domains Supported</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {disasterTypes.map((d, idx) => {
            const Icon = d.icon;
            return (
              <div
                key={idx}
                className={`p-5 rounded-xl border backdrop-blur-md space-y-3 transition hover:scale-[1.01] ${d.color}`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-white">
                    {d.tag}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{d.type}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{d.desc}</p>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-cyan-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{d.metric}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Core Authority Questions Answered */}
      <section className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <Shield className="h-5 w-5 text-cyan-400" />
          <span>Core Authority Questions Answered Deterministically</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="font-bold text-cyan-300">1. Where is the danger?</span>
            <p className="text-slate-400">Interactive GIS map dynamically highlights 50 habitations categorized Green/Yellow/Orange/Red.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="font-bold text-cyan-300">2. Why are they vulnerable?</span>
            <p className="text-slate-400">Explainable risk engine breaks down rainfall, river proximity, slope, and infrastructure weakness.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="font-bold text-cyan-300">3. Where should people go?</span>
            <p className="text-slate-400">Multi-criteria suitability scoring recommends safe relief camps with medical proximity.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="font-bold text-cyan-300">4. Can one shelter hold everyone?</span>
            <p className="text-slate-400">Knapsack overflow protocol automatically partitions population across secondary shelters.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="font-bold text-cyan-300">5. How to get there safely?</span>
            <p className="text-slate-400">Graph Dijkstra algorithm computes shortest paths while dynamically avoiding blocked roads.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="font-bold text-cyan-300">6. What if rainfall rises 30%?</span>
            <p className="text-slate-400">What-If Simulation Lab recalculates all 50 habitations in seconds with before/after delta metrics.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
