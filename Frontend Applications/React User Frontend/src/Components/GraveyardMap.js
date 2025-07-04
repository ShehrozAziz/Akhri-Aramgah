import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InfinitySpin } from "react-loader-spinner"; // Import the loader
import ErrorModal from "./ErrorModal";

const GraveyardMap = ({ onNext, GraveyardID }) => {
  const [graveData, setGraveData] = useState(null);
  const [chosenGrave, setChosenGrave] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  // Fetch graveyard data from the API
  useEffect(() => {
    const fetchGraveData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5004/api/getGravesFromGraveyard/${GraveyardID}`
        );
        const data = await response.json();
        setGraveData(data);
      } catch (error) {
        console.error("Error fetching grave data:", error);
      }
    };
    fetchGraveData();
  }, [GraveyardID]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleGraveClick = (grave) => {
    if (grave.status === "booked" || grave.status === "Completed") {
      setErrorMessage("This grave is already booked. Please choose another.");
      setIsModalOpen(true);
    } else {
      setChosenGrave(grave.id);
    }
  };

  const handleNext = () => {
    if (!chosenGrave) {
      setErrorMessage("Please select a grave before proceeding.");
      setIsModalOpen(true);
    } else {
      onNext(chosenGrave);
    }
  };

  const handleExit = () => {
    navigate("/dashboard");
  };

  if (!graveData) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center vh-100">
        <InfinitySpin width="200" color="#4fa94d" />
        <p>Loading graveyard...</p>
      </div>
    );
  }

  const { graves, totalRows, totalCols } = graveData;

  const renderGraveyard = () => {
    const rows = [];
    let graveIndex = 0;

    for (let r = 1; r <= totalRows; r++) {
      const cols = [];

      for (let c = 1; c <= totalCols; c++) {
        // Add passage column every 4 columns
        if (c % 4 === 1 && c > 1) {
          cols.push(
            <div key={`passage-col-${r}-${c}`} className="col-auto"></div>
          );
        }

        const grave = graves[graveIndex];
        graveIndex++;

        // Determine background color
        let bgColor = "bg-white"; // Available (default)
        if (grave.id === chosenGrave) bgColor = "bg-success"; // Chosen
        else if (grave.status === "booked" || grave.status === "Completed")
          bgColor = "bg-danger"; // Booked

        // Render grave
        cols.push(
          <div
            key={grave.id}
            className={`col p-2 text-center border ${bgColor}`}
            style={{ cursor: "pointer" }}
            onClick={() => handleGraveClick(grave)}
          >
            🪦
          </div>
        );
      }

      // Add passage row every 4 rows
      rows.push(
        <div key={`row-${r}`} className="row flex-nowrap">
          {cols}
        </div>
      );
      if (r % 4 === 0 && r < totalRows) {
        rows.push(<div key={`passage-row-${r}`} className="row my-3"></div>);
      }
    }

    return rows;
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100">
      {/* External Card */}
      <div className="card shadow-lg w-75 h-auto position-relative grave-book-card">
        {/* Internal Card with Scrollable Graveyard Map */}
        <div
          className="card-body p-3"
          style={{ height: "60vh", overflowY: "auto" }}
        >
          <h3 className="text-center fw-bold mb-3">Graveyard Map</h3>
          <div className="container">{renderGraveyard()}</div>
        </div>

        {/* Buttons Fixed at the Bottom of External Card */}
        <div className="card-footer d-flex justify-content-between">
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

export default GraveyardMap;
