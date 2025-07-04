const Complaint = require("../models/Complaint");

exports.registerComplaint = async (req, res) => {
  const { userID, convict, type, message } = req.body;
  console.log("hello world");

  try {
    if (!userID || !convict || !type || !message) {
      return res
        .status(400)
        .send({ success: false, message: "All fields are required." });
    }

    // Determine criticality using external API
    const response = await fetch("http://127.0.0.1:5010/checkcomplaint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }),
    });

    const { prediction } = await response.json();
    console.log("API Response:", prediction);

    // Create complaint instance
    const complaintInstance = new Complaint(
      userID,
      type,
      convict,
      message,
      prediction
    );

    // Save to Firebase
    const result = await Complaint.createComplaint(complaintInstance);

    if (!result.success) {
      return res
        .status(500)
        .send({ success: false, message: "Failed to register complaint." });
    }

    res.status(200).send({
      success: true,
      complaintID: result.complaintID,
      message: "Complaint registered successfully!",
    });
  } catch (error) {
    console.error("Error during complaint registration:", error);
    res.status(500).send({
      success: false,
      message: "An error occurred while registering the complaint.",
    });
  }
};

exports.getComplaintsByUser = async (req, res) => {
  const { userID } = req.body;

  try {
    if (!userID) {
      return res
        .status(400)
        .send({ success: false, message: "UserID is required." });
    }

    const complaints = await Complaint.getComplaintsByUser(userID);

    if (!complaints) {
      return res.status(404).send({
        success: false,
        message: "No complaints found for this user.",
      });
    }

    res.status(200).send({ success: true, complaints });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).send({
      success: false,
      message: "An error occurred while fetching complaints.",
    });
  }
};
