import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import AdminSidebar from "./AdminSidebar";
import "../styles/ViewShelterAdmin.css";

const GOOGLE_MAPS_API_KEY = "AIzaSyCvDmFuDpXO7aDEpSqQ6LScHge8wy8Jx1o";

// Separate LoadScript component to prevent unnecessary re-renders
const MapComponent = ({ shelter, onClose }) => {
  if (!shelter) return null;
  
  return (
    <div className="a9b0123456789">
      <div className="b1c2345678901">
        <h3>📍 Shelter Location</h3>
        <div style={{ width: "100%", maxWidth: "600px", height: "400px" }}>
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={{ lat: shelter.latitude, lng: shelter.longitude }}
            zoom={12}
          >
            <Marker position={{ lat: shelter.latitude, lng: shelter.longitude }} />
          </GoogleMap>
        </div>
        <button 
          className="b2c3456789012" 
          onClick={onClose}
        >
          🔙 Back
        </button>
      </div>
    </div>
  );
};

const ViewShelterAdmin = () => {
  const [shelters, setShelters] = useState([]);
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Fetch shelters on component mount
  useEffect(() => {
    fetchShelters();
  }, []);

  const fetchShelters = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/shelters/view");
      setShelters(response.data);
    } catch (error) {
      console.error("Error fetching shelters:", error);
    }
  };

  const handleDelete = async (shelterId) => {
    if (!window.confirm("🛑 Are you sure you want to delete this shelter?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/shelters/delete/${shelterId}`);
      alert("✅ Shelter deleted successfully!");
      fetchShelters();
    } catch (error) {
      console.error("❌ Error deleting shelter:", error);
      alert("❌ Could not delete shelter. Try again.");
    }
  };

  return (
    <div className="a1b2345678901">
      <AdminSidebar />
      <main className="a2b3456789012">
        <div className="a3b4567890123">
          <h2 className="a4b5678901234">🏠 Shelter List</h2>
          <div className="table-responsive">
            <table className="a5b6789012345">
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
                    <td data-label="Location">{shelter.location}</td>
                    <td data-label="Emergency Contact">{shelter.contactDetails}</td>
                    <td data-label="Capacity">{shelter.totalCapacity}</td>
                    <td data-label="Inmates">{shelter.inmates}</td>
                    <td data-label="Volunteer">
                      <div className="volunteer-info">
                        {shelter.volunteer ? (
                          shelter.volunteer.approvalStatus ? (
                            <p className="a6b7890123456">{shelter.volunteer.approvalStatus}</p>
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
                    <td data-label="Map">
                      <button 
                        className="a7b8901234567" 
                        onClick={() => setSelectedShelter(shelter)}
                      >
                        📍 View Map
                      </button>
                    </td>
                    <td data-label="Delete">
                      <button 
                        className="a8b9012345678" 
                        onClick={() => handleDelete(shelter._id)}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* LoadScript outside of conditional rendering to maintain map state */}
          <LoadScript
            googleMapsApiKey={GOOGLE_MAPS_API_KEY}
            onLoad={() => setIsMapLoaded(true)}
          >
            {selectedShelter && isMapLoaded && (
              <MapComponent 
                shelter={selectedShelter} 
                onClose={() => setSelectedShelter(null)} 
              />
            )}
          </LoadScript>
        </div>
      </main>
    </div>
  );
};

export default ViewShelterAdmin;