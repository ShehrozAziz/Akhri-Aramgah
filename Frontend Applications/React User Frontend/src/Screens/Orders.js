import React from "react";
import SideBar from "../Components/SideBar";
import { useState } from "react";

import OrdersContainer from "../Components/OrdersContainer";
import Footer from "../Components/Footer";
export default function Orders() {
  const name = useState("Hammad Malik");
  return (
    <>
      <div className="sidebar-wrapper">
        <SideBar />
        <div className="dashboard-container">
          <OrdersContainer></OrdersContainer>
        </div>
      </div>
      <Footer></Footer>
    </>
  );
}
