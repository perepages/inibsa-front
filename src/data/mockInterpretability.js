// src/data/mockInterpretability.js

/**
 * Generates mock interpretability data for a given company ID.
 * Since this is mock data, we will just return a generic timeseries
 * that looks realistic for a client that has suddenly stopped ordering.
 */
export function getMockInterpretabilityData(companyId) {
  // Let's create 60 days of history
  const history = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Constants for our mock data
  const normalPurchaseFrequency = 14; // Buys every ~14 days
  const movingThresholdBase = 20; 
  const frozenThresholdBase = 30;

  let lastPurchaseDayOffset = -60;

  for (let i = 60; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Simulate purchases at day -60, -45, -30
    // Then no purchases for 30 days (so they trigger an alert now)
    if (i === 60 || i === 45 || i === 30) {
      lastPurchaseDayOffset = -i;
    }

    const daysSincePurchase = (-i) - lastPurchaseDayOffset;

    // Build the data point
    const point = {
      date: dateStr,
      days_since_purchase: daysSincePurchase,
      moving_threshold: movingThresholdBase,
      frozen_threshold: frozenThresholdBase,
    };

    // Add markers
    if (i === 0) {
      point.is_current_date = true;
      point.is_alert_evaluated = true;
    }

    if (daysSincePurchase === frozenThresholdBase) {
      point.is_overdue_date = true;
      point.event = "Overdue";
    }

    // Mark previous alerts if they crossed the moving threshold without buying
    if (daysSincePurchase === movingThresholdBase) {
      point.is_past_triggered = true;
      point.event = "Soft Alert Triggered";
    }

    history.push(point);
  }

  return {
    company_id: companyId,
    typical_purchase_cadence: `El client compra habitualment cada ${normalPurchaseFrequency} dies`,
    timeseries: history
  };
}
