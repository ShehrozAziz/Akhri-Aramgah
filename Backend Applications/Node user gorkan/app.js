const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");

const graveyardController = require("./controllers/graveyardController");
const graveController = require("./controllers/graveController");

const app = express();
const server = http.createServer(app);

// Set up WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected WebSocket clients
let clients = [];

// Handle WebSocket connection
wss.on("connection", (ws) => {
  console.log("Device connected");
  clients.push(ws);

  ws.on("message", async (message) => {
    try {
      const id = message.toString();
      console.log(id);

      if (!id) {
        ws.send(
          JSON.stringify({
            event: "error",
            message: "GraveyardID is required",
          })
        );
        return;
      }

      // Fetch all maintenance orders for the given GraveyardID
      const orders = await graveyardController.getMOrdersByGraveyard(id);
      console.log(orders);
      const graveorders = await graveController.getBookedGravesByGraveyard(id);
      console.log(graveorders);

      // Send the orders back to the client
      ws.send(
        JSON.stringify({
          event: "maintenanceOrders",
          data: orders,
          data2: graveorders,
        })
      );
    } catch (error) {
      console.error("Error handling message:", error);
      ws.send(
        JSON.stringify({
          event: "error",
          message: "An error occurred while fetching orders.",
        })
      );
    }
  });

  ws.on("close", () => {
    const index = clients.indexOf(ws);
    if (index !== -1) {
      clients.splice(index, 1);
    }
  });
});

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Socket Event Trigger for booking a grave
app.post("/api/bookGrave", async (req, res) => {
  try {
    // Call the bookGrave logic
    const result = await graveController.bookGrave(req);

    // Emit the bookGrave event with GraveID and GraveyardID to all connected clients
    const { GraveID, GraveyardID } = req.body;
    const eventMessage = JSON.stringify({
      event: "bookGrave",
      GraveID,
      GraveyardID,
    });

    // Send message to all connected clients
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(eventMessage);
      }
    });

    return res.status(200).json({
      success: true,
      message: "Grave booked successfully",
      result,
    });
  } catch (error) {
    console.error("Error in /api/bookGrave:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to book grave",
      error: error.message,
    });
  }
});

// Socket Event Trigger for maintenance request
app.post("/api/graveMaintenance", async (req, res) => {
  try {
    // Call the createMaintenanceOrder logic
    const result = await graveyardController.createMaintenanceOrder(req, res);

    // Emit the maintenanceRequest event with GraveID and GraveyardID to all connected clients
    const { GraveID, GraveyardID } = req.body;
    const eventMessage = JSON.stringify({
      event: "maintenanceRequest",
      GraveID,
      GraveyardID,
    });

    // Send message to all connected clients
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(eventMessage);
      }
    });

    return res.status(200).json({
      success: true,
      message: "Maintenance request created successfully",
      result,
    });
  } catch (error) {
    console.error("Error in /api/graveMaintenance:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to create maintenance request",
      error: error.message,
    });
  }
});

// Graveyard Routes
app.get("/api/graveyards", graveyardController.getAllGraveyards);
app.get(
  "/api/getGravesFromGraveyard/:graveyardId",
  graveController.getAllGravesOfGraveyard
);
app.get("/api/getGravesByUser/:userID", graveController.getGravesByUser);
app.post("/api/addDevice", graveController.addDevice);
app.post("/api/getGraveyard", graveyardController.authenticateGraveyard);
app.post("/api/getGraves", graveyardController.getGraves);
app.post(
  "/api/updateGraveOrMaintenance",
  graveController.updateGraveOrMaintenance
);
app.get("/api/getUrl/:graveyardID", graveyardController.getUrl);

// Server
const PORT = process.env.PORT || 5004;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
