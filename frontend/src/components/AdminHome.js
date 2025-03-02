
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
      <button onClick={() => navigate("/admin-approval")}>Volunteer Approvals</button>
      <button onClick={() => navigate("/volunteer-accepted")}>Accepted Volunteers</button>
      <button onClick={() => navigate("/volunteer-rejected")}>Rejected Volunteers</button>
      <button onClick={() => navigate("/admin-incident-page")}>Incident Details</button>
      <button onClick={() => navigate("/admin/add-shelter")}>Add Shelter</button>
      <button onClick={() => navigate("/admin/view-shelter-admin")}>View Shelter</button>
      <button onClick={() => navigate("/admin/resource-type")}>Manage Resource Type</button>
      <button onClick={() => navigate("/admin/task-management")}>Assign Task</button>
      <button onClick={() => navigate("/admin/tasks")}>View Assigned Tasks</button>
      <button onClick={() => navigate("/admin/task-type")}>Manage Task Type</button>

      
      <h3>Account Settings</h3>
      <button onClick={() => navigate("/profile")}>My Profile</button>
      <button onClick={() => navigate("/edit-profile")}>Edit Profile</button>
      <button onClick={() => navigate("/change-password")}>Change Password</button>
      <button onClick={handleLogout} className="logout-btn">Logout</button>
    </div>
  );
};

export default AdminHome;

