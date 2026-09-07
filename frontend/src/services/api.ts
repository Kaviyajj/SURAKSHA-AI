import {
  DashboardResponse,
  Habitation,
  Shelter,
  ShelterAllocationResponse,
  RoadFeature,
  EvacuationPlanResponse,
  SimulationResponse,
  ChatResponse,
  ReportResponse
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Network error');
    throw new Error(`API Error (${res.status}): ${errorText}`);
  }
  return res.json();
}

export const api = {
  // Dashboard
  getDashboard: async (): Promise<DashboardResponse> => {
    const res = await fetch(`${API_BASE}/dashboard`);
    return handleResponse<DashboardResponse>(res);
  },

  // Habitations
  getHabitations: async (filters?: { hazard_type?: string; risk_level?: string; search?: string }): Promise<Habitation[]> => {
    const params = new URLSearchParams();
    if (filters?.hazard_type && filters.hazard_type !== 'All') params.append('hazard_type', filters.hazard_type);
    if (filters?.risk_level && filters.risk_level !== 'All') params.append('risk_level', filters.risk_level);
    if (filters?.search) params.append('search', filters.search);

    const url = `${API_BASE}/habitations${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url);
    return handleResponse<Habitation[]>(res);
  },

  getHabitationDetail: async (id: number): Promise<Habitation> => {
    const res = await fetch(`${API_BASE}/habitations/${id}`);
    return handleResponse<Habitation>(res);
  },

  getHabitationRisk: async (id: number) => {
    const res = await fetch(`${API_BASE}/habitations/${id}/risk`);
    return handleResponse<any>(res);
  },

  // Shelters
  getShelters: async (): Promise<Shelter[]> => {
    const res = await fetch(`${API_BASE}/shelters`);
    return handleResponse<Shelter[]>(res);
  },

  getShelterRecommendation: async (habitationId: number, affectedPopulation?: number): Promise<ShelterAllocationResponse> => {
    const params = affectedPopulation ? `?affected_population=${affectedPopulation}` : '';
    const res = await fetch(`${API_BASE}/shelters/recommend/${habitationId}${params}`);
    return handleResponse<ShelterAllocationResponse>(res);
  },

  // Routing
  getRoadNetwork: async (): Promise<RoadFeature[]> => {
    const res = await fetch(`${API_BASE}/routing/roads`);
    return handleResponse<RoadFeature[]>(res);
  },

  planEvacuationRoute: async (payload: {
    habitation_id: number;
    shelter_id: number;
    avoid_blocked_roads?: boolean;
    consider_hazard_proximity?: boolean;
  }): Promise<EvacuationPlanResponse> => {
    const res = await fetch(`${API_BASE}/routing/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        avoid_blocked_roads: true,
        consider_hazard_proximity: true,
        ...payload
      })
    });
    return handleResponse<EvacuationPlanResponse>(res);
  },

  // Simulation
  runSimulation: async (payload: {
    scenario_name?: string;
    rainfall_delta_pct: number;
    river_level_delta_m: number;
    road_blockage_level: string;
    custom_blocked_road_ids?: number[];
  }): Promise<SimulationResponse> => {
    const res = await fetch(`${API_BASE}/simulation/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenario_name: payload.scenario_name || 'What-If Disaster Escalation',
        ...payload
      })
    });
    return handleResponse<SimulationResponse>(res);
  },

  getSimulationPresets: async () => {
    const res = await fetch(`${API_BASE}/simulation/presets`);
    return handleResponse<any[]>(res);
  },

  // RAG Chat & Documents
  sendChatMessage: async (query: string): Promise<ChatResponse> => {
    const res = await fetch(`${API_BASE}/rag/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    return handleResponse<ChatResponse>(res);
  },

  getIndexedDocuments: async () => {
    const res = await fetch(`${API_BASE}/rag/documents`);
    return handleResponse<any>(res);
  },

  uploadDocument: async (formData: FormData) => {
    const res = await fetch(`${API_BASE}/rag/upload`, {
      method: 'POST',
      body: formData
    });
    return handleResponse<any>(res);
  },

  // Hazards & Rivers GeoJSON
  getRiversGeoJSON: async () => {
    const res = await fetch(`${API_BASE}/hazards/rivers`);
    return handleResponse<any>(res);
  },

  getHazardsSummary: async () => {
    const res = await fetch(`${API_BASE}/hazards/summary`);
    return handleResponse<any>(res);
  },

  // Reports
  generateReport: async (payload: {
    title?: string;
    officer_name?: string;
    jurisdiction?: string;
    include_critical_only?: boolean;
    custom_notes?: string;
  }): Promise<ReportResponse> => {
    const res = await fetch(`${API_BASE}/reports/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse<ReportResponse>(res);
  }
};
