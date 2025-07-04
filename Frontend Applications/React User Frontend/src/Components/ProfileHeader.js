import React, { useState, useEffect } from "react";
import profile from "../Assets/profile.png";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export default function ProfileHeader() {
  const [name, setName] = useState("Loading...");

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setName("Guest");
          return;
        }

        const jwt_token = jwtDecode(token);
        const userID = jwt_token.id;

        const response = await axios.get(
          `http://localhost:5000/api/getUsername`,
          {
            params: { userID }, // Send userID as query param
          }
        );

        if (response.data.success) {
          setName(response.data.name);
        } else {
          setName("User Not Found");
        }
      } catch (error) {
        console.error("Error fetching username:", error);
        setName("Error Loading Name");
      }
    };

    fetchUsername();
  }, []);

  return (
    <div className="container Dashboard-container">
      <div className="user-profile">
        <img src={profile} alt="User Profile" />
        <span className="user-name">{name}</span>
      </div>
    </div>
  );
}
