const { getDatabase, ref, set, push } = require("firebase/database"); // Import necessary functions from Firebase
const bcrypt = require("bcrypt"); // Import bcrypt for password hashing
const { db } = require("../FirebaseConfig"); // Ensure db is initialized in FirebaseConfig.js

exports.createGraveyard = async (graveyardData) => {
  console.log("here man ");
  try {
    const {
      name,
      description,
      totalGraves,
      totalRows,
      totalCols,
      sourcePin,
      gorkanName,
      password,
      customID,
      imageUrl, // Added imageUrl field
    } = graveyardData;
    console.log("hello");
    const dbRef = getDatabase(); // Initialize the database
    const graveyardRef = push(ref(dbRef, "graveyards")); // Push new graveyard
    const graveyardId = graveyardRef.key;

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create graves
    const graves = {};
    for (let row = 1; row <= totalRows; row++) {
      for (let col = 1; col <= totalCols; col++) {
        const graveId = `r${row}c${col}`;
        graves[graveId] = {
          id: graveId,
          name: "",
          cnicNumber: "",
          date: new Date().toISOString(),
          causeOfDeath: "",
          rowPosition: row,
          colPosition: col,
          status: "available",
          device: "no",
          reading: "null",
        };
      }
    }

    // Create graveyard entry
    const graveyard = {
      graveyardId,
      name,
      description,
      totalGraves,
      totalRows,
      totalCols,
      sourcePin,
      gorkanName,
      password: hashedPassword, // Save the hashed password
      customID,
      imageUrl, // Store the image URL from Cloudinary
      graves,
    };

    // Save to Firebase
    await set(graveyardRef, graveyard);

    return graveyard;
  } catch (error) {
    console.log(error.message);
    throw new Error(`Failed to create graveyard: ${error.message}`);
  }
};
