import { useState, useEffect, useMemo } from "react";
import { fetchAlerts } from "../services/api";

/**
 * Computes global KPIs by fetching all alerts once.
 * This ensures KPIs don't fluctuate when changing tabs or filtering locally.
 */
export function useKPIs() {
  const [allAlerts, setAllAlerts] = useState([]);
  const [loadingKPIs, setLoadingKPIs] = useState(true);

  useEffect(() => {
    // Revert the limit to 20 as requested
    fetchAlerts({ skip: 0, limit: 20, filter: "all" })
      .then(data => {
        setAllAlerts(data);
      })
      .catch(console.error)
      .finally(() => setLoadingKPIs(false));
  }, []);

  const kpis = useMemo(() => {
    if (!allAlerts.length) return { total_alerts: 20, urgent_alerts: 0, total_impact: 0, managed_count: 0 };
    return {
      total_alerts: 20, // Reverted to show exactly 20 as the fixed total
      urgent_alerts: allAlerts.filter(a => a.priority_score >= 7.0 && a.status !== "complete" && a.status !== "discarded").length,
      // Total impact only diminishes if complete or discarded
      total_impact: allAlerts
        .filter(a => a.status !== "complete" && a.status !== "discarded")
        .reduce((sum, a) => sum + (a.expected_return || 0), 0),
      managed_count: allAlerts.filter(a => a.status === "complete").length,
    };
  }, [allAlerts]);

  const updateKpiForStatusChange = (updatedAlert) => {
    setAllAlerts(prev => {
      const exists = prev.some(a => a.alert_id === updatedAlert.alert_id);
      if (exists) {
        return prev.map(a => a.alert_id === updatedAlert.alert_id ? updatedAlert : a);
      } else {
        // If an alert from a different filter wasn't in the initial 20 fetch, add it so KPIs track it
        return [...prev, updatedAlert];
      }
    });
  };

  return { kpis, loadingKPIs, updateKpiForStatusChange };
}