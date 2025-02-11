import "../styles/AdminHome.css";
import React from "react";
import { useNavigate } from "react-router-dom";

const AdminIncidentPage = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-home">
      <h2>Incident Details</h2>
<button onClick={() => navigate("/admin-incident-page/admin-report-incident")}>Add Verified Incident</button>
<button onClick={() => navigate("/admin-incident-page/verify-public")}>Verify Incident Reports</button>
<button onClick={() => navigate("/admin-incident-page/ongoing-incident")}>Ongoing Incidents</button>
<button onClick={() => navigate("/admin-incident-page/completed-incident")}>Completed Incidents</button>
<button onClick={() => navigate("/admin-home")}>Back</button>
</div>
  );
};

export default AdminIncidentPage;
