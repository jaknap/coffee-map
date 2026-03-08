import logo from './logo.svg';
import './App.css';
import React, { Component, useState, useEffect }  from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, divIcon } from 'leaflet'
import coffeeShops from './data/coffeeShops';

const myIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
 iconSize: [20,32]
})

// Coffee cup icon using a simple emoji-based approach
const coffeeCupIcon = new divIcon({
  className: 'coffee-cup-icon',
  html: '<div class="coffee-cup-inner">☕</div>',
  iconSize: [50, 50],
  pointAnchor: [25, 25],
})

// Component to handle the coffee cup animation
function AnimatedCoffeeCup({ coffeeShops }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const map = useMap();

  useEffect(() => {
    if (!isAnimating || coffeeShops.length === 0) return;

    // Wait at each location, then move to next
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % coffeeShops.length;
        // Pan the map to the new location
        const nextShop = coffeeShops[nextIndex];
        map.flyTo([nextShop.latitude, nextShop.longitude], 14, {
          duration: 1.5
        });
        return nextIndex;
      });
    }, 3000); // Change position every 3 seconds

    return () => clearInterval(interval);
  }, [isAnimating, coffeeShops, map]);

  if (coffeeShops.length === 0) return null;

  const currentShop = coffeeShops[currentIndex];

  return (
    <Marker 
      position={[currentShop.latitude, currentShop.longitude]}
      icon={coffeeCupIcon}
      opacity={0.9}
    >
      <Popup>
        <div style={{ textAlign: 'center' }}>
          <strong>☕ Visiting:</strong><br/>
          {currentShop.name}
        </div>
      </Popup>
    </Marker>
  );
}

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
