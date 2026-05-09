// src/App.jsx — Inibsa Smart Demand Signals Dashboard
import { useState } from "react";
import { useAlerts } from "./hooks/useAlerts";
import { useKPIs } from "./hooks/useKPIs";
import "./App.css";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function urgencyLabel(u) {
  return { urgent: "Urgent", mitja: "Mitjana", baixa: "Baixa" }[u] || u;
}
function statusLabel(s) {
  return { lleial: "Lleial", promiscu: "Promiscu", perdent: "Perdent", inactiu: "Inactiu", actiu: "Actiu" }[s] || s;
}
function typeLabel(t) {
  return t?.startsWith("commodity") ? "Commodity" : "Tècnic";
}
function typeClass(t) {
  return t?.startsWith("commodity") ? "commodity" : "technical";
}
function probColor(p) {
  if (p >= 0.75) return "#0F9ED5";
  if (p >= 0.50) return "#E97132";
  return "#EF4444";
}
function actionIcon(action) {
  if (!action) return "📋";
  if (action.toLowerCase().includes("truca")) return "📞";
  if (action.toLowerCase().includes("visita")) return "🚗";
  if (action.toLowerCase().includes("oferta")) return "📧";
  return "📋";
}

const OUTCOMES = [
  { key: "contacted", label: "✅ Contactat" },
  { key: "sold", label: "💰 Venda feta" },
  { key: "no_answer", label: "📵 Sense resposta" },
  { key: "not_interested", label: "❌ No interessat" },
];

// ─── OUTCOME MODAL ────────────────────────────────────────────────────────────

function OutcomeModal({ alert, onConfirm, onCancel }) {
  const [selected, setSelected] = useState(null);
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Resultat de la gestió</h3>
        <p>Indica el resultat del contacte amb <strong>{alert.client_name}</strong>:</p>
        <div className="outcome-grid">
          {OUTCOMES.map(o => (
            <button
              key={o.key}
              className={`outcome-btn${selected === o.key ? " selected" : ""}`}
              onClick={() => setSelected(o.key)}
            >
              {o.label}
            </button>
          ))}
        </div>
        <button
          className="btn-primary"
          style={{ width: "100%", justifyContent: "center" }}
          disabled={!selected}
          onClick={() => selected && onConfirm(selected)}
        >
          Confirmar i tancar alerta
        </button>
        <button className="modal-cancel" onClick={onCancel}>Cancel·lar</button>
      </div>
    </div>
  );
}

// ─── ALERT CARD ───────────────────────────────────────────────────────────────

function AlertCard({ alert, onManage }) {
  const isDone = alert.managed;
  const pct = Math.round(alert.conversion_probability * 100);

  return (
    <div className={`alert-card ${alert.urgency}${isDone ? " done" : ""}`}>

      {/* Header */}
      <div className="card-header">
        <div>
          <div className="client-name">{alert.client_name}</div>
          <div className="client-loc">📍 {alert.location}</div>
          <div className="tags">
            <span className={`tag ${typeClass(alert.alert_type)}`}>{typeLabel(alert.alert_type)}</span>
            <span className={`tag ${alert.client_status}`}>{statusLabel(alert.client_status)}</span>
            <span className={`tag ${alert.urgency}`}>{urgencyLabel(alert.urgency)}</span>
          </div>
        </div>
        <div className="impact-block">
          <div className="impact-val">€{alert.economic_impact.toLocaleString("ca-ES")}</div>
          <div className="impact-label">impacte est.</div>
        </div>
      </div>

      {/* Producte */}
      <div className="product-pill">💊 {alert.product_family}</div>

      {/* Motiu de l'alerta */}
      <div className="reason-text">{alert.reason}</div>

      {/* Meta */}
      <div className="meta-grid">
        <div className="meta-item">
          <div className="meta-key">Acció recomanada</div>
          <div className="meta-val">{actionIcon(alert.recommended_action)} {alert.recommended_action}</div>
        </div>
        <div className="meta-item">
          <div className="meta-key">Canal</div>
          <div className="meta-val">{alert.channel}</div>
        </div>
        <div className="meta-item">
          <div className="meta-key">Prob. conversió</div>
          <div className="meta-val">{pct}%</div>
        </div>
        <div className="meta-item">
          <div className="meta-key">Prioritat</div>
          <div className="meta-val">{alert.priority_score}/100</div>
        </div>
      </div>

      {/* Barra de probabilitat */}
      <div className="prob-wrap">
        <div className="prob-label">Probabilitat de conversió</div>
        <div className="prob-track">
          <div
            className="prob-fill"
            style={{ width: `${pct}%`, background: probColor(alert.conversion_probability) }}
          />
        </div>
      </div>

      {/* Accions */}
      {isDone ? (
        <div className="done-badge">
          ✅ Gestionada
          {alert.outcome && <span style={{ color: "#6B7280", fontWeight: 400 }}>· {OUTCOMES.find(o => o.key === alert.outcome)?.label}</span>}
        </div>
      ) : (
        <div className="card-actions">
          <button className="btn-primary" onClick={() => onManage(alert)}>
            {actionIcon(alert.recommended_action)} {alert.recommended_action}
          </button>
          <button className="btn-secondary" onClick={() => onManage(alert)}>
            ✓ Marcar gestionada
          </button>
        </div>
      )}
    </div>
  );
}

// ─── KPI BAR ─────────────────────────────────────────────────────────────────

function KPIBar({ kpis }) {
  if (!kpis) return null;
  return (
    <div className="kpi-grid">
      <div className="kpi">
        <div className="kpi-label">Alertes avui</div>
        <div className="kpi-value blue">{kpis.total_alerts}</div>
      </div>
      <div className="kpi">
        <div className="kpi-label">Urgents</div>
        <div className="kpi-value red">{kpis.urgent_alerts}</div>
      </div>
      <div className="kpi">
        <div className="kpi-label">Impacte potencial</div>
        <div className="kpi-value orange">€{kpis.total_impact?.toLocaleString("ca-ES")}</div>
      </div>
      <div className="kpi">
        <div className="kpi-label">Gestionades</div>
        <div className="kpi-value green">{kpis.managed_count}/{kpis.total_alerts}</div>
      </div>
    </div>
  );
}

// ─── FILTERS ─────────────────────────────────────────────────────────────────

const FILTERS = [
  { key: "all", label: "Totes" },
  { key: "urgent", label: "Urgents" },
  { key: "commodity", label: "Commodity" },
  { key: "technical", label: "Tècnic" },
  { key: "done", label: "Gestionades" },
];

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [modalAlert, setModalAlert] = useState(null);

  const { alerts, loading, error, markAsManaged } = useAlerts();
  const kpis = useKPIs(alerts);

  // Filtra les alertes segons el chip actiu
  const filtered = alerts.filter(a => {
    if (activeFilter === "done") return a.managed;
    if (activeFilter === "urgent") return a.urgency === "urgent" && !a.managed;
    if (activeFilter === "commodity") return a.alert_type.startsWith("commodity") && !a.managed;
    if (activeFilter === "technical") return a.alert_type.startsWith("technical") && !a.managed;
    return !a.managed; // "all"
  });

  async function handleConfirm(outcome) {
    if (!modalAlert) return;
    await markAsManaged(modalAlert.id, outcome);
    setModalAlert(null);
  }

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-left">
          <div className="logo-pill">INIBSA</div>
          <div>
            <div className="topbar-title">Smart Demand Signals</div>
            <div className="topbar-sub">Delegat: Marc Puig · Zona: Catalunya</div>
          </div>
        </div>
        <div className="badge-live">⟳ Actualitzat avui</div>
      </div>

      {/* KPIs */}
      <KPIBar kpis={kpis} />

      {/* Filtres */}
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

      {/* Llista d'alertes */}
      <div className="section-title">
        {activeFilter === "done" ? "Alertes gestionades" : `Alertes pendents (${filtered.length})`}
      </div>

      {loading && (
        <div className="state-box">
          <div className="icon">⏳</div>
          <p>Carregant alertes...</p>
        </div>
      )}

      {error && (
        <div className="state-box">
          <div className="icon">⚠️</div>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="state-box">
          <div className="icon">✅</div>
          <p>Cap alerta pendent en aquest filtre.</p>
        </div>
      )}

      {!loading && !error && filtered.map(alert => (
        <AlertCard
          key={alert.id}
          alert={alert}
          onManage={setModalAlert}
        />
      ))}

      {/* Modal de resultat */}
      {modalAlert && (
        <OutcomeModal
          alert={modalAlert}
          onConfirm={handleConfirm}
          onCancel={() => setModalAlert(null)}
        />
      )}
    </>
  );
}