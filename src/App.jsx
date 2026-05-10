// src/App.jsx — Inibsa Smart Demand Signals
// Connected to real Retention API (http://localhost:8000)
import { useState, useEffect } from "react";
import { useAlerts } from "./hooks/useAlerts";
import { useKPIs } from "./hooks/useKPIs";
import { fetchInterpretability } from "./services/api";
import InterpretabilityGraph from "./components/InterpretabilityGraph";
import "./App.css";

function priorityClass(score) { return score >= 7.0 ? "urgent" : "mitja"; }
function priorityLabel(score) { return score >= 7.0 ? "Alta Prioritat" : "Mitjana"; }
function probColor(p) { return p >= 0.75 ? "#438FC1" : p >= 0.5 ? "#e08b20" : "#FA5E58"; }

/**
 * Transforms raw backend reason strings into user-friendly Catalan messages.
 * Backend sends:
 *   Commodity: "Overdue 152d (cycle:91, thresh:118, conf:1.00, age:1653d, txns:30)"
 *   Technical: "Vol drop >50% (prev6m:X€→recent6m:Y€, age:Zd)"
 */
function formatReason(reason) {
  if (!reason) return "";

  // Commodity/Replenishment pattern
  const overdueMatch = reason.match(
    /Overdue (\d+)d \(cycle:(\d+), thresh:(\d+), conf:([\d.]+), age:(\d+)d, txns:(\d+)\)/
  );
  if (overdueMatch) {
    const [, dslp, cycle, , , ageDays, txns] = overdueMatch;
    const years = (parseInt(ageDays) / 365).toFixed(1);
    const overdueDays = parseInt(dslp) - parseInt(cycle);
    return `Última compra fa ${dslp} dies — ${overdueDays > 0 ? overdueDays : 0} dies per sobre del seu cicle habitual de ${cycle} dies. Client amb ${txns} comandes en ${years} anys d'historial.`;
  }

  // Volume drop pattern
  const volMatch = reason.match(
    /Vol drop >50% \(prev6m:([\d.]+)€→recent6m:([\d.]+)€, age:(\d+)d\)/
  );
  if (volMatch) {
    const [, prev, recent, ageDays] = volMatch;
    const years = (parseInt(ageDays) / 365).toFixed(1);
    const dropPct = Math.round((1 - parseFloat(recent) / parseFloat(prev)) * 100);
    return `Caiguda del ${dropPct}% en volum de compra: de ${Number(prev).toLocaleString("ca-ES", { maximumFractionDigits: 0 })}€ a ${Number(recent).toLocaleString("ca-ES", { maximumFractionDigits: 0 })}€ en els últims 6 mesos. Client amb ${years} anys d'historial.`;
  }

  // Fallback: return as-is
  return reason;
}

const FILTERS = [
  { key: "all",    label: "Totes" },
  { key: "urgent", label: "Alta Prioritat" },
  { key: "done",   label: "Completades" },
];

/* ─── Alert Row ────────────────────────────────────────────── */
function AlertRow({ alert, onManage }) {
  const isDone = alert.managed;
  const pct = Math.round(alert.confidence * 100);
  const cls = priorityClass(alert.priority_score);
  const [expanded, setExpanded] = useState(false);

  const [interpData, setInterpData] = useState(null);
  const [loadingInterp, setLoadingInterp] = useState(false);
  const [interpError, setInterpError] = useState(null);

  useEffect(() => {
    if (expanded && !interpData) {
      setLoadingInterp(true);
      setInterpError(null);
      fetchInterpretability(alert.company_id)
        .then(data => setInterpData(data))
        .catch(() => setInterpError("No s'ha pogut carregar la informació d'interpretabilitat."))
        .finally(() => setLoadingInterp(false));
    }
  }, [expanded, alert.company_id, interpData]);

  return (
    <div className={`alert-row ${cls}${isDone ? " done" : ""}`}>
      {/* Compact summary row */}
      <div className="alert-summary" onClick={() => setExpanded(!expanded)}>
        <div className="alert-indicator" />

        <div className="alert-main">
          <div className="alert-company">{alert.company_id}</div>
          <div className="alert-location">
            <i className="ti ti-map-pin" aria-hidden="true" /> {alert.location}
          </div>
          <div className="alert-tags">
            <span className={`alert-tag ${cls}`}>{priorityLabel(alert.priority_score)}</span>
            {alert.product_family && <span className="alert-tag family">{alert.product_family}</span>}
            {alert.type && <span className="alert-tag type">{alert.type}</span>}
          </div>
        </div>

        <div className="alert-metric">
          <div className="alert-metric-value">
            €{Number(alert.expected_return).toLocaleString("ca-ES", { maximumFractionDigits: 0 })}
          </div>
          <div className="alert-metric-label">Retorn</div>
        </div>

        <div className="alert-metric">
          <div className="alert-metric-value">{Math.round(alert.priority_score)}</div>
          <div className="alert-metric-label">Prioritat</div>
        </div>

        <div className={`alert-expand${expanded ? " open" : ""}`}>
          <i className="ti ti-chevron-down" />
        </div>
      </div>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="alert-detail">
          <div className="detail-reason">{formatReason(alert.reason)}</div>

          <div className="detail-grid">
            <div className="detail-card">
              <div className="detail-card-title">Puntuació Prioritat</div>
              <div className="detail-card-main">{Math.round(alert.priority_score)} / 10</div>
            </div>
            <div className="detail-card">
              <div className="detail-card-title">Retorn Esperat</div>
              <div className="detail-card-main">
                €{Number(alert.expected_return).toLocaleString("ca-ES", { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>

          <div className="detail-confidence">
            <div className="detail-confidence-header">
              <span className="detail-confidence-label">Fiabilitat del patró de compra</span>
              <span className="detail-confidence-val">{pct}%</span>
            </div>
            <div className="detail-track">
              <div className="detail-fill" style={{ width: `${pct}%`, background: probColor(alert.confidence) }} />
            </div>
          </div>

          <div className="detail-actions">
            {isDone ? (
              <div className="done-badge">
                <i className="ti ti-circle-check" aria-hidden="true" /> Acció Completada
              </div>
            ) : (
              <button className="btn-primary" onClick={(e) => { e.stopPropagation(); onManage(alert.company_id); }}>
                <i className="ti ti-check" aria-hidden="true" /> Marcar com a completada
              </button>
            )}
          </div>

          {/* Interpretability graph */}
          <div className="interp-section">
            {loadingInterp && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div className="spinner" />
                <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Carregant gràfic...</p>
              </div>
            )}
            {interpError && (
              <p style={{ color: "var(--color-danger)", textAlign: "center", fontSize: "13px", padding: "10px 0" }}>{interpError}</p>
            )}
            {!loadingInterp && !interpError && interpData && (
              <>
                <div className="interp-meta">
                  <i className="ti ti-info-circle" />
                  <span><strong>Cadència habitual:</strong> {interpData.typical_purchase_cadence}</span>
                </div>
                {interpData.timeseries && interpData.timeseries.length > 0 && (
                  <InterpretabilityGraph data={interpData} />
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Header with KPIs ─────────────────────────────────────── */
function Header({ kpis }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-top">
          <div className="logo-area">
            <div>
              <div className="logo-wordmark"><span>INIBSA</span> · Smart Demand</div>
              <div className="logo-sub">Interhack BCN 2026</div>
            </div>
          </div>
        </div>

        {kpis && (
          <div className="kpi-strip">
            <div className="kpi-item">
              <div className="kpi-item-label"><span className="kpi-dot blue" /> Alertes</div>
              <div className="kpi-item-value">{kpis.total_alerts}</div>
            </div>
            <div className="kpi-item">
              <div className="kpi-item-label"><span className="kpi-dot red" /> Alta Prioritat</div>
              <div className="kpi-item-value">{kpis.urgent_alerts}</div>
            </div>
            <div className="kpi-item">
              <div className="kpi-item-label"><span className="kpi-dot orange" /> Retorn Potencial</div>
              <div className="kpi-item-value">€{kpis.total_impact?.toLocaleString("ca-ES", { maximumFractionDigits: 0 })}</div>
            </div>
            <div className="kpi-item">
              <div className="kpi-item-label"><span className="kpi-dot green" /> Completades</div>
              <div className="kpi-item-value">{kpis.managed_count}/{kpis.total_alerts}</div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

/* ─── App ──────────────────────────────────────────────────── */
export default function App() {
  const [activeFilter, setActiveFilter] = useState("all");
  const { alerts, loading, error, markAsManaged } = useAlerts({ top_x: 20 });
  const kpis = useKPIs(alerts);

  const pending = alerts.filter(a => !a.managed);
  const filtered = alerts.filter(a => {
    if (activeFilter === "done")   return a.managed;
    if (activeFilter === "urgent") return a.priority_score >= 7.0 && !a.managed;
    return !a.managed;
  });

  return (
    <>
      <Header kpis={kpis} />

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-filters">
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
        <div className="toolbar-count">
          {activeFilter === "done"
            ? <><strong>{kpis?.managed_count || 0}</strong> completades</>
            : <><strong>{pending.length}</strong> alertes pendents</>}
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="state-box">
          <div className="spinner" />
          <p>Carregant alertes des de l'API...</p>
        </div>
      )}
      {error && (
        <div className="state-box">
          <div className="state-icon"><i className="ti ti-alert-circle" /></div>
          <p>{error}</p>
        </div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div className="state-box">
          <div className="state-icon"><i className="ti ti-checks" /></div>
          <p>Cap alerta en aquest filtre.</p>
        </div>
      )}

      {/* Alert list */}
      {!loading && !error && (
        <div className="alert-list">
          {filtered.map(a => (
            <AlertRow key={a.company_id} alert={a} onManage={markAsManaged} />
          ))}
        </div>
      )}
    </>
  );
}