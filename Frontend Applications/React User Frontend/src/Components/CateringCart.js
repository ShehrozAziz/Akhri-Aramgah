import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import ErrorModal from "./ErrorModal";
import PaymentModal from "./PaymentModal"; // Import PaymentModal
import "../Styling/TransportCart.css";

const fetchAddress = async (lat, lng) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    return response.data.display_name || "Address not found";
  } catch (error) {
    console.error("Error fetching address:", error);
    return "Error fetching address.";
  }
};

export default function CateringCart({ source, orderDetails, price }) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sourceAddress, setSourceAddress] = useState("");
  const [fare, setFare] = useState(price);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (source) {
      const getAddress = async () => {
        try {
          setLoading(true);
          const address = await fetchAddress(source.lat, source.lng);
          setSourceAddress(address);
        } catch (err) {
          console.error("Error fetching address for source:", err);
          setError("Error fetching address.");
        } finally {
          setLoading(false);
        }
      };
      getAddress();
    }
  }, [source]);

  const handleExit = () => {
    navigate("/Dashboard");
  };

  const handlePaymentSuccess = async (success) => {
    if (!success) {
      toast.error("Payment failed! Please try again.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const jwt_token = jwtDecode(token);
      const userID = String(jwt_token.id);

      const userDetailsResponse = await axios.post(
        "http://localhost:5000/api/userdetails",
        { userID }
      );

      if (!userDetailsResponse.data.success) {
        setError("Failed to retrieve user details.");
        setIsModalOpen(true);
        setLoading(false);
        return;
      }

      const { name, phone } = userDetailsResponse.data.userDetails;

      const orderData = {
        userID,
        name,
        phone,
        sourcePin: `${source.lat},${source.lng}`,
        sourceAddress,
        fare,
        orderDetails,
        status: "Pending",
      };

      const placeOrderResponse = await axios.post(
        "http://localhost:5002/api/placeOrder",
        orderData
      );

      if (placeOrderResponse.data.success) {
        toast.success("Order placed successfully!");
        setTimeout(() => {
          navigate("/Dashboard");
        }, 1000);
      } else {
        setError("Failed to place the order. Please try again.");
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Order submission error:", error);
      setError("An error occurred while placing the order.");
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="catererpayment-container mt-5">
      <h2 className="transportpayment-title text-center mb-4">
        Catering Checkout
      </h2>

      <div className="transportpayment-card mb-4">
        <div className="transportpayment-card-body">
          <h5 className="transportpayment-card-title">Order Details</h5>
          <p>
            <strong>Source Address: </strong> {sourceAddress || "Fetching..."}
          </p>
          <p>
            <strong>Items: </strong> {orderDetails}
          </p>
          <p>
            <strong>Price: </strong> {fare} Rs
          </p>
        </div>
      </div>

      <div className="transportpayment-card">
        <div className="transportpayment-card-body">
          <h5 className="transportpayment-card-title">Payment</h5>
          <p>Click below to proceed with payment.</p>

          <div className="d-flex justify-content-between mt-4">
            <button className="btn map-button" onClick={handleExit}>
              Cancel
            </button>
            <button
              className="btn map-button"
              onClick={() => setShowPaymentModal(true)}
              disabled={loading}
            >
              {loading ? "Processing..." : "Book Order"}
            </button>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal
          price={fare}
          message="Complete your payment to book the order."
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {isModalOpen && (
        <ErrorModal message={error} onClose={() => setIsModalOpen(false)} />
      )}
      <ToastContainer position="top-right" autoClose={500} />
    </div>
  );
}
