import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import "react-toastify/dist/ReactToastify.css";
import { InfinitySpin } from "react-loader-spinner"; // Import loader

export default function DashboardNotification() {
  const token = localStorage.getItem("token");
  const jwt_token = jwtDecode(token);
  const userID = jwt_token.id; //

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Function to fetch orders from a given URL and assign a type
  const fetchOrdersFromAPI = async (url, type) => {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userID }),
      });
      const data = await response.json();
      if (data.success) {
        return data.orders.map((order) => ({ ...order, type }));
      } else {
        return [];
      }
    } catch (error) {
      toast.error(`Error fetching ${type} orders.`);
      return [];
    }
  };

  // Fetch orders from both APIs
  const fetchOrders = async () => {
    setOrders([]);
    setLoading(true);
    try {
      const transportOrders = await fetchOrdersFromAPI(
        `http://localhost:5001/api/fetchAssignedOrders`,
        "Transport"
      );
      const catererOrders = await fetchOrdersFromAPI(
        `http://localhost:5002/api/fetchAssignedOrders`,
        "Caterer"
      );
      setOrders([...transportOrders, ...catererOrders]);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders on component mount and every 10 seconds
  useEffect(() => {
    fetchOrders(); // Initial fetch
    const intervalId = setInterval(fetchOrders, 10000); // 10 seconds = 10000 ms

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [userID]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied to clipboard!", {
        position: "bottom-right",
        autoClose: 1000,
      });
    });
  };

  return (
    <div className="col-lg-6 Dashboard-col-lg-6">
      <div className="card dashboard-active-orders Dashboard-card">
        <h2 className="card-title Dashboard-card-title">Active Orders</h2>
        <div className="card-content Dashboard-card-content">
          {loading ? (
            <div className="loader-wrapper">
              <div className="loader-container">
                <InfinitySpin width="300" color="#4fa94d" />{" "}
                {/* Increased width for larger loader */}
              </div>
            </div>
          ) : orders.length === 0 ? (
            <p className="no-orders-message">No Active orders</p>
          ) : (
            orders.map((order, index) => (
              <div key={index} className="dashboard-order-item">
                <p>
                  <strong>Order ID:</strong> {order.id}{" "}
                  <i
                    className="fa fa-clipboard dashboard-copy-button"
                    onClick={() => copyToClipboard(order.id)}
                    style={{ cursor: "pointer" }}
                  ></i>
                </p>
                <p>
                  <strong>Type:</strong> {order.type}
                </p>
                <p>
                  <strong>Fare:</strong> {order.fare || "N/A"}
                </p>
                <p>
                  <strong>Source Address:</strong> {order.source || "N/A"}
                </p>

                {index < orders.length - 1 && <hr className="Dashboard-hr" />}
              </div>
            ))
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
