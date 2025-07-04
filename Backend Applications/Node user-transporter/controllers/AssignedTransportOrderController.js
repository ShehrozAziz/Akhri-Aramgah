const { ref, get } = require("firebase/database");
const { db } = require("../FirebaseConfig");
const AssignedTransportOrder = require("../models/AssignedTransportOrders");

exports.assignOrder = async (req) => {
  const { orderID, transporterID } = req.body;

  try {
    if (!orderID || !transporterID) {
      return {
        success: false,
        message: "Both orderID and transporterID are required.",
      };
    }

    // Step 1: Retrieve the order from TransportOrder table
    const orderRef = ref(db, `transportOrders/${orderID}`);
    const orderSnapshot = await get(orderRef);

    if (!orderSnapshot.exists()) {
      return {
        success: false,
        message: "Order not found in TransportOrder table.",
      };
    }

    const orderData = orderSnapshot.val();

    // Step 2: Assign order to AssignedTransportOrder table
    const assignedOrder = new AssignedTransportOrder(
      orderID,
      orderData.name,
      orderData.phone,
      transporterID,
      orderData.userID,
      "Assigned", // Set initial status for assigned orders
      orderData.fare,
      orderData.sourceAddress,
      orderData.sourcePin,
      orderData.destinationAddress,
      orderData.destinationPin,
      orderData.date,
      orderData.time
    );

    const assignResult = await AssignedTransportOrder.AssignOrder(
      assignedOrder
    );

    if (!assignResult.success) {
      return {
        success: false,
        message: "Failed to assign the order.",
      };
    }

    return {
      success: true,
      message: "Order assigned successfully.",
      orderID: orderID,
    };
  } catch (error) {
    console.error("Error assigning transport order:", error);
    return {
      success: false,
      message: "An error occurred while assigning the transport order.",
    };
  }
};
exports.fetchAssignedOrders = async (req) => {
  const { userID } = req.body;

  try {
    if (!userID) {
      return {
        success: false,
        message: "User ID is required.",
      };
    }

    const result = await AssignedTransportOrder.fetchAssignedOrders(userID);

    if (!result.success) {
      return {
        success: false,
        message: result.message,
      };
    }

    return {
      success: true,
      orders: result.orders,
    };
  } catch (error) {
    console.error("Error fetching assigned orders:", error);
    return {
      success: false,
      message: "An error occurred while fetching the assigned orders.",
    };
  }
};

exports.fetchAssignedOrdersForTransporter = async (req, res) => {
  const transporterID = req.body.transporterID;

  try {
    if (!transporterID) {
      return res.status(200).json({
        success: false,
        message: "Transporter ID is required.",
      });
    }
    const result =
      await AssignedTransportOrder.fetchAssignedOrdersForTransporter(
        transporterID
      );
    if (!result.success) {
      console.log("empty sutt ra");
      return res.status(200).json({
        success: false,
        message: result.message,
      });
    }
    console.log(result.orders);
    return res.status(200).json({
      success: true,
      orders: result.orders,
    });
  } catch (error) {
    console.error("Error fetching assigned orders:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the assigned orders.",
    });
  }
};

exports.fetchOrderByTransporterID = async (transporterID) => {
  try {
    if (!transporterID) {
      return null; // If no transporterID is provided, return null
    }
    // Call the method to fetch the order for the given transporterID
    const order = await AssignedTransportOrder.getOrderByTransporterID(
      transporterID
    );

    if (!order) {
      return null; // If no order found, return null
    }
    // Return the order wrapped in an array
    return [order]; // Return the order as an array
  } catch (error) {
    console.error("Error fetching order by transporterID:", error);
    return null; // Return null if an error occurs
  }
};

// 3. Check if an order exists
exports.checkOrderExistence = async (req) => {
  const { orderID } = req.body;
  try {
    if (!orderID) {
      return {
        success: false,
        message: "Order ID is required.",
      };
    }
    const exists = await AssignedTransportOrder.checkOrderExistence(orderID); // Get boolean result
    if (!exists) {
      return {
        success: false,
        message: "Order does not exist.",
      };
    }
    return {
      success: true,
      message: "Order exists.",
    };
  } catch (error) {
    console.error("Error checking order existence:", error);
    return {
      success: false,
      message: "An error occurred while checking the order existence.",
    };
  }
};
exports.setorderstatus = async (req) => {
  const { orderID } = req.body;

  try {
    if (!orderID) {
      return {
        success: false,
        message: "Order ID is required.",
      };
    }
    const result = await AssignedTransportOrder.SetStatusChanged(orderID);
    if (!result.success) {
      return {
        success: false,
        message: result.message,
      };
    }
    return {
      success: true,
      message: "Order status updated successfully.",
      orderID: orderID,
    };
  } catch (error) {
    console.error("Error updating order status:", error);
    return {
      success: false,
      message: "An error occurred while updating the order status.",
    };
  }
};

exports.getAssignedTOrders = async (req, res) => {
  const { userID } = req.body;

  console.log("Fetching orders for user:", userID);

  if (!userID) {
    return res
      .status(400)
      .json({ success: false, orders: [], message: "User ID is required." });
  }

  try {
    const orders = await AssignedTransportOrder.getOrdersByUserID(userID);

    if (!Array.isArray(orders)) {
      return res.status(500).json({
        success: false,
        orders: [],
        message: "Internal Server Error.",
      });
    }

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.log(error);
    console.error("Error fetching assigned orders:", error);
    res
      .status(500)
      .json({ success: false, orders: [], message: "An error occurred." });
  }
};
