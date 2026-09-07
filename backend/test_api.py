from fastapi.testclient import TestClient
from app.main import app

def test_full_pipeline():
    with TestClient(app) as client:
        print("--- 1. Testing Root API ---")
        r = client.get("/")
        assert r.status_code == 200
        print("Root API OK:", r.json()["system"])

        print("--- 2. Testing Dashboard API ---")
        r = client.get("/api/dashboard")
        assert r.status_code == 200
        data = r.json()
        print(f"Total Habitations: {data['kpis']['total_habitations']}, Critical: {data['kpis']['critical_zones_count']}, Shelters: {data['kpis']['total_shelters']}")

        print("--- 3. Testing Habitations API ---")
        r = client.get("/api/habitations")
        assert r.status_code == 200
        habs = r.json()
        assert len(habs) == 50
        print(f"Loaded {len(habs)} habitations successfully. First: {habs[0]['name']} - Risk: {habs[0]['risk_score']} ({habs[0]['risk_level']})")

        print("--- 4. Testing Habitation Risk Breakdown ---")
        r = client.get("/api/habitations/1/risk")
        assert r.status_code == 200
        risk_info = r.json()
        print("Risk Factor count:", len(risk_info["factor_contributions"]))
        print("Explanation:", risk_info["explanation"][:80] + "...")

        print("--- 5. Testing Shelter Recommendation & Knapsack Allocation ---")
        r = client.get("/api/shelters/recommend/1")
        assert r.status_code == 200
        alloc = r.json()
        print("Shelter Rec Target:", alloc["habitation_name"], "Affected Pop:", alloc["affected_population"])
        print("Top Rec:", alloc["primary_recommendation"]["shelter_name"], f"Suitability: {alloc['primary_recommendation']['suitability_score']}%")
        print("Is Overflow:", alloc["is_overflow"])

        print("--- 6. Testing Evacuation Routing ---")
        route_payload = {
            "habitation_id": 1,
            "shelter_id": 1,
            "avoid_blocked_roads": True,
            "consider_hazard_proximity": True
        }
        r = client.post("/api/routing/plan", json=route_payload)
        assert r.status_code == 200
        route_data = r.json()
        print(f"Route: {route_data['origin_name']} -> {route_data['destination_name']} | Dist: {route_data['total_distance_km']} km | Time: {route_data['estimated_travel_time_min']} min | Safety: {route_data['route_safety_score']}%")

        print("--- 7. Testing What-If Simulation Lab ---")
        sim_payload = {
            "scenario_name": "Monsoon Cloudburst +30%",
            "rainfall_delta_pct": 30.0,
            "river_level_delta_m": 2.0,
            "road_blockage_level": "Moderate"
        }
        r = client.post("/api/simulation/run", json=sim_payload)
        assert r.status_code == 200
        sim_res = r.json()
        print(f"Simulation Before Critical: {sim_res['before_critical_count']} -> After: {sim_res['after_critical_count']} (Delta: +{sim_res['critical_delta']})")
        print(f"Escalated Habitations Count: {len(sim_res['escalations'])}")

        print("--- 8. Testing RAG SURAKSHA ASSIST Chat ---")
        chat_payload = {"query": "What should authorities do when a habitation becomes critical?"}
        r = client.post("/api/rag/chat", json=chat_payload)
        assert r.status_code == 200
        chat_res = r.json()
        print(f"Chat Confidence: {chat_res['confidence_level']}")
        print(f"Source Citations: {len(chat_res['sources'])} sources cited.")
        print("Answer Preview:", chat_res["answer"][:100] + "...")

        print("--- 9. Testing Reports Generation ---")
        report_payload = {
            "title": "Emergency Relocation Operational Directive",
            "officer_name": "Commander K. Sharma",
            "jurisdiction": "Nilgiri Basin Command"
        }
        r = client.post("/api/reports/generate", json=report_payload)
        assert r.status_code == 200
        report_res = r.json()
        print(f"Report Generated ID: {report_res['report_id']}, Critical Habitations in Report: {report_res['critical_habitations_count']}")

        print("\n=== ALL 9 BACKEND INTEGRATION TESTS PASSED PERFECTLY! ===")

if __name__ == "__main__":
    test_full_pipeline()
