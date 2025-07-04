const TransportOrder = require("../models/TransportOrder");

exports.placeOrder = async (req, res, broadcastNewOrder) => {
  const {
    userID,
    name,
    phone,
    sourcePin,
    destinationPin,
    sourceAddress,
    destinationAddress,
    totalDistance,
    fare,
    status,
  } = req.body;

  try {
    // Validate required fields
    if (
      !userID ||
      !name ||
      !phone ||
      !sourcePin ||
      !destinationPin ||
      !sourceAddress ||
      !destinationAddress ||
      !totalDistance ||
      !fare ||
      !status
    ) {
      return res
        .status(400)
        .send({ success: false, message: "All fields are required." });
    }

    // Create a new order with an auto-generated orderID
    const order = new TransportOrder(
      userID,
      name,
      phone,
      sourcePin,
      destinationPin,
      sourceAddress,
      destinationAddress,
      totalDistance,
      fare,
      status
    );

    // Save the order in the database and get the result with orderID
    const result = await TransportOrder.createOrder(order);

    if (!result.success) {
      return res
        .status(500)
        .send({ success: false, message: "Failed to place the order." });
    }

    // Broadcast new order details including orderID
    broadcastNewOrder({
      orderID: result.orderID,
      userID,
      name,
      phone,
      sourcePin,
      destinationPin,
      sourceAddress,
      destinationAddress,
      totalDistance,
      fare,
      status,
      date: order.date, // Auto-generated date from TransportOrder model
      time: order.time, // Auto-generated time from TransportOrder model
    });

    // Send response with success, orderID, and confirmation message
    res.status(200).send({
      success: true,
      orderID: result.orderID,
      message: "Order placed successfully!",
    });
  } catch (error) {
    console.error("Error placing transport order:", error);
    res.status(500).send({
      success: false,
      message: "An error occurred while placing the order.",
    });
  }
};

// Move the `cancelOrder` and `getUserOrders` functions outside of `placeOrder`

exports.cancelOrder = async (req, res, broadcastOrderUpdate) => {
  try {
    const orderId = req.body.orderID;
    const result = await TransportOrder.cancelOrder(orderId);

    if (!result.success) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Broadcast cancellation update
    broadcastOrderUpdate({
      event: "orderCancelled",
      orderID: orderId,
      message: "Order has been cancelled.",
    });

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
      orderID: orderId,
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    res
      .status(500)
      .json({ success: false, message: "Error deleting order", error });
  }
};

exports.DeleteOrder = async (req, broadcastOrderUpdate) => {
  try {
    const orderId = req.body.orderID;
    const result = await TransportOrder.cancelOrder(orderId);

    if (!result.success) {
      // Order not found, return false
      return false;
    }

    // Broadcast cancellation update
    broadcastOrderUpdate({
      event: "orderCancelled",
      orderID: orderId,
      message: "Order has been cancelled.",
    });

    // Return true if the order is successfully deleted and broadcasted
    return true;
  } catch (error) {
    console.error("Error deleting order:", error);
    // Return false if there is an error
    return false;
  }
};

exports.getUserOrders = async (req, res) => {
  const { userID } = req.body;

  if (!userID) {
    return res
      .status(400)
      .json({ success: false, message: "User ID is required." });
  }

  try {
    const userOrders = await TransportOrder.getOrdersByUserID(userID);

    if (userOrders.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No orders found for this user." });
    }

    res.status(200).json({ success: true, orders: userOrders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching orders", error });
  }
};
