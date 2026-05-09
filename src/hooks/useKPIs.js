// src/hooks/useKPIs.js
import { useState, useEffect } from "react";
import { fetchKPIs } from "../services/api";

export function useKPIs(alerts = []) {
    const [kpis, setKpis] = useState(null);

    useEffect(() => {
        if (!alerts.length) return;
        setKpis({
            total_alerts: alerts.length,
            urgent_alerts: alerts.filter(a => a.urgency === "urgent").length,
            total_impact: alerts.reduce((s, a) => s + a.economic_impact, 0),
            managed_count: alerts.filter(a => a.managed).length,
        });
    }, [alerts]);

    useEffect(() => {
        const tick = async () => { try { setKpis(await fetchKPIs()); } catch { /* silenciós */ } };
        tick();
        const id = setInterval(tick, 30000);
        return () => clearInterval(id);
    }, []);

    return kpis;
}