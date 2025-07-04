import React from "react";
import grave from "../Assets/grave.jpg";
import face from "../Assets/face.png";
import { useNavigate } from "react-router-dom";
export default function DashboardMainService() {
  const navigate = useNavigate();
  function bookgrave() {
    navigate("/bookGrave");
  }

  function searchMorgue() {
    navigate("/SearchMorgue");
  }
  return (
    <>
      <div className="col-md-6">
        <div className="dashboard-main-service-card">
          <div className="dashboard-main-service-card-content">
            <h2 className="dashboard-main-services-card-title">Book a Grave</h2>
            <p className="dashboard-main-service-card-description">
              Using the latest technology our servers will find burial sites
              near you and allow you to choose a suitable site.
            </p>
            <button
              className="btn dashboard-main-service-card-button"
              onClick={bookgrave}
            >
              Book Grave
            </button>
          </div>
          <div className="dashboard-main-service-card-image-container">
            <img
              src={grave}
              alt="Service Image"
              className="dashboard-main-service-card-image"
            ></img>
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <div className="dashboard-main-service-card">
          <div className="dashboard-main-service-card-content">
            <h2 className="dashboard-main-services-card-title">
              Search Morgues
            </h2>
            <p className="dashboard-main-service-card-description">
              Search the morgues for any missing person using the latest
              AI-based image recongtion to search.
            </p>
            <button
              className="btn dashboard-main-service-card-button"
              onClick={searchMorgue}
            >
              Search Morgue
            </button>
          </div>
          <div className="dashboard-main-service-card-image-container">
            <img
              src={face}
              alt="Service Image"
              className="dashboard-main-service-card-image"
            ></img>
          </div>
        </div>
      </div>
    </>
  );
}
