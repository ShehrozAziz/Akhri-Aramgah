const {
  getDatabase,
  ref,
  set,
  get,
  child,
  push,
} = require("firebase/database"); // Firebase functions
const { db } = require("../FirebaseConfig");

class Complaint {
  constructor(userID, type, convict, message, criticality) {
    this.complaintID = null; // Firebase push() will generate this
    this.userID = userID;
    this.type = type;
    this.convict = convict;
    this.message = message;
    this.date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    this.time = new Date().toISOString().split("T")[1].split(".")[0]; // HH:MM:SS
    this.criticality = criticality;
    this.status = "pending"; // Default value
    this.decision = "Not reviewed"; // Default value
  }

  static async createComplaint(complaintInstance) {
    try {
      const dbRef = ref(db, "complaints");
      const newComplaintRef = push(dbRef); // Auto-generate complaintID
      complaintInstance.complaintID = newComplaintRef.key; // Assign the key

      await set(newComplaintRef, { ...complaintInstance });

      return { success: true, complaintID: complaintInstance.complaintID };
    } catch (error) {
      console.error("Error creating complaint:", error);
      return { success: false, error: error.message };
    }
  }
  static async getComplaintsByUser(userID) {
    try {
      const dbRef = ref(db, "complaints");
      const snapshot = await get(dbRef);

      if (!snapshot.exists()) {
        return null;
      }

      const allComplaints = snapshot.val();
      const userComplaints = Object.values(allComplaints).filter(
        (complaint) => complaint.userID === userID
      );

      return userComplaints.length ? userComplaints : null;
    } catch (error) {
      console.error("Error fetching complaints:", error);
      return null;
    }
  }
}

module.exports = Complaint;
