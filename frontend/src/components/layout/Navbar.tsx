import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Radio, Clock, Bell, Info } from 'lucide-react';
import { AlertItem } from '../../types';

interface NavbarProps {
  alerts: AlertItem[];
  activeScenario?: string;
  onSelectHabitation?: (id: number) => void;
  onOpenAlertsModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  alerts,
  activeScenario = 'Monsoon Active Basin Inundation',
  onSelectHabitation
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [showAlertsDropdown, setShowAlertsDropdown] = useState<boolean>(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }) + ' IST');
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const criticalCount = alerts.filter(a => a.severity === 'Critical').length;

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 z-30 sticky top-0">
      {/* Brand & Mission */}
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/40">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-base tracking-wider text-white font-mono">SURAKSHA<span className="text-cyan-400">-AI</span></span>
            <span className="bg-red-500/20 border border-red-500/50 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded tracking-widest uppercase animate-pulse">
              LIVE COMMAND
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">From Hazard Detection to Human-Safe Decisions</p>
        </div>
      </div>

      {/* Center Operational Status Badges */}
      <div className="hidden lg:flex items-center space-x-3">
        {/* System Readiness Status */}
        <div className="flex items-center space-x-2 bg-slate-950/70 border border-slate-800 px-3 py-1.5 rounded-full text-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-slate-300 font-medium">SYSTEM: <span className="text-emerald-400 font-semibold">ONLINE</span></span>
        </div>

        {/* Active Scenario */}
        <div className="flex items-center space-x-2 bg-slate-950/70 border border-slate-800 px-3 py-1.5 rounded-full text-xs">
          <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
          <span className="text-slate-400">SCENARIO:</span>
          <span className="text-cyan-300 font-medium">{activeScenario}</span>
        </div>

        {/* Demo Mode Pill */}
        <div className="flex items-center space-x-1.5 bg-amber-500/10 border border-amber-500/40 px-2.5 py-1 rounded-full text-[11px] text-amber-400 font-medium">
          <Info className="h-3 w-3" />
          <span>SIMULATED DATASET</span>
        </div>
      </div>

      {/* Right Controls & Clock */}
      <div className="flex items-center space-x-3">
        {/* Clock */}
        <div className="hidden md:flex items-center space-x-1.5 bg-slate-950/80 border border-slate-800/80 px-2.5 py-1.5 rounded text-xs font-mono text-cyan-300">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>{timeStr || '20:00:00 IST'}</span>
        </div>

        {/* Alerts Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
            className={`relative p-2 rounded-lg transition-all ${
              criticalCount > 0
                ? 'bg-red-950/40 text-red-400 border border-red-500/40 hover:bg-red-900/50'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
            title="Active Emergency Alerts"
          >
            <Bell className="h-4 w-4" />
            {criticalCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-bounce">
                {criticalCount}
              </span>
            )}
          </button>

          {/* Alerts Dropdown Modal */}
          {showAlertsDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="bg-slate-800/90 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Emergency Incident Feed</span>
                </div>
                <span className="text-[11px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">
                  {alerts.length} Alerts
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
                {alerts.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">No critical alerts detected in zone.</div>
                ) : (
                  alerts.map((alt) => (
                    <div
                      key={alt.id}
                      onClick={() => {
                        if (alt.habitation_id && onSelectHabitation) {
                          onSelectHabitation(alt.habitation_id);
                          setShowAlertsDropdown(false);
                        }
                      }}
                      className="p-3 hover:bg-slate-800/60 transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          alt.severity === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {alt.severity}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{alt.timestamp}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200">{alt.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{alt.message}</p>
                      <p className="text-[10px] text-cyan-400 mt-1 font-medium">Action: {alt.recommended_action}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 text-center">
                <span className="text-[10px] text-slate-400">Click any alert to lock coordinates on GIS Map</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
