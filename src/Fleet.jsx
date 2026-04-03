import { useState, useEffect } from 'react'
import { ref, onValue }        from 'firebase/database'
import { db }                  from './firebase.js'

const FLEET_MOCK = [
  { id: 'veh_001', driver: 'Arjun Menon',   vehicle: 'KL-07 AX 4421', from: 'Ernakulam Central Camp', to: 'Wayanad Relief Camp A', status: 'en_route', progress: 38, eta: 42, items: { food_packets: 60, water_liters: 200 } },
  { id: 'veh_002', driver: 'Priya Nair',    vehicle: 'KL-11 BQ 9934', from: 'Thrissur Relief Hub',    to: 'Kozhikode Camp B',       status: 'loading',   progress: 12, eta: 90, items: { medicine_kits: 20 } },
  { id: 'veh_003', driver: 'Suresh Kumar',  vehicle: 'KL-53 CZ 1182', from: 'Palakkad Camp C',        to: 'Malappuram Relief Post', status: 'standby',   progress: 0,  eta: null, items: {} },
  { id: 'veh_004', driver: 'Divya Thomas',  vehicle: 'KL-02 DK 7763', from: 'Kozhikode Camp B',       to: 'Ernakulam Central Camp', status: 'arrived',   progress: 100, eta: 0, items: { blankets: 50 } },
]

const STATUS_META = {
  en_route: { label: 'EN ROUTE',  bg: '#DCFCE7', color: '#16A34A' },
  loading:  { label: 'LOADING',   bg: '#FEF3C7', color: '#B45309' },
  standby:  { label: 'STANDBY',   bg: '#F1F5F9', color: '#64748B' },
  arrived:  { label: 'ARRIVED',   bg: '#DBEAFE', color: '#1D4ED8' },
}

const ITEM_LABELS = {
  food_packets:  'Food Pkts',
  water_liters:  'Water L',
  medicine_kits: 'Med Kits',
  blankets:      'Blankets',
}

export default function Fleet({ onNav, activeNav, onTrackRoute }) {
  const [fleet, setFleet]   = useState(FLEET_MOCK)
  const [tick,  setTick]    = useState(0)

  /* Simulated live tick */
  useEffect(() => {
    const t = setInterval(() => setTick(p => p + 1), 5000)
    return () => clearInterval(t)
  }, [])

  const enRoute = fleet.filter(v => v.status === 'en_route').length
  const loading = fleet.filter(v => v.status === 'loading').length

  return (
    <>
      {/* Header */}
      <header className="cg-header">
        <div className="cg-header-left">
          <div className="cg-logo">
            <div className="cg-logo-icon"><span/><span/><span/><span/></div>
            <span className="cg-logo-text">CrisisGrid</span>
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.8px', marginTop: 2 }}>
            FLEET MANAGEMENT
          </div>
        </div>
        <div className="cg-live-badge red" style={{ background: 'var(--live-red)', color: '#fff', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: 1, fontFamily: 'var(--font-display)' }}>
          LIVE
        </div>
      </header>

      {/* Top Nav */}
      <BottomNav active={activeNav} onNav={onNav} />

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 10, padding: '14px 16px 0' }}>
        {[
          { label: 'TOTAL VEHICLES', val: fleet.length },
          { label: 'EN ROUTE',       val: enRoute,  color: '#16A34A' },
          { label: 'LOADING',        val: loading,  color: '#B45309' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: 'var(--card)', borderRadius: 10, padding: '11px 10px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: s.color || 'var(--text-primary)', lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.8px', marginTop: 4, textTransform: 'uppercase' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Section title */}
      <div className="cg-section" style={{ paddingBottom: 4 }}>
        <div className="cg-section-title">Active Fleet</div>
        <div className="cg-section-date">LIVE POSITIONS · SYNCED {tick * 5}S AGO</div>
      </div>

      {/* Vehicle cards */}
      <div className="cg-body" style={{ paddingTop: 4 }}>
        {fleet.map((v, i) => {
          const meta  = STATUS_META[v.status] || STATUS_META.standby
          const items = Object.entries(v.items).filter(([, n]) => n > 0)
          return (
            <div key={v.id} className="anim-slide-up" style={{ animationDelay: `${i * 70}ms`, margin: '0 16px 10px', background: 'var(--card)', borderRadius: 14, boxShadow: 'var(--shadow-sm)', overflow: 'hidden', borderLeft: `4px solid ${meta.color}` }}>
              <div style={{ padding: '13px 14px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{v.driver}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1, fontWeight: 500 }}>{v.vehicle}</div>
                </div>
                <span style={{ background: meta.bg, color: meta.color, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.8px', padding: '3px 8px', borderRadius: 4 }}>{meta.label}</span>
              </div>

              {/* Route */}
              <div style={{ padding: '0 14px 10px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.from}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600, color: 'var(--text-primary)' }}>{v.to}</span>
              </div>

              {/* Items */}
              {items.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '0 14px 10px' }}>
                  {items.map(([k, n]) => (
                    <span key={k} style={{ background: 'var(--accent-light)', color: 'var(--accent)', fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20 }}>
                      {n} {ITEM_LABELS[k] || k}
                    </span>
                  ))}
                </div>
              )}

              {/* Progress */}
              {v.status !== 'standby' && (
                <div style={{ padding: '0 14px 13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.7px', textTransform: 'uppercase' }}>{v.progress}% complete</span>
                    {v.eta > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)' }}>ETA ~{v.eta}m</span>}
                    {v.eta === 0 && <span style={{ fontSize: 10, fontWeight: 700, color: '#16A34A' }}>DELIVERED</span>}
                  </div>
                  <div style={{ height: 4, background: 'var(--bg)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${v.progress}%`, background: v.status === 'arrived' ? '#3B82F6' : v.status === 'loading' ? 'var(--warning)' : 'var(--live-green)', borderRadius: 2 }}/>
                  </div>
                  
                  {/* Track Route Button */}
                  {v.status !== 'arrived' && (
                    <button
                      className="cg-btn cg-btn-live anim-pulse"
                      style={{ marginTop: '12px', width: '100%', borderRadius: '10px' }}
                      onClick={() => onTrackRoute && onTrackRoute(v)}
                    >
                      <span>TRACK LIVE SHIPMENT</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14"></path>
                        <path d="m12 5 7 7-7 7"></path>
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
        <div style={{ height: 12 }}/>
      </div>

    </>
  )
}

/* Shared nav — imported inline here to avoid circular deps */
function BottomNav({ active, onNav }) {
  const items = [
    { id: 'resources', label: 'RESOURCES', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> },
    { id: 'fleet',     label: 'FLEET',     icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
    { id: 'alerts',    label: 'ALERTS',    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
  ]
  return (
    <nav className="bottom-nav">
      {items.map(n => (
        <button key={n.id} className={`nav-item ${active === n.id ? 'active' : ''}`} onClick={() => onNav(n.id)}>
          {n.icon}
          <span className="nav-item-label">{n.label}</span>
        </button>
      ))}
    </nav>
  )
}
