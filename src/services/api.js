// src/services/api.js
// Totes les crides al backend centralitzades aquí.
// Quan el backend estigui llest, només cal canviar VITE_API_URL al fitxer .env

import axios from "axios";
import { mockAlerts, mockKPIs } from "../data/mockAlerts";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Canvia a false quan el backend del teu company estigui llest
const USE_MOCK = true;

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 8000,
    headers: { "Content-Type": "application/json" },
});

// Simula un petit delay per fer el mock més realista
const delay = (ms = 400) => new Promise(res => setTimeout(res, ms));

// ─── ALERTES ─────────────────────────────────────────────────────────────────

export async function fetchAlerts(filters = {}) {
    if (USE_MOCK) {
        await delay();
        let data = [...mockAlerts];
        if (filters.urgency && filters.urgency !== "all")
            data = data.filter(a => a.urgency === filters.urgency);
        if (filters.type && filters.type !== "all")
            data = data.filter(a =>
                filters.type === "commodity"
                    ? a.alert_type.startsWith("commodity")
                    : a.alert_type.startsWith("technical")
            );
        if (filters.managed !== undefined)
            data = data.filter(a => a.managed === filters.managed);
        return data.sort((a, b) => b.priority_score - a.priority_score);
    }
    const { data } = await api.get("/api/alerts", { params: filters });
    return data;
}

export async function fetchAlertById(alertId) {
    if (USE_MOCK) {
        await delay(200);
        return mockAlerts.find(a => a.id === alertId) || null;
    }
    const { data } = await api.get(`/api/alerts/${alertId}`);
    return data;
}

export async function updateAlert(alertId, payload) {
    // payload: { managed: true, outcome: "contacted" | "no_answer" | "sold" | "not_interested" }
    if (USE_MOCK) {
        await delay(300);
        const alert = mockAlerts.find(a => a.id === alertId);
        if (alert) Object.assign(alert, payload);
        return alert;
    }
    const { data } = await api.patch(`/api/alerts/${alertId}`, payload);
    return data;
}

// ─── KPIs ─────────────────────────────────────────────────────────────────────

export async function fetchKPIs() {
    if (USE_MOCK) {
        await delay(200);
        const managed = mockAlerts.filter(a => a.managed).length;
        return { ...mockKPIs, managed_count: managed };
    }
    const { data } = await api.get("/api/kpis");
    return data;
}

// ─── CLIENTS ─────────────────────────────────────────────────────────────────

export async function fetchClientHistory(clientId) {
    if (USE_MOCK) {
        await delay(300);
        return { client_id: clientId, history: [] }; // ampliar quan calgui
    }
    const { data } = await api.get(`/api/clients/${clientId}`);
    return data;
}