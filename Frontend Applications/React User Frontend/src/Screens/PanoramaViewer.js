import React from "react";
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";
import imgsec from "../Assets/graveyard1.jpg";
const PanoramaViewer = () => {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <ReactPhotoSphereViewer
        src="https://res.cloudinary.com/dyqdf25sl/image/upload/v1741967470/graveyards/w4fzdvytwwkoprxohtls.jpg" // Replace with your actual image path
        height="100%"
        width="100%"
      />
    </div>
  );
};

export default PanoramaViewer;
