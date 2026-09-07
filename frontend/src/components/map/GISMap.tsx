import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import {
  Layers,
  Search,
  Crosshair,
  Shield,
  AlertTriangle,
  Flame,
  Droplets,
  Mountain,
  Navigation,
  CheckCircle2,
  XCircle,
  Eye
} from 'lucide-react';
import { Habitation, Shelter, RoadFeature, EvacuationPlanResponse } from '../../types';

interface GISMapProps {
  habitations: Habitation[];
  shelters: Shelter[];
  roads: RoadFeature[];
  riversGeoJSON?: any;
  selectedHabitationId?: number | null;
  onSelectHabitation: (id: number) => void;
  activeRoute?: EvacuationPlanResponse | null;
  onPlanRouteForHabitation?: (habId: number) => void;
  onRecommendShelterForHabitation?: (habId: number) => void;
}

// Controller component to smoothly pan/zoom map to selected coordinates
const MapViewController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
};

export const GISMap: React.FC<GISMapProps> = ({
  habitations,
  shelters,
  roads,
  selectedHabitationId,
  onSelectHabitation,
  activeRoute,
  onPlanRouteForHabitation,
  onRecommendShelterForHabitation
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([11.43, 76.78]);
  const [mapZoom, setMapZoom] = useState<number>(11);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Layer toggles
  const [hazardFilter, setHazardFilter] = useState<string>('All');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [showShelters, setShowShelters] = useState<boolean>(true);
  const [showRoads, setShowRoads] = useState<boolean>(true);
  const [showRivers, setShowRivers] = useState<boolean>(true);

  // If a habitation is selected externally, recenter map
  useEffect(() => {
    if (selectedHabitationId) {
      const target = habitations.find(h => h.id === selectedHabitationId);
      if (target) {
        setMapCenter([target.latitude, target.longitude]);
        setMapZoom(13);
      }
    }
  }, [selectedHabitationId, habitations]);

  // Filter habitations
  const filteredHabitations = habitations.filter((h) => {
    if (hazardFilter !== 'All' && h.hazard_type !== hazardFilter) return false;
    if (riskFilter !== 'All' && h.risk_level !== riskFilter) return false;
    if (searchQuery.trim() && !h.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Create Custom SVG Markers
  const createHabitationIcon = (h: Habitation, isSelected: boolean) => {
    let color = '#10b981'; // green
    let pulseClass = '';

    if (h.risk_level === 'Critical') {
      color = '#ef4444'; // red
      pulseClass = 'animate-ping';
    } else if (h.risk_level === 'Very High') {
      color = '#f97316'; // orange-red
    } else if (h.risk_level === 'High') {
      color = '#f59e0b'; // amber
    } else if (h.risk_level === 'Moderate') {
      color = '#eab308'; // yellow
    }

    const isCrit = h.risk_level === 'Critical';

    return L.divIcon({
      className: 'custom-hab-marker',
      html: `
        <div class="relative flex items-center justify-center cursor-pointer transition-transform ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
          ${isCrit ? `<span class="absolute w-8 h-8 rounded-full bg-red-500/40 ${pulseClass}"></span>` : ''}
          <div class="w-6 h-6 rounded-full flex items-center justify-center shadow-lg border ${
            isSelected ? 'border-cyan-300 ring-2 ring-cyan-400' : 'border-white/80'
          }" style="background-color: ${color}">
            <span class="text-[9px] font-black text-slate-950 font-mono">${Math.round(h.risk_score)}</span>
          </div>
          <div class="absolute -bottom-4 bg-slate-900/90 text-white text-[9px] font-semibold px-1 rounded whitespace-nowrap shadow border border-slate-700 pointer-events-none">
            ${h.name.split(' ')[0]}
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14]
    });
  };

  const createShelterIcon = (s: Shelter) => {
    const avail = maxCap(s.total_capacity - s.current_occupancy);
    return L.divIcon({
      className: 'custom-shelter-marker',
      html: `
        <div class="relative flex flex-col items-center cursor-pointer hover:scale-110 transition-transform">
          <div class="w-7 h-7 rounded-lg bg-blue-600 border border-cyan-300 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg class="w-4 h-4 text-cyan-200" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L2 12h3v8h14v-8h3L12 3zm0 2.5l7 6.3V18H5v-7.2l7-6.3z"/>
            </svg>
          </div>
          <div class="absolute -bottom-3 bg-blue-950 text-cyan-300 text-[8px] font-bold px-1 rounded border border-blue-700 whitespace-nowrap">
            ${avail} Avail
          </div>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15]
    });
  };

  function maxCap(val: number) {
    return val > 0 ? val : 0;
  }

  return (
    <div className="relative w-full h-full min-h-[580px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
      {/* Top Floating Control HUD */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Search Bar & Layer Toggles (Pointer Events Enabled) */}
        <div className="flex items-center space-x-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-700/80 shadow-xl">
          <div className="relative flex items-center">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5" />
            <input
              type="text"
              placeholder="Search habitation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 pl-8 pr-3 py-1 text-xs text-slate-100 rounded focus:outline-none focus:border-cyan-500 w-44 sm:w-56"
            />
          </div>

          {/* Hazard Filter */}
          <div className="flex items-center space-x-1 border-l border-slate-700 pl-2">
            {(['All', 'Flood', 'Landslide', 'Wildfire'] as const).map((hz) => (
              <button
                key={hz}
                onClick={() => setHazardFilter(hz)}
                className={`text-[11px] px-2 py-1 rounded font-medium transition ${
                  hazardFilter === hz
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {hz === 'Flood' && <Droplets className="inline h-3 w-3 mr-1 text-cyan-400" />}
                {hz === 'Landslide' && <Mountain className="inline h-3 w-3 mr-1 text-amber-400" />}
                {hz === 'Wildfire' && <Flame className="inline h-3 w-3 mr-1 text-rose-400" />}
                {hz}
              </button>
            ))}
          </div>

          {/* Risk Level Filter */}
          <div className="hidden md:flex items-center space-x-1 border-l border-slate-700 pl-2">
            {(['All', 'Critical', 'High', 'Moderate', 'Low'] as const).map((rl) => (
              <button
                key={rl}
                onClick={() => setRiskFilter(rl)}
                className={`text-[11px] px-2 py-1 rounded transition ${
                  riskFilter === rl
                    ? 'bg-slate-700 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {rl}
              </button>
            ))}
          </div>
        </div>

        {/* Layer Visibility Toggles */}
        <div className="flex items-center space-x-1.5 pointer-events-auto bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-700/80 shadow-xl">
          <button
            onClick={() => setShowShelters(!showShelters)}
            className={`flex items-center space-x-1 text-[11px] px-2 py-1 rounded transition ${
              showShelters ? 'bg-blue-600/30 text-cyan-300 border border-blue-500/40' : 'text-slate-500 bg-slate-950/60'
            }`}
          >
            <Shield className="h-3 w-3" />
            <span>Shelters ({shelters.length})</span>
          </button>

          <button
            onClick={() => setShowRoads(!showRoads)}
            className={`flex items-center space-x-1 text-[11px] px-2 py-1 rounded transition ${
              showRoads ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40' : 'text-slate-500 bg-slate-950/60'
            }`}
          >
            <Navigation className="h-3 w-3" />
            <span>Roads ({roads.length})</span>
          </button>

          <button
            onClick={() => setShowRivers(!showRivers)}
            className={`flex items-center space-x-1 text-[11px] px-2 py-1 rounded transition ${
              showRivers ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-500 bg-slate-950/60'
            }`}
          >
            <Droplets className="h-3 w-3" />
            <span>Rivers</span>
          </button>

          <button
            onClick={() => {
              setMapCenter([11.43, 76.78]);
              setMapZoom(11);
            }}
            title="Reset Map View"
            className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
          >
            <Crosshair className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Map */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapViewController center={mapCenter} zoom={mapZoom} />

        {/* Dark CARTO / OpenStreetMap Basemap */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* River Waterways */}
        {showRivers && (
          <>
            {/* Bhavani River Main */}
            <Polyline
              positions={[
                [11.380, 76.720],
                [11.378, 76.755],
                [11.425, 76.782],
                [11.438, 76.812],
                [11.449, 76.852],
                [11.472, 76.891],
                [11.488, 76.945],
                [11.510, 76.980],
                [11.530, 77.050]
              ]}
              pathOptions={{ color: '#0284c7', weight: 4, opacity: 0.8 }}
            />
            {/* Moyar Gorge Tributary */}
            <Polyline
              positions={[
                [11.570, 76.580],
                [11.582, 76.685],
                [11.572, 76.745],
                [11.565, 76.815],
                [11.532, 76.865],
                [11.472, 76.891]
              ]}
              pathOptions={{ color: '#0ea5e9', weight: 3, opacity: 0.75 }}
            />
          </>
        )}

        {/* Road Network Lines */}
        {showRoads &&
          roads.map((road) => (
            <Polyline
              key={`road-${road.id}`}
              positions={road.geometry}
              pathOptions={{
                color: road.is_blocked ? '#ef4444' : '#64748b',
                weight: road.is_blocked ? 4 : 2,
                dashArray: road.is_blocked ? '6, 6' : undefined,
                opacity: road.is_blocked ? 0.95 : 0.4
              }}
            >
              <Popup>
                <div className="p-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{road.name}</span>
                    {road.is_blocked ? (
                      <span className="text-[9px] bg-red-500/20 text-red-400 font-bold px-1 rounded">BLOCKED</span>
                    ) : (
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-bold px-1 rounded">CLEAR</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">Condition: {road.road_condition}</p>
                  {road.blockage_reason && (
                    <p className="text-[11px] text-red-400 font-medium">⚠️ {road.blockage_reason}</p>
                  )}
                </div>
              </Popup>
            </Polyline>
          ))}

        {/* Active Evacuation Path */}
        {activeRoute && (
          <>
            <Polyline
              positions={activeRoute.route_geometry}
              pathOptions={{
                color: '#06b6d4',
                weight: 5,
                dashArray: '8, 8',
                opacity: 0.95
              }}
            />
            {/* Glow backing */}
            <Polyline
              positions={activeRoute.route_geometry}
              pathOptions={{
                color: '#38bdf8',
                weight: 9,
                opacity: 0.3
              }}
            />
          </>
        )}

        {/* Shelters Layer */}
        {showShelters &&
          shelters.map((shelter) => (
            <Marker
              key={`shelter-${shelter.id}`}
              position={[shelter.latitude, shelter.longitude]}
              icon={createShelterIcon(shelter)}
            >
              <Popup>
                <div className="p-2 space-y-1.5 min-w-[200px]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-cyan-300">{shelter.name}</span>
                    <span className="text-[9px] bg-blue-500/20 text-cyan-400 px-1 rounded font-bold">
                      {shelter.shelter_type}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-300 py-1 border-y border-slate-700">
                    <div>Capacity: <span className="font-mono font-bold text-white">{shelter.total_capacity}</span></div>
                    <div>Available: <span className="font-mono font-bold text-emerald-400">{shelter.available_capacity}</span></div>
                    <div>Safety: <span className="text-cyan-400">{shelter.hazard_risk_level}</span></div>
                    <div>Hospital: <span className="font-mono">{shelter.medical_distance} km</span></div>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center space-x-2">
                    {shelter.has_generator && <span className="text-emerald-400">⚡ Generator</span>}
                    {shelter.has_medical_staff && <span className="text-cyan-400">🩺 Medical Unit</span>}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Habitations Layer */}
        {filteredHabitations.map((hab) => {
          const isSelected = hab.id === selectedHabitationId;
          return (
            <Marker
              key={`hab-${hab.id}`}
              position={[hab.latitude, hab.longitude]}
              icon={createHabitationIcon(hab, isSelected)}
              eventHandlers={{
                click: () => onSelectHabitation(hab.id)
              }}
            >
              <Popup>
                <div className="p-2 space-y-2 min-w-[240px]">
                  {/* Title & Risk Badge */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-white">{hab.name}</h4>
                      <p className="text-[10px] text-slate-400">{hab.district}</p>
                    </div>
                    <div
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-black"
                      style={{ backgroundColor: `${hab.risk_color}30`, color: hab.risk_color, border: `1px solid ${hab.risk_color}` }}
                    >
                      {hab.risk_score} — {hab.risk_level.toUpperCase()}
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-300 bg-slate-900/80 p-1.5 rounded border border-slate-800 font-mono">
                    <div>Pop: <span className="text-white font-bold">{hab.population.toLocaleString()}</span></div>
                    <div>Vuln: <span className="text-red-400 font-bold">{hab.vulnerable_population.toLocaleString()}</span></div>
                    <div>Rain: <span className="text-cyan-300">{hab.rainfall} mm</span></div>
                    <div>River: <span className="text-cyan-300">{hab.river_distance}m</span></div>
                  </div>

                  {/* Explanation Snippet */}
                  <p className="text-[11px] text-slate-300 line-clamp-2 italic">
                    "{hab.explanation}"
                  </p>

                  {/* Actions */}
                  <div className="flex items-center space-x-1.5 pt-1">
                    <button
                      onClick={() => onSelectHabitation(hab.id)}
                      className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold py-1 px-2 rounded flex items-center justify-center space-x-1 transition"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Inspect</span>
                    </button>

                    {onRecommendShelterForHabitation && (
                      <button
                        onClick={() => onRecommendShelterForHabitation(hab.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-1 px-2 rounded flex items-center justify-center space-x-1 transition"
                      >
                        <Shield className="h-3 w-3" />
                        <span>Shelters</span>
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md p-2.5 rounded-lg border border-slate-700/80 shadow-2xl text-[10px] space-y-1">
        <div className="font-bold text-slate-300 uppercase tracking-wider text-[9px] mb-1">Risk Tiers</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-300">
          <div className="flex items-center space-x-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping"></span>
            <span>Critical (81–100)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500"></span>
            <span>Very High (61–80)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
            <span>High (41–60)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500"></span>
            <span>Moderate (21–40)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            <span>Low (0–20)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-blue-600 border border-cyan-400"></span>
            <span>Designated Shelter</span>
          </div>
        </div>
      </div>
    </div>
  );
};
