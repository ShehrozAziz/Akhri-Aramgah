const { ref, set, get, push, update } = require("firebase/database");
const { db } = require("../FirebaseConfig");
const bcrypt = require("bcrypt");

class Caterer {
  constructor(name, phone, password, complaintCount = 0, id = null) {
    // If no ID is provided, auto-generate it using push
    this.id = id || push(ref(db, "caterers")).key; // Generates unique ID using push()
    this.name = name;
    this.phone = phone;
    this.password = password; // Plain password, to be hashed in controller
    this.complaintCount = complaintCount;
  }

  // Function to add a new caterer
  static async addCaterer(caterer) {
    try {
      const catererRef = ref(db, `caterers/${caterer.id}`);
      await set(catererRef, {
        name: caterer.name,
        phone: caterer.phone,
        password: caterer.password, // Store the hashed password
        complaintCount: caterer.complaintCount,
      });
      return { success: true, message: "Caterer added successfully" };
    } catch (error) {
      console.error("Error adding caterer:", error);
      return { success: false, message: "Error adding caterer" };
    }
  }

  // Function to find a caterer by phone number and compare passwords
  static async findByPhoneAndPassword(phone, password) {
    const catererRef = ref(db, "caterers");
    const snapshot = await get(catererRef);

    if (snapshot.exists()) {
      const caterers = snapshot.val();

      // Use Object.entries to access both the ID (key) and the caterer data (value)
      const catererEntry = Object.entries(caterers).find(
        ([, catererData]) => catererData.phone === phone
      );

      if (catererEntry) {
        const [catererID, catererData] = catererEntry; // ID is key, catererData is the value
        const isMatch = await bcrypt.compare(password, catererData.password);

        if (isMatch) {
          return { id: catererID, ...catererData }; // Include the ID in the returned caterer object
        }
      }
    }
    return null; // Return null if no caterer is found or passwords do not match
  }

  static async updatePassword(catererID, oldPassword, newPassword) {
    try {
      const catererRef = ref(db, `caterers/${catererID}`);
      const snapshot = await get(catererRef);
      if (snapshot.exists()) {
        const catererData = snapshot.val();
        const isMatch = await bcrypt.compare(oldPassword, catererData.password);
        if (isMatch) {
          // Hash the new password before storing it
          const hashedNewPassword = await bcrypt.hash(newPassword, 10);

          // Update the password in the database
          await update(catererRef, {
            password: hashedNewPassword,
          });

          return { success: true, message: "Password updated successfully" };
        } else {
          return { success: false, message: "Old password does not match" };
        }
      } else {
        return { success: false, message: "Caterer not found" };
      }
    } catch (error) {
      console.error("Error updating password:", error);
      return { success: false, message: "Error updating password" };
    }
  }

  static async updatePhone(catererID, oldPassword, newPhone) {
    try {
      const catererRef = ref(db, `caterers/${catererID}`);
      const snapshot = await get(catererRef);
      if (snapshot.exists()) {
        const catererData = snapshot.val();
        const isMatch = await bcrypt.compare(oldPassword, catererData.password);
        if (isMatch) {
          // Update the phone number in the database
          await update(catererRef, {
            phone: newPhone,
          });

          return { success: true, message: "Phone No updated successfully" };
        } else {
          return { success: false, message: "Password does not match" };
        }
      } else {
        return { success: false, message: "Caterer not found" };
      }
    } catch (error) {
      console.error("Error updating phone number:", error);
      return { success: false, message: "Error updating phone number" };
    }
  }
}

module.exports = Caterer;
