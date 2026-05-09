// src/App.jsx — Inibsa Smart Demand Signals · Concept 2 "Hackathon Fusion"
import { useState } from "react";
import { useAlerts } from "./hooks/useAlerts";
import { useKPIs } from "./hooks/useKPIs";
import "./App.css";

const URGENCY_LABEL = { urgent: "Urgent", mitja: "Mitjana", baixa: "Baixa" };
const STATUS_LABEL = { lleial: "Lleial", promiscu: "Promiscu", perdent: "Perdent", inactiu: "Inactiu", actiu: "Actiu" };
function typeLabel(t) { return t?.startsWith("commodity") ? "Commodity" : "Tècnic"; }
function typeClass(t) { return t?.startsWith("commodity") ? "commodity" : "technical"; }
function probColor(p) { return p >= 0.75 ? "#0F9ED5" : p >= 0.5 ? "#F97316" : "#EF4444"; }
function actionIcon(a = "") {
  if (a.toLowerCase().includes("truca")) return "ti-phone";
  if (a.toLowerCase().includes("visita")) return "ti-map-pin";
  if (a.toLowerCase().includes("oferta")) return "ti-mail";
  return "ti-send";
}

const OUTCOMES = [
  { key: "contacted", label: "✅ Contactat" },
  { key: "sold", label: "💰 Venda feta" },
  { key: "no_answer", label: "📵 Sense resposta" },
  { key: "not_interested", label: "❌ No interessat" },
];

const FILTERS = [
  { key: "all", label: "Totes" },
  { key: "urgent", label: "Urgents" },
  { key: "commodity", label: "Commodity" },
  { key: "technical", label: "Tècnic" },
  { key: "done", label: "Gestionades" },
];

function OutcomeModal({ alert, onConfirm, onCancel }) {
  const [selected, setSelected] = useState(null);
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon">
            <i className="ti ti-clipboard-check" aria-hidden="true"></i>
          </div>
          <h3>Resultat de la gestió</h3>
        </div>
        <p>Contacte amb <strong>{alert.client_name}</strong> per <strong>{alert.product_family}</strong>:</p>
        <div className="outcome-grid">
          {OUTCOMES.map(o => (
            <button key={o.key} className={`outcome-btn${selected === o.key ? " selected" : ""}`} onClick={() => setSelected(o.key)}>
              {o.label}
            </button>
          ))}
        </div>
        <button className="btn-primary modal-confirm" disabled={!selected} onClick={() => selected && onConfirm(selected)}>
          <i className="ti ti-check" aria-hidden="true"></i> Confirmar i tancar
        </button>
        <button className="modal-cancel" onClick={onCancel}>Cancel·lar</button>
      </div>
    </div>
  );
}

function AlertCard({ alert, onManage }) {
  const isDone = alert.managed;
  const pct = Math.round(alert.conversion_probability * 100);
  return (
    <div className={`alert-card ${alert.urgency}${isDone ? " done" : ""}`}>
      <div className="card-strip" />
      <div className="card-body">
        <div className="card-header">
          <div>
            <div className="client-name">{alert.client_name}</div>
            <div className="client-loc"><i className="ti ti-map-pin" aria-hidden="true"></i> {alert.location}</div>
            <div className="tags">
              <span className={`tag ${typeClass(alert.alert_type)}`}>{typeLabel(alert.alert_type)}</span>
              <span className={`tag ${alert.client_status}`}>{STATUS_LABEL[alert.client_status] || alert.client_status}</span>
              <span className={`tag ${alert.urgency}`}>{URGENCY_LABEL[alert.urgency] || alert.urgency}</span>
            </div>
          </div>
          <div className="impact-block">
            <div className="impact-val">€{alert.economic_impact.toLocaleString("ca-ES")}</div>
            <div className="impact-label">impacte est.</div>
          </div>
        </div>

        <div className="product-pill"><i className="ti ti-pill" aria-hidden="true"></i> {alert.product_family}</div>
        <div className="reason-text">{alert.reason}</div>

        <div className="meta-grid">
          <div><div className="meta-key">Acció</div><div className="meta-val"><i className={`ti ${actionIcon(alert.recommended_action)}`} aria-hidden="true"></i> {alert.recommended_action}</div></div>
          <div><div className="meta-key">Canal</div><div className="meta-val">{alert.channel}</div></div>
          <div><div className="meta-key">Conversió</div><div className="meta-val">{pct}%</div></div>
          <div><div className="meta-key">Prioritat</div><div className="meta-val">{alert.priority_score}/100</div></div>
        </div>

        <div className="prob-wrap">
          <div className="prob-label">Probabilitat de conversió</div>
          <div className="prob-track">
            <div className="prob-fill" style={{ width: `${pct}%`, background: probColor(alert.conversion_probability) }} />
          </div>
        </div>

        {isDone ? (
          <div className="done-badge">
            <i className="ti ti-circle-check" aria-hidden="true"></i> Gestionada
            {alert.outcome && <span style={{ color: "#94A3B8", fontWeight: 400 }}>· {OUTCOMES.find(o => o.key === alert.outcome)?.label}</span>}
          </div>
        ) : (
          <div className="card-actions">
            <button className="btn-primary" onClick={() => onManage(alert)}><i className={`ti ${actionIcon(alert.recommended_action)}`} aria-hidden="true"></i> {alert.recommended_action}</button>
            <button className="btn-secondary" onClick={() => onManage(alert)}><i className="ti ti-check" aria-hidden="true"></i> Marcar gestionada</button>
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
      <div className="kpi orange"><div className="kpi-label">Impacte potencial</div>  <div className="kpi-value">€{kpis.total_impact?.toLocaleString("ca-ES")}</div></div>
      <div className="kpi green"> <div className="kpi-label">Gestionades</div>        <div className="kpi-value">{kpis.managed_count}/{kpis.total_alerts}</div></div>
    </div>
  );
}

export default function App() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [modalAlert, setModalAlert] = useState(null);
  const { alerts, loading, error, markAsManaged } = useAlerts();
  const kpis = useKPIs(alerts);

  const filtered = alerts.filter(a => {
    if (activeFilter === "done") return a.managed;
    if (activeFilter === "urgent") return a.urgency === "urgent" && !a.managed;
    if (activeFilter === "commodity") return a.alert_type.startsWith("commodity") && !a.managed;
    if (activeFilter === "technical") return a.alert_type.startsWith("technical") && !a.managed;
    return !a.managed;
  });

  async function handleConfirm(outcome) {
    if (!modalAlert) return;
    await markAsManaged(modalAlert.id, outcome);
    setModalAlert(null);
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <div className="logo-block">
            <div className="logo-wordmark"><span>INIBSA</span> · Smart Demand</div>
            <div className="logo-sub">Delegat: Marc Puig · Zona Catalunya</div>
          </div>
          <div className="topbar-divider" />
          <div className="topbar-hackathon">
            <div className="hackathon-label">Interhack BCN 2026</div>
            <div className="hackathon-name">BCN Clima</div>
          </div>
          <div className="mlh-badge">MLH</div>
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
        {activeFilter === "done" ? "Alertes gestionades" : `Alertes pendents (${alerts.filter(a => !a.managed).length})`}
      </div>

      {loading && <div className="state-box"><div className="state-icon">⏳</div><p>Carregant alertes...</p></div>}
      {error && <div className="state-box"><div className="state-icon">⚠️</div><p>{error}</p></div>}
      {!loading && !error && filtered.length === 0 && <div className="state-box"><div className="state-icon">✅</div><p>Cap alerta en aquest filtre.</p></div>}
      {!loading && !error && filtered.map(a => <AlertCard key={a.id} alert={a} onManage={setModalAlert} />)}

      {modalAlert && <OutcomeModal alert={modalAlert} onConfirm={handleConfirm} onCancel={() => setModalAlert(null)} />}
    </>
  );
}