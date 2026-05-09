// src/data/mockAlerts.js
export const mockAlerts = [
    {
        id: "Clínica Dental Verdaguer",
        location: "Barcelona, Eixample",
        alerta: "commodity",
        motivo: "Sense compra fa 18 dies. Cicle esperat: 12 dies. Possible desviament a competència detectat per sota del potencial estimat.",
        priority: 91,
        avg_price: 420,
        confidence: 0.78,
        managed: false
    },
    {
        id: "Ortodoncia Sants",
        location: "Barcelona, Sants",
        alerta: "technical",
        motivo: "Caiguda del 60% en volum vs. últims 3 mesos. Senyal de possible canvi de proveïdor.",
        priority: 88,
        avg_price: 1200,
        confidence: 0.65,
        managed: false
    },
    {
        id: "Centre Dental Gràcia",
        location: "Barcelona, Gràcia",
        alerta: "commodity",
        motivo: "Estoc estimat proper a l'esgotament. Finestra òptima de comanda: avui o demà.",
        priority: 74,
        avg_price: 180,
        confidence: 0.91,
        managed: false
    }
];

export const mockKPIs = {
    total_alerts: mockAlerts.length,
    urgent_alerts: mockAlerts.filter(a => a.priority >= 80).length,
    total_impact: mockAlerts.reduce((s, a) => s + a.avg_price, 0),
    managed_count: 0,
};