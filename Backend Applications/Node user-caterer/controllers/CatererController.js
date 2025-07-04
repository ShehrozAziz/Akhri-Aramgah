const bcrypt = require("bcrypt");
const Caterer = require("../models/Caterer");

// Add a new caterer
exports.addCaterer = async (req, res) => {
  const catererData = {
    name: "Jane Doe",
    phone: "123456789",
    password: "password123", // Plain text password to be hashed
    complaintCount: 0,
  };

  try {
    // Hash the password before creating caterer
    const hashedPassword = await bcrypt.hash(catererData.password, 10);

    // Create a new Caterer instance with the hashed password
    const caterer = new Caterer(
      catererData.name,
      catererData.phone,
      hashedPassword,
      catererData.complaintCount
    );

    const result = await Caterer.addCaterer(caterer);

    if (result.success) {
      return res.status(200).send({
        success: true,
        message: result.message,
        caterer: caterer,
      });
    } else {
      return res.status(500).send({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error("Error adding caterer:", error);
    res.status(500).send({
      success: false,
      message: "An error occurred while adding caterer",
    });
  }
};

// Caterer login
exports.login = async (req, res) => {
  const { Password } = req.body;
  const { Phone } = req.body;

  try {
    // Find the caterer by phone number and check password
    const caterer = await Caterer.findByPhoneAndPassword(Phone, Password);
    console.log(caterer);

    if (caterer) {
      return res.status(200).send({
        success: true,
        message: "Login successful",
        caterer: caterer,
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

// Update caterer password
exports.updatePassword = async (req, res) => {
  const catererID = req.body.catererID;
  const oldPassword = req.body.oldpassword;
  const newPassword = req.body.newdata;

  if (!catererID || !oldPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "CatererID, old password, and new password are required",
    });
  }
  try {
    // Call the updatePassword method from the Caterer model
    const result = await Caterer.updatePassword(
      catererID,
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

// Update caterer phone number
exports.updatePhone = async (req, res) => {
  const catererID = req.body.catererID;
  const oldPassword = req.body.oldpassword;
  const newPhone = req.body.newdata;

  if (!catererID || !oldPassword || !newPhone) {
    return res.status(400).json({
      success: false,
      message: "CatererID, old password, and new phone number are required",
    });
  }
  try {
    // Call the updatePhone method from the Caterer model
    const result = await Caterer.updatePhone(catererID, oldPassword, newPhone);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(200).json(result); // Return the error message from the model
    }
  } catch (error) {
    console.error("Error updating phone number:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the phone number",
    });
  }
};
