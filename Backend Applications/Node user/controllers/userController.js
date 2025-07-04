const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // Import JWT
const User = require("../models/User");

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

const JWT_SECRET = "r@nd0mP@ssw0rd!$ecure2024";
exports.signup = async (req, res) => {
  const { name, email, password, phone, dob } = req.body;

  try {
    if (!name || !email || !password || !dob || !phone) {
      return res
        .status(400)
        .send({ success: false, message: "All fields are required." });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // Ensure correct order in User constructor
    const userInstance = new User(name, email, hashedPassword, phone, dob);

    const result = await User.createUser(userInstance);
    if (!result.success) {
      return res
        .status(500)
        .send({ success: false, message: "Failed to create user." });
    }

    const token = jwt.sign({ id: result.userID }, JWT_SECRET, {
      expiresIn: "3d",
    });

    res
      .status(200)
      .send({ success: true, token, message: "Signup successful!" });
  } catch (error) {
    console.error("Error during signup:", error);
    res
      .status(500)
      .send({ success: false, message: "An error occurred during signup." });
  }
};

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

exports.signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.getUserByEmail(email);
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const token = jwt.sign({ id: user.userID }, JWT_SECRET, {
          expiresIn: "3d",
        });
        return res.status(200).send({
          success: true,
          token,
          message: "Sign-in successful!",
        });
      } else {
        return res
          .status(401)
          .send({ success: false, message: "Invalid credentials." });
      }
    } else {
      return res
        .status(404)
        .send({ success: false, message: "User not found." });
    }
  } catch (error) {
    console.error("Error during sign-in:", error);
    return res
      .status(500)
      .send({ success: false, message: "An error occurred during sign-in." });
  }
};

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

exports.checkEmailExists = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  try {
    const exists = await User.emailExists(email);
    return res.status(200).json({ exists });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while checking email" });
  }
};

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

exports.userDetails = async (req, res) => {
  const { userID } = req.body; // Get userID from the request body
  console.log(userID); // This should print the userID
  try {
    if (!userID) {
      return res
        .status(400)
        .send({ success: false, message: "User ID is required." });
    }

    const userDetails = await User.getDetails(userID);
    if (userDetails) {
      return res.status(200).send({
        success: true,
        userDetails,
        message: "User details retrieved successfully.",
      });
    } else {
      return res
        .status(404)
        .send({ success: false, message: "User not found." });
    }
  } catch (error) {
    console.error("Error retrieving user details:", error);
    return res.status(500).send({
      success: false,
      message: "An error occurred while retrieving user details.",
    });
  }
};

exports.changePhonenumber = async (req, res) => {
  const { userID, phone } = req.body;

  try {
    if (!userID || !phone) {
      return res.status(400).send({
        success: false,
        message: "UserID and phone number are required.",
      });
    }

    const result = await User.updatePhoneNumber(userID, phone);
    if (!result.success) {
      return res.status(500).send({
        success: false,
        message: "Failed to update phone number.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Phone number updated successfully.",
    });
  } catch (error) {
    console.error("Error updating phone number:", error);
    res.status(500).send({
      success: false,
      message: "An error occurred while updating the phone number.",
    });
  }
};

exports.changeName = async (req, res) => {
  const { userID, name } = req.body;

  try {
    if (!userID || !name) {
      return res.status(400).send({
        success: false,
        message: "UserID and name are required.",
      });
    }

    const result = await User.updateName(userID, name);
    if (!result.success) {
      return res.status(500).send({
        success: false,
        message: "Failed to update name.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Name updated successfully.",
    });
  } catch (error) {
    console.error("Error updating name:", error);
    res.status(500).send({
      success: false,
      message: "An error occurred while updating the name.",
    });
  }
};

exports.updateDateOfBirth = async (req, res) => {
  const { userID, dob } = req.body;

  try {
    if (!userID || !dob) {
      return res.status(400).send({
        success: false,
        message: "UserID and date of birth are required.",
      });
    }

    const result = await User.updateDateOfBirth(userID, dob);
    if (!result.success) {
      return res.status(500).send({
        success: false,
        message: "Failed to update date of birth.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Date of birth updated successfully.",
    });
  } catch (error) {
    console.error("Error updating date of birth:", error);
    res.status(500).send({
      success: false,
      message: "An error occurred while updating the date of birth.",
    });
  }
};

exports.changePassword = async (req, res) => {
  const { userID, oldPassword, newPassword } = req.body;

  try {
    if (!userID || !oldPassword || !newPassword) {
      return res.status(400).send({
        success: false,
        message: "UserID, old password, and new password are required.",
      });
    }

    // Fetch user's stored password
    const user = await User.getUserById(userID);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found.",
      });
    }

    // Check if old password matches
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).send({
        success: false,
        message: "Old password is incorrect.",
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in Firebase
    const result = await User.updatePassword(userID, hashedPassword);
    if (!result.success) {
      return res.status(500).send({
        success: false,
        message: "Failed to update password.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).send({
      success: false,
      message: "An error occurred while changing the password.",
    });
  }
};

exports.getUsername = async (req, res) => {
  const { userID } = req.query;
  try {
    if (!userID) {
      return res
        .status(400)
        .send({ success: false, message: "UserID is required." });
    }

    const user = await User.getUsername(userID);
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found." });
    }

    res.status(200).send({ success: true, name: user.name });
  } catch (error) {
    console.error("Error fetching username:", error);
    res.status(500).send({
      success: false,
      message: "An error occurred while fetching the username.",
    });
  }
};
