const Morgue = require("../models/Morgue");
const bcrypt = require("bcrypt");

exports.authenticateMorgue = async (req, res) => {
  console.log(req.body);
  try {
    const { customID, password } = req.body;
    const morgue = await Morgue.getByCustomID(customID);

    if (!morgue) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Custom ID or Password" });
    }

    const isPasswordValid = await bcrypt.compare(password, morgue.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Custom ID or Password" });
    }

    // Remove sensitive data before sending the response
    const { password: _, ...morgueData } = morgue;

    res.status(200).json({
      success: true,
      message: "Login successful",
      morgue: morgueData, // Send the entire morgue object (excluding password)
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Login failed", error: error.message });
  }
};

exports.getAllMorgues = async (req, res) => {
  try {
    const availableMorgues = await Morgue.getAvailableMorgues();
    res.status(200).json(availableMorgues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.bookCabin = async (req, res) => {
  try {
    const { morgueId } = req.body;
    console.log(req.body);
    const success = await Morgue.bookCabin(morgueId);
    if (!success) {
      return res.status(400).json({
        success: false,
        message: "No available cabins or invalid morgue ID",
      });
    }

    res
      .status(200)
      .json({ success: true, message: "Cabin booked successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error booking cabin",
      error: error.message,
    });
  }
};

exports.releaseCabin = async (req, res) => {
  try {
    const { morgueId } = req.body;

    if (!morgueId) {
      return res
        .status(400)
        .json({ success: false, message: "Morgue ID is required" });
    }

    const success = await Morgue.releaseCabin(morgueId);

    if (!success) {
      return res.status(400).json({
        success: false,
        message: "Invalid morgue ID or no booked cabins to release",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cabin released successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error releasing cabin",
      error: error.message,
    });
  }
};
