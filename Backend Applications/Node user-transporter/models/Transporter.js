const { ref, set, get, push, update } = require("firebase/database");
const { db } = require("../FirebaseConfig");
const bcrypt = require("bcrypt");

class Transporter {
  constructor(name, phone, password, complaintCount = 0, id = null) {
    // If no ID is provided, auto-generate it using push
    this.id = id || push(ref(db, "transporters")).key; // Generates unique ID using push()
    this.name = name;
    this.phone = phone;
    this.password = password; // Plain password, to be hashed in controller
    this.complaintCount = complaintCount;
  }

  // Function to add a new transporter
  static async addTransporter(transporter) {
    try {
      const transporterRef = ref(db, `transporters/${transporter.id}`);
      await set(transporterRef, {
        name: transporter.name,
        phone: transporter.phone,
        password: transporter.password, // Store the hashed password
        complaintCount: transporter.complaintCount,
      });
      return { success: true, message: "Transporter added successfully" };
    } catch (error) {
      console.error("Error adding transporter:", error);
      return { success: false, message: "Error adding transporter" };
    }
  }

  // Function to find a transporter by phone number and compare passwords
  static async findByPhoneAndPassword(phone, password) {
    const transporterRef = ref(db, "transporters");
    const snapshot = await get(transporterRef);

    if (snapshot.exists()) {
      const transporters = snapshot.val();

      // Use Object.entries to access both the ID (key) and the transporter data (value)
      const transporterEntry = Object.entries(transporters).find(
        ([, transporterData]) => transporterData.phone === phone
      );

      if (transporterEntry) {
        const [transporterID, transporterData] = transporterEntry; // ID is key, transporterData is the value
        const isMatch = await bcrypt.compare(
          password,
          transporterData.password
        );

        if (isMatch) {
          return { id: transporterID, ...transporterData }; // Include the ID in the returned transporter object
        }
      }
    }
    return null; // Return null if no transporter is found or passwords do not match
  }
  static async updatePassword(transporterID, oldPassword, newPassword) {
    try {
      const transporterRef = ref(db, `transporters/${transporterID}`);
      const snapshot = await get(transporterRef);
      if (snapshot.exists()) {
        const transporterData = snapshot.val();
        const isMatch = await bcrypt.compare(
          oldPassword,
          transporterData.password
        );
        if (isMatch) {
          // Hash the new password before storing it
          const hashedNewPassword = await bcrypt.hash(newPassword, 10);

          // Update the password in the database
          await update(transporterRef, {
            password: hashedNewPassword,
          });

          return { success: true, message: "Password updated successfully" };
        } else {
          return { success: false, message: "Old password does not match" };
        }
      } else {
        return { success: false, message: "Transporter not found" };
      }
    } catch (error) {
      console.error("Error updating password:", error);
      return { success: false, message: "Error updating password" };
    }
  }
  static async updatePhone(transporterID, oldPassword, newPhone) {
    try {
      const transporterRef = ref(db, `transporters/${transporterID}`);
      const snapshot = await get(transporterRef);
      if (snapshot.exists()) {
        const transporterData = snapshot.val();
        const isMatch = await bcrypt.compare(
          oldPassword,
          transporterData.password
        );
        if (isMatch) {
          // Update the password in the database
          await update(transporterRef, {
            phone: newPhone,
          });

          return { success: true, message: "Phone No updated successfully" };
        } else {
          return { success: false, message: "password does not match" };
        }
      } else {
        return { success: false, message: "Transporter not found" };
      }
    } catch (error) {
      console.error("Error updating password:", error);
      return { success: false, message: "Error updating password" };
    }
  }
}

module.exports = Transporter;
