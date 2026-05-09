// src/services/api.js
import axios from "axios";
import { mockAlerts, mockKPIs } from "../data/mockAlerts";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const USE_MOCK = true; // canvia a false quan el backend estigui llest

const api = axios.create({ baseURL: BASE_URL, timeout: 8000 });
const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

export async function fetchAlerts(filters = {}) {
    if (USE_MOCK) {
        await delay();
        let data = [...mockAlerts];
        if (filters.urgency && filters.urgency !== "all") data = data.filter(a => a.urgency === filters.urgency);
        if (filters.type === "commodity") data = data.filter(a => a.alert_type.startsWith("commodity"));
        if (filters.type === "technical") data = data.filter(a => a.alert_type.startsWith("technical"));
        return data.sort((a, b) => b.priority_score - a.priority_score);
    }
    const { data } = await api.get("/api/alerts", { params: filters });
    return data;
}

export async function updateAlert(alertId, payload) {
    if (USE_MOCK) {
        await delay(300);
        const alert = mockAlerts.find(a => a.id === alertId);
        if (alert) Object.assign(alert, payload);
        return alert;
    }
    const { data } = await api.patch(`/api/alerts/${alertId}`, payload);
    return data;
}

export async function fetchKPIs() {
    if (USE_MOCK) {
        await delay(200);
        return { ...mockKPIs, managed_count: mockAlerts.filter(a => a.managed).length };
    }
    const { data } = await api.get("/api/kpis");
    return data;
}