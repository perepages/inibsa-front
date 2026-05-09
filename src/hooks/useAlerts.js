import { useState } from "react";
import { mockAlerts } from "../data/mockAlerts";

export function useAlerts() {
    const [alerts, setAlerts] = useState(mockAlerts);

    const markAsManaged = (alertId) => {
        setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, managed: true } : a));
    };

    return { alerts, markAsManaged };
}