import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import ErrorModal from "./ErrorModal";
import { useNavigate } from "react-router-dom";
import Qourma from "../Assets/qourma.jpg";
import Biryani from "../Assets/biryani.jpg";
import Pulao from "../Assets/pulao.jpg";

const menuItems = [
  {
    id: 1,
    name: "Qourma",
    price: 15000,
    string: "Serves 30 to 35 people. 10kg chicken",
    imgUrl: Qourma,
  },
  {
    id: 2,
    name: "Biryani",
    price: 18000,
    string: "Serves 30 to 35 people. 7kg chicken 8kg rice",
    imgUrl: Biryani,
  },
  {
    id: 3,
    name: "Pulao",
    price: 16000,
    string: "Serves 30 to 35 people. 7kg chicken 8kg rice",
    imgUrl: Pulao,
  },
];

export default function CatererMenu({ onSubmitOrder }) {
  const navigate = useNavigate();
  const [order, setOrder] = useState(
    menuItems.reduce((acc, item) => {
      acc[item.id] = { name: item.name, price: item.price, quantity: 0 };
      return acc;
    }, {})
  );
  const [formError, setFormError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleIncrement = (id) => {
    setOrder((prevOrder) => ({
      ...prevOrder,
      [id]: { ...prevOrder[id], quantity: prevOrder[id].quantity + 1 },
    }));
  };

  const handleDecrement = (id) => {
    setOrder((prevOrder) => ({
      ...prevOrder,
      [id]: {
        ...prevOrder[id],
        quantity: Math.max(prevOrder[id].quantity - 1, 0),
      },
    }));
  };

  const calculateTotalPrice = () => {
    return Object.values(order).reduce((total, item) => {
      return total + item.quantity * item.price;
    }, 0);
  };
  const handleExit = () => {
    navigate("/Dashboard");
  };

  const handleSubmitOrder = () => {
    const selectedItems = Object.values(order).filter(
      (item) => item.quantity > 0
    );

    if (selectedItems.length === 0) {
      setFormError("Please select at least one menu item.");
      setIsModalOpen(true);
      return;
    }

    const orderDetails = selectedItems
      .map((item) => `${item.name} - Quantity: ${item.quantity}`)
      .join(", ");

    const totalPrice = calculateTotalPrice();

    onSubmitOrder({ orderDetails, price: totalPrice });
    toast.success(`Order placed successfully! Total Price: PKR ${totalPrice}`);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormError("");
  };

  return (
    <div className="container mt-5 custom-card-caterer-cnt ">
      <h2 className="transportpayment-card-title">Choose Menu Items</h2>

      {menuItems.map((item) => (
        <div
          key={item.id}
          className="menu-card mt-3 p-3 rounded shadow d-flex align-items-center"
        >
          <img
            src={item.imgUrl}
            alt={item.name}
            className="menu-item-img rounded me-3"
            width="100"
            height="100"
          />
          <div className="menu-info">
            <strong>{item.name}</strong> - PKR {item.price}
            <p>
              <strong>{item.string}</strong>
            </p>
            <div className="counter d-flex align-items-center mt-2">
              <button
                onClick={() => handleDecrement(item.id)}
                className="btn btn-outline-dark btn-sm"
              >
                -
              </button>
              <span className="mx-2">{order[item.id].quantity}</span>
              <button
                onClick={() => handleIncrement(item.id)}
                className="btn btn-outline-dark btn-sm"
              >
                +
              </button>
            </div>
          </div>
        </div>
      ))}

      <div className="d-flex justify-content-between">
        <button className="btn map-button" onClick={handleExit}>
          Cancel
        </button>
        <button className="btn map-button" onClick={handleSubmitOrder}>
          Next
        </button>
      </div>

      {isModalOpen && <ErrorModal message={formError} onClose={closeModal} />}
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
