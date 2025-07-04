// ErrorModal.js
import React from "react";
import "../Styling/Modal.css";

const ErrorModal = ({ message, onClose }) => {
  return (
    <div
      className="modal fade show modal_error"
      tabIndex="-1"
      role="dialog"
      style={{ display: "block" }}
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content modal_error-content">
          <div className="modal-header">
            <h5 className="modal-title">Error</h5>
            <button type="button" className="close" onClick={onClose}>
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <p>{message}</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
