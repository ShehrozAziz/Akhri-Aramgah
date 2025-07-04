import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import ErrorModal from "./ErrorModal";
import "../Styling/Map.css"; // Ensure this includes your custom CSS
import Location from "../Assets/Location.png";
import Current from "../Assets/current.png";

// Define the bounds for Lahore
const lahoreBounds = L.latLngBounds(
  [31.33, 74.15], // Southwest corner (lower-left)
  [31.75, 74.52] // Northeast corner (upper-right)
);

// Create a custom icon for the current location
const currentLocationIcon = new L.Icon({
  iconUrl: Current, // Replace with your icon URL
  iconSize: [49, 40], // Size of the icon
  iconAnchor: [12, 41], // Point of the icon which will correspond to marker's location
  popupAnchor: [1, -34], // Point from which the popup should open relative to the iconAnchor
});

// Create a custom icon for the click marker
const clickLocationIcon = new L.Icon({
  iconUrl: Location, // Replace with your icon URL
  iconSize: [40, 40], // Size of the icon
  iconAnchor: [12, 41], // Point of the icon which will correspond to marker's location
  popupAnchor: [1, -34], // Point from which the popup should open relative to the iconAnchor
});

// Modify LocationMarker to accept a prop for setting the position in parent
const LocationMarker = ({ onPositionSet, onPositionSet1 }) => {
  const [position, setPosition] = useState(null);

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng); // Set the marker position on click

      setTimeout(() => {
        if (onPositionSet) onPositionSet(e.latlng); // Send the position back to the parent
        if (onPositionSet1) onPositionSet1(e.latlng); // Check if onPositionSet1 is defined
      }, 0);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={clickLocationIcon} /> // Use custom click icon here
  );
};

// Component to update the map's position based on selected popular location
const ChangeMapView = ({ coordinates }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(coordinates, 16); // Update view based on selected location
  }, [map, coordinates]); // Add coordinates as a dependency
  return null;
};

const MapComponent = ({ message, onPositionSet, onNext }) => {
  const [formError, setFormError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const defaultLocation = [31.5497, 74.3436]; // Default to Lahore center
  const [currentLocation, setCurrentLocation] = useState(defaultLocation);
  const [zoom, setZoom] = useState(13);
  const [searchQuery, setSearchQuery] = useState(""); // Search input
  const [suggestions, setSuggestions] = useState([]); // Search suggestions
  const [selectedLocation, setSelectedLocation] = useState(null); // For search

  // Function to fetch location suggestions from Nominatim API
  const fetchLocationSuggestions = async (query) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}+Lahore&format=json&limit=3`
    );
    const data = await response.json();
    return data.map((item) => ({
      name: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
    }));
  };

  // Update suggestions based on search input
  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 2) {
      const locationSuggestions = await fetchLocationSuggestions(query);
      setSuggestions(locationSuggestions);
    } else {
      setSuggestions([]); // Clear suggestions if input is too short
    }
  };

  // Handle selection of a suggestion
  const handleSuggestionClick = (suggestion) => {
    const selectedCoordinates = [suggestion.lat, suggestion.lon];
    setSelectedLocation(selectedCoordinates);
    setCurrentLocation(selectedCoordinates);
    setSuggestions([]); // Clear suggestions after selecting one
    setSearchQuery(suggestion.name); // Set input to selected suggestion
  };

  useEffect(() => {
    // Define the function to get current location
    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            // If the user's location is within Lahore bounds, set it as currentLocation
            if (lahoreBounds.contains([latitude, longitude])) {
              setCurrentLocation([latitude, longitude]);
              setSelectedLocation([latitude, longitude]); // Set the user's location as selected
            } else {
              setCurrentLocation(defaultLocation);
              setSelectedLocation(defaultLocation);
            }
          },
          (error) => {
            console.error("Error getting location:", error);
            // Use default location if error occurs
            setCurrentLocation(defaultLocation);
            setSelectedLocation(defaultLocation);
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
        // Use default location if geolocation is not supported
        setCurrentLocation(defaultLocation);
        setSelectedLocation(defaultLocation);
      }
    };

    getCurrentLocation();
  }, []); // Run only on mount

  const [position, setPosition] = useState(null);
  // Function to handle position set by LocationMarker
  const handlePositionSet = (position1) => {
    const latitude = position1.lat;
    const longitude = position1.lng;
    setPosition(position1);
  };

  const handleNext = () => {
    if (!position) {
      setFormError("Please select a location.");
      setIsModalOpen(true);
      return;
    }
    onNext(); // Call onNext if position is set
  };

  const handleExit = () => {
    navigate("/Dashboard");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormError(""); // Clear error on modal close
  };

  return (
    <div className="map-main-container">
      {/* Card for Input Field */}
      <div className="card map-card mb-3">
        <div className="card-body map-card-body">
          <h5 className="map-card-title">{message}</h5>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            className="form-control map-input"
            placeholder="Search for a location..."
          />
          {/* Render suggestions if available */}
          {suggestions.length > 0 && (
            <ul className="list-group mt-2">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="list-group-item"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Card for Map */}
      <div className="card map-card mb-3">
        <div className="card-body map-card-body">
          <MapContainer
            center={currentLocation}
            zoom={zoom}
            style={{ height: "400px", width: "100%" }}
            minZoom={12} // Minimum zoom level set to 12
            maxBounds={lahoreBounds} // Restrict panning outside Lahore bounds
            maxBoundsViscosity={1.0} // Prevent panning outside Lahore
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={currentLocation} icon={currentLocationIcon} />
            <LocationMarker
              onPositionSet={onPositionSet}
              onPositionSet1={handlePositionSet}
            />{" "}
            {/* Pass both functions here */}
            {selectedLocation && (
              <ChangeMapView coordinates={selectedLocation} />
            )}
          </MapContainer>
        </div>
      </div>

      {/* Buttons */}
      <div className="d-flex justify-content-between">
        <button className="btn map-button" onClick={handleExit}>
          Cancel
        </button>
        <button className="btn map-button" onClick={handleNext}>
          Next
        </button>
      </div>
      {isModalOpen && <ErrorModal message={formError} onClose={closeModal} />}
    </div>
  );
};

export default MapComponent;
