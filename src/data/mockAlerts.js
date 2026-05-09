// src/data/mockAlerts.js

export const mockAlerts = [
    {
        id: "Clínica Dental Barcelona",
        location: "Barcelona, Eixample",
        alerta: "commodity",
        motivo: "S'ha detectat un buit de consum esperat. Estoc probablement esgotat.",
        priority: 95,
        avg_price: 1200,
        confidence: 0.85,
        managed: false
    },
    {
        id: "OdontoPlus Madrid",
        location: "Madrid, Centro",
        alerta: "technical",
        motivo: "Caiguda sobtada de la freqüència de compra. Se sospita activitat de la competència.",
        priority: 65,
        avg_price: 4500,
        confidence: 0.40,
        managed: false
    },
    {
        id: "Centre Dental Gràcia",
        location: "Barcelona, Gràcia",
        alerta: "commodity",
        motivo: "Canvi en el patró de compra de productes d'anestèsia recurrent.",
        priority: 85,
        avg_price: 850,
        confidence: 0.92,
        managed: false
    }
];