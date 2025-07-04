const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");

const morgueController = require("./controllers/morgueController");

const app = express();
const server = http.createServer(app);

// Set up WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected WebSocket clients
let clients = [];

wss.on("connection", (ws) => {
  console.log("Device connected");
  clients.push(ws);

  ws.on("close", () => {
    clients = clients.filter((client) => client !== ws);
  });
});

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.get("/hello", async (req, res) => {
  res.send("Hello, World!");
});
// Routes
app.post("/api/loginMorgue", morgueController.authenticateMorgue);
app.get("/api/getAllMorgues", morgueController.getAllMorgues);
app.post("/api/releaseCabin", morgueController.releaseCabin);

app.post("/api/bookCabin", async (req, res) => {
  try {
    const { morgueId } = req.body;

    if (!morgueId) {
      return res
        .status(400)
        .json({ success: false, message: "Morgue ID is required" });
    }

    // Call the booking function in the controller
    await morgueController.bookCabin(req, res);

    // Broadcast message to all connected WebSocket clients
    const message = JSON.stringify({
      event: "booking_made",
      message: "A booking is made",
      morgueId: morgueId,
    });

    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Booking failed",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 5006;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
