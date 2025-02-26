import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/MyIncidentReports.css";
import { useUser } from "../context/UserContext";

const MyIncidentReports = () => {
  const [incidents, setIncidents] = useState([]);
  const [error, setError] = useState(null);
  const {user} = useUser();

  useEffect(() => {
    fetchUserIncidents();
  }, []);

  const fetchUserIncidents = async () => {
    try {
      console.log(user.id);
      const response = await axios.get(`http://localhost:5000/api/incidents/my-reports/${user.id}`);
      setIncidents(response.data);
    } catch (error) {
      setError("⚠️ Error loading incidents. Please try again.");
    }
  };

  return (
    <div className="incident-status-container">
      <h2>📋 My Incident Reports</h2>
      {error && <p className="error-message">{error}</p>}
      {incidents.length === 0 ? (
        <p>No incident reports found.</p>
      ) : (
        <table className="incident-table">
          <thead>
            <tr>
              <th>📍 Location</th>
              <th>🔥 Type</th>
              <th>⚠️ Severity</th>
              <th>📝 Description</th>
              <th>📅 Date</th>
              <th>✅ Status</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident) => (
              <tr key={incident._id}>
                <td>{incident.location || "N/A"}</td>
                <td>{incident.type || "N/A"}</td>
                <td>{["Very Low", "Low", "Medium", "High", "Very High"][incident.severity - 1]}</td>
                <td>{incident.description || "No description provided"}</td>
                <td>{new Date(incident.createdAt).toLocaleDateString()}</td>
                <td className={
                  incident.status === 1 ? "verified" :
                  incident.status === 0 ? "pending" :
                  incident.status === 2 ? "deleted" :
                  "completed"
                }>
                  {incident.status === 1 ? "Verified" :
                  incident.status === 0 ? "Pending" :
                  incident.status === 2 ? "Deleted" :
                  "Completed"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyIncidentReports;
