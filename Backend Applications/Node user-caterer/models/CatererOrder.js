const { getDatabase, ref, set, push, get } = require("firebase/database"); // Firebase DB functions
const { db } = require("../FirebaseConfig"); // Adjust the path as necessary

class CatererOrder {
  constructor(
    userID,
    name,
    phone,
    sourcePin,
    sourceAddress,
    fare,
    status,
    orderDetails,
    orderID = null
  ) {
    this.orderID = orderID || push(ref(db, "catererOrders")).key; // Generates unique orderID
    this.userID = userID;
    this.name = name;
    this.phone = phone;
    this.sourcePin = sourcePin;
    this.sourceAddress = sourceAddress;
    this.fare = fare;
    this.status = status;
    this.orderDetails = orderDetails; // New attribute for order-specific details
    this.date = new Date().toLocaleDateString(); // Auto-generated date
    this.time = new Date().toLocaleTimeString(); // Auto-generated time
  }

  // Function to create a caterer order entry in the Firebase database
  static async createOrder(order) {
    try {
      const orderRef = ref(db, `catererOrders/${order.orderID}`);
      await set(orderRef, {
        userID: order.userID,
        name: order.name,
        phone: order.phone,
        sourcePin: order.sourcePin,
        sourceAddress: order.sourceAddress,
        fare: order.fare,
        status: order.status,
        orderDetails: order.orderDetails, // New attribute
        date: order.date,
        time: order.time,
      });

      return { success: true, orderID: order.orderID };
    } catch (error) {
      console.error("Error creating caterer order:", error);
      return { success: false };
    }
  }

  // Function to get all caterer orders from the Firebase database
  static async getAllOrders() {
    try {
      const ordersRef = ref(db, "catererOrders");
      const snapshot = await get(ordersRef);

      if (snapshot.exists()) {
        const orders = snapshot.val();

        // Convert orders to an array of objects including the orderID
        const pendingOrders = Object.entries(orders)
          .filter(([_, order]) => order.status === "Pending") // Filter for pending orders
          .map(([orderID, orderData]) => ({
            orderID, // Add the orderID to each order
            ...orderData,
          }));

        return pendingOrders; // Return pending orders with orderID included
      } else {
        return []; // No orders found
      }
    } catch (error) {
      console.error("Error retrieving orders:", error);
      throw error; // Rethrow to handle it in the WebSocket server
    }
  }

  static async cancelOrder(orderID) {
    try {
      const orderRef = ref(db, `catererOrders/${orderID}`);

      // Delete the order by setting its reference to null
      await set(orderRef, null);

      return { success: true, message: "Order canceled successfully" };
    } catch (error) {
      console.error("Error canceling order:", error);
      return { success: false, message: "Error canceling order", error };
    }
  }

  static async getOrdersByUserID(userID) {
    try {
      const ordersRef = ref(db, "catererOrders");
      const snapshot = await get(ordersRef);
      if (snapshot.exists()) {
        const orders = snapshot.val();
        const userOrders = Object.keys(orders).filter((orderKey) => {
          const order = orders[orderKey];
          return order.userID === userID;
        });
        const userOrderDetails = userOrders.map((orderKey) => {
          const order = orders[orderKey];
          return {
            orderID: orderKey,
            ...order,
          };
        });

        return userOrderDetails;
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error retrieving user orders:", error);
      throw error;
    }
  }
}

module.exports = CatererOrder;
