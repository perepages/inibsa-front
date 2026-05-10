// src/hooks/useKPIs.js
import { useMemo } from "react";

/**
 * Computes KPIs directly from the live alert data.
 * priority_score is 1.0–10.0; we treat >= 7.0 as "urgent".
 * expected_return is the revenue in €.
 */
export function useKPIs(alerts = []) {
  return useMemo(() => {
    if (!alerts.length) return null;
    return {
      total_alerts: alerts.length,
      // priority_score scale: 1–10. Treat >= 7 as high priority
      urgent_alerts: alerts.filter(a => a.priority_score >= 7.0).length,
      // Sum of expected_return across active (non-managed) alerts
      total_impact: alerts
        .filter(a => a.status !== "complete" && a.status !== "discarded")
        .reduce((sum, a) => sum + (a.expected_return || 0), 0),
      managed_count: alerts.filter(a => a.status === "complete").length,
    };
  }, [alerts]);
}