import React from "react";
import "../Styling/settings.css";

import SideBar from "../Components/SideBar";
import Footer from "../Components/Footer";
import SettingsContainer from "../Components/SettingsContainer";
export default function Settings() {
  return (
    <>
      <div className="sidebar-wrapper">
        <SideBar />
        <div className="dashboard-container">
          <SettingsContainer></SettingsContainer>
        </div>
      </div>
      <Footer></Footer>
    </>
  );
}
