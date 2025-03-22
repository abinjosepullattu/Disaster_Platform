import "../styles/VolunteerHome.css";
import React from "react";
import { useNavigate } from "react-router-dom";

const VolunteerHome = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="volunteer-home">
      <h2>Volunteer Dashboard</h2>
      <p>Welcome to the disaster relief platform.</p>
      <button onClick={() => navigate("/assigned-shelters")}>Assigned Shelters</button>
      <button onClick={() => navigate("/accepted-shelters")}>Accepted Shelters</button>
      <button onClick={() => navigate("/volunteer/tasks")}>Assigned Tasks</button>
      <button onClick={() => navigate("/volunteer/accepted-task")}>Accepted Tasks</button>
      <button onClick={() => navigate("/volunteer/completed-tasks")}>Completed Tasks</button>
      <button onClick={() => navigate("/volunteer/view-allocated")}>View Allocated Resources Shelter</button>
      <button onClick={() => navigate("/volunteer/verify-contribute")}>Verify Contributions</button>

      
      
      

      
      <h3>Account Settings</h3>
      <button onClick={() => navigate("/profile")}>My Profile</button>
      <button onClick={() => navigate("/edit-profile")}>Edit Profile</button>
      <button onClick={() => navigate("/change-password")}>Change Password</button>
      <button onClick={handleLogout} className="logout-btn">Logout</button>
    </div>
  );
};

export default VolunteerHome;

