
import "../styles/AdminHome.css";
import React from "react";
import { useNavigate } from "react-router-dom";

const AdminHome = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="admin-home">
      <h2>Admin Dashboard</h2>
      <button onClick={() => navigate("/admin-skills")}>Manage Skills</button>
      <button onClick={() => navigate("/admin/volunteer-page")}>Volunteer Management</button>
      <button onClick={() => navigate("/admin/shelter-page")}>Shelter Management</button>
      <button onClick={() => navigate("/admin/task-page")}>Task Management</button>
      <button onClick={() => navigate("/admin-incident-page")}>Incident Management</button>
      <button onClick={() => navigate("/admin/resource-page")}>Resource Management</button>
      <button onClick={() => navigate("/admin/donation-page")}>Campaign & Donation Management</button>
      <button onClick={() => navigate("/Admin/view-contribute")}>View Public Contributions</button>
      <button onClick={() => navigate("/admin/view-complaint")}>View Complaints</button>
      <button onClick={() => navigate("/admin/account")}>Account Settings</button>

    
      <button onClick={handleLogout} className="logout-btn">Logout</button>
    </div>
  );
};

export default AdminHome;

