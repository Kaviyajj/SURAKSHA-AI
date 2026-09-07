import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, PageId } from './components/layout/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { CommandCenter } from './pages/CommandCenter';
import { RiskIntelligence } from './pages/RiskIntelligence';
import { ShelterRelocation } from './pages/ShelterRelocation';
import { EvacuationRouting } from './pages/EvacuationRouting';
import { SimulationLab } from './pages/SimulationLab';
import { SurakshaAssist } from './pages/SurakshaAssist';
import { ReportsPage } from './pages/ReportsPage';
import { Habitation, Shelter, RoadFeature, DashboardKPIs, AlertItem, EvacuationPlanResponse } from './types';
import { api } from './services/api';

export function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('landing');
  const [habitations, setHabitations] = useState<Habitation[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [roads, setRoads] = useState<RoadFeature[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [selectedHabitationId, setSelectedHabitationId] = useState<number | null>(1);
  const [selectedShelterId, setSelectedShelterId] = useState<number | null>(1);
  const [activeRoute, setActiveRoute] = useState<EvacuationPlanResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initial Data Load from Backend APIs
  const loadInitialData = async () => {
    try {
      const [dashRes, habsRes, sheltersRes, roadsRes] = await Promise.all([
        api.getDashboard(),
        api.getHabitations(),
        api.getShelters(),
        api.getRoadNetwork()
      ]);

      setKpis(dashRes.kpis);
      setAlerts(dashRes.active_alerts);
      setHabitations(habsRes);
      setShelters(sheltersRes);
      setRoads(roadsRes);

      // Pre-calculate initial route from Kaveri Nagar (Hab 1) to District Relief Camp (Shelter 1)
      if (habsRes.length > 0 && sheltersRes.length > 0) {
        const routeRes = await api.planEvacuationRoute({
          habitation_id: habsRes[0].id,
          shelter_id: sheltersRes[0].id
        });
        setActiveRoute(routeRes);
      }
    } catch (err) {
      console.error("Failed to load initial data from SURAKSHA-AI backend:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSelectHabitation = (id: number) => {
    setSelectedHabitationId(id);
  };

  const handleRecommendShelters = (habId: number) => {
    setSelectedHabitationId(habId);
    setCurrentPage('shelter-relocation');
  };

  const handlePlanRoute = (habId: number, shelterId?: number) => {
    setSelectedHabitationId(habId);
    if (shelterId) setSelectedShelterId(shelterId);
    setCurrentPage('evacuation-routing');
  };

  const criticalCount = kpis?.critical_zones_count || habitations.filter(h => h.risk_level === 'Critical').length;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Command Navbar */}
      <Navbar
        alerts={alerts}
        activeScenario={kpis?.active_scenario || 'Monsoon Active Basin Inundation'}
        onSelectHabitation={(id) => {
          setSelectedHabitationId(id);
          setCurrentPage('command-center');
        }}
      />

      {/* Main Body */}
      <div className="flex flex-1 relative">
        {/* Left Sidebar Navigation */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={(page) => setCurrentPage(page)}
          criticalCount={criticalCount}
        />

        {/* Dynamic Page Viewport */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden min-w-0">
          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
              <p className="text-xs font-mono text-cyan-400 uppercase tracking-widest animate-pulse">
                Initializing SURAKSHA-AI Telemetry & GIS Layers...
              </p>
            </div>
          ) : (
            <>
              {currentPage === 'landing' && (
                <LandingPage
                  onNavigate={(page) => setCurrentPage(page)}
                  onSelectHabitation={handleSelectHabitation}
                />
              )}

              {currentPage === 'command-center' && kpis && (
                <CommandCenter
                  kpis={kpis}
                  habitations={habitations}
                  shelters={shelters}
                  roads={roads}
                  alerts={alerts}
                  selectedHabitationId={selectedHabitationId}
                  onSelectHabitation={handleSelectHabitation}
                  activeRoute={activeRoute}
                  onNavigate={(page) => setCurrentPage(page)}
                  onRecommendShelters={handleRecommendShelters}
                  onPlanRoute={handlePlanRoute}
                />
              )}

              {currentPage === 'risk-intelligence' && (
                <RiskIntelligence
                  habitations={habitations}
                  onSelectHabitation={handleSelectHabitation}
                  onNavigate={(page) => setCurrentPage(page)}
                />
              )}

              {currentPage === 'shelter-relocation' && (
                <ShelterRelocation
                  shelters={shelters}
                  habitations={habitations}
                  selectedHabitationId={selectedHabitationId}
                  onSelectHabitation={handleSelectHabitation}
                  onNavigate={(page) => setCurrentPage(page)}
                  onPlanRouteForShelter={handlePlanRoute}
                />
              )}

              {currentPage === 'evacuation-routing' && (
                <EvacuationRouting
                  habitations={habitations}
                  shelters={shelters}
                  roads={roads}
                  selectedHabitationId={selectedHabitationId}
                  selectedShelterId={selectedShelterId}
                  activeRoute={activeRoute}
                  onSetRoute={setActiveRoute}
                  onNavigate={(page) => setCurrentPage(page)}
                />
              )}

              {currentPage === 'simulation-lab' && (
                <SimulationLab
                  habitations={habitations}
                  shelters={shelters}
                  roads={roads}
                  onNavigate={(page) => setCurrentPage(page)}
                  onSelectHabitation={handleSelectHabitation}
                />
              )}

              {currentPage === 'suraksha-assist' && (
                <SurakshaAssist />
              )}

              {currentPage === 'reports' && (
                <ReportsPage />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
export default App;
