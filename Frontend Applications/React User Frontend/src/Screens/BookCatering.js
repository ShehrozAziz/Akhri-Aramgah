import React, { useState } from "react";
import MapComponent from "../Components/MapLocation";
import CateringCart from "../Components/CateringCart";
import CatererMenu from "../Components/CatererMenu";

export default function BookCatering() {
  const [step, setStep] = useState(0);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [price, setPrice] = useState(null);

  // Callback function to handle the position received from MapComponent
  const handlePositionReceived = (position) => {
    if (step === 0) {
      setPickupLocation(position);
    }
  };

  const handleOrderDetailsReceived = ({ orderDetails, price }) => {
    setOrderDetails(orderDetails);
    setPrice(price);

    setStep(2); // Move to Step 2 after receiving order details
  };

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    }
  };

  return (
    <div>
      {step === 0 && (
        <MapComponent
          message="Select Venue"
          onPositionSet={handlePositionReceived}
          onNext={handleNext}
        />
      )}
      {step === 1 && pickupLocation && (
        <CatererMenu onSubmitOrder={handleOrderDetailsReceived} />
      )}
      {step === 2 && orderDetails && price && (
        <CateringCart
          source={pickupLocation}
          orderDetails={orderDetails}
          price={price}
        />
      )}
    </div>
  );
}
