import React, { useState } from "react";
import "../Styling/SignUp.css"; // Use the SignUp CSS file
import loginimg from "../Assets/SignUp.png"; // Keep the import if needed
import ErrorModal from "../Components/ErrorModal";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";

export default function SignUp() {
  const navigate = useNavigate(); // Initialize the navigate function

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState(""); // Added state for phone
  const [signupError, setSignupError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Input change handlers
  const handleNameChange = (e) => {
    setName(e.target.value);
    setSignupError("");
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setSignupError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setSignupError("");
  };

  const handleDobChange = (e) => {
    setDob(e.target.value);
    setSignupError("");
  };

  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
    setSignupError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if the name is empty
    if (!name) {
      setSignupError("Name cannot be empty.");
      setIsModalOpen(true);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setSignupError("Invalid email format.");
      setIsModalOpen(true);
      return;
    }

    // Password validation
    if (password.length < 8) {
      setSignupError("Password must be at least 8 characters long.");
      setIsModalOpen(true);
      return;
    }

    // Phone validation (format: 0XXXXXXXXXX)
    const phoneRegex = /^0\d{10}$/;
    if (!phoneRegex.test(phone)) {
      setSignupError("Phone number must be in the format 0XXXXXXXXXX.");
      setIsModalOpen(true);
      return;
    }

    // Date of Birth validation
    if (!dob) {
      setSignupError("Date of birth cannot be empty.");
      setIsModalOpen(true);
      return;
    }

    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    // Adjust age if the birth month hasn't occurred yet this year
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (age < 18) {
      setSignupError("You must be at least 18 years old.");
      setIsModalOpen(true);
      return;
    }
    try {
      // Check if the email already exists
      const emailCheckResponse = await fetch(
        "http://localhost:5000/api/checkemail",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!emailCheckResponse.ok) {
        const errorData = await emailCheckResponse.json();
        setSignupError(errorData.message || "Error checking email.");
        setIsModalOpen(true);
        return;
      }

      const emailCheckData = await emailCheckResponse.json();
      if (emailCheckData.exists) {
        setSignupError("Email already in use.");
        setIsModalOpen(true);
        return;
      }

      // If email is not in use, proceed with the signup
      const userData = {
        name,
        email,
        password,
        dob,
        phone,
      };

      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      // Handle the response from the signup API
      if (!response.ok) {
        const errorData = await response.json();
        setSignupError(errorData.message || "Signup failed. Please try again.");
        setIsModalOpen(true);
        return;
      }

      // If successful, extract the token from the response
      const responseData = await response.json();
      const token = responseData.token; // Assuming the backend returns { token: "jwt-token" }

      localStorage.setItem("token", token);
      // Display success message
      toast.success("Sign-up successful!");

      // Reset form fields
      setName("");
      setEmail("");
      setPassword("");
      setDob("");
      setPhone("");

      // Wait for 1 second and redirect to the dashboard
      setTimeout(() => {
        navigate("/Dashboard"); // Redirect to dashboard
      }, 1000);
    } catch (error) {
      // Handle any network errors or exceptions
      setSignupError("An error occurred. Please try again.");
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="signup-container container d-flex justify-content-center align-items-center min-vh-100">
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
              <h2>User Sign-Up</h2>
              <p>Enter your details to create an account</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="scrollable-inputs">
                {" "}
                {/* Scrollable inputs */}
                <div>
                  <h6 style={{ textAlign: "left" }}>Name:</h6>
                </div>
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className={`form-control form-control-lg bg-light fs-6 ${
                      signupError && !name ? "error-border" : ""
                    }`}
                    placeholder="Enter Your Name"
                    value={name}
                    onChange={handleNameChange}
                  />
                </div>
                <div>
                  <h6 style={{ textAlign: "left" }}>Email:</h6>
                </div>
                <div className="input-group mb-3">
                  <input
                    type="email"
                    className={`form-control form-control-lg bg-light fs-6 ${
                      signupError && !email ? "error-border" : ""
                    }`}
                    placeholder="Enter Your Email address"
                    value={email}
                    onChange={handleEmailChange}
                  />
                </div>
                <div>
                  <h6 style={{ textAlign: "left" }}>Password:</h6>
                </div>
                <div className="input-group mb-3">
                  <input
                    type="password"
                    className={`form-control form-control-lg bg-light fs-6 ${
                      signupError && !password ? "error-border" : ""
                    }`}
                    placeholder="Enter Your Password"
                    value={password}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div>
                  <h6 style={{ textAlign: "left" }}>Date of Birth:</h6>
                </div>
                <div className="input-group mb-3">
                  <input
                    type="date"
                    className={`form-control form-control-lg bg-light fs-6 ${
                      signupError && !dob ? "error-border" : ""
                    }`}
                    value={dob}
                    onChange={handleDobChange}
                  />
                </div>
                <div>
                  <h6 style={{ textAlign: "left" }}>Phone Number:</h6>
                </div>
                <div className="input-group mb-3">
                  <input
                    type="tel"
                    className={`form-control form-control-lg bg-light fs-6 ${
                      signupError && !phone ? "error-border" : ""
                    }`}
                    placeholder="Enter Phone Number (0XXXXXXXXXX)"
                    value={phone}
                    onChange={handlePhoneChange}
                  />
                </div>
              </div>
              <div className="input-group mb-3">
                <button
                  type="submit"
                  className="btn btn-lg w-100 fs-6 SignUp-btn"
                >
                  <i className="ri-user-add-line"></i> Sign Up
                </button>
              </div>
              <div className="row">
                <small>
                  Have an account?{" "}
                  <Link className="login_link" to="/logIn">
                    Sign In
                  </Link>
                </small>
              </div>
            </form>
          </div>
        </div>
      </div>
      {isModalOpen && <ErrorModal message={signupError} onClose={closeModal} />}
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
