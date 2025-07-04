const { ref, set, push, get } = require("firebase/database");
const { db } = require("../FirebaseConfig");

class GraveOrder {
  static async createOrder(userID, GraveyardID, GraveID) {
    const graveOrderRef = ref(db, "graveOrders");
    const newOrder = push(graveOrderRef);
    await set(newOrder, {
      userID,
      GraveyardID,
      GraveID,
    });
  }
  static async getGravesByUser(userID) {
    // Fetch all grave orders for the user
    const graveOrderSnapshot = await get(ref(db, "graveOrders"));
    if (!graveOrderSnapshot.exists()) return [];

    const graveOrders = Object.values(graveOrderSnapshot.val()).filter(
      (order) => order.userID === userID
    );

    // Prepare an array to hold the results
    const results = [];

    for (const order of graveOrders) {
      const { GraveyardID, GraveID } = order;

      // Fetch graveyard name
      const graveyardSnapshot = await get(ref(db, `graveyards/${GraveyardID}`));
      const graveyardName = graveyardSnapshot.exists()
        ? graveyardSnapshot.val().name
        : "Unknown Graveyard";

      // Fetch grave details
      const graveSnapshot = await get(
        ref(db, `graveyards/${GraveyardID}/graves/${GraveID}`)
      );
      if (graveSnapshot.exists()) {
        const grave = graveSnapshot.val();
        results.push({
          name: grave.name || "Unnamed Grave",
          reading: grave.reading || 0,
          device: grave.device || "no",
          GraveyardID,
          GraveID,
          graveyardName,
        });
      }
    }

    return results;
  }
}

module.exports = GraveOrder;
