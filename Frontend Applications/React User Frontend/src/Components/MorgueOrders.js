import React from "react";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../Styling/Orders.css";
export default function MorgueOrders() {
  const [morgueOrders, setmorgueOrders] = useState([
    {
      id: "1",
      name: "Babar Azam",
      morgue: "General Hospital Mortuary",
      date: "20-12-2024",
    },
    {
      id: "2",
      name: "Shaheen Afridi",
      morgue: "General Hospital Mortuary",
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
        <div className="card orders-active-orders orders-card">
          <h2 className="card-title orders-card-title">Morgue Requests</h2>
          <div className="card-content orders-card-content">
            {morgueOrders.length === 0 ? (
              <p className="no-orders-message">No Past orders</p>
            ) : (
              morgueOrders.map((morgueOrder, index) => (
                <div key={index} className="orders-order-item">
                  <p>
                    <strong>Order ID:</strong> {morgueOrder.id}  
                    <i
                      className="fa fa-clipboard orders-copy-button"
                      onClick={() => copyToClipboard(morgueOrder.id)}
                      style={{ cursor: "pointer" }}
                    ></i>
                  </p>
                  <p>
                    <strong>Name:</strong> {morgueOrder.name}
                  </p>
                  <p>
                    <strong>Location</strong> {morgueOrder.morgue}
                  </p>
                  <p>
                    <strong>Date</strong> {morgueOrder.date}
                  </p>
                  {index < morgueOrders.length - 1 && (
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
