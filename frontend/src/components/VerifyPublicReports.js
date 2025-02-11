import React, { useState, useEffect } from "react";
import axios from "axios";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";
import "../styles/AdminIncidentPage.css";

const VerifyPublicReports = () => {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [mapVisible, setMapVisible] = useState(false);
  const navigate = useNavigate();

  const GOOGLE_MAPS_API_KEY ="AIzaSyCvDmFuDpXO7aDEpSqQ6LScHge8wy8Jx1o"; // ✅ Use API Key from .env

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/incidents/public-reports", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIncidents(response.data);
    } catch (error) {
      console.error("Error fetching incidents:", error);
    }
  };

  const severityLabels = ["Very Low", "Low", "Medium", "High", "Very High"];
  const statusLabels = ["Pending", "Verified", "Deleted", "Completed"];


 // ✅ Verify Incident & Send Email Notification
 const verifyIncident = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`http://localhost:5000/api/incidents/verify/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(response.data.message); // ✅ Displays message from backend
      fetchIncidents();
    } catch (error) {
      console.error("❌ Error verifying incident:", error.response?.data || error.message);
      alert(`❌ Failed to verify incident: ${error.response?.data?.error || "Unknown error"}`);
    }
  };
  // ✅ Delete Incident (No Email Notification)
  const deleteIncident = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/incidents/delete/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("🗑️ Incident removed successfully.");
      fetchIncidents();
    } catch (error) {
      console.error("Error deleting incident:", error);
    }
  };

  return (
    <div className="admin-incident-container">
      <h2>📢 Public Reported Incidents</h2>
      <button onClick={() => navigate("/admin-incident-page")}>🏠 Back to Dashboard</button>

      <table className="incident-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Location</th>
            <th>Severity</th>
            <th>Description</th>
            <th>Status</th>
            <th>Map</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((incident) => (
            <tr key={incident._id}>
              <td>{incident.type}</td>
              <td>{incident.location}</td>
              <td className={`severity-${incident.severity}`}>{severityLabels[incident.severity - 1]}</td>
              <td>{incident.description}</td>
              <td>{statusLabels[incident.status]}</td>
              <td>
                <button className="map-btn" onClick={() => { setSelectedIncident(incident); setMapVisible(true); }}>🗺️ View on Map</button>
              </td>
              <td>
                {incident.status === 0 && (
                  <>
                    <button className="verify-btn" onClick={() => verifyIncident(incident._id)}>✅ Verify</button>
                    <button className="delete-btn" onClick={() => deleteIncident(incident._id)}>🗑️ Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Map Popup */}
      {mapVisible && selectedIncident && (
        <div className="map-overlay">
          <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
            <GoogleMap mapContainerStyle={{ width: "100%", height: "500px" }} zoom={10} center={{ lat: selectedIncident.latitude, lng: selectedIncident.longitude }}>
              <Marker position={{ lat: selectedIncident.latitude, lng: selectedIncident.longitude }} />
              <InfoWindow position={{ lat: selectedIncident.latitude, lng: selectedIncident.longitude }} onCloseClick={() => setMapVisible(false)}>
                <div>
                  <h3>{selectedIncident.type}</h3>
                  <p>{selectedIncident.description}</p>
                  <p><strong>Severity:</strong> {severityLabels[selectedIncident.severity - 1]}</p>
                </div>
              </InfoWindow>
            </GoogleMap>
          </LoadScript>
          <button className="close-map-btn" onClick={() => setMapVisible(false)}>❌ Close Map</button>
        </div>
      )}
    </div>
  );
};

export default VerifyPublicReports;
