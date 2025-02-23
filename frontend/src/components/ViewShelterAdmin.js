import React, { useEffect, useState } from "react";
import axios from "axios";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import "../styles/ViewShelterAdmin.css";

const GOOGLE_MAPS_API_KEY = "AIzaSyCvDmFuDpXO7aDEpSqQ6LScHge8wy8Jx1o"; // ✅ Add your API key

const ViewShelterAdmin = () => {
  const [shelters, setShelters] = useState([]);
  const [selectedShelter, setSelectedShelter] = useState(null);

  useEffect(() => {
    fetchShelters();
  }, []);

  const fetchShelters = () => {
    axios
      .get("http://localhost:5000/api/shelters/view")
      .then((response) => setShelters(response.data))
      .catch((error) => console.error("Error fetching shelters:", error));
  };

  const handleDelete = async (shelterId) => {
    if (!window.confirm("🛑 Are you sure you want to delete this shelter?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/shelters/delete/${shelterId}`);
      alert("✅ Shelter deleted successfully!");
      fetchShelters(); // Refresh list
    } catch (error) {
      console.error("❌ Error deleting shelter:", error);
      alert("❌ Could not delete shelter. Try again.");
    }
  };

  return (
    <div className="view-shelter-container">
      <h2>🏠 Shelter List</h2>
      <table>
        <thead>
          <tr>
            <th>📍 Location</th>
            <th>🛑 Emergency Contact</th>
            <th>🛏️ Capacity</th>
            <th>👥 Inmates</th>
            <th>🧑‍🤝‍🧑 Volunteer</th>
            <th>📍 Map</th>
            <th>🗑️ Delete</th>
          </tr>
        </thead>
        <tbody>
          {shelters.map((shelter) => (
            <tr key={shelter._id}>
              <td>{shelter.location}</td>
              <td>{shelter.contactDetails}</td>
              <td>{shelter.totalCapacity}</td>
              <td>{shelter.inmates}</td>
              <td>
              <div>

  {shelter.volunteer ? (
    shelter.volunteer.approvalStatus ? (
      <p style={{ color: "red", fontWeight: "bold" }}>{shelter.volunteer.approvalStatus}</p>
    ) : (
      <div>
        <p><strong>Name:</strong> {shelter.volunteer.name}</p>
        <p><strong>Email:</strong> {shelter.volunteer.email}</p>
        <p><strong>Phone:</strong> {shelter.volunteer.phone}</p>
      </div>
    )
  ) : (
    <p>No volunteer assigned</p>
  )}
</div>

              </td>
              <td>
                <button onClick={() => setSelectedShelter(shelter)}>📍 View Map</button>
              </td>
              <td>
                <button className="delete-btn" onClick={() => handleDelete(shelter._id)}>🗑️ Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedShelter && (
        <div className="map-overlay">
          <div className="map-container">
            <h3>📍 Shelter Location</h3>
            <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                mapContainerStyle={{ width: "400px", height: "400px" }}
                center={{ lat: selectedShelter.latitude, lng: selectedShelter.longitude }}
                zoom={12}
              >
                <Marker position={{ lat: selectedShelter.latitude, lng: selectedShelter.longitude }} />
              </GoogleMap>
            </LoadScript>
            <button className="back-button" onClick={() => setSelectedShelter(null)}>🔙 Back</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewShelterAdmin;
