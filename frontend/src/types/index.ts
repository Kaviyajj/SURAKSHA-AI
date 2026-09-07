export interface FactorContribution {
  name: string;
  weight: number;
  raw_value: number;
  unit: string;
  normalized_score: number;
  impact_level: string; // Low, Medium, High, Critical
  description: string;
}

export interface Habitation {
  id: number;
  name: string;
  district: string;
  latitude: number;
  longitude: number;
  population: number;
  vulnerable_population: number;
  elderly_count: number;
  children_count: number;
  disabled_count: number;
  rainfall: number;
  elevation: number;
  slope: number;
  river_distance: number;
  infrastructure_score: number;
  road_accessibility: number;
  distance_to_medical: number;
  historical_risk: number;
  hazard_type: string;
  risk_score: number;
  risk_level: string;
  risk_color: string;
  factor_contributions: FactorContribution[];
  explanation: string;
}

export interface Shelter {
  id: number;
  name: string;
  shelter_type: string;
  latitude: number;
  longitude: number;
  total_capacity: number;
  current_occupancy: number;
  available_capacity: number;
  occupancy_rate: number;
  hazard_risk: number;
  hazard_risk_level: string;
  road_accessibility: number;
  medical_distance: number;
  has_generator: boolean;
  has_water_filtration: boolean;
  has_medical_staff: boolean;
  is_active: boolean;
}

export interface ShelterRecommendationItem {
  shelter_id: number;
  shelter_name: string;
  shelter_type: string;
  latitude: number;
  longitude: number;
  total_capacity: number;
  current_occupancy: number;
  available_capacity: number;
  distance_km: number;
  estimated_travel_time_min: number;
  suitability_score: number;
  rank: number;
  safety_rating: string;
  allocated_population: number;
  reason: string;
}

export interface ShelterAllocationResponse {
  habitation_id: number;
  habitation_name: string;
  affected_population: number;
  is_overflow: boolean;
  total_allocated: number;
  unallocated_count: number;
  primary_recommendation: ShelterRecommendationItem | null;
  distribution_plan: ShelterRecommendationItem[];
  decision_summary: string;
}

export interface RouteStep {
  instruction: string;
  distance_km: number;
  duration_min: number;
  hazard_warning?: string | null;
}

export interface EvacuationPlanResponse {
  origin_id: number;
  origin_name: string;
  origin_coords: [number, number];
  destination_id: number;
  destination_name: string;
  destination_coords: [number, number];
  total_distance_km: number;
  estimated_travel_time_min: number;
  route_safety_score: number;
  safety_tier: string;
  blocked_roads_avoided: number;
  hazard_zones_bypassed: string[];
  route_geometry: [number, number][];
  turn_by_turn: RouteStep[];
  routing_algorithm: string;
  explanation: string;
}

export interface RoadFeature {
  id: number;
  name: string;
  road_type: string;
  is_blocked: boolean;
  blockage_reason: string;
  road_condition: string;
  geometry: [number, number][];
}

export interface EscalatedHabitation {
  id: number;
  name: string;
  previous_risk_score: number;
  simulated_risk_score: number;
  previous_risk_level: string;
  simulated_risk_level: string;
  population: number;
  vulnerable_population: number;
  escalation_type: string;
  primary_trigger: string;
}

export interface SimulationResponse {
  simulation_id: number;
  scenario_name: string;
  parameters: {
    rainfall_delta_pct: number;
    river_level_delta_m: number;
    road_blockage_level: string;
    simulated_blocked_roads: number[];
  };
  before_critical_count: number;
  after_critical_count: number;
  critical_delta: number;
  before_high_count: number;
  after_high_count: number;
  before_pop_at_risk: number;
  after_pop_at_risk: number;
  pop_at_risk_delta: number;
  before_shelter_capacity_available: number;
  after_shelter_capacity_available: number;
  escalations: EscalatedHabitation[];
  affected_habitations: any[];
  simulated_blocked_roads: number[];
  actionable_summary: string;
}

export interface SourceCitation {
  document_id: number;
  document_title: string;
  category: string;
  snippet: string;
  relevance_score: number;
}

export interface ChatResponse {
  query: string;
  answer: string;
  sources: SourceCitation[];
  confidence_level: string;
  is_knowledge_base_supported: boolean;
  disclaimer: string;
}

export interface AlertItem {
  id: string;
  severity: string;
  habitation_id?: number | null;
  habitation_name?: string | null;
  title: string;
  message: string;
  timestamp: string;
  recommended_action: string;
}

export interface DashboardKPIs {
  total_habitations: number;
  critical_zones_count: number;
  high_risk_count: number;
  moderate_risk_count: number;
  low_risk_count: number;
  total_monitored_population: number;
  vulnerable_population_total: number;
  population_at_risk: number;
  total_shelters: number;
  total_shelter_capacity: number;
  total_shelter_occupied: number;
  available_shelter_capacity: number;
  shelter_utilization_pct: number;
  active_evacuations_count: number;
  blocked_roads_count: number;
  system_status: string;
  active_scenario: string;
  is_demo_mode: boolean;
}

export interface DashboardResponse {
  kpis: DashboardKPIs;
  active_alerts: AlertItem[];
  risk_distribution: Record<string, number>;
  hazard_type_breakdown: Record<string, number>;
  top_critical_habitations: any[];
  recent_activity: any[];
}

export interface ReportResponse {
  report_id: string;
  generated_at: string;
  title: string;
  officer_name: string;
  jurisdiction: string;
  status: string;
  critical_habitations_count: number;
  population_at_risk: number;
  vulnerable_individuals: number;
  assigned_shelters_count: number;
  shelter_capacity_allocated: number;
  total_evacuation_routes: number;
  critical_habitations: any[];
  shelter_allocations: any[];
  evacuation_routes: any[];
  action_directives: string[];
  standard_operating_procedures: string[];
  disclaimer: string;
}
