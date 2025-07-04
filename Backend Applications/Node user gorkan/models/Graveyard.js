const { ref, set, get, push } = require("firebase/database");
const { db } = require("../FirebaseConfig");

class Graveyard {
  static async getAll() {
    const snapshot = await get(ref(db, "graveyards"));
    if (!snapshot.exists()) return [];

    const data = snapshot.val();
    return Object.keys(data).map((id) => {
      const graveyard = data[id];
      return {
        id,
        name: graveyard.name || "",
        description: graveyard.description || "",
        sourcePin: graveyard.sourcePin || {},
      };
    });
  }
  static async getByCustomID(customID) {
    const snapshot = await get(ref(db, "graveyards"));
    if (!snapshot.exists()) return null;

    const data = snapshot.val();

    // Find the graveyard with the matching customID
    const graveyard = Object.values(data).find(
      (graveyard) => graveyard.customID === customID
    );

    return graveyard || null; // Return the graveyard or null if not found
  }
  static async getGravesByID(graveyardID) {
    const snapshot = await get(ref(db, `graveyards/${graveyardID}`));

    if (!snapshot.exists()) return null;

    return snapshot.val();
  }
  static async getImageUrlByID(graveyardID) {
    const snapshot = await get(ref(db, `graveyards/${graveyardID}/imageUrl`));

    if (!snapshot.exists()) return null;

    return snapshot.val(); // Returns the image URL
  }
}

module.exports = Graveyard;
