const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const WebSocket = require("ws");
const catererOrderController = require("./controllers/CatererOrderController");
const CatererOrder = require("./models/CatererOrder");
const catererController = require("./controllers/CatererController");
const AssignedCatererOrderController = require("./controllers/AssignedCatererOrderController");

const app = express();
const PORT = process.env.PORT || 5002; // Updated port to 5002

app.use(bodyParser.json());
app.use(cors());

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const wss = new WebSocket.Server({ server });
const clients = [];

// Handle WebSocket connection
wss.on("connection", (ws) => {
  console.log("Device connected");
  clients.push(ws);

  ws.on("message", async (message) => {
    const catererId = message.toString();

    const order = await AssignedCatererOrderController.fetchOrderByCatererID(
      catererId
    );

    if (!order) {
      sendAllOrders(ws);
    } else {
      ws.send(JSON.stringify({ event: "oneOrder", data: order }));
    }
  });

  ws.on("close", () => {
    const index = clients.indexOf(ws);
    if (index !== -1) {
      clients.splice(index, 1);
    }
  });
});

// Function to send all orders to a specific client
const sendAllOrders = async (ws) => {
  try {
    const orders = await CatererOrder.getAllOrders();
    ws.send(JSON.stringify({ event: "allOrders", data: orders }));
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
};

// Broadcast new order updates to all connected clients
const broadcastNewOrder = (order) => {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ event: "newOrder", data: [order] }));
    }
  });
};

// Broadcast any order updates to all connected clients
const broadcastOrderUpdate = (update) => {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(update));
    }
  });
};

app.get("/api/hello", async (req, res) => {
  console.log("hit");
});
// Route to place an order
app.post("/api/placeOrder", async (req, res) => {
  console.log("caterers 1st hit");
  const result = await catererOrderController.placeOrder(
    req,
    res,
    broadcastNewOrder
  );
});

app.get("/api/addCaterer", catererController.addCaterer); // Add a caterer
app.post("/api/login", catererController.login); // Login API

// Cancel an order
app.delete("/api/cancelOrder", async (req, res) => {
  await catererOrderController.cancelOrder(req, res, broadcastOrderUpdate);
});

app.post("/api/getUserOrders", async (req, res) => {
  await catererOrderController.getUserOrders(req, res);
});

app.post("/api/AssignOrder", async (req, res) => {
  try {
    const assignResult = await AssignedCatererOrderController.assignOrder(req);

    if (assignResult.success) {
      await catererOrderController.deleteOrder(req, broadcastOrderUpdate);
      return res.json({ success: true, message: "Order Successfully Placed" });
    } else {
      return res.status(500).json({
        success: false,
        message: assignResult.message,
      });
    }
  } catch (error) {
    console.error("Error in assignOrder route:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while assigning the order.",
    });
  }
});

app.post("/api/fetchAssignedOrders", async (req, res) => {
  const { userID } = req.body;
  if (!userID) {
    return res
      .status(400)
      .json({ success: false, message: "UserID is required" });
  }

  try {
    const result = await AssignedCatererOrderController.fetchAssignedOrders(
      req
    );
    res.json(result);
  } catch (error) {
    console.error("Error fetching assigned orders:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching assigned orders" });
  }
});

// Check if an order exists (Accepts orderID in the request body)
app.post("/api/checkOrderExistence", async (req, res) => {
  const { orderID } = req.body;
  if (!orderID) {
    return res
      .status(400)
      .json({ success: false, message: "OrderID is required" });
  }

  try {
    const result = await AssignedCatererOrderController.checkOrderExistence(
      req
    );
    res.json(result);
  } catch (error) {
    console.error("Error checking order existence:", error);
    res
      .status(500)
      .json({ success: false, message: "Error checking order existence" });
  }
});

app.get("/hello", (req, res) => {
  res.send("Hello World!");
});

app.post("/api/setorderstatus", async (req, res) => {
  const { orderID } = req.body;
  if (!orderID) {
    return res
      .status(400)
      .json({ success: false, message: "OrderID is required" });
  }

  try {
    const result = await AssignedCatererOrderController.setorderstatus(req);

    if (result.success) {
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          sendAllOrders(client);
        }
      });
    }

    res.json(result);
  } catch (error) {
    console.error("Error updating order status:", error);
    res
      .status(500)
      .json({ success: false, message: "Error updating order status" });
  }
});

app.post("/api/updatePassword", async (req, res) => {
  await catererController.updatePassword(req, res);
});

app.post("/api/updatePhone", async (req, res) => {
  await catererController.updatePhone(req, res);
});

app.post("/api/fetchOrdersForCaterer", async (req, res) => {
  await AssignedCatererOrderController.fetchAssignedOrdersForCaterer(req, res);
});

app.post("/api/AssignedOrders", async (req, res) => {
  await AssignedCatererOrderController.getAssignedTOrders(req, res);
});

module.exports = app;
