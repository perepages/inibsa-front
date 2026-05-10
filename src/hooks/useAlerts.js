// src/hooks/useAlerts.js
import { useState, useEffect, useCallback, useRef } from "react";
import { fetchAlerts, updateAlertStatus } from "../services/api";

/**
 * Fetches prioritized alerts from the real API and manages local UI state.
 * Real API fields per alert:
 *   company_id, location, reason, priority_score (1–10),
 *   expected_return (€), confidence (0–1), managed (local UI flag)
 */
export function useAlerts({ page = 1, limit = 20, filter = "all" } = {}) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const lastFetchedPage = useRef(null);
  const lastFetchedFilter = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const skip = (page - 1) * limit;
      console.log(`[useAlerts] Fetching page ${page} (skip: ${skip}, limit: ${limit}, filter: ${filter})...`);
      const data = await fetchAlerts({ skip, limit, filter });
      setAlerts(data);
      lastFetchedPage.current = page;
      lastFetchedFilter.current = filter;
    } catch (err) {
      console.error("Error fetching alerts:", err);
      setError("No s'han pogut carregar les alertes. Comprova que l'API està activa a http://localhost:8000");
    } finally {
      setLoading(false);
    }
  }, [page, limit, filter]);

  useEffect(() => {
    if (lastFetchedPage.current !== page || lastFetchedFilter.current !== filter) {
      load();
    }
  }, [page, filter, load]);

  // Change the status of an alert with an optimistic UI update
  const changeAlertStatus = useCallback(async (alertId, newStatus) => {
    setAlerts(prev =>
      prev.map(a => a.alert_id === alertId ? { ...a, status: newStatus } : a)
    );
    try {
      await updateAlertStatus(alertId, newStatus);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  }, []);

  return { alerts, loading, error, refetch: load, changeAlertStatus };
}