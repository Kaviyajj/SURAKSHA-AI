import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Users,
  Building2,
  Navigation,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { DashboardKPIs } from '../../types';

interface KPICardsProps {
  kpis: DashboardKPIs;
  onCardClick?: (metric: string) => void;
}

export const KPICards: React.FC<KPICardsProps> = ({ kpis, onCardClick }) => {
  const cards = [
    {
      id: 'critical_zones',
      title: 'Critical Zones',
      value: kpis.critical_zones_count,
      subtext: `${kpis.total_habitations} total monitored habitations`,
      icon: AlertOctagon,
      color: 'text-red-400',
      bg: 'bg-red-950/30 border-red-500/40',
      glow: 'glow-red',
      badge: 'IMMEDIATE ACTION',
      badgeClass: 'bg-red-500/20 text-red-300 border-red-500/40'
    },
    {
      id: 'pop_at_risk',
      title: 'Population at Acute Risk',
      value: kpis.population_at_risk.toLocaleString(),
      subtext: `${kpis.vulnerable_population_total.toLocaleString()} vulnerable citizens`,
      icon: Users,
      color: 'text-orange-400',
      bg: 'bg-orange-950/30 border-orange-500/40',
      badge: 'PRIORITY 1 & 2',
      badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40'
    },
    {
      id: 'shelter_capacity',
      title: 'Available Shelter Capacity',
      value: kpis.available_shelter_capacity.toLocaleString(),
      subtext: `${kpis.shelter_utilization_pct}% current utilization rate`,
      icon: Building2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/20 border-emerald-500/40',
      badge: `${kpis.total_shelters} Active Relief Camps`,
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    },
    {
      id: 'active_evacuations',
      title: 'Active Evacuation Corridors',
      value: kpis.active_evacuations_count,
      subtext: `${kpis.blocked_roads_count} road sections bypassed`,
      icon: Navigation,
      color: 'text-cyan-400',
      bg: 'bg-cyan-950/20 border-cyan-500/40',
      badge: 'ROUTING ACTIVE',
      badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={() => onCardClick && onCardClick(card.id)}
            className={`p-3.5 rounded-xl border backdrop-blur-md transition-all cursor-pointer glass-card-hover ${card.bg}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">{card.title}</span>
              <div className={`p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 ${card.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                {card.value}
              </span>
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px]">
              <span className="text-slate-400 font-medium truncate mr-1">{card.subtext}</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border uppercase shrink-0 ${card.badgeClass}`}>
                {card.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
