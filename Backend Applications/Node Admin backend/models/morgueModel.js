const { getDatabase, ref, set, push } = require("firebase/database"); // Import necessary functions from Firebase
const bcrypt = require("bcrypt"); // Import bcrypt for password hashing
const { db } = require("../FirebaseConfig"); // Ensure db is initialized in FirebaseConfig.js

exports.createMorgue = async (morgueData) => {
  try {
    const {
      name,
      description,
      totalCabins,
      totalCabinsinRows,
      source,
      managerName,
      password,
      customID,
    } = morgueData;

    const dbRef = getDatabase(); // Initialize the database
    const morgueRef = push(ref(dbRef, "morgues")); // Push new morgue
    const morgueId = morgueRef.key;

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create morgue entry
    const morgue = {
      morgueId,
      name,
      description,
      totalCabins,
      totalCabinsinRows,
      source,
      managerName,
      password: hashedPassword, // Save the hashed password
      customID,
      bookedCabins: 0, // Initialize booked cabins as 0
    };

    // Save to Firebase
    await set(morgueRef, morgue);

    return morgue;
  } catch (error) {
    throw new Error(`Failed to create morgue: ${error.message}`);
  }
};
