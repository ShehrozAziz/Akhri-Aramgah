const {
  getDatabase,
  ref,
  set,
  get,
  child,
  update,
  push,
} = require("firebase/database"); // Import necessary functions from Firebase
const { db } = require("../FirebaseConfig");

class User {
  constructor(name, email, password, phone, dob, userID = null) {
    this.userID = userID; // We will generate a unique ID using Firebase push() when creating a user
    this.name = name;
    this.email = email;
    this.password = password;
    this.phone = phone;
    this.dob = dob;
  }

  logData() {
    console.log("User Data:");
    console.log(`Name: ${this.name}`);
    console.log(`Email: ${this.email}`);
    console.log(`Password (hashed): ${this.password}`);
    console.log(`DOB: ${this.dob}`);
    console.log(`Phone: ${this.phone}`);
  }

  static async emailExists(email) {
    const dbRef = ref(db);
    try {
      const snapshot = await get(child(dbRef, "users"));
      if (snapshot.exists()) {
        const users = snapshot.val();
        // Iterate through users to check if email exists
        for (const userID in users) {
          if (users[userID].email === email) {
            return true; // Email already exists
          }
        }
      }
      return false; // Email does not exist
    } catch (error) {
      console.error("Error checking email existence:", error);
      throw error;
    }
  }

  // Function to create a user entry in the database with a unique ID
  static async createUser(user) {
    try {
      const userRef = push(ref(db, "users")); // This generates a unique ID and creates a reference
      await set(userRef, {
        name: user.name,
        email: user.email,
        password: user.password,
        phone: user.phone, // This should correctly map to the phone field
        dob: user.dob, // This should correctly map to the dob field
      });

      return { success: true, userID: userRef.key }; // Return success and the generated user ID
    } catch (error) {
      console.error("Error creating user:", error);
      return { success: false }; // Return failure if an error occurs
    }
  }

  static async getDetails(userID) {
    const dbRef = ref(db);
    try {
      const snapshot = await get(child(dbRef, `users/${userID}`));
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const userDetails = {
          name: userData.name,
          phone: userData.phone,
        };
        console.log(`User Details for ${userID}:`, userDetails);
        return userDetails;
      } else {
        console.log(`User with ID ${userID} not found.`);
        return null;
      }
    } catch (error) {
      console.error("Error retrieving user details:", error);
      throw error;
    }
  }

  static async getUserByEmail(email) {
    const dbRef = ref(db);
    try {
      const snapshot = await get(child(dbRef, "users"));
      if (snapshot.exists()) {
        const users = snapshot.val();
        // Iterate through users to find the one with the matching email
        for (const userID in users) {
          if (users[userID].email === email) {
            return new User(
              users[userID].name,
              users[userID].email,
              users[userID].password,
              users[userID].dob,
              users[userID].phone,
              userID // Return the userID
            ); // Return the User instance
          }
        }
      }
      return null; // User not found
    } catch (error) {
      console.error("Error fetching user by email:", error);
      throw error; // Propagate the error for handling in the signin function
    }
  }
  static async updatePhoneNumber(userID, phone) {
    try {
      const userRef = ref(db, `users/${userID}`);
      await update(userRef, { phone });

      return { success: true };
    } catch (error) {
      console.error("Error updating phone number:", error);
      return { success: false };
    }
  }
  static async updateName(userID, name) {
    try {
      const userRef = ref(db, `users/${userID}`);
      await update(userRef, { name });

      return { success: true };
    } catch (error) {
      console.error("Error updating name:", error);
      return { success: false };
    }
  }
  static async updateDateOfBirth(userID, dob) {
    try {
      const userRef = ref(db, `users/${userID}`);
      await update(userRef, { dob });

      return { success: true };
    } catch (error) {
      console.error("Error updating date of birth:", error);
      return { success: false };
    }
  }
  static async getUserById(userID) {
    try {
      const userRef = ref(db, `users/${userID}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        return null;
      }

      return snapshot.val(); // Returns user data (including password)
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  }

  static async updatePassword(userID, newPassword) {
    try {
      const userRef = ref(db, `users/${userID}`);
      await update(userRef, { password: newPassword });

      return { success: true };
    } catch (error) {
      console.error("Error updating password:", error);
      return { success: false };
    }
  }
  static async getUsername(userID) {
    try {
      const userRef = ref(db, `users/${userID}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        return null;
      }

      return snapshot.val();
    } catch (error) {
      console.error("Error retrieving username:", error);
      return null;
    }
  }
}

module.exports = User;
