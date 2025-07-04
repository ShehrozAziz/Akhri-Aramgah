const { ref, set, get, onValue, update } = require("firebase/database");
const { db } = require("../FirebaseConfig");

class AssignedTransportOrder {
  constructor(
    orderID,
    name,
    phone,
    transporterID,
    userID,
    status,
    fare,
    source,
    sourcePin,
    destination,
    destinationPin,
    date,
    time
  ) {
    this.orderID = orderID; // orderID passed explicitly
    this.name = name;
    this.phone = phone;
    this.transporterID = transporterID;
    this.userID = userID;
    this.status = status; // E.g., "pending", "in transit", "completed"
    this.fare = fare;
    this.source = source;
    this.sourcePin = sourcePin;
    this.destination = destination;
    this.destinationPin = destinationPin;
    this.date = date;
    this.time = time;
  }

  // Function to assign a new transport order
  static async AssignOrder(order) {
    try {
      const orderRef = ref(db, `assignedTransportOrders/${order.orderID}`); // Updated table name
      await set(orderRef, {
        transporterID: order.transporterID,
        name: order.name,
        phone: order.phone,
        userID: order.userID,
        status: order.status,
        fare: order.fare,
        source: order.source,
        sourcePin: order.sourcePin,
        destination: order.destination,
        destinationPin: order.destinationPin,
        date: order.date,
        time: order.time,
      });
      return {
        success: true,
        message: "Order assigned successfully",
        orderID: order.orderID,
      };
    } catch (error) {
      console.error("Error assigning transport order:", error);
      return { success: false, message: "Error assigning transport order" };
    }
  }
  static async fetchAssignedOrders(userID) {
    try {
      const ordersRef = ref(db, `assignedTransportOrders`);
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
  static async fetchAssignedOrdersForTransporter(transporterID) {
    try {
      const ordersRef = ref(db, `assignedTransportOrders`);
      const snapshot = await get(ordersRef);

      if (snapshot.exists()) {
        const orders = [];
        snapshot.forEach((childSnapshot) => {
          const order = childSnapshot.val();
          if (
            order.transporterID === transporterID &&
            order.status === "Assigned"
          ) {
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
      const orderRef = ref(db, `assignedTransportOrders/${orderID}`);
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
  static async getOrderByTransporterID(transporterID) {
    try {
      const ordersRef = ref(db, `assignedTransportOrders`);
      const snapshot = await get(ordersRef);

      if (snapshot.exists()) {
        let order = null;
        snapshot.forEach((childSnapshot) => {
          const orderData = childSnapshot.val();
          if (
            orderData.transporterID === transporterID &&
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
      console.error("Error fetching order by transporterID:", error);
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
      const orderRef = ref(db, `assignedTransportOrders/${orderID}`);
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
      const ordersRef = ref(db, "assignedTransportOrders");
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

module.exports = AssignedTransportOrder;
