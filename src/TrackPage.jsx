import { useState } from "react";

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

export default function TrackPage({ onBack }) {
  const [activeNav, setActiveNav] = useState("maps");
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  return (
    <div style={{
      minHeight: "100vh", background: "#F0F4F8",
      display: "flex", justifyContent: "center", alignItems: "flex-start",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif"
    }}>
      {/* Phone shell */}
      <div style={{
        width: "100%", maxWidth: 390, minHeight: "100vh",
        background: "#2A4B5C", display: "flex", flexDirection: "column",
        position: "relative", boxShadow: "0 0 60px rgba(0,0,0,0.12)",
        overflow: "hidden"
      }}>
        
        {/* Mock Map Background */}
        <div style={{ 
          position: "absolute", top: 0, left: 0, right: 0, 
          height: isMapExpanded ? "100%" : "60%", 
          transition: "height 0.3s ease-in-out",
          overflow: "hidden" 
        }}>
          {/* Top dark overly for nav */}
          
          <svg viewBox="0 0 400 400" width="100%" height="100%" style={{ opacity: 0.8, filter: "brightness(0.9) contrast(1.2)" }}>
            <path d="M 0 50 C 100 80, 200 120, 400 30 L 400 400 L 0 400 Z" fill="#6ba872" />
            <path d="M -50 150 C 100 180, 200 220, 250 450 L -50 450 Z" fill="#9bc38e" />
            
            {/* Dashed Route */}
            <path d="M 180 350 Q 250 200 280 120" fill="none" stroke="#1B5E83" strokeWidth="4" strokeDasharray="8 6" />
            
            {/* Origin Dot */}
            <circle cx="180" cy="350" r="8" fill="#1B5E83" />
            {/* Destination Pin */}
            <path d="M 280 120 C 280 110, 285 100, 290 100 C 295 100, 300 110, 300 120 C 300 130, 290 145, 290 145 C 290 145, 280 130, 280 120 Z" fill="#0A6B56" transform="translate(-10, -25)" />
            <circle cx="280" cy="105" r="3" fill="#FFF" />
          </svg>
        </div>

        {/* ── HEADER ── */}
        <div style={{ position: "relative", zIndex: 10, padding: "16px 16px 0", marginTop: "12px" }}>
          <div style={{ 
            background: "#13425b", 
            borderRadius: 12, 
            padding: "16px",
            display: "flex", alignItems: "center", gap: 16,
            color: "#FFF",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
          }}>
            <button onClick={onBack} style={{
              background: "transparent", border: "none", color: "#FFF", cursor: "pointer", display: "flex", alignItems: "center"
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>Ernakulam Central Camp → Wayanad</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 4, letterSpacing: "0.05em", fontWeight: 600 }}>MISSION ID: CG-492-ALPHA</div>
            </div>
          </div>
        </div>

        {/* Spacer to push the bottom card down and show the map */}
        <div style={{ flex: 1, minHeight: isMapExpanded ? "85%" : "45%", transition: "min-height 0.3s ease-in-out" }} />

        {/* ── BOTTOM CARD (WHITE PANE) ── */}
        <div style={{
          position: "relative", zIndex: 10, background: "#FFF", 
          marginTop: "auto", borderTopLeftRadius: 24, borderTopRightRadius: 24,
          padding: "24px 20px 80px",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
          flexShrink: 0, display: "flex", flexDirection: "column",
          transform: isMapExpanded ? "translateY(55%)" : "translateY(0)",
          transition: "transform 0.3s ease-in-out"
        }}>
          {/* Drag handle */}
          <div 
            onClick={() => setIsMapExpanded(!isMapExpanded)}
            style={{ 
              width: 44, height: 4, background: "#E8F0F7", borderRadius: 2, 
              margin: "-12px auto 20px", cursor: "pointer",
              padding: "10px 0", // Expand clickable area
              backgroundClip: "content-box" // To keep the visual bar slim while padding expands click area
            }} 
          />
          
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#001e2b", marginBottom: 6 }}>Wayanad Distribution Hub</h1>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7A8D", letterSpacing: "0.08em", marginBottom: 16 }}>
            STATUS: <span style={{ color: "#001e2b" }}>PRIORITY SUPPLY ROUTE</span>
          </div>

          {/* Resources */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
            <span style={{ background: "#F2F6FA", color: "#13425b", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
              POTABLE WATER (1.2kL)
            </span>
            <span style={{ background: "#F2F6FA", color: "#13425b", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              MEDICAL KITS (45)
            </span>
            <span style={{ background: "#F2F6FA", color: "#13425b", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
              RATIONS (300)
            </span>
          </div>

          {/* Details list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#6B7A8D" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Route name</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 800, color: "#001e2b" }}>NH 766 Northern Corridor</span>
            </div>
            
            <div style={{ height: 1, background: "#F0F4F8" }} />
            
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#6B7A8D" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h.01M10 12h.01M14 12h.01M18 12h.01"/></svg>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Distance remaining</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 800, color: "#001e2b" }}>142.4 KM</span>
            </div>
            
            <div style={{ height: 1, background: "#F0F4F8" }} />
            
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#6B7A8D" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Estimated arrival</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#0A6B56" }}>04:45 HR</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#6B7A8D", letterSpacing: "0.05em", marginTop: 2 }}>SYNCED 2M AGO</div>
              </div>
            </div>
          </div>
          
          <button style={{ 
            marginTop: "auto", padding: "16px", borderRadius: 12, background: "#0A6B56",
            color: "#FFF", fontSize: 14, fontWeight: 800, border: "none", cursor: "pointer",
            boxShadow: "0 4px 12px rgba(10,107,86,0.2)"
          }}>
            CONFIRM RECEIPT
          </button>
        </div>

        {/* ── BOTTOM NAV ── */}
        <div style={{
          position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 390, zIndex: 20,
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