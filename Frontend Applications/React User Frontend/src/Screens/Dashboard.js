import React from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import SideBar from "../Components/SideBar";
import DashboardContainer from "../Components/DashboardContainer";
import Footer from "../Components/Footer";

export default function Dashboard() {
  const navigate = useNavigate(); // Initialize useNavigate
  // const token = localStorage.getItem("token");
  // const jwt_token = jwtDecode(token);
  // alert(jwt_token.id);

  return (
    <>
      <div className="sidebar-wrapper">
        <SideBar />
        <div className="dashboard-container">
          <DashboardContainer />
        </div>
      </div>
      <Footer></Footer>
    </>
  );
}
