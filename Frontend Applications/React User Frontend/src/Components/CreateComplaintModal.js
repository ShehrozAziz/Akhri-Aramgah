import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";

const CreateComplaintModal = ({ show, onClose }) => {
  const token = localStorage.getItem("token");
  const jwt_token = jwtDecode(token);
  const userID = jwt_token.id;

  const [convict, setConvict] = useState("");
  const [type, setType] = useState("Graveyard");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/register-complaint",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userID, convict, type, message }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setSuccessMessage("Complaint registered successfully!");
        setConvict("");
        setType("Graveyard");
        setMessage("");
      } else {
        setErrorMessage(data.message || "Failed to register complaint.");
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      setErrorMessage("An error occurred. Please try again.");
    }

    setLoading(false);
  };

  const getConvictLabel = () => {
    switch (type) {
      case "Graveyard":
        return "Graveyard Name";
      case "Morgue":
        return "Morgue Name";
      case "Caterer":
      case "Transporter":
        return "Order ID";
      default:
        return "Convict";
    }
  };

  return (
    <div
      className={`modal fade ${show ? "show d-block" : "d-none"}`}
      tabIndex="-1"
      role="dialog"
    >
      <div className="modal-backdrop show" onClick={onClose}></div>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content create-complaint-card">
          <div className="modal-header">
            <h5 className="modal-title">Register Complaint</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            {successMessage && (
              <div className="alert alert-success">{successMessage}</div>
            )}
            {errorMessage && (
              <div className="alert alert-danger">{errorMessage}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">{getConvictLabel()}</label>
                <input
                  type="text"
                  className="form-control"
                  value={convict}
                  onChange={(e) => setConvict(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Type</label>
                <select
                  className="form-control"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                >
                  <option value="Graveyard">Graveyard</option>
                  <option value="Morgue">Morgue</option>
                  <option value="Caterer">Caterer</option>
                  <option value="Transporter">Transporter</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Message</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn map-button"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Complaint"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateComplaintModal;
