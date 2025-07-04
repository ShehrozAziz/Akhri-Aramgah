const Graveyard = require("../models/Graveyard");
const MaintenanceOrder = require("../models/MaintenanceOrder");
const bcrypt = require("bcrypt");
exports.getAllGraveyards = async (req, res) => {
  try {
    const graveyards = await Graveyard.getAll();
    res.status(200).json(graveyards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.createMaintenanceOrder = async (req) => {
  try {
    const { userID, GraveyardID, GraveID } = req.body;
    console.log(userID + " " + GraveID + " " + GraveyardID);

    if (!userID || !GraveyardID || !GraveID) {
      return {
        success: false,
        message: "Missing required fields: userID, GraveyardID, GraveID",
      };
    }

    // Call the model function to create a maintenance order
    const newOrder = await MaintenanceOrder.createMaintenanceOrder(
      userID,
      GraveyardID,
      GraveID
    );

    console.log("Maintenance order created successfully.");

    return {
      success: true,
      message: "Maintenance order created successfully",
      order: newOrder,
    };
  } catch (error) {
    console.error("Error in creating maintenance order:", error); // Log the error for debugging
    return {
      success: false,
      message: error.message,
    };
  }
};

exports.authenticateGraveyard = async (req, res) => {
  try {
    const { customID, password } = req.body;
    const graveyard = await Graveyard.getByCustomID(customID);
    if (!graveyard) {
      return res.status(200).send({
        success: false,
        message: "Invalid Custom ID or Password",
      });
    }
    const isPasswordValid = await bcrypt.compare(password, graveyard.password);
    if (!isPasswordValid) {
      return res.status(200).send({
        success: false,
        message: "Invalid Custom ID or Password",
      });
    }

    // Exclude `graves` and `sourcePin` from response
    const { graves, sourcePin, ...graveyardData } = graveyard;

    // Return success response
    return res.status(200).send({
      success: true,
      message: "Login successful",
      graveyard: graveyardData,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getGraves = async (req, res) => {
  try {
    const { graveyardID } = req.body;
    if (!graveyardID) {
      return res.status(400).send({
        success: false,
        message: "Graveyard ID is required",
      });
    }

    const graveyard = await Graveyard.getGravesByID(graveyardID);

    if (!graveyard) {
      return res.status(404).send({
        success: false,
        message: "Graveyard not found",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Graves retrieved successfully",
      graves: graveyard.graves || {},
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getMOrdersByGraveyard = async (graveyardId) => {
  try {
    if (!graveyardId) {
      throw new Error("Missing required field: graveyardId");
    }
    // Call the model function
    const orders = await MaintenanceOrder.getMaintenanceOrdersByGraveyard(
      graveyardId
    );
    return orders;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getUrl = async (req, res) => {
  try {
    const { graveyardID } = req.params;
    console.log("jello");

    if (!graveyardID) {
      return res.status(400).json({ error: "graveyardID is required" });
    }

    const imageUrl = await Graveyard.getImageUrlByID(graveyardID);

    if (!imageUrl) {
      return res.status(404).json({ error: "Image not found" });
    }

    return res.status(200).json({ imageUrl });
  } catch (error) {
    console.error("Error fetching image URL:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
