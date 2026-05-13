// src/hooks/useAlerts.js
import { useState, useEffect, useCallback, useRef } from "react";
import { fetchAlerts, updateAlertStatus } from "../services/api";

/**
 * Fetches prioritized alerts from the real API and manages local UI state.
 * Real API fields per alert:
 *   company_id, location, reason, priority_score (1–10),
 *   expected_return (€), confidence (0–1), managed (local UI flag)
 */
export function useAlerts({ page = 1, limit = 20, filter = "all", onStatusChange } = {}) {
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
      setLoading(true);
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

  const changeAlertStatus = useCallback(async (alertId, newStatus) => {
    let shouldRemoveLocal = false;
    let fullAlert = null;

    setAlerts(prev => {
      fullAlert = prev.find(a => a.alert_id === alertId);
      const filter = lastFetchedFilter.current;
      let shouldRemove = false;
      
      if (filter === "new" && newStatus !== "new") shouldRemove = true;
      if (filter === "all" && newStatus !== "new") shouldRemove = true;
      if (filter === "urgent" && newStatus !== "new") shouldRemove = true;
      if (filter === "wip" && newStatus !== "wip") shouldRemove = true;
      if (filter === "done" && newStatus !== "complete") shouldRemove = true;
      if (filter === "discarded" && newStatus !== "discarded") shouldRemove = true;

      shouldRemoveLocal = shouldRemove;

      return prev.map(a => 
        a.alert_id === alertId ? { ...a, status: newStatus, isExiting: shouldRemove } : a
      );
    });

    if (onStatusChange && fullAlert) {
      onStatusChange({ ...fullAlert, status: newStatus });
    }

    if (shouldRemoveLocal) {
      setTimeout(() => {
        setAlerts(prev => prev.filter(a => a.alert_id !== alertId));
      }, 350); // wait for exit animation to complete
    }

    try {
      await updateAlertStatus(alertId, newStatus);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  }, []);

  return { alerts, loading, error, refetch: load, changeAlertStatus };
}