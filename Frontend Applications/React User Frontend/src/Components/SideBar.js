import React, { useState } from "react";
import "../Styling/Sidebar.css";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
export default function SideBar() {
  // State to manage the sidebar toggle
  const [isExpanded, setIsExpanded] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  // Function to handle sidebar toggle
  const toggleSidebar = () => {
    setIsExpanded((prev) => !prev);
  };
  const handleLogout = () => {
    localStorage.removeItem("token");

    navigate("/login");
  };
  const handleCompalints = () => {
    navigate("/Complaints");
  };
  const handleOrders = () => {
    navigate("/Orders");
  };

  const handleHome = () => {
    navigate("/Dashboard");
  };
  const handleGraves = () => {
    navigate("/Graves");
  };
  const handleSettings = () => {
    navigate("/Settings");
  };

  useEffect(() => {
    // Check window width when the component mounts
    const handleResize = () => {
      if (window.innerWidth < 1000) {
        setIsExpanded(false);
      } else {
        setIsExpanded(true);
      }
    };

    // Run the function initially to set the correct state
    handleResize();

    // Add event listener for window resizing
    window.addEventListener("resize", handleResize);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <aside id="sidebar" className={isExpanded ? "sidebar-expand" : ""}>
      <div className="d-flex" style={{ marginTop: "10px" }}>
        <button
          className="sidebar-toggle-btn"
          type="button"
          onClick={toggleSidebar}
        >
          <i className="fa-solid fa-mobile-screen-button"></i>
        </button>
        <div className="sidebar-logo">
          <a href="#" className="sidebar-heading">
            Akhri
            <br />
            Aramgah
          </a>
        </div>
      </div>
      <ul className="sidebar-nav">
        <li className="sidebar-item">
          <a href="#" className="sidebar-link" onClick={handleHome}>
            <i className="lni lni-user"></i>
            <span>Home</span>
          </a>
        </li>
        <li className="sidebar-item">
          <a href="#" className="sidebar-link" onClick={handleGraves}>
            <i class="ri-smartphone-line"></i>
            <span>Graves</span>
          </a>
        </li>
        <li className="sidebar-item">
          <a href="#" className="sidebar-link" onClick={handleOrders}>
            <i className="lni lni-popup"></i>
            <span>Orders</span>
          </a>
        </li>

        <li className="sidebar-item">
          <a href="#" className="sidebar-link" onClick={handleCompalints}>
            <i class="ri-customer-service-2-line"></i>
            <span>Complaints</span>
          </a>
        </li>
        <li className="sidebar-item">
          <a href="#" className="sidebar-link" onClick={handleSettings}>
            <i className="lni lni-cog"></i>
            <span>Settings</span>
          </a>
        </li>
        <li className="sidebar-item">
          <a
            href=""
            className="sidebar-link sidebar-linkx"
            onClick={handleLogout}
          >
            <i className="lni lni-exit"></i>
            <span>Logout</span>
          </a>
        </li>
      </ul>
    </aside>
  );
}
