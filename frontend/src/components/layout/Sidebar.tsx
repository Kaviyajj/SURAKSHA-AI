import React from 'react';
import {
  Home,
  ShieldAlert,
  Activity,
  Building2,
  Navigation,
  Sliders,
  Bot,
  FileText,
  Radio
} from 'lucide-react';

export type PageId =
  | 'landing'
  | 'command-center'
  | 'risk-intelligence'
  | 'shelter-relocation'
  | 'evacuation-routing'
  | 'simulation-lab'
  | 'suraksha-assist'
  | 'reports';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  criticalCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  criticalCount = 0
}) => {
  const navItems = [
    { id: 'landing' as PageId, label: 'Portal Home', icon: Home },
    { id: 'command-center' as PageId, label: 'Command Center', icon: ShieldAlert, badge: criticalCount > 0 ? `${criticalCount} Crit` : undefined, badgeColor: 'bg-red-500/20 text-red-400 border-red-500/40' },
    { id: 'risk-intelligence' as PageId, label: 'Risk Intelligence', icon: Activity },
    { id: 'shelter-relocation' as PageId, label: 'Shelter Capacity', icon: Building2 },
    { id: 'evacuation-routing' as PageId, label: 'Evacuation Routes', icon: Navigation },
    { id: 'simulation-lab' as PageId, label: 'Simulation Lab', icon: Sliders, highlight: true },
    { id: 'suraksha-assist' as PageId, label: 'SURAKSHA ASSIST', icon: Bot },
    { id: 'reports' as PageId, label: 'Action Reports', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-slate-950/95 backdrop-blur-xl border-r border-slate-800 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none shrink-0">
      {/* Top Nav Items */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-mono tracking-wider uppercase text-slate-400 font-semibold">
          Operational Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-cyan-400' : item.highlight ? 'text-amber-400' : 'text-slate-400'
                }`} />
                <span className={isActive ? 'font-semibold' : ''}>{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono font-bold animate-pulse ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
              {item.highlight && !isActive && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold uppercase">
                  WHAT-IF
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Workflow Indicator & Bottom Badge */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 space-y-3">
        <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
          <div className="flex items-center space-x-2 text-[11px] text-cyan-400 font-semibold">
            <Radio className="h-3 w-3 animate-ping text-cyan-400" />
            <span>MISSION CADENCE</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span className="text-cyan-300">DETECT</span> →
            <span className="text-amber-300">ASSESS</span> →
            <span className="text-emerald-300">DECIDE</span> →
            <span className="text-purple-300">ACT</span>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 text-center font-mono">
          SURAKSHA-AI v1.0.0-SIH
        </div>
      </div>
    </aside>
  );
};
