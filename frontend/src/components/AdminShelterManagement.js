import "../styles/AdminHome.css";
import React from "react";
import { useNavigate } from "react-router-dom";

const AdminShelterPage = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-home">
      <h2>Shelter Management</h2>
      <button onClick={() => navigate("/admin/add-shelter")}>Add Shelter</button>
      <button onClick={() => navigate("/admin/view-shelter-admin")}>View Shelter</button>
      <button onClick={() => navigate("/admin/resource-allocation")}>Allocate Resources Shelter</button>

<button onClick={() => navigate("/admin-home")}>Back</button>
</div>
  );
};

export default AdminShelterPage;
