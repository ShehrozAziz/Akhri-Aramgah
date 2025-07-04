import React, { useState } from "react";
import complaint from "../Assets/complaint.png";
import CreateComplaintModal from "./CreateComplaintModal"; // Import modal component

export default function CreateComplaint() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="row Dashboard-row2">
        <div className="col-md-8">
          <div className="complaint-card">
            <div className="complaint-card-content">
              <h2 className="complaints-card-title">Register a Complaint</h2>
              <p className="complaint-card-description">
                Submit a Complaint to the admin panel in case of any problem.
                Akhri Aramgah features smart AI and NLP features to streamline
                the process of complaint resolution.
              </p>
              <button
                className="btn complaint-card-button"
                onClick={() => setShowModal(true)} // Open modal on click
              >
                Submit Complaint
              </button>
            </div>
            <div className="complaint-card-image-container">
              <img
                src={complaint}
                alt="Service Image"
                className="complaint-card-image"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Render Modal if showModal is true */}
      {showModal && (
        <CreateComplaintModal
          show={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
