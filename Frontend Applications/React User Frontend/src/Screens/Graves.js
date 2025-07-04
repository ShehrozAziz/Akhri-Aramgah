import React from "react";
import "../Styling/graves.css";

import SideBar from "../Components/SideBar";
import Footer from "../Components/Footer";
import GraveContainer from "../Components/GraveContainer";
export default function Graves() {
  return (
    <>
      <div className="sidebar-wrapper">
        <SideBar />
        <div className="dashboard-container">
          <GraveContainer></GraveContainer>
        </div>
      </div>
    </>
  );
}
