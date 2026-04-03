import { useState, useEffect } from "react";

const SHIPMENTS = [
  {
    id: 1,
    camp: "Kochi Relief Hub",
    status: "ON THE WAY",
    eta: "~45 min",
    items: ["60 Food Packets", "80 Water Liters"],
    progress: 32,
    progressLabel: "DEPARTED · 32% OF ROUTE COMPLETE",
    route: "NH-66",
    distance: "48 KM",
    borderColor: "#00C9A7",
    statusBg: "#E0FAF5",
    statusColor: "#0F6E56",
  },
  {
    id: 2,
    camp: "Thrissur Medical Depo",
    status: "PREPARING",
    eta: "~110 min",
    items: ["5 Medical Kits", "40 Blanket Rolls"],
    progress: 5,
    progressLabel: "LOADING · 5% OF JOURNEY COMPLETE",
    route: "SH-22",
    distance: "82 KM",
    borderColor: "#F5A623",
    statusBg: "#FEF3E0",
    statusColor: "#B87000",
  },
  {
    id: 3,
    camp: "Aluva Local Store",
    status: "ON THE WAY",
    eta: "~25 min",
    items: ["40 Food Packets", "170 Water Liters"],
    progress: 78,
    progressLabel: "APPROACHING · 78% OF ROUTE COMPLETE",
    route: "BYPASS",
    distance: "12 KM",
    borderColor: "#00C9A7",
    statusBg: "#E0FAF5",
    statusColor: "#0F6E56",
  },
];

const REQUEST_PILLS = ["100 Food Packets", "250 Water Liters", "5 Medical Kits", "40 Blankets"];

const NAV_ITEMS = [
  { id: "fleet", label: "FLEET", icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  )},
  { id: "resources", label: "RESOURCES", icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
    </svg>
  )},
  { id: "maps", label: "MAPS", icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
    </svg>
  )},
  { id: "alerts", label: "ALERTS", icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  )},
];

// Kerala SVG outline path (simplified coastal shape)
const KERALA_PATH = "M 110 20 C 115 22 118 28 116 35 C 120 40 122 48 118 55 C 122 62 124 72 120 80 C 124 90 122 102 116 110 C 120 120 118 132 112 140 C 114 150 110 162 104 170 C 106 180 100 192 92 198 C 88 210 80 220 72 225 C 68 232 62 238 58 242 C 54 248 52 252 55 256 C 52 260 50 265 53 268 C 50 272 52 278 56 280 C 60 284 65 282 68 278 C 72 275 74 270 72 265 C 76 262 80 258 78 252 C 82 248 86 242 84 236 C 90 232 96 226 94 218 C 100 212 106 204 104 196 C 110 188 116 178 114 168 C 118 158 122 146 118 136 C 122 124 124 110 120 98 C 124 86 122 72 116 62 C 120 52 118 40 112 32 C 108 26 104 20 110 20 Z";

// Camp positions on Kerala SVG (x, y, color)
const CAMP_DOTS = [
  { x: 100, y: 95,  color: "#00C9A7", label: "Kochi",    size: 8 },
  { x: 108, y: 140, color: "#00C9A7", label: "Aluva",    size: 7 },
  { x: 88,  y: 160, color: "#F5A623", label: "Thrissur", size: 7 },
  { x: 92,  y: 200, color: "#27AE60", label: "",         size: 6 },
  { x: 104, y: 68,  color: "#27AE60", label: "",         size: 6 },
];
const VOLUNTEER = { x: 72, y: 225 };

function PulsingDot({ color = "#00C9A7" }) {
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", width: 12, height: 12 }}>
      <span style={{
        position: "absolute", width: 12, height: 12, borderRadius: "50%",
        background: color, opacity: 0.3,
        animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite"
      }}/>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "block" }}/>
    </span>
  );
}

function ProgressBar({ value, color }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(value), 300); return () => clearTimeout(t); }, [value]);
  return (
    <div style={{ width: "100%", height: 5, background: "#E8F0F7", borderRadius: 999, overflow: "hidden", margin: "8px 0 4px" }}>
      <div style={{ height: "100%", width: `${width}%`, background: color, borderRadius: 999, transition: "width 1s ease-out" }}/>
    </div>
  );
}

function ShipmentCard({ ship, onTrackClick }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
      borderLeft: `4px solid ${ship.borderColor}`, padding: "14px 14px 12px",
      marginBottom: 12, position: "relative"
    }}>
      {/* ETA badge */}
      <div style={{
        position: "absolute", top: 12, right: 12, background: "#1B5E83",
        color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 9px",
        borderRadius: 999, letterSpacing: "0.02em"
      }}>{ship.eta}</div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, paddingRight: 60 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#1A1A2E" }}>{ship.camp}</span>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
          background: ship.statusBg, color: ship.statusColor, letterSpacing: "0.05em"
        }}>{ship.status}</span>
      </div>

      {/* Resource pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
        {ship.items.map(item => (
          <span key={item} style={{
            fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 999,
            background: ship.borderColor === "#00C9A7" ? "#E0FAF5" : "#FEF3E0",
            color: ship.borderColor === "#00C9A7" ? "#0A6B56" : "#A05C00"
          }}>{item}</span>
        ))}
      </div>

      {/* Progress */}
      <ProgressBar value={ship.progress} color={ship.borderColor} />
      <div style={{ fontSize: 10, color: "#9BAAB8", fontWeight: 600, letterSpacing: "0.04em", marginBottom: 10 }}>
        {ship.progressLabel}
      </div>

      {/* Route + button */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#6B7A8D", fontSize: 13 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
          <span style={{ fontWeight: 600 }}>{ship.route} · {ship.distance}</span>
        </div>
        <button 
          onClick={onTrackClick}
          style={{
          border: "1.5px solid #1B5E83", background: "transparent", color: "#1B5E83",
          fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 8, cursor: "pointer",
          whiteSpace: "nowrap"
        }}>Track Route →</button>
      </div>
    </div>
  );
}

function MiniMap() {
  return (
    <div style={{
      background: "#E8F0F7", borderRadius: 14, padding: "10px 10px 6px",
      marginTop: 4, marginBottom: 4
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#6B7A8D", letterSpacing: "0.08em", marginBottom: 4 }}>
        LIVE RESOURCE MOVEMENT
      </div>
      <svg viewBox="0 30 170 260" width="100%" height="200" style={{ display: "block" }}>
        {/* Kerala outline */}
        <path d={KERALA_PATH} fill="#D0DDED" stroke="#B0C4D8" strokeWidth="1.2"/>

        {/* Dashed lines from camps to volunteer */}
        {CAMP_DOTS.filter(c => c.label).map((c, i) => (
          <line key={i}
            x1={c.x} y1={c.y} x2={VOLUNTEER.x} y2={VOLUNTEER.y}
            stroke={c.color} strokeWidth="1.5" strokeDasharray="5 4"
            opacity="0.85"
          />
        ))}

        {/* Camp dots */}
        {CAMP_DOTS.map((c, i) => (
          <g key={i}>
            <circle cx={c.x} cy={c.y} r={c.size + 3} fill={c.color} opacity="0.2"/>
            <circle cx={c.x} cy={c.y} r={c.size} fill={c.color}/>
            {c.label && (
              <text x={c.x + 10} y={c.y + 4} fontSize="8" fill="#1B5E83" fontWeight="700">{c.label}</text>
            )}
          </g>
        ))}

        {/* Volunteer location */}
        <circle cx={VOLUNTEER.x} cy={VOLUNTEER.y} r={13} fill="#1B5E83" opacity="0.15"/>
        <circle cx={VOLUNTEER.x} cy={VOLUNTEER.y} r={8} fill="#1B5E83"/>
        <circle cx={VOLUNTEER.x} cy={VOLUNTEER.y} r={3.5} fill="#fff"/>
      </svg>
    </div>
  );
}

export default function CrisisGrid({ onTrackClick }) {
  const [activeNav, setActiveNav] = useState("maps");
  const [syncMs] = useState(242);

  return (
    <div style={{
      minHeight: "100vh", background: "#F0F4F8",
      display: "flex", justifyContent: "center", alignItems: "flex-start",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes dash {
          to { stroke-dashoffset: -18; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 0; }
      `}</style>

      {/* Phone shell */}
      <div style={{
        width: "100%", maxWidth: 390, minHeight: "100vh",
        background: "#F0F4F8", display: "flex", flexDirection: "column",
        position: "relative", boxShadow: "0 0 60px rgba(0,0,0,0.12)"
      }}>

        {/* ── HEADER ── */}
        <div style={{ background: "#1B5E83", padding: "14px 16px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28, height: 28, background: "rgba(255,255,255,0.15)",
                borderRadius: 6, display: "grid", placeItems: "center"
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                  <rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/>
                  <rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/>
                </svg>
              </div>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 18, letterSpacing: "-0.01em" }}>CrisisGrid</span>
            </div>
            <span style={{
              background: "#E84545", color: "#fff", fontSize: 11, fontWeight: 800,
              padding: "3px 10px", borderRadius: 6, letterSpacing: "0.08em"
            }}>LIVE</span>
          </div>

          {/* Coords bar */}
          <div style={{
            background: "rgba(0,0,0,0.18)", borderRadius: "8px 8px 0 0",
            padding: "6px 12px", display: "flex", justifyContent: "space-between",
            fontSize: 10, color: "rgba(255,255,255,0.75)", fontWeight: 500, letterSpacing: "0.03em"
          }}>
            <span>LAT: 10.8505° N · LONG: 76.2711° E</span>
            <span>SYNC {syncMs}ms</span>
          </div>
        </div>

        {/* ── SCROLLABLE CONTENT ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px 80px" }}>

          {/* Status banner */}
          <div style={{
            background: "#F0FBF8", border: "1px solid #B8EDE0",
            borderRadius: 12, padding: "12px 14px", marginBottom: 14,
            display: "flex", alignItems: "center", gap: 12
          }}>
            <div style={{
              width: 40, height: 40, background: "#E0FAF5", borderRadius: 10,
              display: "grid", placeItems: "center", flexShrink: 0
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00C9A7" strokeWidth="2" strokeLinecap="round">
                <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v4h-7V8z"/>
                <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: "#1A1A2E" }}>3 Shipments Incoming</span>
                <PulsingDot color="#00C9A7" />
              </div>
              <div style={{ fontSize: 12, color: "#6B7A8D", marginTop: 2 }}>
                All resources will arrive within 70 minutes
              </div>
            </div>
          </div>

          {/* Request summary */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#9BAAB8", letterSpacing: "0.08em", marginBottom: 8 }}>
              YOUR REQUEST SUMMARY
            </div>
            <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 4 }}>
              {REQUEST_PILLS.map(p => (
                <span key={p} style={{
                  flexShrink: 0, background: "#E8F0F7", color: "#1B5E83",
                  fontSize: 12, fontWeight: 600, padding: "5px 12px",
                  borderRadius: 999, display: "flex", alignItems: "center", gap: 5
                }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1B5E83" strokeWidth="2.5">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                  </svg>
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Incoming shipments heading */}
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 18, color: "#1A1A2E", borderBottom: "2px solid #00C9A7", paddingBottom: 2 }}>
              Incoming Shipments
            </span>
          </div>

          {/* Shipment cards */}
          {SHIPMENTS.map(ship => <ShipmentCard key={ship.id} ship={ship} onTrackClick={onTrackClick} />)}

          {/* Mini map */}
          <MiniMap />
        </div>

        {/* ── BOTTOM NAV ── */}
        <div style={{
          position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 390,
          background: "#fff", borderTop: "1px solid #E8EFF6",
          display: "flex", padding: "8px 0 12px"
        }}>
          {NAV_ITEMS.map(item => {
            const active = activeNav === item.id;
            return (
              <button key={item.id}
                onClick={() => setActiveNav(item.id)}
                style={{
                  flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 3, border: "none", background: "transparent", cursor: "pointer",
                  color: active ? "#1B5E83" : "#9BAAB8",
                  padding: "6px 0"
                }}>
                <div style={{
                  width: 44, height: 36, display: "grid", placeItems: "center",
                  background: active ? "#E8F0F7" : "transparent",
                  borderRadius: 10, transition: "background 0.2s"
                }}>
                  {item.icon}
                </div>
                <span style={{
                  fontSize: 9, fontWeight: active ? 700 : 600,
                  letterSpacing: "0.05em"
                }}>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
