import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext"; // Assuming you have an AuthContext for logged-in user
import "../styles/ViewAllocatedResourcesVolunteer.css";

const ViewAllocatedResourcesVolunteer = () => {
  const { user } = useUser(); // Assuming user._id is the logged-in volunteer's ID
  const [shelter, setShelter] = useState(null);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      fetchShelter(user.id);
    }
  }, [user]);

  const fetchShelter = async (volunteerId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/resourceTypes/shelter-assigned/${volunteerId}`
      );
      if (response.data) {
        setShelter(response.data);
        console.log(response.data);
        fetchAllocations(response.data._id);
      } else {
       // setError("No shelter assigned to you.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching shelter:", err);
      //setError("Failed to load shelter. Please try again.");
      setLoading(false);
    }
  };

  const fetchAllocations = async (shelterId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/resourceTypes/allocations/${shelterId}`
      );
      setAllocations(response.data);
    } catch (err) {
      console.error("Error fetching allocations:", err);
      setError("Failed to load allocations. Please try again.");
    } finally {
      setLoading(false);
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

      {loading ? (
        <div className="loading">Loading...</div>
      ) : shelter ? (
        <>
          <h3>Shelter: {shelter.location}</h3>

          {allocations.length > 0 ? (
            <div className="allocations-list">
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
            <p className="no-data">No allocations found for your shelter.</p>
          )}
        </>
      ) : (
        <p className="error">No shelter assigned to you.</p>
      )}
    </div>
  );
};

export default ViewAllocatedResourcesVolunteer;
