import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext"; // Import the user context
import "../styles/AddContributedResource.css";

const AddContributedResource = () => {
  const { user } = useUser(); // Get the current user from context
  const [shelters, setShelters] = useState([]);
  const [resourceTypes, setResourceTypes] = useState([]);
  const [selectedShelter, setSelectedShelter] = useState("");
  const [resources, setResources] = useState([
    { resourceType: "", unit: "", quantity: "", description: "" }
  ]);
  const [contributorName, setContributorName] = useState("");
  const [contributorContact, setContributorContact] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Define available units as an array
  const availableUnits = [
    "kg", "g", "liters", "ml", "pieces", "boxes", "packs", "bottles", 
    "cartons", "cans", "pairs", "rolls", "sets", "units"
  ];

  useEffect(() => {
    fetchShelters();
    fetchResourceTypes();
    
    // Pre-fill contributor information if user is logged in
    if (user) {
      setContributorName(user.name || "");
      setContributorContact(user.phone || "");
    }
  }, [user]);

  const fetchShelters = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/resourceTypes/shelters");
      setShelters(response.data);
    } catch (err) {
      console.error("Error fetching shelters:", err);
      setError("Failed to load shelters.");
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
    if (!selectedShelter || !contributorName || !contributorContact || resources.some(r => !r.resourceType || !r.quantity || !r.unit)) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError("");

    // Check which ID field exists on the user object
    const userId = user ? (user._id || user.id) : null;
    
    // Log the user and ID for debugging
    console.log("User object:", user);
    console.log("Contributor ID being sent:", userId);

    try {
      const response = await axios.post("http://localhost:5000/api/resourceTypes/add-contribution", {
        shelter: selectedShelter,
        resources,
        contributorName,
        contributorContact,
        contributorId: userId, // Use the correctly identified ID
      });
      
      console.log("Response from server:", response.data);
      alert("Resources contributed successfully!");
      setSelectedShelter("");
      setContributorName(user ? user.name || "" : "");
      setContributorContact(user ? user.phone || "" : "");
      setResources([{ resourceType: "", unit: "", quantity: "", description: "" }]);
    } catch (err) {
      console.error("Error contributing resources:", err);
      setError("Failed to contribute resources. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contribute-resource-container">
      <h2>Contribute Resources</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Contributor Information</h3>
          <div className="form-group">
            <label htmlFor="contributorName">Your Name:</label>
            <input 
              type="text" 
              id="contributorName"
              value={contributorName} 
              onChange={(e) => setContributorName(e.target.value)} 
              placeholder="Enter  full name"
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="contributorContact">Contact Info:</label>
            <input 
              type="text" 
              id="contributorContact"
              value={contributorContact} 
              onChange={(e) => setContributorContact(e.target.value)} 
              placeholder="Phone number"
              required 
            />
          </div>
          {!user && (
            <p className="info-message">
              Note: Sign in to track your contributions and receive updates.
            </p>
          )}
        </div>

        <div className="form-section">
          <h3>Shelter</h3>
          <div className="form-group">
            <label htmlFor="shelterSelect">Select Shelter:</label>
            <select 
              id="shelterSelect"
              value={selectedShelter} 
              onChange={(e) => setSelectedShelter(e.target.value)} 
              required
            >
              <option value="">-- Select Shelter --</option>
              {shelters.map((shelter) => (
                <option key={shelter._id} value={shelter._id}>{shelter.location}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>Resources</h3>
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

        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Submitting..." : "Submit Contribution"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddContributedResource;