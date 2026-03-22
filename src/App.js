import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, divIcon } from 'leaflet'
import coffeeShops from './data/coffeeShops';

const myIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
 iconSize: [20,32]
})

// Coffee cup icon using a simple optimized inline SVG (less repaint overhead than emoji fonts)
const coffeeCupIcon = new divIcon({
  className: 'coffee-cup-icon',
  html: `<div class="coffee-cup-inner" aria-label="coffee cup">☕</div>`,
  iconSize: [42, 42],
  pointAnchor: [21, 21],
})

const AnimatedCoffeeCup = React.memo(function AnimatedCoffeeCup({ coffeeShops }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const map = useMap();
  const markerRef = useRef(null);

  const initialPos = (coffeeShops && coffeeShops.length > 0)
    ? [coffeeShops[0].latitude, coffeeShops[0].longitude]
    : [51.505, -0.09];

  // Use a ref for animated position to avoid React re-renders each frame
  const animatedPosRef = useRef(initialPos);

  const currentShop = useMemo(() => {
    if (!coffeeShops || coffeeShops.length === 0) return null;
    return coffeeShops[currentIndex % coffeeShops.length];
  }, [coffeeShops, currentIndex]);

  useEffect(() => {
    if (!isAnimating || !coffeeShops || coffeeShops.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % coffeeShops.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isAnimating, coffeeShops]);

  // When the current shop changes, interpolate the marker from previous to next position
  useEffect(() => {
    if (!currentShop) return;

    const from = animatedPosRef.current;
    const to = [currentShop.latitude, currentShop.longitude];
    const duration = 800; // ms
    const start = performance.now();
    let raf = null;

    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      }
      const eased = easeInOutCubic(t);
      const lat = from[0] + (to[0] - from[0]) * eased;
      const lng = from[1] + (to[1] - from[1]) * eased;
      animatedPosRef.current = [lat, lng];

      // Update marker position directly (no React re-render)
      if (markerRef.current && markerRef.current.setLatLng) {
        try {
          markerRef.current.setLatLng([lat, lng]);
        } catch (e) {
          // ignore
        }
      }

      // Pan map to follow marker smoothly (no animation, each frame synced to marker)
      if (map && map.panTo && typeof map.panTo === 'function') {
        try {
          map.panTo([lat, lng], { animate: false });
        } catch (e) {
          // ignore
        }
      }

      if (t < 1) raf = requestAnimationFrame(step);
    }

    raf = requestAnimationFrame(step);

    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [currentShop]);

  // Sync initial pos when `coffeeShops` changes (set marker directly)
  useEffect(() => {
    if (coffeeShops && coffeeShops.length > 0 && markerRef.current && markerRef.current.setLatLng) {
      const first = coffeeShops[0];
      animatedPosRef.current = [first.latitude, first.longitude];
      try { markerRef.current.setLatLng(animatedPosRef.current); } catch (e) {}
    }
  }, [coffeeShops]);

  if (!currentShop) return null;

  return (
    <Marker
      ref={markerRef}
      // position prop set only initially to avoid React-driven moves; markerRef will be updated each frame
      position={initialPos}
      icon={coffeeCupIcon}
      opacity={0.95}
      interactive={false}
    >
      <Popup>
        <div style={{ textAlign: 'center' }}>
          <strong>☕ Visiting:</strong><br />
          {currentShop.name}
        </div>
      </Popup>
    </Marker>
  );
});

function App() {
  return (
    <div>
      <MapContainer
        center={[51.505, -0.09]}  // Initial position latitude and longitude
        zoom={12}                  // Initial zoom level
        style={{ height: '600px', width: '100%' }}
      >
        {/* Map layers go here */}
        
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        {/* Animated Coffee Cup */}
        <AnimatedCoffeeCup coffeeShops={coffeeShops} />

      {coffeeShops.map(data => ( 
          <Marker 
           key = {data.name}
           position={[data.latitude, data.longitude]}
           icon={myIcon}>
           <Popup>
                {data.name}
            </Popup>
        </Marker>
    ))}

      {/* <Marker position={[51.505, -0.09]} icon={myIcon}>
      <Popup>
      Coffee Shop!
      </Popup>
      </Marker>  */}
      
      </MapContainer>
      <h1>Coffee Map</h1>
      </div>
  );
}

export default App;
