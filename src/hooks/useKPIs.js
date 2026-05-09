export function useKPIs(alerts = []) {
    const activeAlerts = alerts.filter(a => !a.managed);

    const oppValue = activeAlerts
        .filter(a => a.alerta === "commodity")
        .reduce((sum, a) => sum + a.avg_price, 0);

    const riskValue = activeAlerts
        .filter(a => a.alerta === "technical")
        .reduce((sum, a) => sum + a.avg_price, 0);

    return { oppValue, riskValue };
}