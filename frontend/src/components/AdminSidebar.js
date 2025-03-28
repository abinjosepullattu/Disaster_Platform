import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const [hoveredButton, setHoveredButton] = useState(null);

  // Inline CSS for the sidebar
  const styles = {
    sidebar: {
      width: "250px",
      background: "linear-gradient(to bottom, #2c3e50, #34495e)",
      color: "white",
      padding: "20px",
      boxShadow: "2px 0 15px rgba(0,0,0,0.2)",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      overflowX: "hidden", // Add this line to prevent horizontal scrolling

    },
    sidebarContent: {
      flex: 1,
      overflowY: "hidden", // Changed from "auto" to "hidden"
      overflowX: "hidden", // Add this to prevent horizontal scrolling in content

    },
    sidebarTitle: {
      textAlign: "center",
      borderBottom: "2px solid #3498db",
      paddingBottom: "15px",
      marginBottom: "20px",
      color: "#ecf0f1",
      fontSize: "1.5rem",
    },
    sidebarButton: {
      width: "100%",
      padding: "12px",
      margin: "8px 0",
      background: "rgba(255,255,255,0.1)",
      color: "white",
      border: "none",
      borderRadius: "5px",
      transition: "all 0.3s ease",
      cursor: "pointer",
    },
    sidebarButtonHover: {
      background: "#3498db",
      transform: "translateX(5px)",
    },
    logoutButton: {
      width: "100%",
      padding: "12px",
      marginTop: "20px",
      background: "#e74c3c",
      color: "white",
      border: "none",
      borderRadius: "6px",
      transition: "background 0.3s ease",
      position: "relative",
      bottom: 0,
    },
    dashboardButton: {
      width: "100%",
      padding: "12px",
      marginTop: "10px",
      background: "#2ecc71",
      color: "white",
      border: "none",
      borderRadius: "6px",
      transition: "background 0.3s ease",
    }
  };

  const sidebarItems = [
    { label: "Account Settings", path: "/admin/account" },
    { label: "View Complaints", path: "/admin/view-complaint" },
    { label: "Manage Skills", path: "/admin-skills" },
    { label: "Volunteer Management", path: "/admin/volunteer-page" },
    { label: "Shelter Management", path: "/admin/shelter-page" },
    { label: "Task Management", path: "/admin/task-page" },
    { label: "Incident Management", path: "/admin-incident-page" },
    { label: "Resource Management", path: "/admin/resource-page" },
    { label: "Campaign & Donation", path: "/admin/donation-page" },
    { label: "View Contributions", path: "/Admin/view-contribute" },
    { label: "Back", path: -1 },
  ];

  return (
    <aside style={styles.sidebar}>
      <div style={styles.sidebarContent}>
        <h2 style={styles.sidebarTitle}>Admin Panel</h2>
        {sidebarItems.map((item, index) => (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            onMouseEnter={() => setHoveredButton(index)}
            onMouseLeave={() => setHoveredButton(null)}
            style={{
              ...styles.sidebarButton,
              ...(hoveredButton === index ? styles.sidebarButtonHover : {}),
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
     
      <button 
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          navigate("/login");
        }} 
        style={styles.logoutButton}
      >
        Logout
      </button>
      <button 
        onClick={() => navigate("/admin-home")} 
        style={styles.dashboardButton}
      >
        Dashboard
      </button>
    </aside>
  );
};

export default AdminSidebar;