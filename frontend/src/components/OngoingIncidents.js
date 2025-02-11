import React, { useState, useEffect } from "react";
import axios from "axios";
import { GoogleMap, Marker, InfoWindow, LoadScriptNext } from "@react-google-maps/api"; 
import { useNavigate } from "react-router-dom";
import "../styles/OngoingIncidents.css";

const GOOGLE_MAPS_API_KEY = "AIzaSyCvDmFuDpXO7aDEpSqQ6LScHge8wy8Jx1o"; // Load from .env

const OngoingIncidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [mapVisible, setMapVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/incidents/ongoing", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIncidents(response.data);
    } catch (error) {
      console.error("Error fetching incidents:", error);
    }
  };

  const completeIncident = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/incidents/complete/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("✅ Incident marked as completed! Volunteers have been notified.");
      fetchIncidents();
    } catch (error) {
      console.error("Error marking incident as completed:", error);
    }
  };

  return (
    <div className="incident-container">
      <h2>🚨 Ongoing Incidents</h2>
      <button onClick={() => navigate("/admin-incident-page")}>🏠 Back to Dashboard</button>

      <table className="incident-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Location</th>
            <th>Severity</th>
            <th>Description</th>
            <th>Map</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((incident) => (
            <tr key={incident._id}>
              <td>{incident.type}</td>
              <td>{incident.location}</td>
              <td>{["Very Low", "Low", "Medium", "High", "Very High"][incident.severity - 1]}</td>
              <td>{incident.description}</td>
              <td>
                <button className="map-btn" onClick={() => { setSelectedIncident(incident); setMapVisible(true); }}>🗺️ View</button>
              </td>
              <td>
                <button className="complete-btn" onClick={() => completeIncident(incident._id)}>✅ Mark Completed</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ Map Popup with Back Button */}
      {mapVisible && selectedIncident && (
        <div className="map-overlay">
          <LoadScriptNext googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
            <GoogleMap 
              zoom={10} 
              center={{ lat: selectedIncident.latitude, lng: selectedIncident.longitude }} 
              mapContainerStyle={{ width: "100%", height: "400px" }}
            >
              <Marker position={{ lat: selectedIncident.latitude, lng: selectedIncident.longitude }} />
              <InfoWindow position={{ lat: selectedIncident.latitude, lng: selectedIncident.longitude }} onCloseClick={() => setMapVisible(false)}>
                <div>
                  <h3>{selectedIncident.type}</h3>
                  <p>{selectedIncident.description}</p>
                </div>
              </InfoWindow>
            </GoogleMap>
          </LoadScriptNext>

          {/* ✅ Back Button Below Map */}
          <button className="back-btn" onClick={() => setMapVisible(false)}>🔙 Back</button>
        </div>
      )}
    </div>
  );
};

export default OngoingIncidents;
