import React, { useState, useEffect, useRef } from "react";
import ProfileHeader from "./ProfileHeader";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import { InfinitySpin } from "react-loader-spinner";
import "react-toastify/dist/ReactToastify.css";
import PaymentModal from "./PaymentModal"; // Import the PaymentModal component

export default function GraveContainer() {
  const [graves, setGraves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentGrave, setCurrentGrave] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const maintenancePrice = 3000; // Setting a fixed price for maintenance
  const gravesRef = useRef([]);



  const token = localStorage.getItem("token");
  const jwt_token = jwtDecode(token);
  const userID = jwt_token.id;

  const fetchStatus = async (grave, index) => {
    try {
      const res = await axios.get(
        `http://localhost:5015/soil/${grave.graveyardID}/${grave.graveID}`
      );

      const updatedStatus = res.data.status;

      setGraves((prev) => {
        const newGraves = [...prev];
        newGraves[index] = { ...newGraves[index], status: updatedStatus };
        gravesRef.current = newGraves; // update ref to match state
        return newGraves;
      });
    } catch (err) {
      console.error(`Error fetching status for Grave ID ${grave.graveID}:`, err);
    }
  };
  useEffect(() => {
    const intervalId = setInterval(() => {
      gravesRef.current.forEach((grave, index) => {
        if (grave.device === "yes") {
          fetchStatus(grave, index);
        }
      });
    }, 15000); // every 15 seconds

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!userID) {
      console.error("No userID found in local storage.");
      setLoading(false);
      return;
    }

    const fetchGraves = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5004/api/getGravesByUser/${userID}`
        );

        const data = response.data.map((grave) => ({
          name: grave.name,
          graveyard: grave.graveyardName,
          status: "Loading...", // Will be updated below
          graveID: grave.GraveID || null,
          graveyardID: grave.GraveyardID || null,
          device: grave.device,
        }));

        setGraves(data);
        gravesRef.current = data; // keep reference updated
        setLoading(false);

        // Initial fetch for each grave's status
        data.forEach((grave, index) => {
          if (grave.device === "yes") {
            fetchStatus(grave, index);
          }
        });

      } catch (error) {
        console.error("Error fetching graves:", error);
        setLoading(false);
      }
    };

    fetchGraves();
  }, []);


  const handleOpenDialog = (grave) => {
    setCurrentGrave(grave);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleProceedToPayment = () => {
    // Close the confirmation dialog and open the payment modal
    setOpenDialog(false);
    setShowPaymentModal(true);
  };

  const handlePaymentResult = async (success) => {
    if (success) {
      // Only proceed with maintenance scheduling if payment was successful
      const payload = {
        userID,
        GraveyardID: currentGrave.graveyardID,
        GraveID: currentGrave.graveID,
      };

      try {
        await axios.post("http://localhost:5004/api/graveMaintenance", payload);
        toast.success(
          "Success! Your grave will be repaired if there are damages"
        );

        // Update the grave status in the UI if needed
        setGraves(
          graves.map((grave) => {
            if (grave.graveID === currentGrave.graveID) {
              return { ...grave, status: "Maintenance Scheduled" };
            }
            return grave;
          })
        );
      } catch (error) {
        console.error("Error scheduling maintenance:", error);
        toast.error("Failed to schedule maintenance.");
      }
    } else {
      toast.error("Payment was not successful. Please try again.");
    }

    // Close the payment modal regardless of outcome
    setShowPaymentModal(false);
  };

  if (loading) {
    return (
      <div className="loader-wrapper">
        <div className="loader-container">
          <InfinitySpin width="300" color="#4fa94d" />
        </div>
      </div>
    );
  }

  return (
    <>
      <ProfileHeader />
      <ToastContainer />

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          price={maintenancePrice}
          message={`Payment for Grave Maintenance at ${currentGrave?.graveyard}`}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentResult}
        />
      )}

      <div className="container Dashboard-container">
        <div className="row Dashboard-row2">
          <div className="col-md-10">
            <div className="grave-card">
              <div className="container mt-4">
                <h2 className="graves-internal-card-title">Graves</h2>
                <div className="row">
                  {graves.map((grave, index) => (
                    <div className="col-lg-6 col-md-12 mb-4" key={index}>
                      <div className="grave-card1">
                        <div className="grave-internal-grave-column p-3">
                          <div className="mb-3">
                            <span className="grave-internal-label">Name:</span>
                            <span className="grave-internal-value">
                              {grave.name}
                            </span>
                          </div>
                          <div className="mb-3">
                            <span className="grave-internal-label">
                              Graveyard:
                            </span>
                            <span className="grave-internal-value">
                              {grave.graveyard}
                            </span>
                          </div>
                          <div className="mb-3">
                            <span className="grave-internal-label">Status:</span>
                            <span
                              className="grave-internal-value"
                              style={{
                                color:
                                  grave.device === "no"
                                    ? "grey"
                                    : grave.status === "Out of Order"
                                      ? "red"
                                      : grave.status === "Wet" || grave.status === "Dry"
                                        ? "red"
                                        : "white",
                              }}
                            >
                              {grave.device === "no" ? "Not Available" : grave.status}
                            </span>
                          </div>

                          <div className="text-start">
                            <button
                              className="btn grave-internal-btn"
                              onClick={() => handleOpenDialog(grave)}
                            >
                              Schedule Maintenance
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle sx={{ fontWeight: "bold" }}>
          Schedule Maintenance
        </DialogTitle>
        <DialogContent>
          <p>Would you like to schedule maintenance for this grave?</p>
          <p>
            Maintenance will cost: PKR {maintenancePrice} ($
            {Math.ceil(maintenancePrice / 276)} USD)
          </p>
          <p>
            This will include checking the grave's condition and repairing any
            damages caused by moisture or other factors.
          </p>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            sx={{
              backgroundColor: "#22201d",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#44403c",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleProceedToPayment}
            sx={{
              backgroundColor: "#22201d",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#44403c",
              },
            }}
          >
            Proceed to Payment
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
