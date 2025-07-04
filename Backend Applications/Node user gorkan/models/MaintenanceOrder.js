const { ref, push, set, get, remove } = require("firebase/database");
const { db } = require("../FirebaseConfig");

class MaintenanceOrder {
  static async createMaintenanceOrder(userID, GraveyardID, GraveID) {
    // Reference to the maintenanceOrders table
    const maintenanceOrderRef = ref(db, "maintenanceOrders");

    // Create a new push key and store the maintenance order
    const newOrder = push(maintenanceOrderRef);
    await set(newOrder, {
      userID,
      GraveyardID,
      GraveID,
      createdAt: new Date().toISOString(), // Store the timestamp for the order creation
    });

    return { id: newOrder.key, userID, GraveyardID, GraveID };
  }
  static async getMaintenanceOrdersByGraveyard(graveyardId) {
    const snapshot = await get(ref(db, "maintenanceOrders"));

    if (!snapshot.exists()) {
      return [];
    }

    const data = snapshot.val();

    // Filter orders by GraveyardID
    const filteredOrders = Object.keys(data)
      .filter((key) => data[key].GraveyardID === graveyardId)
      .map((key) => ({
        GraveID: data[key].GraveID,
        GraveyardID: data[key].GraveyardID,
      }));

    return filteredOrders;
  }
  static async removeOrder(graveyardId, graveId) {
    const snapshot = await get(ref(db, "maintenanceOrders"));
    if (!snapshot.exists()) return;

    const orders = snapshot.val();
    const orderKeysToDelete = Object.keys(orders).filter(
      (key) =>
        orders[key].GraveyardID === graveyardId &&
        orders[key].GraveID === graveId
    );

    for (const key of orderKeysToDelete) {
      await remove(ref(db, `maintenanceOrders/${key}`));
    }
  }
}

module.exports = MaintenanceOrder;
