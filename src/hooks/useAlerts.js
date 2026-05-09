// src/hooks/useAlerts.js
import { useState, useEffect, useCallback } from "react";
import { fetchAlerts, updateAlert } from "../services/api";

export function useAlerts(filters = {}) {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const filtersKey = JSON.stringify(filters);

    const load = useCallback(async () => {
        setLoading(true); setError(null);
        try { setAlerts(await fetchAlerts(filters)); }
        catch { setError("No s'han pogut carregar les alertes."); }
        finally { setLoading(false); }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtersKey]);

    useEffect(() => { load(); }, [load]);

    const markAsManaged = useCallback(async (alertId, outcome) => {
        setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, managed: true, outcome } : a));
        try { await updateAlert(alertId, { managed: true, outcome }); }
        catch { setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, managed: false, outcome: null } : a)); }
    }, []);

    return { alerts, loading, error, refetch: load, markAsManaged };
}