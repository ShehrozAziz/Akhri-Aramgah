import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";

export default function TransporterOrders() {
  const token = localStorage.getItem("token");
  const jwt_token = jwtDecode(token);
  const userID = jwt_token.id;

  const [transporterOrders, setTransporterOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          "http://localhost:5001/api/getAssignedOrders1",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userID }),
          }
        );

        const data = await response.json();

        if (data.success && Array.isArray(data.orders)) {
          setTransporterOrders(data.orders);
        } else {
          toast.error("Failed to fetch orders.");
        }
      } catch (error) {
        toast.error("Error fetching orders.");
      }
    };

    fetchOrders();
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
    <>
      <div className="col-lg-6 orders-col-lg-6">
        <div className="card dashboard-active-orders orders-card">
          <h2 className="card-title orders-card-title">
            Transportation Orders
          </h2>
          <div className="card-content orders-card-content">
            {transporterOrders.length === 0 ? (
              <p className="no-orders-message">No Past Orders</p>
            ) : (
              transporterOrders.map((order) => (
                <div key={order.orderID} className="orders-order-item">
                  <p>
                    <strong>Order ID:</strong> {order.orderID}{" "}
                    <i
                      className="fa fa-clipboard orders-copy-button"
                      onClick={() => copyToClipboard(order.orderID)}
                      style={{ cursor: "pointer" }}
                    ></i>
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`status-badge ${
                        order.status === "Completed"
                          ? "status-completed"
                          : "status-pending"
                      }`}
                    >
                      {order.status}
                    </span>
                  </p>
                  <p>
                    <strong>Source:</strong> {order.source}
                  </p>
                  <p>
                    <strong>Destination:</strong> {order.destination}
                  </p>
                  <p>
                    <strong>Fare:</strong> Rs {order.fare}
                  </p>
                  <p>
                    <strong>Date:</strong> {order.date}
                  </p>
                  <p>
                    <strong>Time:</strong> {order.time}
                  </p>
                  <hr className="orders-hr" />
                </div>
              ))
            )}
          </div>
        </div>
        <ToastContainer />
      </div>
    </>
  );
}
