import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Download,
  Building2,
  Navigation,
  Sparkles,
  Users
} from 'lucide-react';
import { ReportResponse } from '../types';
import { api } from '../services/api';

export const ReportsPage: React.FC = () => {
  const [officerName, setOfficerName] = useState<string>('Commander K. Sharma, IAS');
  const [jurisdiction, setJurisdiction] = useState<string>('Nilgiri Basin Disaster Response Authority');
  const [reportData, setReportData] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const res = await api.generateReport({
        officer_name: officerName,
        jurisdiction: jurisdiction,
        include_critical_only: true
      });
      setReportData(res);
    } catch (err) {
      console.error("Failed to generate action report:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGenerateReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Top Header & Customizer */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800 print:hidden">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-bold uppercase">
            <FileText className="h-4 w-4" />
            <span>Official Incident Action Directives</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Authority Response Summary Report</h1>
          <p className="text-xs text-slate-400">Formal evacuation plan and multi-shelter distribution manifest for operational field dispatch</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center space-x-2 transition shadow-lg shadow-cyan-500/20"
          >
            <Printer className="h-4 w-4" />
            <span>Print / Export PDF Action Plan</span>
          </button>
        </div>
      </div>

      {/* Control Customizer Bar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 backdrop-blur-md grid grid-cols-1 md:grid-cols-3 gap-3 print:hidden">
        <div>
          <label className="text-[10px] font-mono text-slate-400 block mb-1">INCIDENT COMMANDER</label>
          <input
            type="text"
            value={officerName}
            onChange={(e) => setOfficerName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="text-[10px] font-mono text-slate-400 block mb-1">JURISDICTION / THEATER</label>
          <input
            type="text"
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="w-full bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>{loading ? 'Compiling Report...' : 'Re-compile Action Directives'}</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      {reportData ? (
        <div className="p-8 rounded-2xl border border-slate-700 bg-slate-950 text-slate-100 space-y-8 shadow-2xl print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
          {/* Official Document Header */}
          <div className="border-b-2 border-slate-800 print:border-black pb-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-xl bg-cyan-600 print:bg-black flex items-center justify-center text-white">
                  <Shield className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-xl font-black font-mono tracking-wider uppercase text-white print:text-black">
                    SURAKSHA-AI DISASTER RELOCATION DIRECTIVE
                  </h2>
                  <p className="text-xs text-slate-400 print:text-gray-700">
                    National Disaster Management Authority • Emergency Operations Command
                  </p>
                </div>
              </div>

              <div className="text-right font-mono text-xs">
                <span className="text-[10px] text-slate-400 print:text-gray-600 block">DOCUMENT REF:</span>
                <span className="font-bold text-cyan-400 print:text-black">{reportData.report_id}</span>
                <span className="text-[10px] text-slate-400 print:text-gray-600 block mt-1">TIMESTAMP: {reportData.generated_at}</span>
              </div>
            </div>

            {/* Officer & Jurisdiction Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-xs font-mono bg-slate-900/60 print:bg-gray-100 p-3 rounded-lg">
              <div>
                <span className="text-[10px] text-slate-400 print:text-gray-600 block">AUTHORITY:</span>
                <span className="font-bold text-white print:text-black">{reportData.officer_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 print:text-gray-600 block">JURISDICTION:</span>
                <span className="font-bold text-white print:text-black">{reportData.jurisdiction}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 print:text-gray-600 block">STATUS:</span>
                <span className="font-bold text-emerald-400 print:text-black">{reportData.status}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 print:text-gray-600 block">CLASSIFICATION:</span>
                <span className="font-bold text-amber-400 print:text-black">OPERATIONAL</span>
              </div>
            </div>
          </div>

          {/* Executive Summary Metrics */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400 print:text-black font-mono">
              1. Executive Incident Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center font-mono">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 print:border-gray-300">
                <span className="text-[10px] text-slate-400 print:text-gray-600 block">CRITICAL HABITATIONS</span>
                <span className="text-2xl font-black text-red-400 print:text-black">{reportData.critical_habitations_count}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 print:border-gray-300">
                <span className="text-[10px] text-slate-400 print:text-gray-600 block">POPULATION AT RISK</span>
                <span className="text-2xl font-black text-orange-400 print:text-black">{reportData.population_at_risk.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 print:border-gray-300">
                <span className="text-[10px] text-slate-400 print:text-gray-600 block">VULNERABLE CITIZENS</span>
                <span className="text-2xl font-black text-amber-400 print:text-black">{reportData.vulnerable_individuals.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 print:border-gray-300">
                <span className="text-[10px] text-slate-400 print:text-gray-600 block">SHELTER CAPACITY ASSIGNED</span>
                <span className="text-2xl font-black text-emerald-400 print:text-black">{reportData.shelter_capacity_allocated.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Critical Habitations & Relocation Targets Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400 print:text-black font-mono">
              2. Priority Habitations Relocation Matrix
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800 print:border-gray-300">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 print:bg-gray-100 text-slate-400 print:text-gray-700 text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Habitation</th>
                    <th className="py-2.5 px-2">Risk</th>
                    <th className="py-2.5 px-2">Population</th>
                    <th className="py-2.5 px-2">Vulnerable</th>
                    <th className="py-2.5 px-3">Primary Relief Camp</th>
                    <th className="py-2.5 px-3">Overflow Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-200">
                  {reportData.shelter_allocations.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 font-sans font-bold text-white print:text-black">{item.habitation_name}</td>
                      <td className="py-2.5 px-2 text-red-400 print:text-black font-bold">{item.risk_score}</td>
                      <td className="py-2.5 px-2 text-slate-200 print:text-black">{item.population.toLocaleString()}</td>
                      <td className="py-2.5 px-2 text-amber-400 print:text-black font-bold">{item.vulnerable_population.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-cyan-300 print:text-black font-sans">{item.primary_shelter}</td>
                      <td className="py-2.5 px-3">
                        {item.is_overflow ? (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/40 font-bold">
                            MULTI-SHELTER
                          </span>
                        ) : (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/40 font-bold">
                            SINGLE-SHELTER
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Evacuation Route Corridors */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400 print:text-black font-mono">
              3. Approved Evacuation Corridors & Blockage Avoidance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
              {reportData.evacuation_routes.map((rt, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 print:border-gray-300 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-sans font-bold text-white print:text-black">
                      {rt.origin} → {rt.destination}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">{rt.safety_score}% Safety</span>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 print:text-gray-700">
                    <span>Dist: {rt.distance_km} km</span>
                    <span>Transit: ~{rt.duration_min} min</span>
                    <span className="text-cyan-300">Bypassed: {rt.blocked_avoided} blocked links</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Directives Checklist */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400 print:text-black font-mono">
              4. Immediate Operational Directives for Responders
            </h3>
            <div className="space-y-2 font-sans text-xs">
              {reportData.action_directives.map((dir, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-slate-200 print:text-gray-900">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{dir}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Standard Operating Procedures Citations */}
          <div className="space-y-2 pt-4 border-t border-slate-800 print:border-gray-300 text-[11px] font-mono text-slate-400 print:text-gray-600">
            <span className="font-bold block text-slate-300 print:text-gray-800 uppercase">
              Compliance & Legal Verification
            </span>
            {reportData.standard_operating_procedures.map((sop, idx) => (
              <p key={idx}>• {sop}</p>
            ))}
            <p className="pt-2 text-[10px] text-slate-400 italic">
              {reportData.disclaimer}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-xs text-slate-400">Loading action report data...</div>
      )}
    </div>
  );
};
