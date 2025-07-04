import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import ErrorModal from "./ErrorModal";
import PaymentModal from "./PaymentModal"; // Import the existing payment modal
import { ToastContainer, toast } from "react-toastify";
import "../Styling/TransportCart.css";

const calculateFare = (distance) => {
  const baseFare = 500;
  const variableFare = distance * 50;
  return Math.round(baseFare + variableFare);
};

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

export default function TransporterCart({ source, destination }) {
  const navigate = useNavigate();
  const [formError, setFormError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false); // Payment modal state
  const [fare, setFare] = useState(0);
  const [distance, setDistance] = useState(0);
  const [sourceAddress, setSourceAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (source && destination) {
      const fetchDistance = async () => {
        try {
          setLoading(true);
          setError("");

          const response = await axios.get(
            `http://router.project-osrm.org/route/v1/driving/${source.lng},${source.lat};${destination.lng},${destination.lat}?overview=false`
          );

          if (response.data.routes.length > 0) {
            const distancex = response.data.routes[0].distance / 1000;
            setDistance(distancex);
            setFare(calculateFare(distancex));
          } else {
            setError("Unable to calculate distance.");
          }

          const sourceAddr = await fetchAddress(source.lat, source.lng);
          const destAddr = await fetchAddress(destination.lat, destination.lng);
          setSourceAddress(sourceAddr);
          setDestinationAddress(destAddr);
        } catch (err) {
          console.error("Error fetching distance data:", err);
          setError("Error fetching distance data.");
        } finally {
          setLoading(false);
        }
      };

      fetchDistance();
    }
  }, [source, destination]);

  const handleExit = () => {
    navigate("/Dashboard");
  };

  const handleOrderPlacement = async (success) => {
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
        setFormError("Failed to retrieve user details.");
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
        destinationPin: `${destination.lat},${destination.lng}`,
        sourceAddress,
        destinationAddress,
        totalDistance: distance,
        fare,
        status: "Pending",
      };

      const placeOrderResponse = await axios.post(
        "http://localhost:5001/api/placeOrder",
        orderData
      );

      if (placeOrderResponse.data.success) {
        toast.success("Order placed successfully!");
        setTimeout(() => navigate("/Dashboard"), 1000);
      } else {
        setFormError("Failed to place the order. Please try again.");
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Error in order submission:", error);
      setFormError("Error placing order. Please try again.");
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transportpayment-container mt-5">
      <h2 className="transportpayment-title text-center mb-4">
        Transport Checkout
      </h2>
      <div className="transportpayment-card mb-4">
        <div className="transportpayment-card-body">
          <h5 className="transportpayment-card-title">Your Route</h5>
          <p>
            <strong>Source Address:</strong> {sourceAddress || "Fetching..."}
          </p>
          <p>
            <strong>Destination Address:</strong>{" "}
            {destinationAddress || "Fetching..."}
          </p>
          <p>
            <strong>Distance: {distance} Km</strong>
          </p>
          {loading ? (
            <strong>Loading distance...</strong>
          ) : error ? (
            <strong className="text-danger">{error}</strong>
          ) : (
            <strong className="mt-3">Total Fare: {Math.round(fare)} Rs</strong>
          )}
        </div>
      </div>

      <div className="d-flex justify-content-between">
        <button className="btn map-button" onClick={handleExit}>
          Cancel
        </button>
        <button
          className="btn map-button"
          onClick={() => setIsPaymentModalOpen(true)} // Open payment modal
          disabled={loading}
        >
          {loading ? "Placing Order..." : "Proceed to Payment"}
        </button>
      </div>

      {isModalOpen && (
        <ErrorModal message={formError} onClose={() => setIsModalOpen(false)} />
      )}
      {isPaymentModalOpen && (
        <PaymentModal
          price={Math.round(fare)}
          message="Payment for the transport service"
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={handleOrderPlacement} // Call order placement after payment
        />
      )}

      <ToastContainer
        position="top-right"
        autoClose={500}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss
      />
    </div>
  );
}
