import "../styles/AdminHome.css";
import React from "react";
import { useNavigate } from "react-router-dom";

const AdminDonationPage = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-home">
      <h2>Campaign & Donation Management</h2>
      <button onClick={() => navigate("/admin/campaign-page")}>Add Campaign</button>
      <button onClick={() => navigate("/admin/donation-view")}>View Donations</button>
      <button onClick={() => navigate("/admin/donation-alloc")}>Allocate Donations</button>
      <button onClick={() => navigate("/admin/donation-report")}>View Donation Usage Report</button>


<button onClick={() => navigate("/admin-home")}>Back</button>
</div>
  );
};

export default AdminDonationPage;
