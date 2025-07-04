import React from "react";
import SideBar from "../Components/SideBar";
import "../Styling/Complaints.css";
import Footer from "../Components/Footer";
import DashboardComplaints from "../Components/DashboardComplaints";
export default function Complaints() {
  return (
    <>
      <div className="sidebar-wrapper">
        <SideBar />
        <div className="dashboard-container">
          <DashboardComplaints></DashboardComplaints>
        </div>
      </div>
      <Footer></Footer>
    </>
  );
}
