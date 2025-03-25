import "../styles/AdminHome.css";
import React from "react";
import { useNavigate } from "react-router-dom";

const AdminTaskPage = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-home">
      <h2>Task Management</h2>
      <button onClick={() => navigate("/admin/task-type")}>Manage Task Type</button>
      <button onClick={() => navigate("/admin/task-management")}>Assign Task</button>
      <button onClick={() => navigate("/admin/tasks")}>View Assigned Tasks</button>
      <button onClick={() => navigate("/admin/completed-tasks")}>Verify Completed Tasks</button>
      <button onClick={() => navigate("/admin/progress-reports")}>Task Progress Reports</button>


<button onClick={() => navigate("/admin-home")}>Back</button>
</div>
  );
};

export default AdminTaskPage;
