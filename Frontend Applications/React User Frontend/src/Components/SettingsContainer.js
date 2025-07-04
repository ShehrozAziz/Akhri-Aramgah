import React, { useState } from "react";
import ProfileHeader from "./ProfileHeader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ErrorModal from "./ErrorModal";
import { jwtDecode } from "jwt-decode";

export default function SettingsContainer() {
  const [name, setname] = useState("");
  const [phone, setPhone] = useState("");
  const [oldPassword, setOldPassword] = useState(""); // Old password required for change
  const [newPassword, setNewPassword] = useState("");
  const [dob, setDOB] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const closeModal = () => setIsModalOpen(false);

  // Get user ID from JWT
  const token = localStorage.getItem("token");
  const jwt_token = token ? jwtDecode(token) : null;
  const userID = jwt_token?.id;

  if (!userID) {
    return <p>Error: User not authenticated</p>;
  }

  // Generic API call function
  const updateUserInfo = async (endpoint, data, successMessage) => {
    try {
      const response = await fetch(`http://localhost:5000/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(successMessage);
      } else {
        setLoginError(result.message);
        setIsModalOpen(true);
      }
    } catch (error) {
      setLoginError("Server error, please try again.");
      setIsModalOpen(true);
    }
  };

  // Handle username update
  const handleUsernameSubmit = () => {
    if (!name) {
      setLoginError("Username cannot be empty");
      setIsModalOpen(true);
    } else {
      updateUserInfo(
        "changeName",
        { userID, name },
        "Username updated successfully!"
      );
      setname("");
    }
  };

  // Handle phone update
  const handlePhoneSubmit = () => {
    const phoneRegex = /^0\d{10}$/;
    if (!phone) {
      setLoginError("Phone number cannot be empty");
      setIsModalOpen(true);
    } else if (!phoneRegex.test(phone)) {
      setLoginError("Phone number must be in the format 0XXXXXXXXXX");
      setIsModalOpen(true);
    } else {
      updateUserInfo(
        "changePhonenumber",
        { userID, phone },
        "Phone number updated successfully!"
      );
      setPhone("");
    }
  };

  // Handle date of birth update
  const handleDOBSubmit = () => {
    if (!dob) {
      setLoginError("Date of birth cannot be empty");
      setIsModalOpen(true);
    } else {
      updateUserInfo(
        "updateDateOfBirth",
        { userID, dob },
        "Date of birth updated successfully!"
      );
      setDOB("");
    }
  };

  // Handle password update
  const handlePasswordSubmit = () => {
    if (!oldPassword || !newPassword) {
      setLoginError("Both old and new passwords are required");
      setIsModalOpen(true);
    } else if (newPassword.length < 8) {
      setLoginError("New password must be at least 8 characters");
      setIsModalOpen(true);
    } else {
      updateUserInfo(
        "changePassword",
        { userID, oldPassword, newPassword },
        "Password updated successfully!"
      );
      setOldPassword("");
      setNewPassword("");
    }
  };

  return (
    <>
      <ProfileHeader />

      <div className="container settings-container">
        <div className="row settings-row">
          {/* Change Phone Number */}
          <div className="col-lg-6 settings-col-lg-6">
            <div className="card settings-active-orders settings-card">
              <h2 className="card-title settings-card-title">
                Change Phone Number
              </h2>
              <div className="card-content settings-card-content">
                <div className="settings-input-container">
                  <input
                    type="text"
                    className="settings-input-field"
                    placeholder="Enter new phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <button
                    onClick={handlePhoneSubmit}
                    className="settings-input-button"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="col-lg-6 settings-col-lg-6">
            <div className="card settings-active-orders settings-card">
              <h2 className="card-title settings-card-title">
                Change Password
              </h2>
              <div className="card-content settings-card-content">
                <div className="settings-input-container">
                  <input
                    type="password"
                    className="settings-input-field"
                    placeholder="Enter old password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                  <input
                    type="password"
                    className="settings-input-field"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    onClick={handlePasswordSubmit}
                    className="settings-input-button"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Change Username */}
          <div className="col-lg-6 settings-col-lg-6">
            <div className="card settings-active-orders settings-card">
              <h2 className="card-title settings-card-title">
                Change Username
              </h2>
              <div className="card-content settings-card-content">
                <div className="settings-input-container">
                  <input
                    type="text"
                    className="settings-input-field"
                    placeholder="Enter new username"
                    value={name}
                    onChange={(e) => setname(e.target.value)}
                  />
                  <button
                    onClick={handleUsernameSubmit}
                    className="settings-input-button"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Change Date of Birth */}
          <div className="col-lg-6 settings-col-lg-6">
            <div className="card settings-active-orders settings-card">
              <h2 className="card-title settings-card-title">
                Change Date of Birth
              </h2>
              <div className="card-content settings-card-content">
                <div className="settings-input-container">
                  <input
                    type="date"
                    className="settings-input-field"
                    value={dob}
                    onChange={(e) => setDOB(e.target.value)}
                  />
                  <button
                    onClick={handleDOBSubmit}
                    className="settings-input-button"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Modal */}
        {isModalOpen && (
          <ErrorModal message={loginError} onClose={closeModal} />
        )}

        <ToastContainer
          position="top-right"
          autoClose={1000}
          hideProgressBar={false}
        />
      </div>
    </>
  );
}
