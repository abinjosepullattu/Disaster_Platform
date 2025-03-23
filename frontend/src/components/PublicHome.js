import "../styles/PublicHome.css";
import React from "react";
import { useNavigate } from "react-router-dom";

const PublicHome = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="public-home">
      <h2>Welcome to the Disaster Relief Platform</h2>
      <p>Stay updated and contribute to relief efforts.</p>
      <button onClick={() => navigate("/report-incident")}>Report an Incident</button>
      <button onClick={() => navigate("/my-incidents")}>📋 View My Incident Reports</button>
      <button onClick={() => navigate("/public/view-campaign")}> View Donation Campaigns</button>
      <button onClick={() => navigate("/public/my-donation")}> My Donations</button>
      <button onClick={() => navigate("/public/contribute-res")}> Add Contributed Resources</button>
      <button onClick={() => navigate("/public/view-contribute")}> My Contributions</button>
      <button onClick={() => navigate("/user/complaint")}>Submit Complaint</button>
      <button onClick={() => navigate("/user/view-complaint")}>View Complaint Status</button>

      

      

      <h3>Account Settings</h3>
      <button onClick={() => navigate("/profile")}>My Profile</button>
      <button onClick={() => navigate("/edit-profile")}>Edit Profile</button>
      <button onClick={() => navigate("/change-password")}>Change Password</button>
      <button onClick={handleLogout} className="logout-btn">Logout</button>
    </div>
  );
};

export default PublicHome;

