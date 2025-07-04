import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import PaymentModal from "./PaymentModal"; // Import the PaymentModal component

const MorgueCart = ({ MorgueID }) => {
  const navigate = useNavigate();
  const [deceasedName, setDeceasedName] = useState("");
  const [cnic, setCnic] = useState("");
  const [dateOfDeath, setDateOfDeath] = useState("");
  const [causeOfDeath, setCauseOfDeath] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false); // Control payment modal visibility
  const price = 5000; // Fixed price for morgue booking

  const token = localStorage.getItem("token");
  const jwt_token = jwtDecode(token);
  const userID = jwt_token.id;

  const causes = [
    "Heart Attack",
    "Cancer",
    "Accident",
    "COVID-19",
    "Old Age",
    "Other",
  ];

  const validateForm = () => {
    const cnicPattern = /^\d{5}-\d{7}-\d{1}$/;
    if (!cnicPattern.test(cnic)) {
      toast.error("Invalid CNIC format. Use xxxxx-xxxxxxx-x.");
      return false;
    }

    if (!deceasedName || !dateOfDeath || !causeOfDeath) {
      toast.error("Please fill all the fields.");
      return false;
    }

    return true;
  };

  const handleProceedToPayment = () => {
    if (validateForm()) {
      setShowPaymentModal(true);
    }
  };

  const handlePaymentResult = async (success) => {
    if (success) {
      // Only proceed with booking if payment was successful
      setLoading(true);

      const data = {
        userID,
        MorgueID,
        deceasedName,
        cnic,
        dateOfDeath,
        causeOfDeath,
      };

      try {
        const response = await fetch("http://localhost:5006/api/bookCabin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            morgueId: MorgueID,
            userID,
            deceasedName,
            cnic,
            dateOfDeath,
            causeOfDeath,
          }),
        });

        if (response.ok) {
          toast.success("Morgue booking successful!");
          setTimeout(() => navigate("/Dashboard"), 1000);
        } else {
          toast.error("Booking failed.");
        }
      } catch (error) {
        console.error("Error booking morgue:", error);
        toast.error("Error booking morgue.");
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("Payment was not successful. Please try again.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <ToastContainer position="top-center" autoClose={5000} />

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          price={price}
          message={`Payment for Morgue Booking for ${deceasedName}`}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentResult}
        />
      )}

      <div
        className="card shadow-lg morgue-book-card"
        style={{
          width: "70vw",
          height: "70vh",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3 className="text-center fw-bold">Morgue Order</h3>
        <div
          className="container overflow-auto"
          style={{ flex: 1, maxHeight: "calc(100% - 80px)" }}
        >
          {/* Form Inputs */}
          <div className="mb-3">
            <label htmlFor="deceasedName" className="form-label">
              Deceased Name
            </label>
            <input
              type="text"
              className="form-control"
              id="deceasedName"
              value={deceasedName}
              onChange={(e) => setDeceasedName(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="cnic" className="form-label">
              CNIC Number (xxxxx-xxxxxxx-x)
            </label>
            <input
              type="text"
              className="form-control"
              id="cnic"
              value={cnic}
              onChange={(e) => setCnic(e.target.value)}
              maxLength="15"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="dateOfDeath" className="form-label">
              Date of Death
            </label>
            <input
              type="date"
              className="form-control"
              id="dateOfDeath"
              value={dateOfDeath}
              onChange={(e) => setDateOfDeath(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="causeOfDeath" className="form-label">
              Cause of Death
            </label>
            <select
              className="form-select"
              id="causeOfDeath"
              value={causeOfDeath}
              onChange={(e) => setCauseOfDeath(e.target.value)}
            >
              <option value="">Select Cause of Death</option>
              {causes.map((cause, index) => (
                <option key={index} value={cause}>
                  {cause}
                </option>
              ))}
            </select>
          </div>

          {/* Price information */}
          <div className="mb-3">
            <h5>Price: PKR {price}</h5>
            <p className="text-muted">
              (Approximately ${Math.ceil(price / 276)} USD)
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex justify-content-between mt-3">
          <button
            className="btn map-button"
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </button>
          <button
            className="btn map-button"
            onClick={handleProceedToPayment}
            disabled={loading}
          >
            {loading ? "Processing..." : "Proceed to Payment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MorgueCart;
