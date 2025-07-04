const { ref, get, update, updateOne } = require("firebase/database");
const { db } = require("../FirebaseConfig");

class Morgue {
  static async getAll() {
    const snapshot = await get(ref(db, "morgues"));
    if (!snapshot.exists()) return [];

    return Object.keys(snapshot.val()).map((id) => ({
      id,
      ...snapshot.val()[id],
    }));
  }

  static async getByCustomID(customID) {
    const snapshot = await get(ref(db, "morgues"));
    if (!snapshot.exists()) return null;

    return (
      Object.values(snapshot.val()).find(
        (morgue) => morgue.customID === customID
      ) || null
    );
  }

  static async getAvailableMorgues() {
    const snapshot = await get(ref(db, "morgues"));
    if (!snapshot.exists()) return [];

    return Object.keys(snapshot.val())
      .map((id) => ({
        id,
        ...snapshot.val()[id],
      }))
      .filter((morgue) => morgue.totalCabins - (morgue.bookedCabins || 0) > 0);
  }

  static async bookCabin(morgueId) {
    const morgueRef = ref(db, `morgues/${morgueId}`);
    const snapshot = await get(morgueRef);

    if (!snapshot.exists()) return false;

    const morgue = snapshot.val();
    const newBookedCabins = (morgue.bookedCabins || 0) + 1;

    if (newBookedCabins > morgue.totalCabins) return false;

    await update(morgueRef, { bookedCabins: newBookedCabins });
    return true;
  }
  static async releaseCabin(morgueId) {
    const morgueRef = ref(db, `morgues/${morgueId}`);
    const snapshot = await get(morgueRef);

    if (!snapshot.exists()) return false; // Morgue ID does not exist

    const morgue = snapshot.val();
    const currentBookedCabins = morgue.bookedCabins || 0;

    if (currentBookedCabins === 0) return false; // No cabins to release

    // Decrease bookedCabins by 1
    await update(morgueRef, { bookedCabins: currentBookedCabins - 1 });

    return true;
  }
}

module.exports = Morgue;
