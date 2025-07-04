const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const WebSocket = require("ws");
const transportOrderController = require("./controllers/transportOrderController");
const TransportOrder = require("./models/TransportOrder"); // Adjust the path as necessary
const transporterController = require("./controllers/TransportController");
const AssignedTransportOrderController = require("./controllers/AssignedTransportOrderController");
const app = express();
const PORT = process.env.PORT || 5001; // New port for this server
app.use(bodyParser.json());
app.use(cors());
const server = app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});
const wss = new WebSocket.Server({ server });
const clients = [];
wss.on("connection", (ws) => {
  console.log("Device connected");
  clients.push(ws);
  ws.on("message", async (message) => {
    const transporterId = message.toString();

    const order =
      await AssignedTransportOrderController.fetchOrderByTransporterID(
        transporterId
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

const sendAllOrders = async (ws) => {
  try {
    const orders = await TransportOrder.getAllOrders();
    ws.send(JSON.stringify({ event: "allOrders", data: orders }));
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
};

const broadcastNewOrder = (order) => {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ event: "newOrder", data: [order] }));
    }
  });
};

const broadcastOrderUpdate = (update) => {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(update));
    }
  });
};

app.post("/api/placeOrder", async (req, res) => {
  const result = await transportOrderController.placeOrder(
    req,
    res,
    broadcastNewOrder
  );
});

app.get("/api/addTransporter", transporterController.addTransporter);
app.post("/api/login", transporterController.login);

app.delete("/api/cancelOrder", async (req, res) => {
  await transportOrderController.cancelOrder(req, res, broadcastOrderUpdate);
});
app.post("/api/getUserOrders", async (req, res) => {
  await transportOrderController.getUserOrders(req, res);
});
app.post("/api/AssignOrder", async (req, res) => {
  try {
    const assignResult = await AssignedTransportOrderController.assignOrder(
      req
    );

    if (assignResult.success) {
      await transportOrderController.DeleteOrder(req, broadcastOrderUpdate);

      return res.json({ success: true, message: "Successfully Placed Order" });
    } else {
      return res
        .status(500)
        .json({ success: false, message: assignResult.message });
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
  console.log("returning");
  if (!userID) {
    return res
      .status(400)
      .json({ success: false, message: "UserID is required" });
  }

  try {
    const result = await AssignedTransportOrderController.fetchAssignedOrders(
      req
    );
    console.log(result);
    res.json(result);
  } catch (error) {
    console.error("Error fetching assigned orders:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching assigned orders" });
  }
});

// Check if an order exists (Accepting orderID in the body)
app.post("/api/checkOrderExistence", async (req, res) => {
  const { orderID } = req.body;
  if (!orderID) {
    return res
      .status(400)
      .json({ success: false, message: "OrderID is required" });
  }

  try {
    const result = await AssignedTransportOrderController.checkOrderExistence(
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
    const result = await AssignedTransportOrderController.setorderstatus(req);

    if (result.success) {
      // Send all orders to all connected WebSocket clients
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          sendAllOrders(client);
        }
      });
    }
    res.json(result);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating order status",
    });
  }
});

app.post("/api/updatePassword", async (req, res) => {
  await transporterController.updatePassword(req, res);
});

app.post("/api/updatePhone", async (req, res) => {
  await transporterController.updatePhone(req, res);
});

app.post("/api/fetchOrdersForTransporter", async (req, res) => {
  await AssignedTransportOrderController.fetchAssignedOrdersForTransporter(
    req,
    res
  );
});
app.post(
  "/api/getAssignedOrders1",
  AssignedTransportOrderController.getAssignedTOrders
);

module.exports = app;
