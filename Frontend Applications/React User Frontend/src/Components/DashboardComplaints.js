import React, { useState, useEffect } from "react";
import profile from "../Assets/profile.png";
import complaint from "../Assets/complaint.png";
import ProfileHeader from "./ProfileHeader";
import CreateComplaint from "./CreateComplaint";
import { jwtDecode } from "jwt-decode";
export default function DashboardComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const token = localStorage.getItem("token");
  const jwt_token = jwtDecode(token);
  const userID = jwt_token.id;

  // Fetch complaints for a specific userID (replace with actual user ID)
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/get-complaints",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userID }),
          }
        );

        const data = await response.json();
        if (data.success) {
          const formattedComplaints = data.complaints
            .map((c) => ({
              complaintId: c.complaintID,
              datePlaced: c.date,
              status: c.status,
              dateResolved:
                c.status === "Resolved" ? c.dateResolved || "N/A" : "N/A",
              verdict: c.decision,
              message: c.message,
            }))
            .sort((a, b) => new Date(b.datePlaced) - new Date(a.datePlaced)); // Sort latest first

          setComplaints(formattedComplaints);
        } else {
          setComplaints([]);
        }
      } catch (error) {
        console.error("Error fetching complaints:", error);
      }
    };

    fetchComplaints();
  }, []);

  // Function to open the modal with selected complaint details
  const handleDetailsClick = (complaint) => {
    setSelectedComplaint(complaint);
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setSelectedComplaint(null);
  };

  return (
    <>
      <ProfileHeader />

      <div
        className={`container Dashboard-container ${
          selectedComplaint ? "blurred" : ""
        }`}
      >
        <CreateComplaint />
      </div>

      {/* Complaints list */}
      <div
        className={`container Dashboard-container ${
          selectedComplaint ? "blurred" : ""
        }`}
      >
        <div className="row Dashboard-row2">
          <div className="col-md-10">
            <div className="complaint-card">
              <div className="container mt-4">
                <h2 className="complaints-internal-card-title">Complaints</h2>
                {complaints.length === 0 ? (
                  <p>No complaints made</p>
                ) : (
                  <div className="row">
                    {complaints.map((complaint) => (
                      <div
                        className="col-lg-6 col-md-12 mb-4"
                        key={complaint.complaintId}
                      >
                        <div className="complaint-card1">
                          <div className="complaint-internal-complaint-column p-3">
                            <div className="mb-3">
                              <span className="complaint-internal-label">
                                Complaint ID:
                              </span>
                              <span className="complaint-internal-value">
                                {complaint.complaintId}
                              </span>
                            </div>
                            <div className="mb-3">
                              <span className="complaint-internal-label">
                                Date:
                              </span>
                              <span className="complaint-internal-value">
                                {complaint.datePlaced}
                              </span>
                            </div>
                            <div className="mb-3">
                              <span className="complaint-internal-label">
                                Status:
                              </span>
                              <span className="complaint-internal-value complaint-internal-status">
                                {complaint.status}
                              </span>
                            </div>
                            <div className="text-start">
                              <button
                                className="btn complaint-internal-btn"
                                onClick={() => handleDetailsClick(complaint)}
                              >
                                Details
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Popup for Complaint Details */}
      {selectedComplaint && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="modal-heading">Details</h3>
            <p>
              <strong>Complaint ID:</strong> {selectedComplaint.complaintId}
            </p>
            <p>
              <strong>Date Placed:</strong> {selectedComplaint.datePlaced}
            </p>
            <p>
              <strong>Status:</strong> {selectedComplaint.status}
            </p>
            <p>
              <strong>Complaint Message:</strong> {selectedComplaint.message}
            </p>
            <p>
              <strong>Verdict:</strong> {selectedComplaint.verdict}
            </p>
            <div className="modal-button-div">
              <button className="btn modal-button" onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
