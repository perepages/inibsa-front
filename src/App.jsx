// src/App.jsx
import { useState } from "react";
import { useAlerts } from "./hooks/useAlerts";
import { useKPIs } from "./hooks/useKPIs";
import "./App.css";

export default function App() {
  const { alerts, markAsManaged } = useAlerts();
  const kpis = useKPIs(alerts);
  const [filter, setFilter] = useState("all");

  const visibleAlerts = alerts.filter(a => {
    if (a.managed) return false;
    if (filter === "commodity") return a.alerta === "commodity";
    if (filter === "technical") return a.alerta === "technical";
    return true;
  });

  return (
    <div className="app-container">
      {/* NAVBAR MATCHING SCREENSHOT */}
      <nav className="navbar">
        <div className="navbar-left">
          <div className="nav-logo">I</div>
          <span className="nav-title">Inibsa Smart Demand Signals</span>
        </div>
        <div className="navbar-right">
          <span className="nav-division">Spain Division</span>
          <div className="nav-avatar">SR</div>
        </div>
      </nav>

      <main className="main-content">
        <h1 className="page-title">Resum del Matí</h1>

        {/* OVERVIEW CARDS */}
        <div className="overview-grid">
          <div className="overview-card">
            <div className="card-label">Oportunitat (Commodities)</div>
            <div className="card-value">€{kpis.oppValue.toLocaleString()}</div>
            <div className="card-trend positive">+12% vs últim mes</div>
          </div>

          <div className="overview-card">
            <div className="card-label">Ingressos en Risc (Tècnics)</div>
            <div className="card-value">€{kpis.riskValue.toLocaleString()}</div>
            <div className="card-trend negative">Atenció crítica necessària</div>
          </div>

          <div className="overview-card health-card">
            <div className="card-label">Estat dels Clients</div>
            <div className="health-bar-row">
              <span className="health-label">Lleials</span>
              <div className="bar-track"><div className="bar-fill green" style={{ width: '70%' }}></div></div>
            </div>
            <div className="health-bar-row">
              <span className="health-label">Promiscus</span>
              <div className="bar-track"><div className="bar-fill orange" style={{ width: '45%' }}></div></div>
            </div>
            <div className="health-bar-row">
              <span className="health-label">Marginals</span>
              <div className="bar-track"><div className="bar-fill red" style={{ width: '25%' }}></div></div>
            </div>
          </div>
        </div>

        {/* INBOX SECTION */}
        <div className="inbox-container">
          <div className="inbox-header">
            <h2>Bústia de Senyals Intel·ligents</h2>
            <select className="inbox-filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">Totes les Alertes</option>
              <option value="commodity">Oportunitats (Commodity)</option>
              <option value="technical">Risc (Tècnic)</option>
            </select>
          </div>

          <div className="inbox-list">
            {visibleAlerts.length === 0 && <div className="empty-state">Tot al dia! No hi ha alertes pendents.</div>}

            {visibleAlerts.map(alert => (
              <div key={alert.id} className="alert-row">
                <div className="alert-main">
                  <div className="alert-title-group">
                    <h3 className="alert-id">{alert.id}</h3>
                    <span className="alert-location">{alert.location}</span>
                  </div>
                  <p className="alert-motivo">{alert.motivo}</p>

                  <div className="alert-metrics">
                    <span className="metric-price">€{alert.avg_price.toLocaleString()} avg price</span>
                    <span className="metric-conf">{(alert.confidence * 100).toFixed(0)}% de confiança</span>
                  </div>
                </div>

                <div className="alert-side">
                  <div className="alert-badges">
                    {alert.alerta === "commodity"
                      ? <span className="badge badge-opp">Oportunitat</span>
                      : <span className="badge badge-risk">Risc de Fuga</span>
                    }
                    {alert.priority >= 80
                      ? <span className="badge badge-high">URGÈNCIA ALTA ({alert.priority})</span>
                      : <span className="badge badge-med">URGÈNCIA MITJA ({alert.priority})</span>
                    }
                  </div>
                  <button className="btn-complete" onClick={() => markAsManaged(alert.id)}>
                    ✓ Completat
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}