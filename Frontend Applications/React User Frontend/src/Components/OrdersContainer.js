import React from "react";
import GraveOrder from "./GraveOrder";
import MorgueOrders from "./MorgueOrders";
import CatererOrders from "./CatererOrders";
import TransporterOrders from "./TransporterOrders";
import ProfileHeader from "./ProfileHeader";

export default function OrdersContainer() {
  return (
    <>
      <ProfileHeader></ProfileHeader>

      <div className="container Dashboard-container">
        <div className="row Dashboard-row">
          <CatererOrders></CatererOrders>
          <TransporterOrders></TransporterOrders>
        </div>
      </div>
    </>
  );
}
