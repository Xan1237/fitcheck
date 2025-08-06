import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./style.scss";

// Import marker icon images to ensure they're properly bundled
const markerShadow =
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png";

// Component to handle map position updates with smooth animation
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
 
  useEffect(() => {
    // Project LatLng to screen coordinates at given zoom
    const targetPoint = map.project(center, zoom);
    const mapSize = map.getSize();

    // Shift up by 1/5 of the map height
    targetPoint.y -= mapSize.y / 5;

    // Convert back to LatLng and set view there
    const shiftedLatLng = map.unproject(targetPoint, zoom);
    
    // Add smooth animation
    map.flyTo(shiftedLatLng, zoom, {
      duration: 0.75, // Animation duration in seconds
      easeLinearity: 0.25,
    });
  }, [center, zoom, map]);

  return null;
};

// Component to handle map behavior when activeGym changes
const MapController = ({ markers, activeGym }) => {
  const map = useMap();
  
  useEffect(() => {
    if (activeGym && markers) {
      // Only center the map on the active gym
      const selectedGym = markers.find(gym => gym.id === activeGym);
      if (selectedGym) {
        // Use flyTo for smooth animation
        const position = selectedGym.position;
        // We don't need to call flyTo here since ChangeView will handle it
        // Just for sidebar clicks that won't trigger marker click events
        
        // But we can make sure the popup is open for sidebar clicks
        setTimeout(() => {
          const layers = Object.values(map._layers);
          for (const layer of layers) {
            if (layer._latlng && 
                layer._latlng.lat === selectedGym.position[0] && 
                layer._latlng.lng === selectedGym.position[1]) {
              layer.openPopup();
              break;
            }
          }
        }, 800); // Slight delay to allow animation to finish
      }
    }
  }, [activeGym, markers, map]);
  
  return null;
};

const Map = ({ searchResults, markers, activeGym, setActiveGym }) => {
  const [position, setPosition] = useState([44.648766, -63.575237]); // Default center
  const [zoom, setZoom] = useState(12);

  // Function to fetch coordinates from an address
  const fetchCoordinates = async (searchResults) => {
    try {
      const response = await fetch("/api/address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ searchResults }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setPosition([data.latitude, data.longitude]);
      setZoom(14); // Zoom in when searching for a specific location
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Create custom orange marker icons
  const createCustomMarkerIcon = (active = false) => {
    const size = active ? 35 : 25;
    const height = active ? 57 : 41;
    const strokeWidth = active ? 1.5 : 1;

    return new L.Icon({
      iconUrl: `data:image/svg+xml;charset=UTF-8,
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${height}" viewBox="0 0 25 41">
          <path stroke="%23ffffff" stroke-width="${strokeWidth}" fill="%23ff6b35" d="M12.5,0C5.597,0,0,5.597,0,12.5C0,19.403,12.5,41,12.5,41S25,19.403,25,12.5C25,5.597,19.403,0,12.5,0z
          M12.5,18.75a6.25,6.25,0,1,1,0-12.5a6.25,6.25,0,0,1,0,12.5z"/>
        </svg>`,
      shadowUrl: markerShadow,
      iconSize: [size, height],
      iconAnchor: [size / 2, height],
      popupAnchor: [0, -height],
      shadowSize: [41, 41],
    });
  };

  // Create marker icons
  const normalIcon = createCustomMarkerIcon(false);
  const activeIcon = createCustomMarkerIcon(true);

  // Fetch coordinates when address changes
  useEffect(() => {
    if (searchResults) {
      fetchCoordinates(searchResults);
    }
  }, [searchResults]);

  // Update map center when active gym changes
  useEffect(() => {
    if (activeGym && markers) {
      const selectedGym = markers.find((gym) => gym.id === activeGym);
      if (selectedGym) {
        setPosition(selectedGym.position);
        setZoom(15);
      }
    }
  }, [activeGym, markers]);

  return (
    <div className="map-container">
      <MapContainer
        center={position}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <ChangeView center={position} zoom={zoom} />
        <MapController markers={markers} activeGym={activeGym} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers &&
          markers.map((marker) => (
            <Marker
              key={marker.id}
              position={marker.position}
              icon={marker.id === activeGym ? activeIcon : normalIcon}
              eventHandlers={{
                click: (e) => {
                  setActiveGym(marker.id);
                  e.target.openPopup();
                },
              }}
            >
              <Popup>
                <div className="map-popup">
                  <h3>{marker.name}</h3>
                  <p>{marker.location}</p>
                  <a href={marker.link} className="popup-link">
                    View Details
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
};

export default Map;