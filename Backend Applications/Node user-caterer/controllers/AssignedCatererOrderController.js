const { ref, get } = require("firebase/database");
const { db } = require("../FirebaseConfig");
const AssignedCatererOrder = require("../models/AssignedCatererOrders");

exports.assignOrder = async (req) => {
  const { orderID, catererID } = req.body;

  try {
    if (!orderID || !catererID) {
      return {
        success: false,
        message: "Both orderID and catererID are required.",
      };
    }

    // Step 1: Retrieve the order from CatererOrder table
    const orderRef = ref(db, `catererOrders/${orderID}`);
    const orderSnapshot = await get(orderRef);

    if (!orderSnapshot.exists()) {
      return {
        success: false,
        message: "Order not found in CatererOrder table.",
      };
    }

    const orderData = orderSnapshot.val();

    // Step 2: Assign order to AssignedCatererOrder table
    const assignedOrder = new AssignedCatererOrder(
      orderID,
      orderData.name,
      orderData.phone,
      catererID,
      orderData.userID,
      "Assigned", // Initial status
      orderData.fare,
      orderData.sourceAddress,
      orderData.sourcePin,
      orderData.orderDetails, // Additional details specific to the caterer
      orderData.date,
      orderData.time
    );

    const assignResult = await AssignedCatererOrder.AssignOrder(assignedOrder);

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
    console.error("Error assigning caterer order:", error);
    return {
      success: false,
      message: "An error occurred while assigning the caterer order.",
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

    const result = await AssignedCatererOrder.fetchAssignedOrders(userID);

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

exports.fetchAssignedOrdersForCaterer = async (req, res) => {
  const catererID = req.body.catererID;

  try {
    if (!catererID) {
      return res.status(200).json({
        success: false,
        message: "Caterer ID is required.",
      });
    }
    const result = await AssignedCatererOrder.fetchAssignedOrdersForCaterer(
      catererID
    );

    if (!result.success) {
      return res.status(200).json({
        success: false,
        message: result.message,
      });
    }

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

exports.fetchOrderByCatererID = async (catererID) => {
  try {
    if (!catererID) {
      return null;
    }
    const order = await AssignedCatererOrder.getOrderByCatererID(catererID);

    if (!order) {
      return null;
    }
    return [order];
  } catch (error) {
    console.error("Error fetching order by catererID:", error);
    return null;
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
    const exists = await AssignedCatererOrder.checkOrderExistence(orderID);
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
    const result = await AssignedCatererOrder.SetStatusChanged(orderID);
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
    const orders = await AssignedCatererOrder.getOrdersByUserID(userID);

    if (!Array.isArray(orders)) {
      return res.status(500).json({
        success: false,
        orders: [],
        message: "Internal Server Error.",
      });
    }

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching assigned orders:", error);
    res
      .status(500)
      .json({ success: false, orders: [], message: "An error occurred." });
  }
};
