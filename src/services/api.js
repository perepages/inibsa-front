// src/services/api.js
import axios from "axios";
import { mockAlerts, mockKPIs } from "../data/mockAlerts";

// CONFIGURACIÓ DE VULTURE
// Apunta a l'URL de l'API o Webhook que us ofereix Vulture.
const BASE_URL = import.meta.env.VITE_VULTURE_API_URL || "https://la-teva-api-vulture.com";
const USE_MOCK = true; // IMPORTANT: Quan vulguis dades reals de Vulture, posa això a 'false'

const api = axios.create({ baseURL: BASE_URL, timeout: 8000 });
const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

export async function fetchAlerts(filters = {}) {
    if (USE_MOCK) {
        await delay();
        let data = [...mockAlerts];
        if (filters.priority === "urgent") data = data.filter(a => a.priority >= 80);
        if (filters.type === "commodity") data = data.filter(a => a.alerta.startsWith("commodity"));
        if (filters.type === "technical") data = data.filter(a => a.alerta.startsWith("technical"));
        return data.sort((a, b) => b.priority - a.priority);
    }

    // DEMANAR DADES AL DASHBOARD DE VULTURE:
    const { data } = await api.get("/api/v1/alerts", { params: filters });
    return data;
}

export async function updateAlert(alertId, payload) {
    if (USE_MOCK) {
        await delay(300);
        const alert = mockAlerts.find(a => a.id === alertId);
        if (alert) Object.assign(alert, payload);
        return alert;
    }

    // ENVIAR ACTUALITZACIÓ AL DASHBOARD DE VULTURE:
    const { data } = await api.patch(`/api/v1/alerts/${alertId}`, payload);
    return data;
}

export async function fetchKPIs() {
    if (USE_MOCK) {
        await delay(200);
        return { ...mockKPIs, managed_count: mockAlerts.filter(a => a.managed).length };
    }
    const { data } = await api.get("/api/v1/kpis");
    return data;
}