import React, { useState } from "react";
import MapComponent from "../Components/MapLocation";
import TransporterCart from "../Components/TransporterCart";

export default function BookTransport() {
  const [step, setStep] = useState(0);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);

  // Callback function to handle the position received from MapComponent
  const handlePositionReceived = (position) => {
    if (step === 0) {
      setPickupLocation(position);
    } else if (step === 1) {
      setDropoffLocation(position);
    }
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
          message="Select Location for Pickup"
          onPositionSet={handlePositionReceived}
          onNext={handleNext} // Pass handleNext as a prop
        />
      )}
      {step === 1 && (
        <MapComponent
          message="Select Location for Dropoff"
          onPositionSet={handlePositionReceived}
          onNext={handleNext} // Pass handleNext as a prop
        />
      )}
      {step === 2 && (
        <TransporterCart
          source={pickupLocation}
          destination={dropoffLocation}
        />
      )}
    </div>
  );
}
