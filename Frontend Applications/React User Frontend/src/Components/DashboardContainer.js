import React from "react";
import "../Styling/Activeorders.css";
import "../Styling/DashboardServices.css";
import "../Styling/DashboardMainService.css";
import DashboardOrder from "./DashboardOrder";
import DashboardNotification from "./DashboardNotification";
import DashboardServices from "./DashboardServices";
import DashboardMainService from "./DashboardMainService";
import { useState } from "react";
import ProfileHeader from "./ProfileHeader";
export default function DashboardContainer() {
  // Sample orders for now (not using props)
  const name = useState("Hammad Malik");

  return (
    <>
      <ProfileHeader></ProfileHeader>

      <div className="container Dashboard-container">
        <div className="row Dashboard-row">
          <DashboardOrder></DashboardOrder>
          <DashboardNotification></DashboardNotification>
        </div>
      </div>
      <div className="container Dashboard-container">
        <div className="row Dashboard-row">
          <DashboardServices></DashboardServices>
        </div>
      </div>
      <div className="container Dashboard-container">
        <div className="row Dashboard-row">
          <DashboardMainService></DashboardMainService>
        </div>
      </div>
    </>
  );
}
