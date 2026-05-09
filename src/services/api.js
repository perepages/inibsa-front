// src/services/api.js
// Retention API — http://localhost:8000
// Docs: /docs (Swagger) | /redoc (ReDoc)
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

/**
 * GET /alerts?top_x={n}
 * Returns an array of prioritized client alerts.
 *
 * Response fields:
 *   company_id      string  — Unique client identifier
 *   location        string  — Province where the company is located
 *   reason          string  — Human-readable alert explanation
 *   priority_score  float   — 1.0–10.0 (10 = highest priority)
 *   expected_return float   — Estimated revenue in € from successful outreach
 *   confidence      float   — 0.0–1.0 reliability of purchase pattern
 */
export async function fetchAlerts({ top_x = 20 } = {}) {
  const { data } = await api.get("/alerts", { params: { top_x } });
  // Normalise: add a local `managed` flag for UI state tracking
  return data.map(alert => ({ ...alert, managed: false }));
}