import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./style.scss";

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      console.log("Latitude:", position.coords.latitude);
      console.log("Longitude:", position.coords.longitude);
    },
    (error) => {
      console.error("Error getting location:", error.message);
    }
  );
} else {
  console.log("Geolocation is not supported by this browser.");
}

const markers = [
  {
    id: 1,
    name: "Fit For Less",
    position: [44.77269337771879, -63.693536924525894], // Latitude, Longitude
    description: "Fit For Less Lower Sackville",
    link: "/gym/sackville",
  },
  {
    id: 2,
    name: "Fit For Less",
    position: [44.73686038444007, -63.65620366193974],
    description: "Fit For Less Beford",
    link: "/gym/BedfordFitForLess",
  },
  {
    id: 3,
    name: "Fit For Less",
    position: [44.66158683551251, -63.65525032597009],
    description: "Fit For Less Lacewood Drive",
    link: "https://www.fit4less.ca/locations/provinces/nova-scotia/halifax/halifax-clayton-park?utm_source=G&utm_medium=lpm&utm_campaign=fit4less",
  },
];

// Separate component to handle map position updates
const ChangeView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 12, { animate: true });
  }, [center, map]);
  return null;
};

const Map = ({ searchResults }) => {
  const [position, setPosition] = useState([44.648766, -63.575237]); // Default center

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
      console.log(data);
      console.log("f");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const createCustomMarkerIcon = (color = "#ff5722") => {
    return new L.Icon({
      iconUrl: `data:image/svg+xml;charset=UTF-8,
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
          <path fill="${color}" d="M12.5,0C5.597,0,0,5.597,0,12.5C0,19.403,12.5,41,12.5,41S25,19.403,25,12.5C25,5.597,19.403,0,12.5,0z
          M12.5,18.75a6.25,6.25,0,1,1,0-12.5a6.25,6.25,0,0,1,0,12.5z"/>
        </svg>`,
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  };

  // Create your orange marker with the desired RGB value
  const orangeIcon = createCustomMarkerIcon("rgb(255, 140, 0)");

  // Fetch coordinates when address changes
  useEffect(() => {
    if (searchResults) {
      fetchCoordinates(searchResults);
    }
  }, [searchResults]);

  return (
    <div
      className="map"
      style={{
        height: "65vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <MapContainer
        center={position}
        zoom={12}
        scrollWheelZoom={true}
        style={{
          height: "100%",
          width: "80%",
          maxWidth: "1300px",
          margin: "0 auto",
        }}
      >
        <ChangeView center={position} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers.map((marker) => (
          <Marker
            id="marker"
            key={marker.id}
            position={marker.position}
            icon={orangeIcon}
          >
            <Popup>
              <a href={marker.link} rel="noopener noreferrer">
                {marker.description}
              </a>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;
