const Grave = require("../models/grave");
const MaintenanceOrder = require("../models/MaintenanceOrder");
const { ref, set, get, push, update } = require("firebase/database");
const { db } = require("../FirebaseConfig");
const GraveOrder = require("../models/GraveOrder");
exports.getAllGravesOfGraveyard = async (req, res) => {
  try {
    const graveyardId = req.params.graveyardId;

    // Call the model function
    const { graves, totalRows, totalCols } =
      await Grave.getGravesWithDimensions(graveyardId);

    res.status(200).json({ graves, totalRows, totalCols });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.bookGrave = async (req) => {
  const {
    userID,
    GraveyardID,
    GraveID,
    deceasedName,
    cnic,
    dateOfDeath,
    causeOfDeath,
    moistureDevice,
  } = req.body;

  try {
    // Check if the grave exists and if it's available (not already booked)
    const graveSnapshot = await get(
      ref(db, `graveyards/${GraveyardID}/graves/${GraveID}`)
    );

    if (!graveSnapshot.exists()) {
      return {
        success: false,
        message: "Grave not found.",
      };
    }

    const graveData = graveSnapshot.val();

    if (graveData.status === "booked") {
      return {
        success: false,
        message: "Grave already booked.",
      };
    }

    // Set moistureDevice flag
    const deviceFlag = moistureDevice ? "yes" : "no";

    // Update grave status and other details in the grave data
    const updatedGraveData = {
      status: "booked",
      name: deceasedName,
      causeOfDeath: causeOfDeath,
      cnicNumber: cnic,
      date: dateOfDeath,
      device: deviceFlag,
      reading: 0,
    };

    // Update grave with new data
    await update(
      ref(db, `graveyards/${GraveyardID}/graves/${GraveID}`),
      updatedGraveData
    );

    console.log("Grave booking updated successfully.");

    // Add the booking details to GraveOrders (if required)
    await GraveOrder.createOrder(userID, GraveyardID, GraveID);

    return {
      success: true,
      message: "Grave booked successfully!",
    };
  } catch (error) {
    console.error("Error in booking grave:", error); // Log the error for debugging
    return {
      success: false,
      message: error.message,
    };
  }
};

exports.getGravesByUser = async (req, res) => {
  try {
    const userID = req.params.userID;

    // Call the model function
    const graves = await GraveOrder.getGravesByUser(userID);

    res.status(200).json(graves);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.addDevice = async (req, res) => {
  try {
    const { graveyardId, graveId } = req.body;

    if (!graveyardId || !graveId) {
      return res
        .status(400)
        .json({ error: "Missing required fields: graveyardId, graveId" });
    }

    // Call the model function to update the grave
    const updatedGrave = await Grave.addDevice(graveyardId, graveId);

    res
      .status(200)
      .json({ message: "Device added successfully", grave: updatedGrave });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getBookedGravesByGraveyard = async (graveyardId) => {
  try {
    if (!graveyardId) {
      throw new Error("Missing required field: graveyardId");
    }

    // Call the model function
    const bookedGraves = await Grave.getBookedGravesByGraveyard(graveyardId);

    return bookedGraves;
  } catch (error) {
    console.error("Error fetching booked graves:", error.message);
    throw error; // Re-throw the error to be handled by the caller
  }
};
exports.updateGraveOrMaintenance = async (req, res) => {
  try {
    const { type, GraveID, GraveyardID } = req.body;
    console.log(type + " " + GraveID + " " + GraveyardID);

    if (!type || !GraveID || !GraveyardID) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    if (type === "grave") {
      // Update grave status to "Completed"
      await Grave.updateStatus(GraveyardID, GraveID, "Completed");
      return res.status(200).json({
        success: true,
        message: `Grave ${GraveID} in Graveyard ${GraveyardID} status set to 'Completed'.`,
      });
    } else if (type === "maintenance") {
      // Remove maintenance orders
      await MaintenanceOrder.removeOrder(GraveyardID, GraveID);
      return res.status(200).json({
        success: true,
        message: `Maintenance orders for Grave ${GraveID} in Graveyard ${GraveyardID} removed.`,
      });
    } else {
      return res
        .status(400)
        .json({ error: "Invalid type. Must be 'grave' or 'maintenance'." });
    }
  } catch (error) {
    console.error("Error updating grave or maintenance:", error.message);
    res.status(500).json({ error: error.message });
  }
};
