import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../Styling/Orders.css";
import { jwtDecode } from "jwt-decode";
export default function CatererOrders() {
  const token = localStorage.getItem("token");
  const jwt_token = jwtDecode(token);
  const userID = jwt_token.id;

  const [catererOrders, setCatererOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userID) {
        toast.error("User not authenticated!");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5002/api/AssignedOrders",
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
          setCatererOrders(data.orders);
        } else {
          toast.error("No orders found.");
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
          <h2 className="card-title orders-card-title">Catering Orders</h2>
          <div className="card-content orders-card-content">
            {catererOrders.length === 0 ? (
              <p className="no-orders-message">No Past Orders</p>
            ) : (
              catererOrders.map((order, index) => (
                <div key={order.orderID} className="orders-order-item">
                  <p>
                    <strong>Order ID:</strong> {order.orderID}  
                    <i
                      className="fa fa-clipboard orders-copy-button"
                      onClick={() => copyToClipboard(order.orderID)}
                      style={{ cursor: "pointer" }}
                    ></i>
                  </p>
                  <p>
                    <strong>Location:</strong> {order.source}
                  </p>
                  <p>
                    <strong>Charges:</strong> Rs {order.fare}
                  </p>
                  <p>
                    <strong>Date:</strong> {order.date}
                  </p>
                  {index < catererOrders.length - 1 && (
                    <hr className="orders-hr" />
                  )}
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
