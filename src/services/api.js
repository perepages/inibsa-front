// src/services/api.js
// Retention API — http://localhost:8000
// Docs: /docs (Swagger) | /redoc (ReDoc)
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://208.85.19.72:8000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
  headers: { "Content-Type": "application/json" },
});

/**
 * GET /alerts?skip={n}&limit={m}&filter={f}
 * Returns an array of prioritized client alerts.
 */
export async function fetchAlerts({ skip = 0, limit = 20, filter = "all" } = {}) {
  const { data } = await api.get("/alerts", { params: { skip, limit, filter } });
  return data;
}

/**
 * GET /api/alerts/{alert_id}/interpretability
 * Returns the interpretability graph data for a specific client.
 */
export async function fetchInterpretability(alertId) {
  const { data } = await api.get(`/api/alerts/${alertId}/interpretability`);
  return data;
}

/**
 * PUT /api/alerts/{alert_id}/status
 * Updates the status of an alert.
 * status: "new" | "wip" | "complete" | "discarded"
 */
export async function updateAlertStatus(alertId, status) {
  const { data } = await api.put(`/api/alerts/${alertId}/status`, { status });
  return data;
}