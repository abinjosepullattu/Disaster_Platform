import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";
import "../styles/DonationUsageReport.css";

const DonationUsageReport = () => {
  const { user } = useUser();
  const [donations, setDonations] = useState({ total: 0, allocated: 0, remaining: 0 });
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    resourceType: ""
  });
  const [resourceTypes, setResourceTypes] = useState([]);
  const baseUrl = "http://localhost:5000/api";

  useEffect(() => {
    if (user) {
      // Fetch initial data when component mounts
      fetchInitialData();
    }
  }, [user]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Get donation summary
      const summaryRes = await axios.get(`${baseUrl}/donations/summary`);
      setDonations(summaryRes.data);
      
      // Get allocation history
      const allocationsRes = await axios.get(`${baseUrl}/donations/allocations`);
      setAllocations(allocationsRes.data);
      
      // Get resource types list
      const typesRes = await axios.get(`${baseUrl}/resourceTypes/list`);
      setResourceTypes(typesRes.data);
      
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => new Date(dateString).toLocaleString();
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Handle filter form changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // Apply selected filters
  const applyFilters = async () => {
    setLoading(true);
    try {
      // Build query parameters for the API request
      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.resourceType) params.append("resourceType", filters.resourceType);
      
      // Send the API request with query parameters
      const allocationsRes = await axios.get(`${baseUrl}/donations/allocations?${params}`);
      setAllocations(allocationsRes.data);
      
      // Calculate totals from the filtered allocations on the frontend
      if (filters.resourceType) {
        // Calculate both total and allocated for the filtered resource type
        let total = 0;
        let allocated = 0;
        
        allocationsRes.data.forEach(allocation => {
          // Filter items by resource type
          const filteredItems = allocation.allocations.filter(item => 
            item.resourceType && item.resourceType._id === filters.resourceType
          );
          
          // Sum up the costs of the filtered items
          const itemsTotal = filteredItems.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
          allocated += itemsTotal;
          total += itemsTotal;
        });
        
        // Update donations with calculated values
        setDonations({
          total: total,
          allocated: allocated,
          remaining: total - allocated
        });
      } else {
        // If no resource type filter, use the full totals
        // Calculate the total from all allocations
        let total = 0;
        let allocated = 0;
        
        allocationsRes.data.forEach(allocation => {
          allocated += allocation.totalCost;
          total += allocation.totalCost;
        });
        
        setDonations({
          total: total,
          allocated: allocated,
          remaining: total - allocated
        });
      }
    } catch (err) {
      console.error("Error applying filters:", err);
      setError("Failed to filter records.");
    } finally {
      setLoading(false);
    }
  };

  // Reset filters to default
  const resetFilters = async () => {
    setFilters({ startDate: "", endDate: "", resourceType: "" });
    fetchInitialData();
  };

  // Group allocations by date
  const groupAllocationsByDate = () => {
    const grouped = {};
    allocations.forEach(allocation => {
      const date = new Date(allocation.createdAt).toLocaleDateString();
      if (!grouped[date]) grouped[date] = [];
      
      // If a resourceType filter is active, check if any allocation items match it
      if (filters.resourceType) {
        // Create a copy of the allocation with filtered items
        const filteredAllocation = {
          ...allocation,
          allocations: allocation.allocations.filter(item => 
            item.resourceType && item.resourceType._id === filters.resourceType
          )
        };
        
        // Only add this allocation if it has matching items after filtering
        if (filteredAllocation.allocations.length > 0) {
          grouped[date].push(filteredAllocation);
        }
      } else {
        // No resourceType filter, add the whole allocation
        grouped[date].push(allocation);
      }
    });
    return grouped;
  };

  const groupedAllocations = groupAllocationsByDate();

  if (loading && allocations.length === 0) return <div className="loading">Loading...</div>;
  if (error && allocations.length === 0) return <div className="error">{error}</div>;

  return (
    <div className="donation-usage-report-container">
      <h2>Donation Usage Report</h2>
      
      <div className="donation-summary-card">
        <h3>Donation Summary</h3>
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

      <div className="filter-section">
        <h4>Filter Records</h4>
        <div className="filter-controls">
          <div className="filter-group">
            <label>Start Date:</label>
            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
          </div>
          
          <div className="filter-group">
            <label>End Date:</label>
            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
          </div>
          
          <div className="filter-group">
            <label>Resource Type:</label>
            <select name="resourceType" value={filters.resourceType} onChange={handleFilterChange}>
              <option value="">All Resources</option>
              {resourceTypes.map(type => (
                <option key={type._id} value={type._id}>{type.name}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-actions">
            <button onClick={applyFilters} className="filter-button">Apply Filters</button>
            <button onClick={resetFilters} className="reset-button">Reset</button>
          </div>
        </div>
      </div>

      {loading && <div className="loading">Loading records...</div>}
      
      {!loading && Object.keys(groupedAllocations).length > 0 ? (
        <div className="allocations-list">
          {Object.entries(groupedAllocations).map(([date, dateAllocations]) => (
            <div key={date} className="allocation-date-group">
              <div className="date-header">
                <h4>Date: {date}</h4>
              </div>
              
              {dateAllocations.map((allocation) => (
                <div key={allocation.id} className="allocation-card">
                  <div className="allocation-header">
                    <h5>Allocated: {formatDate(allocation.createdAt)}</h5>
                    <span className="allocation-by">By: {allocation.admin?.name || "System"}</span>
                    <span className="allocation-total">Total: {formatCurrency(allocation.totalCost)}</span>
                  </div>
                  
                  <table className="resources-table">
                    <thead>
                      <tr>
                        <th>Resource</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>Cost (per unit)</th>
                        <th>Total Cost</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allocation.allocations.map((resource, index) => (
                        <tr key={index}>
                          <td>{resource.resourceType?.name || "Unknown Resource"}</td>
                          <td>{resource.quantity}</td>
                          <td>{resource.unit}</td>
                          <td>{formatCurrency(resource.cost)}</td>
                          <td>{formatCurrency(resource.quantity * resource.cost)}</td>
                          <td>{resource.description || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        !loading && <p className="no-data">No donation allocation records found.</p>
      )}
    </div>
  );
};

export default DonationUsageReport;