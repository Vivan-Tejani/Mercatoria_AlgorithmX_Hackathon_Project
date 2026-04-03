import { useEffect, useState } from 'react'
import { ref, push, onValue } from 'firebase/database'
import { db }         from './firebase.js'

const FALLBACK_CAMPS = {
  camp_001: { name: 'Wayanad Relief Camp A',    location: { lat: 11.6854, lng: 76.1320 } },
  camp_002: { name: 'Ernakulam Central Camp',   location: { lat: 9.9312, lng: 76.2673 } },
  camp_003: { name: 'Thrissur Relief Hub',      location: { lat: 10.5276, lng: 76.2144 } },
  camp_004: { name: 'Kozhikode Camp B',         location: { lat: 11.2588, lng: 75.7804 } },
  camp_005: { name: 'Malappuram Relief Post',   location: { lat: 11.0510, lng: 76.0711 } },
  camp_006: { name: 'Palakkad Camp C',          location: { lat: 10.7867, lng: 76.6548 } },
}

const RESOURCES = [
  {
    key: 'food_packets', label: 'Food Packets', surplus: 349,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
  },
  {
    key: 'water_liters', label: 'Water Liters', surplus: 1200,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
      </svg>
    ),
  },
  {
    key: 'medicine_kits', label: 'Medicine Kits', surplus: 45,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="12" y1="8" x2="12" y2="16"/>
        <line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
    ),
  },
  {
    key: 'blankets', label: 'Blankets', surplus: 82,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    key: 'hygiene_kits', label: 'Hygiene Kits', surplus: 96,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="3"/>
        <path d="M9 12h6"/>
        <path d="M12 9v6"/>
      </svg>
    ),
  },
  {
    key: 'baby_food_kits', label: 'Baby Food Kits', surplus: 64,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3h6"/>
        <path d="M10 3v4"/>
        <path d="M14 3v4"/>
        <rect x="7" y="7" width="10" height="14" rx="3"/>
      </svg>
    ),
  },
]

function getNow() {
  const d = new Date()
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()
    + ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' IST'
}

const NAV_ITEMS = [
  { id: 'resources', label: 'RESOURCES', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> },
  { id: 'fleet',     label: 'FLEET',     icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
  { id: 'alerts',    label: 'ALERTS',    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
]

export default function VolunteerRequest({ onSubmit, onNav, activeNav = 'resources' }) {
  const [selectedCamp, setSelectedCamp] = useState('camp_001')
  const [camps,        setCamps]        = useState(FALLBACK_CAMPS)
  const [quantities,   setQuantities]   = useState({
    food_packets: 0,
    water_liters: 0,
    medicine_kits: 0,
    blankets: 0,
    hygiene_kits: 0,
    baby_food_kits: 0,
  })
  const [submitting,   setSubmitting]   = useState(false)
  const [error,        setError]        = useState(null)

  useEffect(() => {
    const campsRef = ref(db, 'camps')
    const unsub = onValue(
      campsRef,
      (snap) => {
        const data = snap.val()
        if (!data || typeof data !== 'object') return

        const normalized = Object.fromEntries(
          Object.entries(data).map(([id, value]) => [
            id,
            {
              name: value.name || id,
              location: value.location || FALLBACK_CAMPS[id]?.location || { lat: 0, lng: 0 },
            },
          ])
        )

        setCamps((prev) => ({ ...prev, ...normalized }))
      },
      () => {
        // Keep fallback camps if read fails.
      }
    )

    return () => unsub()
  }, [])

  useEffect(() => {
    if (camps[selectedCamp]) return
    const firstId = Object.keys(camps)[0]
    if (firstId) setSelectedCamp(firstId)
  }, [camps, selectedCamp])

  const camp = camps[selectedCamp] || FALLBACK_CAMPS.camp_001

  const adjust = (key, delta) =>
    setQuantities(q => ({ ...q, [key]: Math.max(0, q[key] + delta) }))

  const handleSubmit = async () => {
    const hasAny = Object.values(quantities).some(v => v > 0)
    if (!hasAny) { setError('Please request at least one resource.'); return }

    setSubmitting(true)
    setError(null)

    // Safety timeout — button never stays stuck past 10s
    const timeout = setTimeout(() => {
      setSubmitting(false)
      setError('Request timed out. Check your Firebase connection and try again.')
    }, 10000)

    try {
      const payload = {
        volunteerCampId:   selectedCamp,
        volunteerCampName: camp.name,
        location:          camp.location,
        requested: {
          food_packets:  quantities.food_packets,
          water_liters:  quantities.water_liters,
          medicine_kits: quantities.medicine_kits,
          blankets:      quantities.blankets,
          hygiene_kits:  quantities.hygiene_kits,
          baby_food_kits: quantities.baby_food_kits,
        },
        status:    'pending',
        createdAt: Date.now(),
      }
      const snapshot = await push(ref(db, 'volunteerRequests'), payload)
      clearTimeout(timeout)
      // setSubmitting(false) intentionally NOT called here — we navigate away
      onSubmit(snapshot.key)
    } catch (err) {
      clearTimeout(timeout)
      setSubmitting(false)
      setError('Submission failed: ' + (err.message || 'Check your connection.'))
    }
  }

  return (
    <>
      {/* Header */}
      <header className="cg-header">
        <div className="cg-header-left">
          <div className="cg-logo">
            <div className="cg-logo-icon"><span/><span/><span/><span/></div>
            <span className="cg-logo-text">CrisisGrid</span>
          </div>
          <div className="cg-header-loc">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>{camp.name.toUpperCase()}</span>
          </div>
        </div>
        <div className="cg-header-right">
          <div className="cg-live-badge green">
            <span className="cg-live-dot"/>
            LIVE
          </div>
        </div>
      </header>

      {/* Top Nav — wired to App via onNav */}
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

      {/* Info Banner */}
      <div className="cg-info-banner">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>System will auto-select nearest camps based on availability</span>
      </div>

      {/* Scrollable Body */}
      <div className="cg-body">

        <div className="camp-selector-wrap">
          <div className="camp-selector-label">Your Camp</div>
          <select
            className="camp-selector"
            value={selectedCamp}
            onChange={e => setSelectedCamp(e.target.value)}
          >
            {Object.entries(camps).map(([id, c]) => (
              <option key={id} value={id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="cg-section">
          <div className="cg-section-title">Request Resources</div>
          <div className="cg-section-date">{getNow()}</div>
        </div>

        <div style={{ padding: '0 16px' }}>
          {RESOURCES.map((res, i) => (
            <div
              key={res.key}
              className={`resource-card anim-slide-up ${quantities[res.key] > 0 ? 'active' : ''}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="resource-card-icon">{res.icon}</div>
              <div className="resource-card-info">
                <div className="resource-card-name">{res.label}</div>
                <div className="resource-card-sub">Nearest surplus: {res.surplus.toLocaleString()} units</div>
              </div>
              <div className="stepper">
                <button className="stepper-btn" onClick={() => adjust(res.key, -1)} aria-label="Decrease">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <span className="stepper-val">{quantities[res.key]}</span>
                <button className="stepper-btn" onClick={() => adjust(res.key, 1)} aria-label="Increase">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div style={{ margin: '0 16px', padding: '10px 14px', background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, fontSize: 12, color: '#B91C1C', fontWeight: 500 }}>
            {error}
          </div>
        )}

        <div className="submit-wrap">
          <button className="submit-btn" onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                Processing&nbsp;
                <span className="loading-dot"/>
              </>
            ) : (
              <>
                Submit Request
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </>
            )}
          </button>
          <div className="submit-hint">Estimated response time: under 3 seconds</div>
        </div>

      </div>

    </>
  )
}
