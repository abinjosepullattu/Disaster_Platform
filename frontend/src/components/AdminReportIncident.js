import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { GoogleMap, LoadScript, Marker, Autocomplete } from "@react-google-maps/api";
import "../styles/AdminIncidentPage.css";
import { useUser } from "../context/UserContext";

const AdminReportIncident = () => {
  const { user } = useUser();
  const [form, setForm] = useState({ location: "", type: "", severity: 1, description: "" });
  const [marker, setMarker] = useState(null);
  const navigate = useNavigate();
  const autocompleteRef = useRef(null);

  const GOOGLE_MAPS_API_KEY ="AIzaSyCvDmFuDpXO7aDEpSqQ6LScHge8wy8Jx1o"; // ✅ Load API key from .env

  const handleMapClick = (e) => {
    setMarker({ lat: e.latLng.lat(), lng: e.latLng.lng() });
  };

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current.getPlace();
    if (place && place.geometry) {
      setMarker({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
      setForm((prev) => ({ ...prev, location: place.formatted_address }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!marker) return alert("⚠️ Please select a location on the map!");
  
    try {
      // const token = localStorage.getItem("token");
      // if (!token) {
      //   alert("⚠️ Admin login required!");
      //   return;
      // }
  
      // ✅ Step 1: Report the Incident
      const response = await axios.post(
        "http://localhost:5000/api/incidents/add",
        {
          location: form.location,
          type: form.type,
          severity: form.severity,
          description: form.description,
          latitude: marker.lat,
          longitude: marker.lng,
          status: 1, // ✅ Automatically mark as Verified
          userId:user.id
        },
        
      );
  
      alert("✅ Incident added successfully and marked as Verified!");
  
      // ✅ Step 2: Send Email to Volunteers
      // await axios.post(
      //   "http://localhost:5000/api/incidents/notify-volunteers",
      //   { incidentId: response.data.incident._id }, // ✅ Send incident ID
      //   {
      //     headers: { Authorization: `Bearer ${token}` },
      //   }
      // );
  
      alert("📧 Email notifications sent to all volunteers.");
      navigate("/admin-home");
    } catch (error) {
      console.error("❌ Error submitting incident:", error.response?.data || error.message);
      alert("❌ Error adding incident or sending email. Please try again.");
    }
  };
  

  return (
    <div className="admin-incident-container">
      <h2>📍 Add Verified Incident</h2>
      <p className="attention-message">⚠️ Ensure all details are accurate before submission.</p>

      <form onSubmit={handleSubmit} className="incident-form">
        <label>📍 Search Location:</label>
        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
          <Autocomplete onLoad={(ref) => (autocompleteRef.current = ref)} onPlaceChanged={handlePlaceSelect}>
            <input type="text" placeholder="Search for a location..." className="search-box" />
          </Autocomplete>

          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "400px" }}
            zoom={10}
            center={marker || { lat: 12.9716, lng: 77.5946 }}
            onClick={handleMapClick}
          >
            {marker && <Marker position={marker} />}
          </GoogleMap>
        </LoadScript>

        <label>📍 Location Name:</label>
        <input type="text" value={form.location} placeholder="Enter location name" onChange={(e) => setForm({ ...form, location: e.target.value })} required />

        <label>🔥 Incident Type:</label>
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required>
          <option value="" disabled>Select Incident Type</option>
          <option value="Fire">Fire</option>
          <option value="Flood">Flood</option>
          <option value="Earthquake">Earthquake</option>
          <option value="Landslide">Landslide</option>
          <option value="Accident">Accident</option>
          <option value="Other">Other</option>
        </select>

        <label>⚠️ Severity Level:</label>
        <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} required>
          <option value="1">Very Low</option>
          <option value="2">Low</option>
          <option value="3">Medium</option>
          <option value="4">High</option>
          <option value="5">Very High</option>
        </select>

        <label>📝 Description:</label>
        <textarea placeholder="Describe the incident..." onChange={(e) => setForm({ ...form, description: e.target.value })} required />

        <button type="submit">🚀 Add Verified Incident</button>
      </form>
    </div>
  );
};

export default AdminReportIncident;
