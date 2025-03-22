import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";
import "../styles/DonationAllocationAdmin.css";

const DonationAllocation = () => {
  const { user } = useUser();
  const [donations, setDonations] = useState({ total: 0, allocated: 0, remaining: 0 });
  const [resourceTypes, setResourceTypes] = useState([]);
  const [allocations, setAllocations] = useState([
    { resourceType: "", quantity: "", unit: "", cost: "", description: "" }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [allocationHistory, setAllocationHistory] = useState([]);

  // Define available units
  const availableUnits = [
    "kg", "g", "liters", "ml", "pieces", "boxes", "packs", "bottles", 
    "cartons", "cans", "pairs", "rolls", "sets", "units"
  ];

  useEffect(() => {
    if (user?.role === "admin") {
      fetchInitialData();
    }
  }, [user]);

  const fetchInitialData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [donationsRes, typesRes, historyRes] = await Promise.all([
        axios.get("http://localhost:5000/api/donations/summary"),
        axios.get("http://localhost:5000/api/resourceTypes/list"),
        axios.get("http://localhost:5000/api/donations/allocations")
      ]);
      
      setDonations(donationsRes.data);
      setResourceTypes(typesRes.data);
      setAllocationHistory(historyRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleAllocationChange = (index, field, value) => {
    const updatedAllocations = [...allocations];
    updatedAllocations[index][field] = value;
    
    // Auto-calculate cost if quantity or cost per unit changes
    if (field === "quantity" || field === "cost") {
      const quantity = parseFloat(field === "quantity" ? value : updatedAllocations[index].quantity) || 0;
      const cost = parseFloat(field === "cost" ? value : updatedAllocations[index].cost) || 0;
      updatedAllocations[index].totalCost = (quantity * cost).toFixed(2);
    }
    
    setAllocations(updatedAllocations);
  };

  const addAllocationField = () => {
    setAllocations([...allocations, { resourceType: "", quantity: "", unit: "", cost: "", description: "" }]);
  };

  const removeAllocationField = (index) => {
    if (allocations.length > 1) {
      setAllocations(allocations.filter((_, i) => i !== index));
    }
  };

  const calculateTotalAllocationCost = () => {
    return allocations.reduce((total, item) => {
      return total + (parseFloat(item.quantity || 0) * parseFloat(item.cost || 0));
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (allocations.some(a => !a.resourceType || !a.quantity || !a.unit || !a.cost)) {
      setError("Please complete all required fields for each allocation.");
      return;
    }
    
    const totalCost = calculateTotalAllocationCost();
    
    if (totalCost > donations.remaining) {
      setError(`Insufficient funds. Total cost (${formatCurrency(totalCost)}) exceeds available balance (${formatCurrency(donations.remaining)}).`);
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      await axios.post("http://localhost:5000/api/donations/allocate", {
        allocations: allocations,
        totalCost: totalCost
      });
      alert("Funds Allocated Successfully");
      setSuccess("Funds allocated successfully!");
      setAllocations([{ resourceType: "", quantity: "", unit: "", cost: "", description: "" }]);
      
      // Refresh data
      fetchInitialData();
    } catch (err) {
      console.error("Error allocating donations:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to allocate funds. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="permission-denied">
        <h2>Donation Allocation</h2>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="donation-allocation-container">
      <h1>Donation Allocation Dashboard</h1>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="summary-card">
        <h2>Donation Summary</h2>
        <div className="summary-stats">
          <div className="stat-item">
            <div className="stat-label">Total Donations</div>
            <div className="stat-value">{formatCurrency(donations.total)}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Allocated</div>
            <div className="stat-value">{formatCurrency(donations.allocated)}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Available Balance</div>
            <div className="stat-value">{formatCurrency(donations.remaining)}</div>
          </div>
        </div>
      </div>
      
      <div className="allocation-form-container">
        <h2>Allocate Funds</h2>
        <form onSubmit={handleSubmit}>
          <div className="allocations-section">
            <h3>Resource Allocations</h3>
            {allocations.map((allocation, index) => (
              <div key={index} className="allocation-item">
                <div className="allocation-row">
                  <div className="form-group">
                    <label>Resource:</label>
                    <select 
                      value={allocation.resourceType} 
                      onChange={(e) => handleAllocationChange(index, "resourceType", e.target.value)}
                      required
                    >
                      <option value="">Select Resource</option>
                      {resourceTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Quantity:</label>
                    <input 
                      type="number" 
                      value={allocation.quantity} 
                      onChange={(e) => handleAllocationChange(index, "quantity", e.target.value)}
                      required
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Unit:</label>
                    <select 
                      value={allocation.unit} 
                      onChange={(e) => handleAllocationChange(index, "unit", e.target.value)}
                      required
                    >
                      <option value="">Select Unit</option>
                      {availableUnits.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Cost (₹):</label>
                    <input 
                      type="number" 
                      value={allocation.cost} 
                      onChange={(e) => handleAllocationChange(index, "cost", e.target.value)}
                      required
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className="allocation-row">
                  <div className="form-group description">
                    <label>Description (optional):</label>
                    <textarea 
                      value={allocation.description} 
                      onChange={(e) => handleAllocationChange(index, "description", e.target.value)}
                      placeholder="Additional details"
                    />
                  </div>
                  
                  <div className="item-cost">
                    <label>Cost: </label>
                    {formatCurrency(parseFloat(allocation.quantity || 0) * parseFloat(allocation.cost || 0))}
                  </div>
                  
                  {allocations.length > 1 && (
                    <button 
                      type="button" 
                      className="remove-btn" 
                      onClick={() => removeAllocationField(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            <button type="button" className="add-btn" onClick={addAllocationField}>
              + Add Resource
            </button>
            
            <div className="allocation-summary">
              <h4>Summary</h4>
              <p>Total Cost: {formatCurrency(calculateTotalAllocationCost())}</p>
              <p>Remaining After Allocation: {formatCurrency(donations.remaining - calculateTotalAllocationCost())}</p>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading || calculateTotalAllocationCost() <= 0 || calculateTotalAllocationCost() > donations.remaining}
          >
            {loading ? "Processing..." : "Allocate Funds"}
          </button>
        </form>
      </div>
      
    </div>
  );
};

export default DonationAllocation;