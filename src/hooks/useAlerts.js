// src/hooks/useAlerts.js
import { useState, useEffect, useCallback } from "react";
import { fetchAlerts } from "../services/api";

/**
 * Fetches prioritized alerts from the real API and manages local UI state.
 * Real API fields per alert:
 *   company_id, location, reason, priority_score (1–10),
 *   expected_return (€), confidence (0–1), managed (local UI flag)
 */
export function useAlerts({ top_x = 20 } = {}) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAlerts({ top_x });
      setAlerts(data);
    } catch (err) {
      console.error("Error fetching alerts:", err);
      setError("No s'han pogut carregar les alertes. Comprova que l'API està activa a http://208.85.19.72:8000");
    } finally {
      setLoading(false);
    }
  }, [top_x]);

  useEffect(() => {
    load();
  }, [load]);

  // Mark an alert as managed locally (no PATCH endpoint in the API)
  const markAsManaged = useCallback((companyId) => {
    setAlerts(prev =>
      prev.map(a => a.company_id === companyId ? { ...a, managed: true } : a)
    );
  }, []);

  return { alerts, loading, error, refetch: load, markAsManaged };
}