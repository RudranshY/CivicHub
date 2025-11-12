import React, { useEffect, useState, useMemo } from 'react';
import { getHeatmapData } from '../helper/api';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { auth } from '../components/firebase.jsx';

// --- LEAFLET IMPORTS ---
import { MapContainer, TileLayer, useMap } from 'react-leaflet'; // Added useMap
import LeafletHeatmap from '../components/LeafletHeatmap'; // Import our new component
// --- END LEAFLET IMPORTS ---

const containerStyle = {
  width: '100vw',
  height: '100vh',
};

// --- NEW: Default center (India) if user denies location ---
const defaultCenter = [23.039809, 78.5031242];

// --- NEW Component to handle map centering ---
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}
// --- END NEW Component ---

const HeatmapComponent = () => {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);
  const [heatMapData, setHeatMapData] = useState([]);

  // --- NEW State for map center ---
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(5.8); // Default zoom

  useEffect(() => {
    // --- NEW: Ask for user's location ---
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]); // Set map to user's location
          setMapZoom(13); // Zoom in closer
        },
        (error) => {
          console.error("Error getting location, using default.", error);
          setMapCenter(defaultCenter); // On error, use the default
          setMapZoom(5.8);
        }
      );
    }
    // --- END NEW ---

    // ... (Your existing useEffect for auth check is perfect) ...
    const usingSwal = () => {
      withReactContent(Swal).fire({
        icon: "error",
        title: "User Not Logged In",
        text: "Please sign in to view Heat Map",
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Log In',
        cancelButtonText: 'Close',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        } else {
          navigate('/');
        }
      })
    };
    auth.onAuthStateChanged((user) => {
      if (!user) {
        usingSwal();
      } else {
        setLoggedIn(true);
      }
    });
  }, [navigate]);

  useEffect(() => {
    // --- MODIFIED: Don't fetch unless logged in ---
    if (!loggedIn) return; 

    const fetchHeatmapData = async () => {
      try {
        const data = await getHeatmapData();
        setHeatMapData(data);
      } catch (error) {
        console.error('Error fetching heatmap data:', error);
      }
    };
    fetchHeatmapData();
  }, [loggedIn]); // --- MODIFIED: Run when loggedIn changes ---

  // ... (Your heatmapPoints and gradient code is perfect) ...
  const heatmapPoints = useMemo(() => {
    try {
      return heatMapData.map(point => [point.lat, point.lng, point.weight || 1.0]);
    } catch (error) {
      console.error('Error creating heatmap points:', error);
      alert('Please reload this page once, if the issue persists please report a bug.\nSorry for the inconvenience.');
      return []; 
    }
  }, [heatMapData]);

  const gradient = {
    0.1: 'rgba(0, 255, 255, 1)', 
    0.3: 'rgba(0, 200, 255, 1)',
    0.5: 'rgba(0, 150, 255, 1)',
    0.7: 'rgba(0, 100, 255, 1)',
    0.9: 'rgba(0, 50, 255, 1)',
    1.0: 'rgba(0, 0, 255, 1)'    
  };

  return (
    <>
      {loggedIn && (
        <MapContainer
          style={containerStyle}
          center={mapCenter} // --- MODIFIED ---
          zoom={mapZoom}     // --- MODIFIED ---
        >
          {/* --- NEW: This component updates the map view --- */}
          <ChangeView center={mapCenter} zoom={mapZoom} />

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {heatmapPoints.length > 0 && (
            <LeafletHeatmap
              points={heatmapPoints}
              radius={25}
              gradient={gradient}
            />
          )}
        </MapContainer>
      )}
      {!loggedIn && <div>Loading...</div>}
    </>
  );
};

export default React.memo(HeatmapComponent);