import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../Styling/SearchMorgue.css"; // Import custom CSS
import { useNavigate } from "react-router-dom";

export default function SearchMorgue() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [bestMatch, setBestMatch] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle Image Selection
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setPreviewImage(reader.result);
        setSelectedImage(reader.result.split(",")[1]); // Remove "data:image/jpeg;base64,"
      };
    }
  };

  function exit() {
    navigate("/Dashboard");
  }

  // Handle Search
  const handleSearch = async () => {
    if (!selectedImage) {
      toast.error("Please upload an image first!");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5011/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: selectedImage }),
      });

      const data = await response.json();
      if (!data.success && data.message === "No Face Detected") {
        toast.warning("No face detected in the uploaded image.");
        setBestMatch(null);
      } else if (data.matches.length > 0) {
        // Get the most similar match
        const mostSimilarMatch = data.matches.reduce((max, match) =>
          match.similarity > max.similarity ? match : max
        );
        setBestMatch(mostSimilarMatch);
      } else {
        toast.info("No matching images found.");
        setBestMatch(null);
      }
    } catch (err) {
      toast.error("Error connecting to the server. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="search-container">
      <ToastContainer />
      <h3 className="text-center fw-bold">Search Morgues</h3>

      {/* Image Upload Section */}
      <div className="upload-section">
        <label className="form-label">Upload Image</label>
        <input
          type="file"
          className="form-control"
          accept="image/*"
          onChange={handleImageUpload}
        />

        {/* Show Image Preview */}
        {previewImage && (
          <div className="image-preview">
            <img src={previewImage} alt="Uploaded" />
          </div>
        )}

        {/* Buttons Section */}
        <div className="buttons">
          <button
            className="btn map-button"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
          <button className="btn map-button" onClick={exit}>
            Exit
          </button>
        </div>
      </div>

      {/* Display Best Match */}
      {bestMatch && (
        <div className="results-container">
          <div className="match-card">
            <img
              src={`data:image/jpeg;base64,${bestMatch.image_base64}`}
              alt="Matched"
            />
            <div className="match-info">
              <p>
                Similarity:{" "}
                <strong>{Math.round(bestMatch.similarity * 100)}%</strong>
              </p>
              <p className="morgue-name">
                Morgue Name: {bestMatch.morgue_name}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
