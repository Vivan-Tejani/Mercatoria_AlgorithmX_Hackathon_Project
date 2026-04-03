import { useState, useEffect } from 'react'
import { ref, onValue }        from 'firebase/database'
import { db }                  from './firebase.js'

/* ── Nav items ── */
const NAV_ITEMS = [
  {
    id: 'fleet', label: 'FLEET',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1"/>
        <path d="M16 8h4l3 3v5h-7V8z"/>
        <circle cx="5.5"  cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
  {
    id: 'resources', label: 'RESOURCES',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="12" y1="8" x2="12" y2="16"/>
        <line x1="8"  y1="12" x2="16" y2="12"/>
      </svg>
    ),
  },
  {
    id: 'alerts', label: 'ALERTS',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
  },
]

/* ── Icon helpers ── */
const TruckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="1"/>
    <path d="M16 8h4l3 3v5h-7V8z"/>
    <circle cx="5.5"  cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
)

const RouteIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)

const RoadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
  </svg>
)

/* ── Summarise items in a transfer ── */
function summariseItems(items = {}) {
  const labels = {
    food_packets:  'Food Packets',
    water_liters:  'Water Liters',
    medicine_kits: 'Medicine Kits',
    blankets:      'Blankets',
    hygiene_kits:  'Hygiene Kits',
    baby_food_kits: 'Baby Food Kits',
  }
  return Object.entries(items)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ label: `${v} ${labels[k] || k}`, key: k }))
}

/* ── Aggregate all requested items from transfers ── */
function aggregateRequested(transfers) {
  const totals = {}
  for (const t of transfers) {
    for (const [k, v] of Object.entries(t.items || {})) {
      totals[k] = (totals[k] || 0) + v
    }
  }
  return totals
}

const RESOURCE_ICONS = {
  food_packets:  '📦',
  water_liters:  '💧',
  medicine_kits: '🩺',
  blankets:      '🛏',
  hygiene_kits:  '🧴',
  baby_food_kits: '🍼',
}

export default function VolunteerTracking({ requestId, onTrackRoute, onBack, onNav, activeNav = 'resources' }) {
  const [transfers, setTransfers] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [syncMs,    setSyncMs]    = useState(null)

  useEffect(() => {
    if (!requestId) return
    const start    = Date.now()
    const dbRef    = ref(db, 'transferRequests')
    const unsub    = onValue(dbRef, (snap) => {
      setSyncMs(Date.now() - start)
      const data = snap.val() || {}
      const list = Object.entries(data)
        .filter(([, v]) => v.volunteerRequestId === requestId)
        .map(([id, v]) => ({ id, ...v }))
      setTransfers(list)
      setLoading(false)
    })
    return () => unsub()
  }, [requestId])

  /* Update sync timer every second */
  useEffect(() => {
    const t = setInterval(() => setSyncMs(p => p !== null ? p + 1000 : null), 1000)
    return () => clearInterval(t)
  }, [])

  const maxEta       = transfers.length ? Math.max(...transfers.map(t => t.etaMinutes || 0)) : 0
  const aggregated   = aggregateRequested(transfers)
  const syncDisplay  = syncMs !== null ? `${Math.round(syncMs / 1000)}s` : '–'

  /* Derive coords for header */
  const firstTransfer = transfers[0]
  const lat = firstTransfer?.toLat   ?? '10.8505'
  const lng = firstTransfer?.toLng   ?? '76.2711'

  return (
    <>
      {/* ── Header ── */}
      <header className="cg-header">
        <div className="cg-header-left">
          <div className="cg-logo">
            <div className="cg-logo-icon"><span/><span/><span/><span/></div>
            <span className="cg-logo-text">CrisisGrid</span>
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.8px', marginTop: 2, fontFamily: 'var(--font-body)' }}>
            LAT: {lat} · LONG: {lng}
          </div>
        </div>
        <div className="cg-header-right">
          <div style={{ textAlign: 'right' }}>
            <div className="cg-live-badge red" style={{ background: 'var(--live-red)', color: '#fff', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
              LIVE
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 3, letterSpacing: 0.5 }}>
              SYNC: {syncDisplay}
            </div>
          </div>
        </div>
      </header>

      {/* ── Top Nav ── */}
      <nav className="bottom-nav">
        {NAV_ITEMS.map(n => (
          <button
            key={n.id}
            className={`nav-item ${activeNav === n.id ? 'active' : ''}`}
            onClick={() => onNav && onNav(n.id)}
          >
            {n.icon}
            <span className="nav-item-label">{n.label}</span>
          </button>
        ))}
      </nav>

      {/* ── Scrollable body ── */}
      <div className="cg-body">

        {/* Shipment Banner */}
        {!loading && (
          <div className="shipment-banner anim-fade-in">
            <div className="banner-icon"><TruckIcon/></div>
            <div>
              <div className="banner-title">
                {transfers.length} Shipment{transfers.length !== 1 ? 's' : ''} Incoming
                <span className="banner-pulse"/>
              </div>
              <div className="banner-sub">
                {transfers.length > 0
                  ? `All resources will arrive within ${maxEta} minutes`
                  : 'Waiting for coordinator to assign shipments…'}
              </div>
            </div>
          </div>
        )}

        {/* YOUR REQUEST SUMMARY */}
        {Object.keys(aggregated).length > 0 && (
          <>
            <div style={{ padding: '14px 16px 0', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Your Request Summary
            </div>
            <div className="chips-scroll">
              {Object.entries(aggregated).map(([k, v]) => (
                <div key={k} className="chip">
                  <span>{RESOURCE_ICONS[k] || '📦'}</span>
                  {v} {k.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Incoming Shipments */}
        <div className="cg-section" style={{ paddingBottom: 4 }}>
          <div className="cg-section-title">Incoming Shipments</div>
        </div>

        {loading && (
          <div className="empty-state">
            <div className="loading-dot" style={{ width: 10, height: 10, margin: '0 auto 12px' }}/>
            <div className="empty-state-text">Connecting to live data…</div>
          </div>
        )}

        {!loading && transfers.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🚛</div>
            <div className="empty-state-text">No shipments assigned yet.<br/>A coordinator will dispatch resources shortly.</div>
          </div>
        )}

        {transfers.map((t, i) => {
          const isOnWay  = t.status === 'dispatched' || t.status === 'on_way'
          const isPending = t.status === 'pending'
          const progress  = isOnWay ? 32 : isPending ? 5 : 10
          const items     = summariseItems(t.items)
          const isWarning = !isOnWay

          return (
            <div
              key={t.id}
              className={`shipment-card anim-slide-up ${isWarning ? 'preparing' : ''}`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Top row */}
              <div className="shipment-card-top">
                <div>
                  <div className="shipment-camp-name">{t.fromName}</div>
                </div>
                <div className="shipment-card-badges">
                  <span className={`status-badge ${isOnWay ? 'on-way' : 'preparing'}`}>
                    {isOnWay ? 'ON THE WAY' : 'PREPARING'}
                  </span>
                  <span className="eta-badge">~{t.etaMinutes}m</span>
                </div>
              </div>

              {/* Item chips */}
              <div className="item-chips">
                {items.map(item => (
                  <span key={item.key} className={`item-chip ${isWarning ? 'warning' : ''}`}>
                    {item.label}
                  </span>
                ))}
              </div>

              {/* Progress bar */}
              <div className="progress-wrap">
                <div className="progress-label">
                  {isOnWay ? `DEPARTED · ${progress}% OF ROUTE COMPLETE` : `LOADING · ${progress}% OF JOURNEY COMPLETE`}
                </div>
                <div className="progress-bar-bg">
                  <div
                    className={`progress-bar-fill ${isWarning ? 'yellow' : ''}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Bottom row */}
              <div className="shipment-card-bottom">
                <div className="route-info">
                  <RoadIcon/>
                  <span>{t.routeSummary} &nbsp;·&nbsp; {t.distanceKm} KM</span>
                </div>
                <button
                  className="track-btn"
                  onClick={() => onTrackRoute(t)}
                >
                  Track Route
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
              </div>
            </div>
          )
        })}

        {/* Bottom padding */}
        <div style={{ height: 12 }}/>
      </div>

    </>
  )
}
