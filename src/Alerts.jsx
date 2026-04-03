import { useState } from 'react'

const ALERTS_DATA = [
  {
    id: 'a1',
    type:    'critical',
    title:   'Critical Supply Shortage',
    body:    'Wayanad Relief Camp A has less than 10% medicine kit inventory remaining.',
    camp:    'Wayanad Relief Camp A',
    time:    '2 min ago',
    read:    false,
  },
  {
    id: 'a2',
    type:    'warning',
    title:   'Transfer Delayed',
    body:    'Shipment from Ernakulam Central Camp is delayed by 20 minutes due to road conditions on NH-66.',
    camp:    'Ernakulam → Wayanad',
    time:    '8 min ago',
    read:    false,
    canTrack: true, // Used to render the track live button
  },
  {
    id: 'a3',
    type:    'info',
    title:   'New Volunteer Request',
    body:    'Kozhikode Camp B submitted a request for 150 food packets and 400 water liters.',
    camp:    'Kozhikode Camp B',
    time:    '14 min ago',
    read:    false,
  },
  {
    id: 'a4',
    type:    'success',
    title:   'Delivery Confirmed',
    body:    'Transfer treq_001 delivered successfully. Inventory at Thrissur Relief Hub updated.',
    camp:    'Thrissur Relief Hub',
    time:    '31 min ago',
    read:    true,
  },
  {
    id: 'a5',
    type:    'warning',
    title:   'Low Blanket Stock',
    body:    'Malappuram Relief Post blanket inventory is at 12 units — below threshold of 25.',
    camp:    'Malappuram Relief Post',
    time:    '1 hr ago',
    read:    true,
  },
  {
    id: 'a6',
    type:    'info',
    title:   'System Update',
    body:    'Inventory sync completed across all 6 camps. Next sync in 5 minutes.',
    camp:    'All Camps',
    time:    '1 hr ago',
    read:    true,
  },
]

const TYPE_META = {
  critical: { color: '#EF4444', bg: '#FEF2F2', border: '#FCA5A5', icon: '⚠️', label: 'CRITICAL' },
  warning:  { color: '#F59E0B', bg: '#FFFBEB', border: '#FCD34D', icon: '🔔', label: 'WARNING'  },
  info:     { color: '#3B82F6', bg: '#EFF6FF', border: '#93C5FD', icon: 'ℹ️',  label: 'INFO'    },
  success:  { color: '#22C55E', bg: '#F0FDF4', border: '#86EFAC', icon: '✅', label: 'RESOLVED' },
}

export default function Alerts({ onNav, activeNav, onTrackRoute }) {
  const [alerts,  setAlerts]  = useState(ALERTS_DATA)
  const [filter,  setFilter]  = useState('all')

  const unread = alerts.filter(a => !a.read).length

  const markRead = (id) =>
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a))

  const markAllRead = () =>
    setAlerts(prev => prev.map(a => ({ ...a, read: true })))

  const filtered = filter === 'all'
    ? alerts
    : alerts.filter(a => filter === 'unread' ? !a.read : a.type === filter)

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
            ALERTS & NOTIFICATIONS
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {unread > 0 && (
            <div style={{ background: '#EF4444', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
              {unread}
            </div>
          )}
          <div className="cg-live-badge green" style={{ color: 'var(--live-green)', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
            <span className="cg-live-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor', animation: 'pulse 1.5s ease-in-out infinite', display: 'inline-block' }}/>
            LIVE
          </div>
        </div>
      </header>

      {/* Top Nav */}
      <BottomNav active={activeNav} onNav={onNav} />

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px 0', overflowX: 'auto' }}>
        {[
          { id: 'all',      label: 'All' },
          { id: 'unread',   label: `Unread (${unread})` },
          { id: 'critical', label: 'Critical' },
          { id: 'warning',  label: 'Warning' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              flexShrink: 0,
              padding: '6px 14px',
              borderRadius: 20,
              border: '1.5px solid',
              borderColor: filter === f.id ? 'var(--primary)' : 'var(--border)',
              background:  filter === f.id ? 'var(--primary)' : 'var(--card)',
              color:       filter === f.id ? '#fff'            : 'var(--text-secondary)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              transition: 'all 0.15s',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Mark all read */}
      {unread > 0 && (
        <div style={{ padding: '10px 16px 0', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={markAllRead} style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            Mark all as read
          </button>
        </div>
      )}

      {/* Section title */}
      <div className="cg-section" style={{ paddingTop: 12, paddingBottom: 4 }}>
        <div className="cg-section-title">
          {filter === 'all' ? 'All Alerts' : filter === 'unread' ? 'Unread' : filter.charAt(0).toUpperCase() + filter.slice(1)}
        </div>
      </div>

      {/* Alert cards */}
      <div className="cg-body" style={{ paddingTop: 4 }}>
        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🔕</div>
            <div className="empty-state-text">No alerts in this category.</div>
          </div>
        )}

        {filtered.map((a, i) => {
          const meta = TYPE_META[a.type] || TYPE_META.info
          return (
            <div
              key={a.id}
              className="anim-slide-up"
              onClick={() => markRead(a.id)}
              style={{
                animationDelay: `${i * 60}ms`,
                margin: '0 16px 10px',
                background: a.read ? 'var(--card)' : meta.bg,
                border: `1.5px solid ${a.read ? 'var(--border)' : meta.border}`,
                borderRadius: 14,
                padding: '13px 14px',
                cursor: 'pointer',
                boxShadow: a.read ? 'var(--shadow-sm)' : `0 2px 8px ${meta.color}22`,
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{meta.icon}</span>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                      {a.title}
                    </div>
                    <div style={{ fontSize: 10, color: meta.color, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', marginTop: 2 }}>
                      {meta.label}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 8 }}>
                  {!a.read && (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color, flexShrink: 0 }}/>
                  )}
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{a.time}</span>
                </div>
              </div>

              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>
                {a.body}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {a.camp}
              </div>

              {a.canTrack && (
                <div style={{ marginTop: 12, borderTop: `1px solid ${meta.border}`, paddingTop: 10 }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onTrackRoute(a.id); }}
                    style={{
                      width: '100%', padding: '8px 0', borderRadius: 8,
                      background: 'var(--primary)', color: '#fff', 
                      fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                    }}
                  >
                    Track Live Shipment
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
                    </svg>
                  </button>
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
