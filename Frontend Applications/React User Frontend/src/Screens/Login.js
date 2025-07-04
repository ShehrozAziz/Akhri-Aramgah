import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "../Styling/Login.css";
import googleimg from "../Assets/google.png";
import loginimg from "../Assets/login.png";
import ErrorModal from "../Components/ErrorModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate(); // Initialize useNavigate

  // Email validation
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setLoginError("");
  };

  // Password validation
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setLoginError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target.closest("form"); // Get the form element

    // Check if the email format is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLoginError("Invalid email format.");
      setIsModalOpen(true); // Open the modal
      return;
    }

    if (!password) {
      setLoginError("Password cannot be empty.");
      setIsModalOpen(true); // Open the modal
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Show success toast notification
        toast.success("Login successful!"); // Display success message

        // Store the token in local storage (or a more secure storage)
        localStorage.setItem("token", data.token);

        // Decode the token to get user ID
        const decodedToken = jwtDecode(data.token);

        // Redirect to /userdashboard
        setTimeout(() => {
          navigate("/Dashboard");
        }, 1000);
      } else {
        // Handle incorrect credentials or other errors
        setLoginError(
          data.message || "Incorrect credentials. Please try again."
        );
        setIsModalOpen(true); // Open the modal for the error
      }
    } catch (error) {
      console.error("Error during login:", error);
      setLoginError("An error occurred. Please try again later.");
      setIsModalOpen(true); // Open the modal for the error
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="login-container container d-flex justify-content-center align-items-center min-vh-100">
      <div className="row border rounded-5 p-3 bg-white shadow box-area">
        {/* Left Box */}
        <div
          className="col-md-6 rounded-4 d-flex justify-content-center align-items-center flex-column left-box"
          style={{ background: "#22201d" }}
        >
          <div className="featured-image mb-3">
            <img
              src={loginimg}
              className="img-fluid"
              alt="logo"
              style={{ width: "250px" }}
            />
          </div>
          <p
            className="text-white fs-2"
            style={{
              fontFamily: "'Courier New', Courier, monospace",
              fontWeight: 600,
            }}
          >
            Rest with Dignity
          </p>
          <small
            className="text-white text-wrap text-center"
            style={{
              width: "17rem",
              fontFamily: "'Courier New', Courier, monospace",
            }}
          >
            Secure a peaceful resting place with our dedicated services.
          </small>
        </div>
        <div className="col-md-6 right-box">
          <div className="row align-items-center">
            <div className="header-text mb-4">
              <h2>User Sign-In</h2>
              <p>Enter your Akhri Aramgah credentials</p>
            </div>
            <form>
              <div>
                <h6 style={{ textAlign: "left" }}>Email:</h6>
              </div>
              <div className="input-group mb-3">
                <input
                  type="email"
                  className="form-control form-control-lg bg-light fs-6"
                  placeholder="Enter Your Email address"
                  value={email}
                  onChange={handleEmailChange}
                  required
                />
              </div>
              <div>
                <h6 style={{ textAlign: "left" }}>Password:</h6>
              </div>
              <div className="input-group mb-1">
                <input
                  type="password"
                  className="form-control form-control-lg bg-light fs-6"
                  placeholder="Enter Your Password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="input-group mb-3">
                <button
                  className="btn btn-lg w-100 fs-6 Login-btn"
                  onClick={handleSubmit}
                >
                  <i className="ri-door-open-line"></i> Login
                </button>
              </div>

              <div className="row">
                <small>
                  Don't have an account?{" "}
                  <Link className="login_link" to="/SignUp">
                    Sign Up
                  </Link>
                </small>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* Modal for error messages */}
      {isModalOpen && <ErrorModal message={loginError} onClose={closeModal} />}
      <ToastContainer
        position="top-right"
        autoClose={500}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss
      />
    </div>
  );
}
