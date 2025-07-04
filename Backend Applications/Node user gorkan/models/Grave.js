const { ref, set, get, update } = require("firebase/database");
const { db } = require("../FirebaseConfig");

class Grave {
  static async getGravesWithDimensions(graveyardId) {
    // Fetch graves
    const gravesSnapshot = await get(
      ref(db, `graveyards/${graveyardId}/graves`)
    );
    if (!gravesSnapshot.exists())
      return { graves: [], totalRows: 0, totalCols: 0 };

    const gravesData = gravesSnapshot.val();

    // Transform the data into an array of objects
    const graves = Object.keys(gravesData).map((key) => ({
      id: key,
      status: gravesData[key].status || "unknown", // Default to 'unknown' if status is not defined
    }));

    // Sort graves by row and column based on the id (rXcY format)
    graves.sort((a, b) => {
      const [rowA, colA] = a.id.match(/\d+/g).map(Number); // Extract row and col
      const [rowB, colB] = b.id.match(/\d+/g).map(Number);
      return rowA === rowB ? colA - colB : rowA - rowB; // Compare rows, then columns
    });

    // Fetch total rows and columns from sourcePin
    const graveyardSnapshot = await get(ref(db, `graveyards/${graveyardId}`));
    const graveyardData = graveyardSnapshot.exists()
      ? graveyardSnapshot.val()
      : {};

    const totalRows = graveyardData.totalRows || 0;
    const totalCols = graveyardData.totalCols || 0;
    console.log(totalRows);
    return { graves, totalRows, totalCols };
  }
  static async addDevice(graveyardId, graveId) {
    // Reference to the specific grave
    const graveRef = ref(db, `graveyards/${graveyardId}/graves/${graveId}`);

    // Update the device and reading fields
    await update(graveRef, {
      device: "yes",
      reading: 2,
    });

    return { graveyardId, graveId, device: "yes", reading: 2 };
  }
  static async getBookedGravesByGraveyard(graveyardId) {
    const snapshot = await get(ref(db, `graveyards/${graveyardId}/graves`));
    if (!snapshot.exists()) return [];

    const data = snapshot.val();

    // Filter graves where status is "booked"
    const bookedGraves = Object.keys(data)
      .filter((key) => data[key].status === "booked")
      .map((key) => ({
        GraveID: key,
        GraveyardID: graveyardId,
      }));

    return bookedGraves;
  }
  static async updateStatus(graveyardId, graveId, status) {
    const graveRef = ref(db, `graveyards/${graveyardId}/graves/${graveId}`);
    await update(graveRef, { status });
  }
}

module.exports = Grave;
