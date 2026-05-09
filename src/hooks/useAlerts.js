// src/hooks/useAlerts.js
import { useState } from "react";
import { mockAlerts } from "../data/mockAlerts";

export function useAlerts() {
    const [alerts, setAlerts] = useState(mockAlerts);

    // Per treure errors de "loading", el simulem a false. 
    // Així quan poseu l'API de Vulture només caldrà afegir un useState(false) de veritat.
    const loading = false;
    const error = null;

    const markAsManaged = (alertId) => {
        setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, managed: true } : a));
    };

    return { alerts, loading, error, markAsManaged };
}