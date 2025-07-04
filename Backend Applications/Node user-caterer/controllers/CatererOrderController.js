const CatererOrder = require("../models/CatererOrder");

// Place a new order
exports.placeOrder = async (req, res, broadcastNewOrder) => {
  console.log("Caterer order placement hit");

  const {
    userID,
    name,
    phone,
    sourcePin,
    sourceAddress,
    fare,
    status,
    orderDetails,
  } = req.body;

  try {
    // Validate required fields
    if (
      !userID ||
      !name ||
      !phone ||
      !sourcePin ||
      !sourceAddress ||
      !fare ||
      !status ||
      !orderDetails
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    // Create a new CatererOrder instance
    const order = new CatererOrder(
      userID,
      name,
      phone,
      sourcePin,
      sourceAddress,
      fare,
      status,
      orderDetails
    );

    // Save the order in the database
    const result = await CatererOrder.createOrder(order);

    if (!result.success) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to place the order." });
    }

    // Broadcast the new order details
    broadcastNewOrder({
      orderID: result.orderID,
      userID,
      name,
      phone,
      sourcePin,
      sourceAddress,
      fare,
      status,
      orderDetails,
      date: order.date, // Auto-generated
      time: order.time, // Auto-generated
    });

    res.status(200).json({
      success: true,
      orderID: result.orderID,
      message: "Order placed successfully!",
    });
  } catch (error) {
    console.error("Error placing caterer order:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while placing the order.",
      error,
    });
  }
};

// Cancel an order
exports.cancelOrder = async (req, res, broadcastOrderUpdate) => {
  const { orderID } = req.body;

  if (!orderID) {
    return res
      .status(400)
      .json({ success: false, message: "Order ID is required." });
  }

  try {
    const result = await CatererOrder.cancelOrder(orderID);

    if (!result.success) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    // Broadcast order cancellation
    broadcastOrderUpdate({
      event: "orderCancelled",
      orderID,
      message: "Order has been cancelled.",
    });

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully.",
      orderID,
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while cancelling the order.",
      error,
    });
  }
};

// Delete an order (utility function)
exports.deleteOrder = async (req, broadcastOrderUpdate) => {
  const { orderID } = req.body;

  if (!orderID) {
    console.error("Order ID is required to delete an order.");
    return false;
  }

  try {
    const result = await CatererOrder.cancelOrder(orderID);

    if (!result.success) {
      console.error("Order not found:", orderID);
      return false;
    }

    // Broadcast order cancellation
    broadcastOrderUpdate({
      event: "orderCancelled",
      orderID,
      message: "Order has been cancelled.",
    });

    return true;
  } catch (error) {
    console.error("Error deleting order:", error);
    return false;
  }
};

// Fetch user-specific orders
exports.getUserOrders = async (req, res) => {
  const { userID } = req.body;

  if (!userID) {
    return res
      .status(400)
      .json({ success: false, message: "User ID is required." });
  }

  try {
    const userOrders = await CatererOrder.getOrdersByUserID(userID);

    if (userOrders.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No orders found for this user." });
    }

    res.status(200).json({
      success: true,
      orders: userOrders,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching orders.",
      error,
    });
  }
};
