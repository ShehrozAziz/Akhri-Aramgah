import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";
import axios from "axios";

const stripePromise = loadStripe(
  "pk_test_51Qjhha1NPNnbr2aIuS9xpaYBEtPoYcUQZ32uRUmBxDNS8b0QtEucSmWyPPUOQXC3bl71PsHa54g4NhrtaxyOmpZC00Ug8Z570F"
);

const PaymentModal = ({ price, message, onClose, onSuccess }) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        price={price}
        message={message}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </Elements>
  );
};

const CheckoutForm = ({ price, message, onClose, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const usdPrice = Math.ceil(price / 276); // Convert PKR to USD

  const handlePayment = async () => {
    setLoading(true);
    setError("");

    try {
      // Request clientSecret from the backend
      const { data } = await axios.post(
        "http://localhost:5008/api/create-payment",
        {
          amount: usdPrice * 100, // Convert to cents
        }
      );

      const clientSecret = data.clientSecret;
      if (!clientSecret) throw new Error("No client secret received");

      // Confirm the payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        setError(result.error.message);
        onSuccess(false);
      } else if (
        result.paymentIntent &&
        result.paymentIntent.status === "succeeded"
      ) {
        onSuccess(true);
        onClose();
      } else {
        setError("Payment processing failed.");
        onSuccess(false);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      onSuccess(false);
    }

    setLoading(false);
  };

  return (
    <div className="payment-overlay">
      <div className="payment-modal card p-4">
        <h4 className="text-center">Complete Payment</h4>
        <p className="text-center">{message}</p>
        <h5 className="text-center">Amount: ${usdPrice}</h5>

        <div className="card-input mt-3">
          <CardElement className="form-control" />
        </div>

        {error && <p className="text-danger text-center mt-2">{error}</p>}

        <div className="d-flex justify-content-between mt-3">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn pay-btn"
            onClick={handlePayment}
            disabled={loading || !stripe || !elements}
          >
            {loading ? "Processing..." : "Pay Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
