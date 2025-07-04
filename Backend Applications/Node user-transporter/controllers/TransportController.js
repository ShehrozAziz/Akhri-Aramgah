const bcrypt = require("bcrypt");
const Transporter = require("../models/Transporter");

exports.addTransporter = async (req, res) => {
  const transporterData = {
    name: "John Doe",
    phone: "1234567890",
    password: "password123", // Plain text password to be hashed
    complaintCount: 0,
  };

  try {
    // Hash the password before creating transporter
    const hashedPassword = await bcrypt.hash(transporterData.password, 10);

    // Create a new Transporter instance with the hashed password
    const transporter = new Transporter(
      transporterData.name,
      transporterData.phone,
      hashedPassword,
      transporterData.complaintCount
    );

    const result = await Transporter.addTransporter(transporter);

    if (result.success) {
      return res.status(200).send({
        success: true,
        message: result.message,
        transporter: transporter,
      });
    } else {
      return res.status(500).send({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error("Error adding transporter:", error);
    res.status(500).send({
      success: false,
      message: "An error occurred while adding transporter",
    });
  }
};

// Login route (for comparison of hashed password)
exports.login = async (req, res) => {
  const { Password } = req.body;
  const { Phone } = req.body;

  try {
    // Find the transporter by phone number and check password
    const transporter = await Transporter.findByPhoneAndPassword(
      Phone,
      Password
    );
    console.log(transporter);

    if (transporter) {
      return res.status(200).send({
        success: true,
        message: "Login successful",
        transporter: transporter,
      });
    } else {
      return res.status(200).send({
        success: false,
        message: "Invalid Phone number or Password",
      });
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).send({
      success: false,
      message: "An error occurred while logging in",
    });
  }
};
exports.updatePassword = async (req, res) => {
  const transporterID = req.body.transporterID;
  const oldPassword = req.body.oldpassword;
  const newPassword = req.body.newdata;
  if (!transporterID || !oldPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "TransporterID, old password, and new password are required",
    });
  }
  try {
    // Call the updatePassword method from the Transporter model
    const result = await Transporter.updatePassword(
      transporterID,
      oldPassword,
      newPassword
    );
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(200).json(result); // Return the error message from the model
    }
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the password",
    });
  }
};
exports.updatePhone = async (req, res) => {
  const transporterID = req.body.transporterID;
  const oldPassword = req.body.oldpassword;
  const newPhone = req.body.newdata;
  if (!transporterID || !oldPassword || !newPhone) {
    return res.status(400).json({
      success: false,
      message: "TransporterID, old password, and new password are required",
    });
  }
  try {
    // Call the updatePassword method from the Transporter model
    const result = await Transporter.updatePhone(
      transporterID,
      oldPassword,
      newPhone
    );
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(200).json(result); // Return the error message from the model
    }
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the password",
    });
  }
};
