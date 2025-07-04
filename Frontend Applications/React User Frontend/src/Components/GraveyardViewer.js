import React, { useEffect, useState } from "react";
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";

const GraveyardViewer = ({ graveyardId, onNext }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPanorama = async () => {
      try {
        const response = await fetch(
          `http://localhost:5004/api/getUrl/${graveyardId}`
        );
        const data = await response.json();

        if (data.imageUrl) {
          setImageUrl(data.imageUrl);
        } else {
          throw new Error("No image found");
        }
      } catch (err) {
        setError("Failed to load panorama image.");
      } finally {
        setLoading(false);
      }
    };

    fetchPanorama();
  }, [graveyardId]);

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100">
      <div className="graveyard-viewer-card">
        <h3 className="text-center" style={{ fontWeight: "bold" }}>
          Graveyard View
        </h3>

        {loading && <p>Loading...</p>}
        {error && <p className="text-danger">{error}</p>}

        {imageUrl && (
          <div className="viewer-container">
            <ReactPhotoSphereViewer src={imageUrl} width="100%" height="100%" />
          </div>
        )}

        <div className="viewer-buttons">
          <button
            className="btn map-button"
            onClick={() => window.history.back()}
          >
            Exit
          </button>
          <button className="btn map-button" onClick={onNext}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default GraveyardViewer;
