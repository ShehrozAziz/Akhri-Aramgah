import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorModal from "./ErrorModal";

const MorgueChooser = ({ onNext }) => {
  const [morgues, setMorgues] = useState([]);
  const [selectedMorgue, setSelectedMorgue] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Get user's current location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting location:", error);
      }
    );

    // Fetch morgues from API
    const fetchMorgues = async () => {
      try {
        const response = await fetch("http://localhost:5006/api/getAllMorgues");
        const data = await response.json();
        setMorgues(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching morgues:", error);
        setLoading(false);
      }
    };

    fetchMorgues();
  }, []);

  // Haversine formula to calculate distance
  const getDistance = (lat1, lng1, lat2, lng2) => {
    if (
      lat1 === undefined ||
      lng1 === undefined ||
      lat2 === undefined ||
      lng2 === undefined
    ) {
      return null; // Return null if any value is missing
    }
    const toRad = (angle) => (angle * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Sort morgues by closest distance
  useEffect(() => {
    if (userLocation && morgues.length > 0) {
      const sortedMorgues = [...morgues]
        .map((morgue) => {
          if (
            morgue.source?.lat !== undefined &&
            morgue.source?.lng !== undefined
          ) {
            return {
              ...morgue,
              distance: getDistance(
                userLocation.lat,
                userLocation.lng,
                morgue.source.lat,
                morgue.source.lng
              ),
            };
          }
          return { ...morgue, distance: null };
        })
        .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));

      setMorgues(sortedMorgues);
    }
  }, [userLocation, morgues]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleMorgueClick = (morgue) => {
    setSelectedMorgue(morgue.id);
  };

  const handleNext = () => {
    if (!selectedMorgue) {
      setErrorMessage("Please select a morgue before proceeding.");
      setIsModalOpen(true);
    } else {
      onNext(selectedMorgue);
    }
  };

  const handleExit = () => {
    navigate("/dashboard");
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100">
      <div
        className="card shadow-lg morgue-book-card"
        style={{
          width: "70vw",
          height: "80vh",
          overflow: "auto",
          padding: "30px",
          borderRadius: "20px",
          position: "relative",
        }}
      >
        <h3 className="text-center fw-bold">Choose a Morgue</h3>
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Search for a morgue..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <div
          className="list-group"
          style={{ maxHeight: "40vh", overflowY: "auto" }}
        >
          {loading ? (
            <div>Loading...</div>
          ) : (
            morgues
              .filter((morgue) =>
                morgue.name.toLowerCase().includes(searchQuery)
              )
              .map((morgue) => (
                <button
                  key={morgue.id}
                  className={`list-group-item list-group-item-action ${
                    selectedMorgue === morgue.id ? "active" : ""
                  }`}
                  onClick={() => handleMorgueClick(morgue)}
                >
                  <h5 className="mb-1">{morgue.name}</h5>
                  <p className="mb-1">
                    {typeof morgue.distance === "number"
                      ? `${morgue.distance.toFixed(2)} km away`
                      : "Distance unavailable"}
                  </p>
                </button>
              ))
          )}
        </div>
        <div
          className="d-flex justify-content-between"
          style={{
            position: "absolute",
            bottom: "20px",
            width: "calc(70vw - 50px)",
          }}
        >
          <button className="btn map-button" onClick={handleExit}>
            Cancel
          </button>
          <button className="btn map-button" onClick={handleNext}>
            Next
          </button>
        </div>
      </div>
      {isModalOpen && (
        <ErrorModal message={errorMessage} onClose={closeModal} />
      )}
    </div>
  );
};

export default MorgueChooser;
