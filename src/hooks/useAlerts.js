// src/hooks/useAlerts.js
import { useState, useEffect, useCallback } from "react";
import { fetchAlerts, updateAlert } from "../services/api";

export function useAlerts(filters = {}) {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const filtersKey = JSON.stringify(filters);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchAlerts(filters);
            setAlerts(data);
        } catch (err) {
            setError("No s'han pogut carregar les alertes. Comprova la connexió.");
            console.error(err);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtersKey]);

    useEffect(() => { load(); }, [load]);

    // Marca una alerta com gestionada (optimistic update)
    const markAsManaged = useCallback(async (alertId, outcome) => {
        // Actualitza localment primer (optimistic)
        setAlerts(prev =>
            prev.map(a => a.id === alertId ? { ...a, managed: true, outcome } : a)
        );
        try {
            await updateAlert(alertId, { managed: true, outcome });
        } catch (err) {
            // Reverteix si falla
            setAlerts(prev =>
                prev.map(a => a.id === alertId ? { ...a, managed: false, outcome: null } : a)
            );
            console.error("Error actualitzant alerta:", err);
        }
    }, []);

    return { alerts, loading, error, refetch: load, markAsManaged };
}