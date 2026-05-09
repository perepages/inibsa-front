// src/App.jsx
import { useState } from "react";
import { useAlerts } from "./hooks/useAlerts";
import { useKPIs } from "./hooks/useKPIs";
import "./App.css";

const FILTERS = [
  { key: "all", label: "Totes" },
  { key: "urgent", label: "Urgents (Prioritat Alta)" },
  { key: "commodity", label: "Commodity" },
  { key: "technical", label: "Tècnic" },
  { key: "done", label: "Completades" },
];

function typeLabel(t) { return t?.startsWith("commodity") ? "Commodity" : "Tècnic"; }
function typeClass(t) { return t?.startsWith("commodity") ? "commodity" : "technical"; }
function probColor(p) { return p >= 0.75 ? "#0F9ED5" : p >= 0.5 ? "#F97316" : "#EF4444"; }

function AlertCard({ alert, onManage }) {
  const isDone = alert.managed;
  const pct = Math.round(alert.confidence * 100);
  const isUrgent = alert.priority >= 80;
  const urgencyClass = isUrgent ? "urgent" : "mitja";
  const urgencyLabel = isUrgent ? "Urgent" : "Prioritat Mitjana";

  return (
    <div className={`alert-card ${urgencyClass}${isDone ? " done" : ""}`}>
      <div className="card-strip" />
      <div className="card-body">
        <div className="card-header">
          <div>
            <div className="client-name">{alert.id}</div>
            <div className="client-loc"><i className="ti ti-map-pin" aria-hidden="true"></i> {alert.location}</div>
            <div className="tags">
              <span className={`tag ${typeClass(alert.alerta)}`}>{typeLabel(alert.alerta)}</span>
              <span className={`tag ${urgencyClass}`}>{urgencyLabel}</span>
            </div>
          </div>
          <div className="impact-block">
            <div className="impact-val">€{alert.avg_price.toLocaleString("ca-ES")}</div>
            <div className="impact-label">avg price</div>
          </div>
        </div>

        <div className="reason-text"><strong>Motiu de l'alerta:</strong> {alert.motivo}</div>

        <div className="meta-grid">
          <div><div className="meta-key">Nivell de Confiança</div><div className="meta-val">{pct}%</div></div>
          <div><div className="meta-key">Prioritat</div><div className="meta-val">{alert.priority}/100</div></div>
        </div>

        <div className="prob-wrap">
          <div className="prob-label">Indicador de Confiança</div>
          <div className="prob-track">
            <div className="prob-fill" style={{ width: `${pct}%`, background: probColor(alert.confidence) }} />
          </div>
        </div>

        {isDone ? (
          <div className="done-badge">
            <i className="ti ti-circle-check" aria-hidden="true"></i> Acció Completada
          </div>
        ) : (
          <div className="card-actions">
            <button className="btn-primary" onClick={() => onManage(alert.id)}>
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
      <div className="kpi blue">  <div className="kpi-label">Alertes avui</div>      <div className="kpi-value">{kpis.total_alerts}</div></div>
      <div className="kpi red">   <div className="kpi-label">Urgents</div>            <div className="kpi-value">{kpis.urgent_alerts}</div></div>
      <div className="kpi orange"><div className="kpi-label">Valor (Avg Price)</div>  <div className="kpi-value">€{kpis.total_impact?.toLocaleString("ca-ES")}</div></div>
      <div className="kpi green"> <div className="kpi-label">Completades</div>        <div className="kpi-value">{kpis.managed_count}/{kpis.total_alerts}</div></div>
    </div>
  );
}

export default function App() {
  const [activeFilter, setActiveFilter] = useState("all");
  const { alerts, loading, error, markAsManaged } = useAlerts();
  const kpis = useKPIs(alerts);

  const filtered = alerts.filter(a => {
    if (activeFilter === "done") return a.managed;
    if (activeFilter === "urgent") return a.priority >= 80 && !a.managed;
    if (activeFilter === "commodity") return a.alerta.startsWith("commodity") && !a.managed;
    if (activeFilter === "technical") return a.alerta.startsWith("technical") && !a.managed;
    return !a.managed;
  });

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <div className="logo-block">
            <div className="logo-wordmark"><span>INIBSA</span> · Smart Demand</div>
            <div className="logo-sub">Focus Hackathon: Senyals accionables</div>
          </div>
          <div className="topbar-divider" />
          <div className="topbar-hackathon">
            <div className="hackathon-label">Interhack BCN 2026</div>
            <div className="hackathon-name">Vulture Connection</div>
          </div>
        </div>
        <div className="badge-live"><i className="ti ti-refresh" aria-hidden="true"></i> Actualitzat avui</div>
      </div>

      <KPIBar kpis={kpis} />

      <div className="filters">
        <span className="filter-label">Filtrar:</span>
        {FILTERS.map(f => (
          <button key={f.key} className={`chip${activeFilter === f.key ? " active" : ""}`} onClick={() => setActiveFilter(f.key)}>{f.label}</button>
        ))}
      </div>

      <div className="section-title">
        {activeFilter === "done" ? "Alertes completades" : `Alertes pendents (${alerts.filter(a => !a.managed).length})`}
      </div>

      {loading && <div className="state-box"><div className="state-icon">⏳</div><p>Carregant alertes...</p></div>}
      {error && <div className="state-box"><div className="state-icon">⚠️</div><p>{error}</p></div>}
      {!loading && !error && filtered.length === 0 && <div className="state-box"><div className="state-icon">✅</div><p>Cap alerta en aquest filtre.</p></div>}

      {/* Passem markAsManaged directament per evitar el modal */}
      {!loading && !error && filtered.map(a => <AlertCard key={a.id} alert={a} onManage={markAsManaged} />)}
    </>
  );
}