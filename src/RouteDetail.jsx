import { useState, useCallback, useEffect } from 'react'
import {
  GoogleMap,
  useJsApiLoader,
  DirectionsRenderer,
  MarkerF,
  PolylineF,
} from '@react-google-maps/api'

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

/* ── Camp coordinates lookup ── */
const CAMP_COORDS = {
  camp_001: { lat: 11.6854, lng: 76.1320 },
  camp_002: { lat: 10.8505, lng: 76.2711 },
  camp_003: { lat: 10.5276, lng: 76.2144 },
  camp_004: { lat: 11.2588, lng: 75.7804 },
  camp_005: { lat: 11.0510, lng: 76.0711 },
  camp_006: { lat: 10.7867, lng: 76.6548 },
}

/* ── Summarise items ── */
const RESOURCE_LABEL = {
  food_packets:  'Food Packets',
  water_liters:  'Water Liters',
  medicine_kits: 'Medical Kits',
  blankets:      'Blankets',
  hygiene_kits:  'Hygiene Kits',
  baby_food_kits: 'Baby Food Kits',
}

const RESOURCE_ICON = {
  food_packets:  '📦',
  water_liters:  '💧',
  medicine_kits: '🩺',
  blankets:      '🛏',
  hygiene_kits:  '🧴',
  baby_food_kits: '🍼',
}

/* ── Map style: earthy/terrain look ── */
const MAP_STYLE = [
  { featureType: 'landscape',    elementType: 'geometry', stylers: [{ color: '#c8dcb0' }] },
  { featureType: 'water',        elementType: 'geometry', stylers: [{ color: '#89bdd3' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#e8d5a3' }] },
  { featureType: 'road',         elementType: 'labels.text.fill', stylers: [{ color: '#5a5a5a' }] },
  { featureType: 'poi',          stylers: [{ visibility: 'off' }] },
  { featureType: 'transit',      stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'labels.text.fill', stylers: [{ color: '#3d3d3d' }] },
]

function generateMissionId() {
  const parts = ['CG', Math.floor(Math.random() * 900 + 100), 'ALPHA']
  return parts.join('-')
}

export default function RouteDetail({ transfer, onBack, onNav, activeNav = 'resources' }) {
  const [directions,   setDirections]       = useState(null)
  const [directionsFailed, setDirectionsFailed] = useState(true) // Start with polyline assumption to prevent UI pop-in
  const [mapInstance,  setMapInstance]      = useState(null)
  const [missionId]  = useState(generateMissionId)
  
  // Keep track of live progress to animate the truck marker
  const [progress, setProgress] = useState(transfer ? (transfer.progress || 10) : 10)

  /* Build fallback coords if transfer doesn't have them */
  const fromCoords = transfer
    ? (CAMP_COORDS[transfer.from] || { lat: 10.8505, lng: 76.2711 })
    : { lat: 10.8505, lng: 76.2711 }

  const toCoords = transfer
    ? (CAMP_COORDS[transfer.to] || { lat: 11.6854, lng: 76.1320 })
    : { lat: 11.6854, lng: 76.1320 }

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: ['geometry'],
  })

  const onMapLoad = useCallback((map) => {
    setMapInstance(map)
    if (!window.google) return

    // Auto fit map bounds to the two markers initially
    try {
      const bounds = new window.google.maps.LatLngBounds()
      bounds.extend(fromCoords)
      bounds.extend(toCoords)
      map.fitBounds(bounds)
    } catch(e) {
      console.warn("Bounds fitting error:", e)
    }

    // DirectionsService intentionally disabled for demo mode.
    // try {
    //   const svc = new window.google.maps.DirectionsService()
    //   svc.route(
    //     {
    //       origin:      new window.google.maps.LatLng(fromCoords.lat, fromCoords.lng),
    //       destination: new window.google.maps.LatLng(toCoords.lat,   toCoords.lng),
    //       travelMode:  window.google.maps.TravelMode.DRIVING,
    //     },
    //     (result, status) => {
    //       if (status === 'OK') {
    //         setDirectionsFailed(false)
    //         setDirections(result)
    //       } else {
    //         console.warn('Directions query failed:', status)
    //         setDirectionsFailed(true) // trigger polyline fallback
    //       }
    //     }
    //   )
    // } catch (e) {
    //   console.warn("Failed to init DirectionsService:", e);
    //   setDirectionsFailed(true);
    // }
    setDirections(null)
    setDirectionsFailed(true)
  }, [fromCoords, toCoords])

  const mapCenter = {
    lat: (fromCoords.lat + toCoords.lat) / 2,
    lng: (fromCoords.lng + toCoords.lng) / 2,
  }

  /* Animate progress to show 'Live' tracking */
  useEffect(() => {
    // Increase progress by 0.2% every 1.5 seconds to simulate movement
    const t = setInterval(() => {
      setProgress(prev => {
        const next = prev + 0.2;
        return next > 100 ? 100 : next;
      })
    }, 1500)
    return () => clearInterval(t)
  }, [])

  /* Calculate active truck coordinate based on polyline OR fallback linear path */
  const getLiveTruckCoords = useCallback(() => {
    if (!window.google) return fromCoords;
    
    const percentage = progress / 100;

    // If directions succeeded, trace the rendered route via spherical geometry!
    if (directions && window.google.maps.geometry?.spherical) {
      const path = directions.routes[0].overview_path;
      const totalDistance = window.google.maps.geometry.spherical.computeLength(path);
      const targetDistance = totalDistance * percentage;
      
      let walked = 0;
      for (let i = 0; i < path.length - 1; i++) {
        const segLen = window.google.maps.geometry.spherical.computeDistanceBetween(path[i], path[i+1]);
        if (walked + segLen >= targetDistance) {
          const ratio = (targetDistance - walked) / segLen;
          const lat = path[i].lat() + (path[i+1].lat() - path[i].lat()) * ratio;
          const lng = path[i].lng() + (path[i+1].lng() - path[i].lng()) * ratio;
          return { lat, lng };
        }
        walked += segLen;
      }
      return { lat: path[path.length - 1].lat(), lng: path[path.length - 1].lng() };
    } 
    
    // Otherwise fallback to linear interpolation between the two camp markers
    return {
      lat: fromCoords.lat + (toCoords.lat - fromCoords.lat) * percentage,
      lng: fromCoords.lng + (toCoords.lng - fromCoords.lng) * percentage,
    }
  }, [directions, fromCoords, toCoords, progress])

  const liveCoords = getLiveTruckCoords()

  const items = transfer
    ? Object.entries(transfer.items || {}).filter(([, v]) => v > 0)
    : []

  const hours   = transfer ? Math.floor(transfer.etaMinutes / 60) : 0
  const minutes = transfer ? transfer.etaMinutes % 60 : 0
  const etaStr  = hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')} HR` : `${minutes} MIN`

  return (
    <>
      {/* ── Header ── */}
      <header className="route-header">
        <button className="back-btn" onClick={onBack} aria-label="Go back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <div className="route-header-info">
          <div className="route-header-title">
            {transfer ? `${transfer.fromName} → ${transfer.toName?.split(' ')[0]}` : 'Route Detail'}
          </div>
          <div className="route-header-sub">MISSION ID: {missionId}</div>
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

      {/* ── Map Area ── */}
      <div className="map-area">
        {isLoaded ? (
            <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%', backgroundColor: '#c8ddc7' }}
            center={mapCenter}
            zoom={8}
            onLoad={onMapLoad}
            options={{
                mapTypeId: 'satellite',
              disableDefaultUI: false,
              zoomControl: true,
                streetViewControl: false,
            }}
          >
            {/* Directions route (legacy API output) */}
            {directions && !directionsFailed && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  suppressMarkers: true,
                  polylineOptions: {
                    strokeColor:   '#0B3547',
                    strokeWeight:  4,
                    strokeOpacity: 0.85,
                    icons: [{
                      icon:   { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 4 },
                      offset: '0',
                      repeat: '20px',
                    }],
                  },
                }}
              />
            )}

            {/* Fallback dotted line if Directions API is restricted or fails */}
            {directionsFailed && isLoaded && (
              <PolylineF
                path={[fromCoords, toCoords]}
                options={{
                  strokeColor: '#0B3547',
                  strokeOpacity: 0.85,
                  strokeWeight: 4,
                }}
              />
            )}

            {/* Source marker – initially */}
            {isLoaded && (
            <MarkerF
              position={fromCoords}
              icon={{
                url: `data:image/svg+xml,${encodeURIComponent(`
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="#0B3547" stroke="white" stroke-width="2"/>
                  </svg>
                `)}`,
              }}
            />
            )}

            {/* Live Truck Marker! */}
            {liveCoords && (
              <MarkerF
                position={liveCoords}
                icon={{
                  url: `data:image/svg+xml,${encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15" fill="#0B3547" stroke="white" stroke-width="2"/>
                      <text x="18" y="23" font-size="16" text-anchor="middle" fill="white">🚛</text>
                    </svg>
                  `)}`,
                }}
                zIndex={100}
              />
            )}

            {/* Destination marker – flag */}
            {isLoaded && (
            <MarkerF
              position={toCoords}
              icon={{
                url: `data:image/svg+xml,${encodeURIComponent(`
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="#1A8C76" stroke="white" stroke-width="2"/>
                    <text x="18" y="23" font-size="16" text-anchor="middle" fill="white">🚩</text>
                  </svg>
                `)}`,
              }}
            />
            )}
          </GoogleMap>
        ) : (
          /* Loading placeholder */
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#c8dcb0', flexDirection: 'column', gap: 10, padding: 20, textAlign: 'center' }}>
            <div className="loading-dot" style={{ width: 12, height: 12 }}/>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
              {loadError ? `Map Error: ${loadError.message || 'Check API Key & Enable Maps JS API'}` : 'Loading map…'}
            </div>
          </div>
        )}

        {isLoaded && directionsFailed && (
          <div style={{ position: 'absolute', top: 10, left: 10, right: 10, zIndex: 5, background: 'rgba(11,53,71,0.86)', color: '#fff', fontSize: 11, padding: '7px 10px', borderRadius: 8, letterSpacing: '0.2px' }}>
            Map loaded in demo mode. Route request is disabled, showing fallback tracking.
          </div>
        )}
      </div>

      {/* ── Bottom Sheet ── */}
      <div className="bottom-sheet">
        <div className="sheet-handle"/>

        <div className="sheet-dest-name">{transfer?.toName || 'Destination'}</div>
        <div className="sheet-status-label">STATUS: PRIORITY SUPPLY ROUTE</div>

        {/* Item chips */}
        <div className="sheet-chips">
          {items.map(([key, val]) => (
            <div key={key} className="sheet-chip">
              <span>{RESOURCE_ICON[key] || '📦'}</span>
              {key === 'water_liters'
                ? `POTABLE WATER (${val >= 1000 ? (val / 1000).toFixed(1) + 'kL' : val + 'L'})`
                : `${RESOURCE_LABEL[key] || key.toUpperCase()} (${val})`
              }
            </div>
          ))}
        </div>

        {/* Detail rows */}
        <div className="sheet-rows">
          <div className="sheet-row">
            <div className="sheet-row-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
              Route name
            </div>
            <div className="sheet-row-val">{transfer?.routeSummary || '—'}</div>
          </div>

          <div className="sheet-row">
            <div className="sheet-row-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
              Distance remaining
            </div>
            <div className="sheet-row-val">{transfer?.distanceKm ?? '—'} KM</div>
          </div>

          <div className="sheet-row">
            <div className="sheet-row-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              Estimated arrival
            </div>
            <div>
              <div className="sheet-row-val highlight">{etaStr}</div>
              <div className="sheet-row-val-sub">SYNCED 2M AGO</div>
            </div>
          </div>
        </div>
      </div>

    </>
  )
}
