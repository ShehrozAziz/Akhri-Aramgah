const { getDatabase, ref, set, push, get } = require("firebase/database"); // Firebase DB functions
const { db } = require("../FirebaseConfig"); // Adjust the path as necessary

class TransportOrder {
  constructor(
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
    orderID = null
  ) {
    this.orderID = orderID || push(ref(db, "transportOrders")).key; // Generates unique orderID
    this.userID = userID;
    this.name = name;
    this.phone = phone;
    this.sourcePin = sourcePin;
    this.destinationPin = destinationPin;
    this.sourceAddress = sourceAddress;
    this.destinationAddress = destinationAddress;
    this.totalDistance = totalDistance;
    this.fare = fare;
    this.status = status;
    this.date = new Date().toLocaleDateString(); // Auto-generated date
    this.time = new Date().toLocaleTimeString(); // Auto-generated time
  }

  // Function to create a transport order entry in the Firebase database
  static async createOrder(order) {
    try {
      const orderRef = ref(db, `transportOrders/${order.orderID}`);
      await set(orderRef, {
        userID: order.userID,
        name: order.name,
        phone: order.phone,
        sourcePin: order.sourcePin,
        destinationPin: order.destinationPin,
        sourceAddress: order.sourceAddress,
        destinationAddress: order.destinationAddress,
        totalDistance: order.totalDistance,
        fare: order.fare,
        status: order.status,
        date: order.date,
        time: order.time,
      });

      return { success: true, orderID: order.orderID };
    } catch (error) {
      console.error("Error creating transport order:", error);
      return { success: false };
    }
  }

  // Function to get all transport orders from the Firebase database
  static async getAllOrders() {
    try {
      const ordersRef = ref(db, "transportOrders");
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
      const orderRef = ref(db, `transportOrders/${orderID}`);

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
      const ordersRef = ref(db, "transportOrders");
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

module.exports = TransportOrder;
