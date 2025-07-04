import React from "react";
import transport from "../Assets/transport.jpeg";
import morgue from "../Assets/morgue.jpeg";
import caterer from "../Assets/catering.jpeg";
import { useNavigate } from "react-router-dom";
export default function DashboardServices() {
  const navigate = useNavigate();
  const handleTransport = () => {
    navigate("/BookTransport");
  };
  const handleCatering = () => {
    navigate("/BookCatering");
  };
  const handleMorgue = () => {
    navigate("/BookMorgue");
  };
  return (
    <>
      <div className="col-lg-6 dashboard-services-col-lg-6">
        <div className="dashboard-services-cards-container">
          <div className="card dashboard-services-card" onClick={handleMorgue}>
            <img
              src={morgue}
              alt="Book a Morgue Cabin"
              className="dashboard-services-card-image"
            />
            <h2 className="dashboard-services-card-title">
              Book a Morgue Cabin
            </h2>
            <p className="dashboard-services-card-description">
              Find and Book a cabin in the morgue while you wait for the
              funeral.
            </p>
          </div>
          <div
            className="card dashboard-services-card"
            onClick={handleCatering}
          >
            <img
              src={caterer}
              alt="Service 2"
              className="dashboard-services-card-image"
            />
            <h2 className="dashboard-services-card-title">Book Caterers</h2>
            <p className="dashboard-services-card-description">
              Book relaible catering service for a funeral event.
            </p>
          </div>
          <div
            className="card dashboard-services-card"
            onClick={handleTransport}
          >
            <img
              src={transport}
              alt="Service 3"
              className="dashboard-services-card-image"
            />
            <h2 className="dashboard-services-card-title">
              Book Transport Service
            </h2>
            <p className="dashboard-services-card-description">
              Find and book a vehicle to transport the body.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
