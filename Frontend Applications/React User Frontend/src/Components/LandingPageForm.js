import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ErrorModal from "./ErrorModal";

export default function LandingPageForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    reason: "",
    details: "",
  });

  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    if (!formData.name) {
      return "Name is required";
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return "Valid email is required";
    }
    if (!formData.reason) {
      return "Reason is required";
    }
    if (!formData.details) {
      return "Details are required";
    }
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errorMsg = validateForm();
    if (errorMsg) {
      setError(errorMsg); // Show modal with error
    } else {
      toast.success("Form submitted successfully!"); // Success toast
      setFormData({
        name: "",
        email: "",
        reason: "",
        details: "",
      });
    }
  };

  const handleCloseModal = () => {
    setError(null); // Close modal
  };

  return (
    <>
      <section className="get-in-touch Landing-form" id="contact">
        <p className="section__subheader landing-text2">GET IN TOUCH WITH US</p>
        <h2 className="form-labelp">Contact</h2>
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
            />

            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your Email"
            />

            <label htmlFor="reason">Reason</label>
            <select
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
            >
              <option value="" disabled>
                Select a reason
              </option>
              <option value="general">General Queries</option>
              <option value="data">Request Data for Research</option>
              <option value="job">Apply for Job</option>
            </select>

            <label htmlFor="details">Details</label>
            <textarea
              id="details"
              name="details"
              value={formData.details}
              onChange={handleChange}
              rows="5"
              placeholder="Enter details here"
            ></textarea>

            <button type="submit">Submit</button>
          </form>
        </div>
      </section>

      {/* Error Modal */}
      {error && <ErrorModal message={error} onClose={handleCloseModal} />}

      {/* Toast for success */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss
      />
    </>
  );
}
