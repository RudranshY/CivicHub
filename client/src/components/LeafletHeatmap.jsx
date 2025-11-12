// client/src/components/LeafletHeatmap.jsx

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import 'leaflet.heat'; // This imports the plugin
import L from 'leaflet';

const LeafletHeatmap = ({ points, radius = 25, gradient }) => {
  const map = useMap();

  useEffect(() => {
    // Create a new heatmap layer
    const heatLayer = L.heatLayer(points, {
      radius: radius,
      gradient: gradient,
      // You can add more options here (blur, max, etc.)
    });

    // Add the layer to the map
    heatLayer.addTo(map);

    // This is the cleanup function: it removes the layer when the component is unmounted
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points, radius, gradient]); // Re-run if these props change

  return null; // This component doesn't render any visible HTML itself
};

export default LeafletHeatmap;