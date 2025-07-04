const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const graveyardController = require("./controllers/graveyardController");
const morgueController = require("./controllers/morgueController");
const fs = require("fs");
const path = require("path");
const {
  getDatabase,
  ref,
  get,
  set,
  update,
  push,
  remove,
} = require("firebase/database");
const { db } = require("./FirebaseConfig");
const bcrypt = require("bcryptjs");
const app = express();

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Routes
app.post("/api/graveyard/create", graveyardController.createGraveyard);
app.post("/api/morgue/create", morgueController.createMorgue);
app.get("/api/hello", (req, res) => {
  res.send("Hello, World!");
});

app.get("/api/getcomplaints", async (req, res) => {
  console.log("hello man apoi");

  try {
    const db = getDatabase();

    // Fetch complaints
    const complaintsSnap = await get(ref(db, "complaints"));
    if (!complaintsSnap.exists()) {
      return res
        .status(404)
        .json({ success: false, message: "No complaints found." });
    }

    const complaints = complaintsSnap.val();

    // Fetch both assigned orders once to avoid repeated DB hits
    const catererOrdersSnap = await get(ref(db, "assignedCatererOrders"));
    const transporterOrdersSnap = await get(ref(db, "assignedTransportOrders"));

    const catererOrders = catererOrdersSnap.exists()
      ? catererOrdersSnap.val()
      : {};
    const transporterOrders = transporterOrdersSnap.exists()
      ? transporterOrdersSnap.val()
      : {};

    const updatedComplaints = Object.entries(complaints).map(
      ([id, complaint]) => {
        const updated = { ...complaint };

        if (complaint.type === "Caterer" && catererOrders[complaint.convict]) {
          console.log("hello " + catererOrders[complaint.convict].catererID);
          updated.convict =
            catererOrders[complaint.convict].catererID || "Unknown Caterer ID";
        } else if (
          complaint.type === "Transporter" &&
          transporterOrders[complaint.convict]
        ) {
          console.log(
            "hello " + transporterOrders[complaint.convict].transporterID
          );
          updated.convict =
            transporterOrders[complaint.convict].transporterID ||
            "Unknown Transporter ID";
        }
        // For Graveyard and Morgue, convict stays as name (no change needed)

        return [id, updated];
      }
    );

    // Convert back to object with complaint IDs as keys
    const result = Object.fromEntries(updatedComplaints);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/api/makeDecision", async (req, res) => {
  const { complaintID, decision } = req.body;

  if (!complaintID || !decision) {
    return res.status(400).json({
      success: false,
      message: "complaintID and decision are required",
    });
  }

  try {
    const dbRef = ref(getDatabase(), `complaints/${complaintID}`);

    // Check if the complaint exists first
    const snapshot = await get(dbRef);
    if (!snapshot.exists()) {
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found" });
    }

    // Update decision and status to "resolved"
    await set(dbRef, {
      ...snapshot.val(),
      decision: decision,
      status: "resolved",
    });

    res.status(200).json({
      success: true,
      message: "Decision updated and status set to resolved",
    });
  } catch (error) {
    console.error("Error updating decision:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/api/searchGraves", async (req, res) => {
  const { name, cnicNumber } = req.body;

  if (!name && !cnicNumber) {
    return res.status(400).json({
      success: false,
      message: "Please provide a name or cnicNumber to search.",
    });
  }

  try {
    const dbRef = ref(getDatabase(), "graveyards");
    const snapshot = await get(dbRef);

    if (!snapshot.exists()) {
      return res
        .status(404)
        .json({ success: false, message: "No graveyards found." });
    }

    const graveyards = snapshot.val();
    const results = [];

    Object.entries(graveyards).forEach(([graveyardId, graveyard]) => {
      const graveyardName = graveyard.name || "Unnamed Graveyard";
      const graves = graveyard.graves || {};

      Object.values(graves).forEach((grave) => {
        const matchByName =
          name &&
          grave.name &&
          grave.name.toLowerCase().includes(name.toLowerCase());
        const matchByCNIC =
          cnicNumber && grave.cnicNumber && grave.cnicNumber === cnicNumber;

        if (matchByName || matchByCNIC) {
          results.push({
            graveyardName,
            graveDetails: grave,
          });
        }
      });
    });

    if (results.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No matching graves found." });
    }

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("No Graves Found:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

app.get("/api/fetchgraveyardandmorgues", async (req, res) => {
  try {
    const db = getDatabase();
    // Fetch graveyards
    const graveyardsSnapshot = await get(ref(db, "graveyards"));
    const graveyardsData = graveyardsSnapshot.exists()
      ? graveyardsSnapshot.val()
      : {};
    // Strip 'graves' from each graveyard
    const cleanedGraveyards = Object.values(graveyardsData).map((graveyard) => {
      const { graves, ...rest } = graveyard;
      return rest;
    });

    // Fetch morgues
    const morguesSnapshot = await get(ref(db, "morgues"));
    const morguesData = morguesSnapshot.exists()
      ? Object.values(morguesSnapshot.val())
      : [];

    // Combine response
    res.status(200).json({
      success: true,
      graveyards: cleanedGraveyards,
      morgues: morguesData,
    });
  } catch (error) {
    console.error("Error fetching graveyards and morgues:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
app.post("/api/editmanager", async (req, res) => {
  try {
    const { type, id, password, name } = req.body;

    if (!type || !id || !password || !name) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const db = getDatabase();
    const hashedPassword = await bcrypt.hash(password, 10);

    let updatePath, nameField;

    if (type === "graveyard") {
      updatePath = `graveyards/${id}`;
      nameField = "gorkanName";
    } else if (type === "morgue") {
      updatePath = `morgues/${id}`;
      nameField = "managerName";
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Must be 'graveyard' or 'morgue'",
      });
    }

    const updates = {
      password: hashedPassword,
      [nameField]: name,
    };

    await update(ref(db, updatePath), updates);

    res
      .status(200)
      .json({ success: true, message: "Manager updated successfully" });
  } catch (error) {
    console.error("Error editing manager:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/api/addvendor", async (req, res) => {
  try {
    const { vendorType, name, phone, password } = req.body;

    if (
      !vendorType ||
      !["caterer", "transporter"].includes(vendorType) ||
      !name ||
      !phone ||
      !password
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or missing fields" });
    }

    const db = getDatabase();
    const hashedPassword = await bcrypt.hash(password, 10);

    const vendorData = {
      name,
      phone,
      password: hashedPassword,
      complaintCount: 0,
    };

    const nodePath = vendorType === "caterer" ? "caterers" : "transporters";

    const newRef = push(ref(db, nodePath));
    await set(newRef, vendorData);

    res.status(200).json({
      success: true,
      message: "Vendor added successfully",
      vendorId: newRef.key,
    });
  } catch (error) {
    console.error("Error adding vendor:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/api/searchvendor", async (req, res) => {
  try {
    const { vendorType, id, name } = req.body;
    console.log("the id os " + id);
    if (!vendorType || !["caterer", "transporter"].includes(vendorType)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid vendor type" });
    }

    const nodePath = vendorType === "caterer" ? "caterers" : "transporters";
    const db = getDatabase();
    const vendorRef = ref(db, nodePath);
    const snapshot = await get(vendorRef);

    if (!snapshot.exists())
      return res
        .status(404)
        .json({ success: false, message: "No vendors found" });

    const data = snapshot.val();

    // Search by ID (takes precedence)
    if (id && data[id]) {
      return res.status(200).json({ success: true, data: { id, ...data[id] } });
    }

    // Otherwise, search by name (substring case-insensitive)
    if (name) {
      const filtered = Object.entries(data)
        .filter(([_, val]) =>
          val.name?.toLowerCase().includes(name.toLowerCase())
        )
        .map(([id, val]) => ({ id, ...val }));

      return res.status(200).json({ success: true, data: filtered });
    }

    return res
      .status(400)
      .json({ success: false, message: "Provide either vendor ID or name" });
  } catch (err) {
    console.error("Search vendor error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/api/warnvendor", async (req, res) => {
  try {
    const { vendorType, id } = req.body;

    if (
      !vendorType ||
      !["caterer", "transporter"].includes(vendorType) ||
      !id
    ) {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }

    const nodePath = vendorType === "caterer" ? "caterers" : "transporters";
    const vendorRef = ref(getDatabase(), `${nodePath}/${id}`);
    const snapshot = await get(vendorRef);

    if (!snapshot.exists())
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found" });

    const vendorData = snapshot.val();
    const updatedCount = (vendorData.complaintCount || 0) + 1;

    await update(vendorRef, { complaintCount: updatedCount });

    res.status(200).json({
      success: true,
      message: "Warning count incremented",
      complaintCount: updatedCount,
    });
  } catch (err) {
    console.error("Warn vendor error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/api/banvendor", async (req, res) => {
  try {
    const { vendorType, id } = req.body;

    if (
      !vendorType ||
      !["caterer", "transporter"].includes(vendorType) ||
      !id
    ) {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }

    const nodePath = vendorType === "caterer" ? "caterers" : "transporters";
    const vendorRef = ref(getDatabase(), `${nodePath}/${id}`);
    const snapshot = await get(vendorRef);

    if (!snapshot.exists())
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found" });

    await remove(vendorRef);

    res
      .status(200)
      .json({ success: true, message: "Vendor has been banned (deleted)" });
  } catch (err) {
    console.error("Ban vendor error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.get("/api/admin/earnings-summary", async (req, res) => {
  try {
    const db = getDatabase();

    const catererSnap = await get(ref(db, "assignedCatererOrders"));
    const transporterSnap = await get(ref(db, "assignedTransportOrders"));

    let catering = 0;
    let transport = 0;

    if (catererSnap.exists()) {
      Object.values(catererSnap.val()).forEach((order) => {
        catering += parseInt(order.fare || 0);
      });
    }

    if (transporterSnap.exists()) {
      Object.values(transporterSnap.val()).forEach((order) => {
        transport += parseInt(order.fare || 0);
      });
    }

    res.status(200).json({ catering, transport });
  } catch (err) {
    console.error("Error fetching earnings summary:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.get("/api/admin/cause-of-deaths", async (req, res) => {
  try {
    const db = getDatabase();
    const graveyardsSnap = await get(ref(db, "graveyards"));

    if (!graveyardsSnap.exists()) {
      return res
        .status(404)
        .json({ success: false, message: "No graveyard data found." });
    }

    const graveyards = graveyardsSnap.val();
    const causeCounts = {};

    Object.values(graveyards).forEach((graveyard) => {
      const graves = graveyard.graves || {};
      Object.values(graves).forEach((grave) => {
        const cause = (grave.causeOfDeath || "").trim();
        if (cause && cause.toLowerCase() !== "null") {
          causeCounts[cause] = (causeCounts[cause] || 0) + 1;
        }
      });
    });

    res.status(200).json({ success: true, data: causeCounts });
  } catch (err) {
    console.error("Error fetching causes of death:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.get("/api/admin/complaints-distribution", async (req, res) => {
  try {
    const db = getDatabase();
    const complaintsSnap = await get(ref(db, "complaints"));

    if (!complaintsSnap.exists()) {
      return res
        .status(404)
        .json({ success: false, message: "No complaints found." });
    }

    const complaints = complaintsSnap.val();
    const domainCounts = {
      Caterer: 0,
      Transporter: 0,
      Graveyard: 0,
      Morgue: 0,
    };

    Object.values(complaints).forEach((complaint) => {
      const type = complaint.type;
      if (domainCounts.hasOwnProperty(type)) {
        domainCounts[type]++;
      }
    });

    res.status(200).json({ success: true, data: domainCounts });
  } catch (err) {
    console.error("Error fetching complaints distribution:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Server

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
