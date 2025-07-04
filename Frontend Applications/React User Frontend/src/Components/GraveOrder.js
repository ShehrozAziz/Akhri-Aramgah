import React from "react";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../Styling/Orders.css";
export default function GraveOrder() {
  const [graveOrders, setGraveOrders] = useState([
    {
      id: "1",
      name: "Babar Azam",
      graveyard: "Samsani Graveyard",
      date: "20-12-2024",
    },
    {
      id: "2",
      name: "Shaheen Afridi",
      graveyard: "Samsani Graveyard",
      date: "20-12-2024",
    },
  ]);
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
          <h2 className="card-title orders-card-title">Grave Requests</h2>
          <div className="card-content orders-card-content">
            {graveOrders.length === 0 ? (
              <p className="no-orders-message">No Past orders</p>
            ) : (
              graveOrders.map((graveOrder, index) => (
                <div key={index} className="orders-order-item">
                  <p>
                    <strong>Order ID:</strong> {graveOrder.id}  
                    <i
                      className="fa fa-clipboard orders-copy-button"
                      onClick={() => copyToClipboard(graveOrder.id)}
                      style={{ cursor: "pointer" }}
                    ></i>
                  </p>
                  <p>
                    <strong>Name:</strong> {graveOrder.name}
                  </p>
                  <p>
                    <strong>Graveyard</strong> {graveOrder.graveyard}
                  </p>
                  <p>
                    <strong>Graveyard</strong> {graveOrder.date}
                  </p>
                  {index < graveOrders.length - 1 && (
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
