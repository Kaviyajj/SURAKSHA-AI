import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import {
  Activity,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Shield,
  Droplets,
  Mountain,
  Flame,
  AlertTriangle,
  Download
} from 'lucide-react';
import { Habitation } from '../types';
import { PageId } from '../components/layout/Sidebar';

interface RiskIntelligenceProps {
  habitations: Habitation[];
  onSelectHabitation: (id: number) => void;
  onNavigate: (page: PageId) => void;
}

export const RiskIntelligence: React.FC<RiskIntelligenceProps> = ({
  habitations,
  onSelectHabitation,
  onNavigate
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [hazardFilter, setHazardFilter] = useState<string>('All');
  const [tierFilter, setTierFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'risk_score' | 'population' | 'vulnerable_population'>('risk_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort
  const filtered = habitations.filter((h) => {
    if (hazardFilter !== 'All' && h.hazard_type !== hazardFilter) return false;
    if (tierFilter !== 'All' && h.risk_level !== tierFilter) return false;
    if (searchTerm.trim() && !h.name.toLowerCase().includes(searchTerm.toLowerCase()) && !h.district.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    const valA = a[sortBy];
    const valB = b[sortBy];
    return sortOrder === 'desc' ? valB - valA : valA - valB;
  });

  // Risk distribution for Recharts
  const distributionData = [
    { name: 'Critical', count: habitations.filter(h => h.risk_level === 'Critical').length, color: '#ef4444' },
    { name: 'Very High', count: habitations.filter(h => h.risk_level === 'Very High').length, color: '#f97316' },
    { name: 'High', count: habitations.filter(h => h.risk_level === 'High').length, color: '#f59e0b' },
    { name: 'Moderate', count: habitations.filter(h => h.risk_level === 'Moderate').length, color: '#eab308' },
    { name: 'Low', count: habitations.filter(h => h.risk_level === 'Low').length, color: '#10b981' },
  ];

  // Hazard Breakdown for Pie
  const hazardData = [
    { name: 'Flood', value: habitations.filter(h => h.hazard_type === 'Flood').length, color: '#06b6d4' },
    { name: 'Landslide', value: habitations.filter(h => h.hazard_type === 'Landslide').length, color: '#f59e0b' },
    { name: 'Wildfire', value: habitations.filter(h => h.hazard_type === 'Wildfire').length, color: '#f43f5e' },
  ];

  const handleSort = (field: 'risk_score' | 'population' | 'vulnerable_population') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-bold uppercase">
            <Activity className="h-4 w-4" />
            <span>Vulnerability Assessment Registry</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Habitations Risk Intelligence</h1>
          <p className="text-xs text-slate-400">Granular risk ranking and factor breakdown across all 50 monitored habitations</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('command-center')}
            className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center space-x-1.5 transition"
          >
            <Shield className="h-4 w-4" />
            <span>Open GIS Map</span>
          </button>
        </div>
      </div>

      {/* Visual Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Risk Distribution Bar Chart */}
        <div className="lg:col-span-2 p-4 rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Risk Level Distribution (50 Habitations)</h3>
            <span className="text-[10px] text-slate-400 font-mono">Real-time Tiers</span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hazard Exposure Pie Chart */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Hazard Classification</h3>
            <span className="text-[10px] text-slate-400 font-mono">By Disaster Type</span>
          </div>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={hazardData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {hazardData.map((entry, index) => (
                    <Cell key={`cell-pie-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-[10px] text-slate-300 font-mono">
            {hazardData.map(h => (
              <div key={h.name} className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: h.color }}></span>
                <span>{h.name}: {h.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search habitation name or district..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 pl-9 pr-3 py-1.5 text-xs text-white rounded-lg focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Hazard Filter Buttons */}
        <div className="flex items-center space-x-1">
          {['All', 'Flood', 'Landslide', 'Wildfire'].map((hz) => (
            <button
              key={hz}
              onClick={() => setHazardFilter(hz)}
              className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition ${
                hazardFilter === hz
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {hz}
            </button>
          ))}
        </div>

        {/* Risk Tier Filter */}
        <div className="flex items-center space-x-1">
          {['All', 'Critical', 'Very High', 'High', 'Moderate', 'Low'].map((tier) => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`text-xs px-2 py-1.5 rounded-lg font-medium transition ${
                tierFilter === tier
                  ? 'bg-slate-700 text-white font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Habitations Data Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Habitation</th>
                <th className="py-3 px-3">Hazard</th>
                <th
                  onClick={() => handleSort('risk_score')}
                  className="py-3 px-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center space-x-1">
                    <span>Risk Score</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('population')}
                  className="py-3 px-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center space-x-1">
                    <span>Population</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('vulnerable_population')}
                  className="py-3 px-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center space-x-1">
                    <span>Vulnerable</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Rainfall</th>
                <th className="py-3 px-3">River Dist</th>
                <th className="py-3 px-3">Slope</th>
                <th className="py-3 px-3">Access</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filtered.map((hab) => (
                <tr key={hab.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-4">
                    <div className="font-sans font-bold text-white text-xs">{hab.name}</div>
                    <div className="text-[10px] text-slate-400 font-sans">{hab.district}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                      {hab.hazard_type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center space-x-1.5">
                      <span
                        className="font-bold text-xs px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: `${hab.risk_color}25`,
                          color: hab.risk_color,
                          border: `1px solid ${hab.risk_color}60`
                        }}
                      >
                        {hab.risk_score}
                      </span>
                      <span className="text-[10px] font-sans text-slate-400 hidden sm:inline">
                        {hab.risk_level}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-200">{hab.population.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-red-400 font-bold">
                    {hab.vulnerable_population.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-cyan-300">{hab.rainfall} mm</td>
                  <td className="py-2.5 px-3 text-cyan-300">{hab.river_distance}m</td>
                  <td className="py-2.5 px-3 text-amber-300">{hab.slope}°</td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] font-bold ${hab.road_accessibility < 40 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {hab.road_accessibility}%
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-sans">
                    <button
                      onClick={() => {
                        onSelectHabitation(hab.id);
                        onNavigate('command-center');
                      }}
                      className="bg-cyan-600/30 hover:bg-cyan-600 text-cyan-200 hover:text-white border border-cyan-500/40 text-[11px] font-bold px-2.5 py-1 rounded transition"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-950 text-slate-400 text-xs border-t border-slate-800 flex items-center justify-between">
          <span>Showing {filtered.length} of {habitations.length} habitations</span>
          <span className="text-cyan-400 font-mono">Demographic & Hazard Model: Active</span>
        </div>
      </div>
    </div>
  );
};
