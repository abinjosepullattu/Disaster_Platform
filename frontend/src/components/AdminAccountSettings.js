import "../styles/AdminHome.css";
import React from "react";
import { useNavigate } from "react-router-dom";

const AdminAccountPage = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-home">
      <h2>Account Settings</h2>
      <button onClick={() => navigate("/profile")}>My Profile</button>
      <button onClick={() => navigate("/edit-profile")}>Edit Profile</button>
      <button onClick={() => navigate("/change-password")}>Change Password</button>


<button onClick={() => navigate("/admin-home")}>Back</button>
</div>
  );
};

export default AdminAccountPage;
