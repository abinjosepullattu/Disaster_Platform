import "../styles/AdminHome.css";
import React from "react";
import { useNavigate } from "react-router-dom";

const AdminResourcePage = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-home">
      <h2>Resource Management</h2>
      <button onClick={() => navigate("/admin/resource-type")}>Manage Resource Type</button>
      <button onClick={() => navigate("/admin/view-allocated")}>View Allocated Resources</button>
      <button onClick={() => navigate("/admin/res-usage-details")}>View Resource Usage Report</button>


<button onClick={() => navigate("/admin-home")}>Back</button>
</div>
  );
};

export default AdminResourcePage;
