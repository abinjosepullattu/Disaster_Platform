import "../styles/AdminHome.css";
import React from "react";
import { useNavigate } from "react-router-dom";

const AdminVolunteerPage = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-home">
      <h2>Incident Details</h2>
      <button onClick={() => navigate("/admin-approval")}>Volunteer Approvals</button>
      <button onClick={() => navigate("/volunteer-accepted")}>Accepted Volunteers</button>
      <button onClick={() => navigate("/volunteer-rejected")}>Rejected Volunteers</button>
<button onClick={() => navigate("/admin-home")}>Back</button>
</div>
  );
};

export default AdminVolunteerPage;
