// src/hooks/useKPIs.js
import { useState, useEffect } from "react";

export function useKPIs(alerts = []) {
    const [kpis, setKpis] = useState(null);

    useEffect(() => {
        if (!alerts.length) return;
        setKpis({
            total_alerts: alerts.length,
            urgent_alerts: alerts.filter(a => a.priority >= 80).length,
            total_impact: alerts.reduce((s, a) => s + a.avg_price, 0),
            managed_count: alerts.filter(a => a.managed).length,
        });
    }, [alerts]);

    return kpis;
}