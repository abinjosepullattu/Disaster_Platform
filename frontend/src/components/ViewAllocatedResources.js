import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/ViewAllocatedResources.css";

const ViewAllocatedResources = () => {
  const [shelters, setShelters] = useState([]);
  const [selectedShelter, setSelectedShelter] = useState("");
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchShelters();
  }, []);

  const fetchShelters = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/resourceTypes/shelters");
      setShelters(response.data);
    } catch (err) {
      console.error("Error fetching shelters:", err);
      setError("Failed to load shelters. Please try again.");
    }
  };

  const fetchAllocations = async (shelterId) => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`http://localhost:5000/api/resourceTypes/allocations/${shelterId}`);
      setAllocations(response.data);
    } catch (err) {
      console.error("Error fetching allocations:", err);
      setError("Failed to load allocations. Please try again.");
      setAllocations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShelterChange = (e) => {
    const shelterId = e.target.value;
    setSelectedShelter(shelterId);
    if (shelterId) {
      fetchAllocations(shelterId);
    } else {
      setAllocations([]);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="view-allocations-container">
      <h2>View Allocated Resources</h2>
      {error && <p className="error">{error}</p>}
      
      <div className="shelter-selector">
        <label>Select Shelter:</label>
        <select 
          value={selectedShelter} 
          onChange={handleShelterChange}
        >
          <option value="">-- Select Shelter --</option>
          {shelters.map((shelter) => (
            <option key={shelter._id} value={shelter._id}>{shelter.location}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading allocations...</div>
      ) : (
        <>
          {allocations.length > 0 ? (
            <div className="allocations-list">
              <h3>Allocated Resources</h3>
              {allocations.map((allocation) => (
                <div key={allocation._id} className="allocation-card">
                  <div className="allocation-header">
                    <h4>Allocation Date: {formatDate(allocation.allocatedAt)}</h4>
                  </div>
                  <div className="resources-table-container">
                    <table className="resources-table">
                      <thead>
                        <tr>
                          <th>Resource</th>
                          <th>Quantity</th>
                          <th>Unit</th>
                          <th>Amount (₹)</th>
                          <th>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allocation.resources.map((resource, index) => (
                          <tr key={index}>
                            <td>{resource.resourceType.name}</td>
                            <td>{resource.quantity}</td>
                            <td>{resource.unit}</td>
                            <td>₹{resource.totalAmount.toFixed(2)}</td>
                            <td>{resource.description || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="allocation-summary">
                    <p>
                      <strong>Total Amount:</strong> ₹
                      {allocation.resources
                        .reduce((sum, resource) => sum + resource.totalAmount, 0)
                        .toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            selectedShelter && <p className="no-data">No allocations found for this shelter.</p>
          )}
        </>
      )}
    </div>
  );
};

export default ViewAllocatedResources;