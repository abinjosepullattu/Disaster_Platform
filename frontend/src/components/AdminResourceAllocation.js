import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AdminResourceAllocation.css";
import { useNavigate } from "react-router-dom";

const AdminResourceAllocation = () => {
      const navigate = useNavigate();
    
  const [shelters, setShelters] = useState([]);
  const [resourceTypes, setResourceTypes] = useState([]);
  const [selectedShelter, setSelectedShelter] = useState("");
  const [resources, setResources] = useState([
    { 
      resourceType: "", 
      unit: "", 
      quantity: "", 
      totalAmount: "",
      description: "" 
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Define available units for dropdown
  const availableUnits = ["Kilogram", "Gram", "Liter", "Milliliter", "Piece", "Box", "Packet"];

  useEffect(() => {
    fetchShelters();
    fetchResourceTypes();
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

  const fetchResourceTypes = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/resourceTypes/list");
      setResourceTypes(response.data);
    } catch (err) {
      console.error("Error fetching resource types:", err);
      setError("Failed to load resource types. Please try again.");
    }
  };

  const handleResourceChange = (index, field, value) => {
    const updatedResources = [...resources];

    if (field === "resourceType") {
      const selectedResource = resourceTypes.find(r => r._id === value);
      updatedResources[index] = {
        ...updatedResources[index],
        resourceType: value,
        unit: selectedResource ? selectedResource.unit : ""
      };
    } else {
      updatedResources[index][field] = value;
    }

    setResources(updatedResources);
  };

  const addResourceField = () => {
    setResources([...resources, { 
      resourceType: "", 
      unit: "", 
      quantity: "", 
      totalAmount: "",
      description: "" 
    }]);
  };

  const removeResourceField = (index) => {
    const updatedResources = [...resources];
    updatedResources.splice(index, 1);
    setResources(updatedResources);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedShelter || resources.some(r => !r.resourceType || !r.quantity || !r.unit || !r.totalAmount)) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      // Prepare data according to backend model
      const formattedResources = resources.map(r => ({
        resourceType: r.resourceType,
        unit: r.unit,
        quantity: parseFloat(r.quantity),
        totalAmount: parseFloat(r.totalAmount),
        description: r.description || "" // Ensure description is at least an empty string
      }));

      const response = await axios.post("http://localhost:5000/api/resourceTypes/allocate", {
        shelter: selectedShelter,
        resources: formattedResources
      });

      alert("Resources allocated successfully!");
      navigate(-1);
      setSelectedShelter("");
      setResources([{ 
        resourceType: "", 
        unit: "", 
        quantity: "", 
        totalAmount: "",
        description: "" 
      }]);

      // Display updated data in console
      console.log("Response Data:", response.data);
    } catch (err) {
      console.error("Error allocating resources:", err);
      setError("Failed to allocate resources. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-resource-allocation-container">
      <h2>Allocate Resources to Shelter</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>Shelter:</label>
        <select 
          value={selectedShelter} 
          onChange={(e) => setSelectedShelter(e.target.value)}
          required
        >
          <option value="">-- Select Shelter --</option>
          {shelters.map((shelter) => (
            <option key={shelter._id} value={shelter._id}>{shelter.location}</option>
          ))}
        </select>

        <h3>Resources</h3>
        {resources.map((resource, index) => (
          <div key={index} className="resource-item">
            <div className="resource-row">
              <select 
                value={resource.resourceType} 
                onChange={(e) => handleResourceChange(index, "resourceType", e.target.value)}
                required
                className="resource-type-select"
              >
                <option value="">-- Select Resource --</option>
                {resourceTypes.map((r) => (
                  <option key={r._id} value={r._id}>{r.name}</option>
                ))}
              </select>
              
              <select 
                value={resource.unit} 
                onChange={(e) => handleResourceChange(index, "unit", e.target.value)}
                required
                className="unit-select"
              >
                <option value="">-- Select Unit --</option>
                {availableUnits.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
            
            <div className="resource-row">
              <input 
                type="number" 
                placeholder="Quantity" 
                value={resource.quantity} 
                onChange={(e) => handleResourceChange(index, "quantity", e.target.value)}
                required
                className="quantity-input"
              />
              
              <input 
                type="number" 
                placeholder="Total Amount (₹)" 
                value={resource.totalAmount} 
                onChange={(e) => handleResourceChange(index, "totalAmount", e.target.value)}
                required
                className="total-amount-input"
              />
            </div>
            
            <div className="resource-row description-row">
              <textarea
                placeholder="Description (optional)"
                value={resource.description}
                onChange={(e) => handleResourceChange(index, "description", e.target.value)}
                rows={4}
                className="description-textarea"
              />
            </div>
            <div className="remove-button-container">
    <button 
      type="button" 
      className="remove-button" 
      onClick={() => removeResourceField(index)}
    >
      Remove
    </button>
  </div>
          </div>
        ))}
        <button type="button" className="add-button" onClick={addResourceField}>
          + Add Resource
        </button>
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Allocating..." : "Allocate Resources"}
        </button>
      </form>
    </div>
  );
};

export default AdminResourceAllocation;