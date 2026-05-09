// src/hooks/useAlerts.js
import { useState, useEffect, useCallback, useRef } from "react";
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
  
  // Use a ref to track the last top_x we successfully fetched to avoid redundant calls
  const lastFetchedTopX = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`[useAlerts] Fetching data (top_x: ${top_x})...`);
      const data = await fetchAlerts({ top_x });
      setAlerts(data);
      lastFetchedTopX.current = top_x;
    } catch (err) {
      console.error("Error fetching alerts:", err);
      setError("No s'han pogut carregar les alertes. Comprova que l'API està activa a http://localhost:8000");
    } finally {
      setLoading(false);
    }
  }, [top_x]);

  useEffect(() => {
    // Only fetch automatically if we haven't fetched for this top_x yet
    if (lastFetchedTopX.current !== top_x) {
      load();
    }
  }, [top_x, load]);

  // Mark an alert as managed locally (no PATCH endpoint in the API)
  const markAsManaged = useCallback((companyId) => {
    setAlerts(prev =>
      prev.map(a => a.company_id === companyId ? { ...a, managed: true } : a)
    );
  }, []);

  return { alerts, loading, error, refetch: load, markAsManaged };
}