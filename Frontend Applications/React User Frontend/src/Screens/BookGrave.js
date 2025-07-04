import React, { useState } from "react";
import GraveyardChooser from "../Components/GraveyardChooser";
import GraveyardViewer from "../Components/GraveyardViewer";
import GraveyardMap from "../Components/GraveyardMap";
import GraveCart from "../Components/GraveCart";

const BookGrave = () => {
  const [selectedGraveyard, setSelectedGraveyard] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGrave, setSelectedGrave] = useState(null);

  // Step 1: Select Graveyard
  const handleNextGraveyard = (graveyardId) => {
    setSelectedGraveyard(graveyardId);
    setCurrentStep(2); // Move to Step 2 (Graveyard Viewer)
  };

  // Step 2: View Graveyard in 360
  const handleNextViewer = () => {
    setCurrentStep(3); // Move to Step 3 (Graveyard Map)
  };

  // Step 3: Select Grave
  const handleNextMap = (graveId) => {
    setSelectedGrave(graveId);
    setCurrentStep(4); // Move to Step 4 (GraveCart)
  };

  return (
    <div>
      {currentStep === 1 && <GraveyardChooser onNext={handleNextGraveyard} />}
      {currentStep === 2 && (
        <GraveyardViewer
          graveyardId={selectedGraveyard}
          onNext={handleNextViewer}
        />
      )}
      {currentStep === 3 && (
        <GraveyardMap GraveyardID={selectedGraveyard} onNext={handleNextMap} />
      )}
      {currentStep === 4 && (
        <GraveCart GraveyardID={selectedGraveyard} GraveID={selectedGrave} />
      )}
    </div>
  );
};

export default BookGrave;
