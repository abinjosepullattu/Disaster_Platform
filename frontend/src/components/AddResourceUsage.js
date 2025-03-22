import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";
//import "../styles/AddResourceUsage.css";

const AddResourceUsage = () => {
  const { user } = useUser();
  const [assignedShelter, setAssignedShelter] = useState(null);
  const [resourceTypes, setResourceTypes] = useState([]);
  const [resources, setResources] = useState([
    { resourceType: "", unit: "", quantity: "", description: "" }
  ]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fetchingUserData, setFetchingUserData] = useState(true);

  // Define available units as an array
  const availableUnits = [
    "kg", "g", "liters", "ml", "pieces", "boxes", "packs", "bottles", 
    "cartons", "cans", "pairs", "rolls", "sets", "units"
  ];

  useEffect(() => {
    if (user) {
      fetchUserAssignedShelter();
      fetchResourceTypes();
    }
  }, [user]);

  const fetchUserAssignedShelter = async () => {
    setFetchingUserData(true);
    try {
      // Step 1: Find the volunteer record for this user
      const volunteerResponse = await axios.get(
        `http://localhost:5000/api/resourceTypes/user/${user.id}`
      );
      
      if (!volunteerResponse.data) {
        setError("No volunteer record found for this user.");
        setFetchingUserData(false);
        return;
      }
      
      const volunteerId = volunteerResponse.data._id;
      
      // Step 2: Find shelters assigned to this volunteer
      const shelterResponse = await axios.get(
        `http://localhost:5000/api/resourceTypes/volunteer/${volunteerId}`
      );
      
      if (shelterResponse.data && shelterResponse.data.length > 0) {
        setAssignedShelter(shelterResponse.data[0]);
      } else {
        setAssignedShelter(null);
      }
    } catch (err) {
      console.error("Error fetching assigned shelter:", err);
      setError("Failed to load your assigned shelter information.");
    } finally {
      setFetchingUserData(false);
    }
  };

  const fetchResourceTypes = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/resourceTypes/list");
      if (response.data && Array.isArray(response.data)) {
        setResourceTypes(response.data);
      } else {
        setError("Failed to load resource types.");
      }
    } catch (err) {
      console.error("Error fetching resource types:", err);
      setError("Failed to load resource types.");
    }
  };

  const handleResourceChange = (index, field, value) => {
    const updatedResources = [...resources];
    updatedResources[index][field] = value;
    setResources(updatedResources);
  };

  const addResourceField = () => {
    setResources([...resources, { resourceType: "", unit: "", quantity: "", description: "" }]);
  };

  const removeResourceField = (index) => {
    if (resources.length > 1) {
      const updatedResources = [...resources];
      updatedResources.splice(index, 1);
      setResources(updatedResources);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!assignedShelter || resources.some(r => !r.resourceType || !r.quantity || !r.unit)) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/resourceTypes/add-usage", 
        {
          shelter: assignedShelter._id,
          resources,
          notes,
          userId: user.id // Send the current user's ID
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      
      console.log("Response from server:", response.data);
      alert("Usage Details Entered Successfully");
      setSuccess(true);
      setNotes("");
      setResources([{ resourceType: "", unit: "", quantity: "", description: "" }]);
    } catch (err) {
      console.error("Error recording resource usage:", err);
      setError("Failed to record resource usage. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="resource-usage-container">
        <h2>Resource Usage Entry</h2>
        <p className="error">Please log in to record resource usage.</p>
      </div>
    );
  }

  return (
    <div className="resource-usage-container">
      <h2>Resource Usage Entry</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">Resource usage recorded successfully!</p>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Your Assigned Shelter</h3>
          {fetchingUserData ? (
            <p>Loading your assigned shelter...</p>
          ) : assignedShelter ? (
            <div className="shelter-info">
              <p><strong>Shelter Location:</strong> {assignedShelter.location}</p>
              <p><strong>Capacity:</strong> {assignedShelter.inmates}/{assignedShelter.totalCapacity}</p>
              <p><strong>Contact:</strong> {assignedShelter.contactDetails}</p>
            </div>
          ) : (
            <p>You don't have any shelter assigned to you.</p>
          )}
        </div>

        {assignedShelter && (
          <>
            <div className="form-section">
              <h3>Resources Used</h3>
              {resources.map((resource, index) => (
                <div key={index} className="resource-item">
                  <div className="resource-row">
                    <div className="form-group">
                      <label>Resource Type:</label>
                      <select 
                        value={resource.resourceType} 
                        onChange={(e) => handleResourceChange(index, "resourceType", e.target.value)}
                        required
                      >
                        <option value="">-- Select Resource --</option>
                        {resourceTypes.map((r) => (
                          <option key={r._id} value={r._id}>{r.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Unit:</label>
                      <select
                        value={resource.unit}
                        onChange={(e) => handleResourceChange(index, "unit", e.target.value)}
                        required
                      >
                        <option value="">-- Select Unit --</option>
                        {availableUnits.map((unit, i) => (
                          <option key={i} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Quantity:</label>
                      <input 
                        type="number" 
                        placeholder="Quantity" 
                        value={resource.quantity} 
                        onChange={(e) => handleResourceChange(index, "quantity", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="resource-bottom-row">
                    <div className="form-group description-field">
                      <label>Description:</label>
                      <textarea
                        placeholder="Additional details (optional)"
                        value={resource.description}
                        onChange={(e) => handleResourceChange(index, "description", e.target.value)}
                        rows={2}
                      />
                    </div>
                    {resources.length > 1 && (
                      <button 
                        type="button" 
                        className="remove-button" 
                        onClick={() => removeResourceField(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <hr />
                </div>
              ))}
              <button type="button" className="add-button" onClick={addResourceField}>
                + Add Resource
              </button>
            </div>

            <div className="form-section">
              <h3>Additional Notes</h3>
              <div className="form-group">
                <textarea
                  placeholder="Any additional notes about this resource usage"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? "Submitting..." : "Add Usage"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default AddResourceUsage;