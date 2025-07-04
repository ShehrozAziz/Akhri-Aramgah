import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import { InfinitySpin } from "react-loader-spinner"; // Import the loader

export default function DashboardOrder() {
  const token = localStorage.getItem("token");
  const jwt_token = jwtDecode(token);
  const userID = jwt_token.id; // Assuming userID is in the token payload

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch orders from a specific API based on type
  const fetchOrdersFromAPI = async (apiURL, type) => {
    try {
      const timestamp = new Date().getTime(); // Adding timestamp to avoid cached response
      const response = await fetch(
        `${apiURL}/api/getUserOrders?timestamp=${timestamp}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userID }),
        }
      );
      const data = await response.json();
      if (data.success) {
        // Add type to each order before returning
        return data.orders.map((order) => ({ ...order, type }));
      }
      return [];
    } catch (error) {
      toast.error(`Error fetching ${type} orders from ${apiURL}.`);
      return [];
    }
  };

  // Combined fetch orders function
  const fetchOrders = async () => {
    setOrders([]);
    setLoading(true);
    try {
      const [transporterOrders, catererOrders] = await Promise.all([
        fetchOrdersFromAPI("http://localhost:5001", "transporter"),
        fetchOrdersFromAPI("http://localhost:5002", "caterer"),
      ]);
      setOrders([...transporterOrders, ...catererOrders]); // Combine all orders
    } catch (error) {
      toast.error("Error fetching orders.");
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

  // Cancel an order
  const cancelOrder = async (orderID, type) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel it!",
      cancelButtonText: "No, keep it",
    });

    if (result.isConfirmed) {
      setLoading(true);

      // Determine the API URL based on the order type
      const apiURL =
        type === "transporter"
          ? "http://localhost:5001"
          : "http://localhost:5002";

      try {
        const response = await fetch(`${apiURL}/api/cancelOrder`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderID }),
        });
        const data = await response.json();

        if (data.success) {
          setOrders(orders.filter((order) => order.orderID !== orderID));
          Swal.fire({
            icon: "success",
            title: "Order Canceled",
            text: "Your order has been successfully canceled.",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Cancellation Failed",
            text: "We encountered an issue canceling the order. Please try again.",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while canceling the order. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="col-lg-6 Dashboard-col-lg-6">
      <div className="card dashboard-active-orders Dashboard-card">
        <h2 className="card-title Dashboard-card-title">Pending Orders</h2>
        <div className="card-content Dashboard-card-content">
          {loading ? (
            <div className="loader-wrapper">
              <div className="loader-container">
                <InfinitySpin width="300" color="#4fa94d" />
              </div>
            </div>
          ) : orders.length === 0 ? (
            <p className="no-orders-message">No pending orders</p>
          ) : (
            orders.map((order, index) => (
              <div key={index} className="dashboard-order-item">
                <p>
                  <strong>Type:</strong> {order.type || "N/A"}
                </p>
                <p>
                  <strong>Fare:</strong> {order.fare || "N/A"}
                </p>
                <p>
                  <strong>Source Address:</strong>{" "}
                  {order.sourceAddress || "N/A"}
                </p>
                <p>
                  <button
                    className="btn btn-danger dashboard-cancel-button-1"
                    onClick={() => cancelOrder(order.orderID, order.type)}
                    style={{
                      cursor: "pointer",
                      padding: "5px 10px",
                      fontSize: "14px",
                    }}
                  >
                    Cancel Order
                  </button>
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
