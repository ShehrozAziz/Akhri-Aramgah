import React, { useState } from "react";
import MorgueChooser from "../Components/MorgueChooser";
import MorgueCart from "../Components/MorgueCart";

const BookMorgue = () => {
  const [selectedMorgue, setSelectedMorgue] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Handle Step 1: Select Morgue
  const handleNextMorgue = (morgueId) => {
    setSelectedMorgue(morgueId);
    setCurrentStep(2); // Move to Step 2 (MorgueCart)
  };

  return (
    <div>
      {currentStep === 1 && <MorgueChooser onNext={handleNextMorgue} />}
      {currentStep === 2 && <MorgueCart MorgueID={selectedMorgue} />}
    </div>
  );
};

export default BookMorgue;
