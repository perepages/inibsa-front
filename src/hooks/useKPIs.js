// src/hooks/useKPIs.js
import { useState, useEffect } from "react";
import { fetchKPIs } from "../services/api";

export function useKPIs(alerts = []) {
    const [kpis, setKpis] = useState(null);

    // Recalcula els KPIs localment quan canvien les alertes (més ràpid que polling)
    useEffect(() => {
        if (!alerts.length) return;
        setKpis({
            total_alerts: alerts.length,
            urgent_alerts: alerts.filter(a => a.urgency === "urgent").length,
            total_impact: alerts.reduce((s, a) => s + a.economic_impact, 0),
            managed_count: alerts.filter(a => a.managed).length,
            avg_conversion: Math.round(
                alerts.reduce((s, a) => s + a.conversion_probability, 0) / alerts.length * 100
            ),
        });
    }, [alerts]);

    // Polling al backend cada 30s per mantenir sincronia
    useEffect(() => {
        const tick = async () => {
            try {
                const data = await fetchKPIs();
                setKpis(data);
            } catch { /* silenciós si falla */ }
        };
        tick();
        const interval = setInterval(tick, 30000);
        return () => clearInterval(interval);
    }, []);

    return kpis;
}