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

  // Commodity/Replenishment pattern - flexible with spaces and decimals
  const overdueMatch = reason.match(
    /Overdue\s+(\d+)d\s+\(cycle:(\d+(?:\.\d+)?),\s+thresh:(\d+(?:\.\d+)?),\s+conf:([\d.]+),\s+age:(\d+)d,\s+txns:(\d+)\)/i
  );
  if (overdueMatch) {
    const [, dslp, cycle, , , ageDays, txns] = overdueMatch;
    const years = (parseInt(ageDays) / 365).toFixed(1);
    const cycleVal = Math.round(parseFloat(cycle));
    const overdueDays = parseInt(dslp) - cycleVal;
    return `Última compra fa ${dslp} dies — ${overdueDays > 0 ? overdueDays : 0} dies per sobre del seu cicle habitual de ${cycleVal} dies. Client amb ${txns} comandes en ${years} anys d'historial.`;
  }

  // Volume drop pattern - flexible with spaces
  const volMatch = reason.match(
    /Vol\s+drop\s+>\s*50%\s+\(prev6m:([\d.]+)€\s*→\s*recent6m:([\d.]+)€,\s*age:(\d+)d\)/i
  );
  if (volMatch) {
    const [, prev, recent, ageDays] = volMatch;
    const years = (parseInt(ageDays) / 365).toFixed(1);
    const dropPct = Math.round((1 - parseFloat(recent) / parseFloat(prev)) * 100);
    return `Caiguda del ${dropPct}% en volum de compra: de ${Number(prev).toLocaleString("ca-ES", { maximumFractionDigits: 0 })}€ a ${Number(recent).toLocaleString("ca-ES", { maximumFractionDigits: 0 })}€ en els últims 6 mesos. Client amb ${years} anys d'historial.`;
  }

  return reason;
}

const FILTERS = [
  { key: "all",    label: "Totes" },
  { key: "urgent", label: "Alta Prioritat" },
  { key: "wip",    label: "En Procés" },
  { key: "done",   label: "Completades" },
  { key: "discarded", label: "Descartades" },
];

/* ─── Alert Row ────────────────────────────────────────────── */
function AlertRow({ alert, onStatusChange }) {
  const status = alert.status || "new";
  const isDone = status === "complete";
  const isWip = status === "wip";
  const isDiscarded = status === "discarded";
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
      fetchInterpretability(alert.alert_id)
        .then(data => setInterpData(data))
        .catch(() => setInterpError("No s'ha pogut carregar la informació d'interpretabilitat."))
        .finally(() => setLoadingInterp(false));
    }
  }, [expanded, alert.alert_id, interpData]);

  return (
    <div className={`alert-row ${cls}${status !== "new" ? ` status-${status}` : ""}`}>
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
          <div className="alert-metric-value">{Number(alert.priority_score).toFixed(1)}</div>
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

          <div className="detail-actions" style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            {status !== "new" && (
              <button className="btn-secondary" onClick={(e) => { e.stopPropagation(); onStatusChange(alert.alert_id, "new"); }}>
                <i className="ti ti-arrow-back-up" aria-hidden="true" /> Desfer
              </button>
            )}
            
            {status !== "complete" && (
              <button className="btn-primary" onClick={(e) => { e.stopPropagation(); onStatusChange(alert.alert_id, "complete"); }}>
                <i className="ti ti-check" aria-hidden="true" /> Completar
              </button>
            )}
            
            {status !== "wip" && (
              <button className="btn-secondary" onClick={(e) => { e.stopPropagation(); onStatusChange(alert.alert_id, "wip"); }}>
                <i className="ti ti-clock" aria-hidden="true" /> En procés
              </button>
            )}
            
            {status !== "discarded" && (
              <button className="btn-danger" onClick={(e) => { e.stopPropagation(); onStatusChange(alert.alert_id, "discarded"); }}>
                <i className="ti ti-trash" aria-hidden="true" /> Descartar
              </button>
            )}
            
            {status !== "new" && (
              <div className={`status-badge ${status}`} style={{ marginLeft: "auto" }}>
                {status === "complete" && <><i className="ti ti-circle-check" /> Completada</>}
                {status === "wip" && <><i className="ti ti-clock" /> En procés</>}
                {status === "discarded" && <><i className="ti ti-trash" /> Descartada</>}
              </div>
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

/* ─── Header (clean, minimal) ──────────────────────────────── */
function Header() {
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
      </div>
    </header>
  );
}

/* ─── KPI Strip (standalone, light background) ─────────────── */
function KPIStrip({ kpis }) {
  if (!kpis) return null;
  return (
    <div className="kpi-strip">
      <div className="kpi-card">
        <div className="kpi-card-icon blue"><i className="ti ti-bell-ringing" /></div>
        <div className="kpi-card-body">
          <div className="kpi-card-value">{kpis.total_alerts}</div>
          <div className="kpi-card-label">Alertes Totals</div>
        </div>
      </div>
      <div className="kpi-card">
        <div className="kpi-card-icon red"><i className="ti ti-urgent" /></div>
        <div className="kpi-card-body">
          <div className="kpi-card-value">{kpis.urgent_alerts}</div>
          <div className="kpi-card-label">Alta Prioritat</div>
        </div>
      </div>
      <div className="kpi-card">
        <div className="kpi-card-icon orange"><i className="ti ti-chart-bar" /></div>
        <div className="kpi-card-body">
          <div className="kpi-card-value">€{kpis.total_impact?.toLocaleString("ca-ES", { maximumFractionDigits: 0 })}</div>
          <div className="kpi-card-label">Retorn Potencial</div>
        </div>
      </div>
      <div className="kpi-card">
        <div className="kpi-card-icon green"><i className="ti ti-circle-check" /></div>
        <div className="kpi-card-body">
          <div className="kpi-card-value">{kpis.managed_count}<span className="kpi-card-total">/{kpis.total_alerts}</span></div>
          <div className="kpi-card-label">Completades</div>
        </div>
      </div>
    </div>
  );
}

/* ─── App ──────────────────────────────────────────────────── */
export default function App() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  const { alerts, loading, error, changeAlertStatus } = useAlerts({ 
    page: currentPage, 
    limit: PAGE_SIZE, 
    filter: activeFilter 
  });
  const kpis = useKPIs(alerts);

  return (
    <>
      <Header />
      {currentPage === 1 && <KPIStrip kpis={kpis} />}

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-filters">
          <span className="filter-label">Filtrar:</span>
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`chip${activeFilter === f.key ? " active" : ""}`}
              onClick={() => { setActiveFilter(f.key); setCurrentPage(1); }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="toolbar-count">
          {activeFilter === "done"
            ? <><strong>{kpis?.managed_count || 0}</strong> completades</>
            : <><strong>{alerts.length}</strong> {activeFilter === "all" ? "alertes totals" : "resultats"}</>}
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
      {!loading && !error && alerts.length === 0 && (
        <div className="state-box">
          <div className="state-icon"><i className="ti ti-checks" /></div>
          <p>Cap alerta en aquest filtre.</p>
        </div>
      )}

      {/* Alert list */}
      {!loading && !error && (
        <>
          <div className="alert-list">
            {alerts.map(a => (
              <AlertRow key={a.alert_id} alert={a} onStatusChange={changeAlertStatus} />
            ))}
          </div>

          <div className="pagination">
            <button 
              className="btn-secondary" 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              <i className="ti ti-chevron-left" /> Anterior
            </button>
            <span className="pagination-info">Pàgina {currentPage}</span>
            <button 
              className="btn-secondary" 
              disabled={alerts.length < PAGE_SIZE} 
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Següent <i className="ti ti-chevron-right" />
            </button>
          </div>
        </>
      )}
    </>
  );
}