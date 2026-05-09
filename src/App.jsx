// src/App.jsx — Inibsa Smart Demand Signals
// Connected to real Retention API (http://localhost:8000)
import { useState } from "react";
import { useAlerts } from "./hooks/useAlerts";
import { useKPIs } from "./hooks/useKPIs";
import "./App.css";

// priority_score is 1.0–10.0. >= 7 = urgent
function priorityClass(score) { return score >= 7.0 ? "urgent" : "mitja"; }
function priorityLabel(score) { return score >= 7.0 ? "Alta Prioritat" : "Prioritat Mitjana"; }
function probColor(p) { return p >= 0.75 ? "#0F9ED5" : p >= 0.5 ? "#F97316" : "#EF4444"; }

const FILTERS = [
  { key: "all",    label: "Totes" },
  { key: "urgent", label: "Alta Prioritat (≥7.0)" },
  { key: "done",   label: "Completades" },
];

function AlertCard({ alert, onManage }) {
  const isDone = alert.managed;
  const pct = Math.round(alert.confidence * 100);
  const urgencyClass = priorityClass(alert.priority_score);

  return (
    <div className={`alert-card ${urgencyClass}${isDone ? " done" : ""}`}>
      <div className="card-strip" />
      <div className="card-body">

        {/* Header: company + location + impact */}
        <div className="card-header">
          <div>
            <div className="client-name">{alert.company_id}</div>
            <div className="client-loc">
              <i className="ti ti-map-pin" aria-hidden="true"></i> {alert.location}
            </div>
            <div className="tags">
              <span className={`tag ${urgencyClass}`}>{priorityLabel(alert.priority_score)}</span>
            </div>
          </div>
          <div className="impact-block">
            <div className="impact-val">
              €{Number(alert.expected_return).toLocaleString("ca-ES", { maximumFractionDigits: 0 })}
            </div>
            <div className="impact-label">retorn esperat</div>
          </div>
        </div>

        {/* Reason from the API */}
        <div className="reason-text">{alert.reason}</div>

        {/* Meta: priority score + confidence */}
        <div className="meta-grid">
          <div>
            <div className="meta-key">Puntuació Prioritat</div>
            <div className="meta-val">{Number(alert.priority_score).toFixed(1)} / 10</div>
          </div>
          <div>
            <div className="meta-key">Confiança</div>
            <div className="meta-val">{pct}%</div>
          </div>
        </div>

        {/* Confidence bar */}
        <div className="prob-wrap">
          <div className="prob-label">Fiabilitat del patró de compra</div>
          <div className="prob-track">
            <div
              className="prob-fill"
              style={{ width: `${pct}%`, background: probColor(alert.confidence) }}
            />
          </div>
        </div>

        {/* Action */}
        {isDone ? (
          <div className="done-badge">
            <i className="ti ti-circle-check" aria-hidden="true"></i> Acció Completada
          </div>
        ) : (
          <div className="card-actions">
            <button className="btn-primary" onClick={() => onManage(alert.company_id)}>
              <i className="ti ti-check" aria-hidden="true"></i> Marcar com a completada
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

function KPIBar({ kpis }) {
  if (!kpis) return null;
  return (
    <div className="kpi-grid">
      <div className="kpi blue">
        <div className="kpi-label">Alertes carregades</div>
        <div className="kpi-value">{kpis.total_alerts}</div>
      </div>
      <div className="kpi red">
        <div className="kpi-label">Alta Prioritat (≥7)</div>
        <div className="kpi-value">{kpis.urgent_alerts}</div>
      </div>
      <div className="kpi orange">
        <div className="kpi-label">Retorn Potencial</div>
        <div className="kpi-value">
          €{kpis.total_impact?.toLocaleString("ca-ES", { maximumFractionDigits: 0 })}
        </div>
      </div>
      <div className="kpi green">
        <div className="kpi-label">Completades</div>
        <div className="kpi-value">{kpis.managed_count}/{kpis.total_alerts}</div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeFilter, setActiveFilter] = useState("all");
  const { alerts, loading, error, refetch, markAsManaged } = useAlerts({ top_x: 20 });
  const kpis = useKPIs(alerts);

  const filtered = alerts.filter(a => {
    if (activeFilter === "done")   return a.managed;
    if (activeFilter === "urgent") return a.priority_score >= 7.0 && !a.managed;
    return !a.managed; // "all"
  });

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-left">
          <div className="logo-block">
            <div className="logo-wordmark"><span>INIBSA</span> · Smart Demand</div>
            <div className="logo-sub">Retention API · localhost:8000</div>
          </div>
          <div className="topbar-divider" />
          <div className="topbar-hackathon">
            <div className="hackathon-label">Interhack BCN 2026</div>
            <div className="hackathon-name">Live Data</div>
          </div>
        </div>
        <button className="badge-live" onClick={refetch} title="Recarregar alertes">
          <i className="ti ti-refresh" aria-hidden="true"></i> Actualitzar
        </button>
      </div>

      {/* KPI bar */}
      <KPIBar kpis={kpis} />

      {/* Filters */}
      <div className="filters">
        <span className="filter-label">Filtrar:</span>
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`chip${activeFilter === f.key ? " active" : ""}`}
            onClick={() => setActiveFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Section title */}
      <div className="section-title">
        {activeFilter === "done"
          ? "Alertes completades"
          : `Alertes pendents (${alerts.filter(a => !a.managed).length})`}
      </div>

      {/* States */}
      {loading && (
        <div className="state-box">
          <div className="state-icon">⏳</div>
          <p>Carregant alertes des de l'API...</p>
        </div>
      )}
      {error && (
        <div className="state-box">
          <div className="state-icon">⚠️</div>
          <p>{error}</p>
        </div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div className="state-box">
          <div className="state-icon">✅</div>
          <p>Cap alerta en aquest filtre.</p>
        </div>
      )}

      {/* Alert list */}
      {!loading && !error && filtered.map(a => (
        <AlertCard key={a.company_id} alert={a} onManage={markAsManaged} />
      ))}
    </>
  );
}