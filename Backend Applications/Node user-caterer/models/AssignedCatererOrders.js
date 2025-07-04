const { ref, set, get, onValue, update } = require("firebase/database");
const { db } = require("../FirebaseConfig");

class AssignedCatererOrder {
  constructor(
    orderID,
    name,
    phone,
    catererID,
    userID,
    status,
    fare,
    source,
    sourcePin,
    orderDetails,
    date,
    time
  ) {
    this.orderID = orderID; // orderID passed explicitly
    this.name = name;
    this.phone = phone;
    this.catererID = catererID;
    this.userID = userID;
    this.status = status; // E.g., "pending", "in process", "completed"
    this.fare = fare;
    this.source = source;
    this.sourcePin = sourcePin;
    this.orderDetails = orderDetails; // New field for additional details
    this.date = date;
    this.time = time;
  }

  // Function to assign a new caterer order
  static async AssignOrder(order) {
    try {
      const orderRef = ref(db, `assignedCatererOrders/${order.orderID}`); // Updated table name
      console.log("ID: ", order.orderID);
      console.log("Order: ", order);
      await set(orderRef, {
        catererID: order.catererID,
        name: order.name,
        phone: order.phone,
        userID: order.userID,
        status: order.status,
        fare: order.fare,
        source: order.source,
        sourcePin: order.sourcePin,
        orderDetails: order.orderDetails, // Added to the database
        date: order.date,
        time: order.time,
      });
      return {
        success: true,
        message: "Order assigned successfully",
        orderID: order.orderID,
      };
    } catch (error) {
      console.error("Error assigning caterer order:", error);
      return { success: false, message: "Error assigning caterer order" };
    }
  }

  static async fetchAssignedOrders(userID) {
    try {
      const ordersRef = ref(db, `assignedCatererOrders`);
      const snapshot = await get(ordersRef);

      if (snapshot.exists()) {
        const orders = [];
        snapshot.forEach((childSnapshot) => {
          const order = childSnapshot.val();
          if (order.userID === userID && order.status === "Assigned") {
            orders.push({ orderID: childSnapshot.key, ...order });
          }
        });
        return { success: true, orders };
      } else {
        return {
          success: false,
          message: "No assigned orders found for this user.",
        };
      }
    } catch (error) {
      console.error("Error fetching assigned orders:", error);
      return { success: false, message: "Error fetching assigned orders." };
    }
  }

  static async fetchAssignedOrdersForCaterer(catererID) {
    try {
      const ordersRef = ref(db, `assignedCatererOrders`);
      const snapshot = await get(ordersRef);

      if (snapshot.exists()) {
        const orders = [];
        snapshot.forEach((childSnapshot) => {
          const order = childSnapshot.val();
          if (order.catererID === catererID && order.status === "Assigned") {
            orders.push({ orderID: childSnapshot.key, ...order });
          }
        });
        return { success: true, orders };
      } else {
        return {
          success: false,
          message: "No assigned orders found for this user.",
        };
      }
    } catch (error) {
      console.error("Error fetching assigned orders:", error);
      return { success: false, message: "Error fetching assigned orders." };
    }
  }

  static async checkOrderExistence(orderID) {
    try {
      const orderRef = ref(db, `assignedCatererOrders/${orderID}`);
      const snapshot = await new Promise((resolve, reject) => {
        onValue(
          orderRef,
          (data) => resolve(data),
          (error) => reject(error),
          { onlyOnce: true } // Ensures the listener detaches after the first read
        );
      });

      return snapshot.exists(); // Returns true if the order exists, false otherwise
    } catch (error) {
      console.error("Error checking order existence:", error);
      return false; // Returns false if there's an error
    }
  }

  static async getOrderByCatererID(catererID) {
    try {
      const ordersRef = ref(db, `assignedCatererOrders`);
      const snapshot = await get(ordersRef);

      if (snapshot.exists()) {
        let order = null;
        snapshot.forEach((childSnapshot) => {
          const orderData = childSnapshot.val();
          if (
            orderData.catererID === catererID &&
            orderData.status === "Assigned"
          ) {
            order = { orderID: childSnapshot.key, ...orderData };
          }
        });
        return order;
      } else {
        return null; // No orders found in the database
      }
    } catch (error) {
      console.error("Error fetching order by catererID:", error);
      return null; // Return null if there's an error
    }
  }

  static async SetStatusChanged(orderID) {
    try {
      const exists = await this.checkOrderExistence(orderID);
      if (!exists) {
        return {
          success: false,
          message: "Order not found",
        };
      }
      const orderRef = ref(db, `assignedCatererOrders/${orderID}`);
      await update(orderRef, {
        status: "Completed",
      });
      return {
        success: true,
        message: "Order status updated to Completed successfully",
        orderID: orderID,
      };
    } catch (error) {
      console.error("Error updating order status:", error);
      return {
        success: false,
        message: "Error updating order status",
      };
    }
  }
  static async getOrdersByUserID(userID) {
    try {
      const ordersRef = ref(db, "assignedCatererOrders");
      const snapshot = await get(ordersRef);

      if (!snapshot.exists()) return [];

      const orders = [];
      snapshot.forEach((childSnapshot) => {
        const order = childSnapshot.val();
        if (order.userID === userID) {
          orders.push({ orderID: childSnapshot.key, ...order });
        }
      });

      return orders;
    } catch (error) {
      console.error("Error fetching assigned orders:", error);
      return []; // Ensure consistency by returning an empty array on error
    }
  }
}

module.exports = AssignedCatererOrder;
