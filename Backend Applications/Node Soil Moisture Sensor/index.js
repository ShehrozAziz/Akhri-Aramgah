require("dotenv").config(); // 👈 MUST be at the top

const express = require("express");
const nodemailer = require("nodemailer");
const app = express();
const port = 5015;
const cors = require("cors");
app.use(cors());
app.use(express.json());

let readings = {}; // { "GYID-GID": { count, states, email, personName, firstAlertSent, ... } }

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ALERT_EMAIL,
    pass: process.env.ALERT_PASS,
  },
});

// Moisture interpretation
function interpretMoisture(reading) {
  if (reading === 0) return "Out of Order";
  if (reading >= 4000) return "Dry";
  if (reading < 2500) return "Wet";
  return "Normal";
}

// Send email alerts
function sendEmailAlert(email, graveID, personName, condition) {
  const color = condition === "Dry" ? "#f44336" : "#2196F3";

  const htmlContent = `
        <div style="max-width: 500px; margin: auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="background-color: ${color}; color: white; padding: 10px 20px; border-radius: 10px;">
                <h2 style="margin: 0;">Soil Alert: ${condition} Condition</h2>
            </div>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 10px; margin-top: 10px;">
                <p><strong>Person Name:</strong> ${personName}</p>
                <p>The soil condition around the grave is reported as <strong>${condition}</strong>.</p>
                <p>Please consider inspecting this grave to ensure conditions are safe and appropriate.</p>
            </div>
        </div>
    `;

  const mailOptions = {
    from: process.env.ALERT_EMAIL,
    to: email || "recipient@example.com",
    subject: `Soil Alert: ${condition} Condition Detected`,
    text: `Grave of (${personName}) has reported a ${condition} soil condition. Please inspect.`,
    html: htmlContent,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("Email send error:", err);
    } else {
      console.log("Email sent:", info.response);
    }
  });
}

// POST route
app.post("/soil", (req, res) => {
  const { GraveyardID, GraveID, moisture, userEmail, personName } = req.body;
  console.log("Hit");

  if (!GraveyardID || !GraveID || moisture === undefined || !personName) {
    return res.status(400).send("Missing required fields.");
  }

  const key = `${GraveyardID}-${GraveID}`;
  const condition = interpretMoisture(moisture);

  if (!readings[key]) {
    readings[key] = {
      GraveyardID,
      GraveID,
      moisture,
      personName,
      email: userEmail,
      states: [condition],
      timestamp: new Date(),
      firstAlertSent: false,
    };
  } else {
    const record = readings[key];
    record.moisture = moisture;
    record.timestamp = new Date();
    record.email = userEmail || record.email;
    record.personName = personName || record.personName;

    record.states.push(condition);
    if (record.states.length > 3) {
      record.states.shift();
    }

    // Skip alerts for "Out of Order"
    if (
      condition !== "Out of Order" &&
      record.states.length === 3 &&
      (record.states.every((s) => s === "Dry") ||
        record.states.every((s) => s === "Wet"))
    ) {
      sendEmailAlert(record.email, GraveID, record.personName, condition);
      record.states = []; // Reset
    }
  }

  res.send("Reading received!");
});

// GET all readings
app.get("/readings", (req, res) => {
  res.json(readings);
});

// GET a specific grave's current status
app.get("/soil/:graveyardID/:graveID", (req, res) => {
  const { graveyardID, graveID } = req.params;

  if (!graveyardID || !graveID) {
    return res.status(400).json({ error: "Missing graveyardID or graveID" });
  }

  const key = `${graveID}-${graveyardID}`;
  const data = readings[key];

  console.log(key);

  if (!data) {
    console.log("No data found for this grave.");
    return res.status(404).json({ message: "No data found for this grave." });
  }

  let condition = interpretMoisture(data.moisture);
  if (data.moisture === 0) {
    condition = "Out of Order";
  }
  console.log(condition);

  return res.json({
    status: condition,
    graveID: data.GraveID,
    graveyardID: data.GraveyardID,
    personName: data.personName,
    lastReading: data.moisture,
    lastUpdated: data.timestamp,
  });
});

// Start server
app.listen(port, () => {
  console.log(`Soil monitoring server running at http://localhost:${port}`);
});
