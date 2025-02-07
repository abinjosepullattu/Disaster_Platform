import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminHome.css";

const AdminHome = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-home">
      <h2>Admin Dashboard</h2>
      <button onClick={() => navigate("/admin-skills")}>Manage Skills</button>
      <button onClick={() => navigate("/admin-approval")}>Volunteer Approvals</button>
      <button onClick={() => navigate("/volunteer-accepted")}>Accepted Volunteers</button>
      <button onClick={() => navigate("/volunteer-rejected")}>Rejected Volunteers</button>
    </div>
  );
};

export default AdminHome;
