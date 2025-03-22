import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";
import "../styles/ViewResourceUsage.css";

const AdminViewResourceUsage = () => {
  const { user } = useUser();
  const [shelters, setShelters] = useState([]);
  const [selectedShelterId, setSelectedShelterId] = useState("");
  const [usageRecords, setUsageRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    resourceType: ""
  });
  const [resourceTypes, setResourceTypes] = useState([]);
  // Base URLs for API endpoints
  const resourceTypesBaseUrl = "http://localhost:5000/api/resourceTypes";
  const sheltersBaseUrl = "http://localhost:5000/api/resourceTypes";

  useEffect(() => {
    // Fetch initial data when component mounts
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Admin gets all shelters, not just ones they own or are assigned to
      const sheltersRes = await axios.get(`${sheltersBaseUrl}/all`);
      setShelters(sheltersRes.data);
      
      // Get resource types list
      const typesRes = await axios.get(`${resourceTypesBaseUrl}/list`);
      setResourceTypes(typesRes.data);
      
      // If there are shelters, select the first one by default
      if (sheltersRes.data && sheltersRes.data.length > 0) {
        setSelectedShelterId(sheltersRes.data[0]._id);
        await fetchUsageRecords(sheltersRes.data[0]._id);
      } else {
        setError("No shelters found in the system.");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUsageRecords = async (shelterId) => {
    try {
      setLoading(true);
      const usageRes = await axios.get(`${resourceTypesBaseUrl}/usage/${shelterId}`);
      setUsageRecords(usageRes.data);
      setError("");
    } catch (err) {
      console.error("Error fetching usage records:", err);
      setError("Failed to load usage records.");
      setUsageRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle shelter selection change
  const handleShelterChange = async (e) => {
    const shelterId = e.target.value;
    setSelectedShelterId(shelterId);
    if (shelterId) {
      await fetchUsageRecords(shelterId);
      // Reset filters when changing shelter
      setFilters({ startDate: "", endDate: "", resourceType: "" });
    } else {
      setUsageRecords([]);
    }
  };

  // Format date for display
  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  // Handle filter form changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // Apply selected filters
  const applyFilters = async () => {
    if (!selectedShelterId) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.resourceType) params.append("resourceType", filters.resourceType);
      
      const response = await axios.get(`${resourceTypesBaseUrl}/usage/${selectedShelterId}?${params}`);
      setUsageRecords(response.data);
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
    if (selectedShelterId) {
      await fetchUsageRecords(selectedShelterId);
    }
  };

  // Group usage records by date
  const groupUsageByDate = () => {
    const grouped = {};
    usageRecords.forEach(record => {
      // Use createdAt field to match your schema
      const date = new Date(record.createdAt).toLocaleDateString();
      if (!grouped[date]) grouped[date] = [];
      
      // Create a copy of the record with possibly filtered resources
      const recordCopy = {...record};
      
      // Filter resources if a resource type filter is active
      if (filters.resourceType) {
        recordCopy.resources = record.resources.filter(
          resource => resource.resourceType?._id === filters.resourceType
        );
        
        // Skip this record if it has no matching resources after filtering
        if (recordCopy.resources.length === 0) return;
      }
      
      grouped[date].push(recordCopy);
    });
    return grouped;
  };

  const groupedUsage = groupUsageByDate();
  
  // Find the currently selected shelter object
  const selectedShelter = shelters.find(shelter => shelter._id === selectedShelterId);

  if (loading && shelters.length === 0) return <div className="loading">Loading...</div>;
  if (error && shelters.length === 0) return <div className="error">{error}</div>;
  if (shelters.length === 0) return <p className="error">No shelters found in the system.</p>;

  return (
    <div className="view-usage-container">
      <h2>Admin Resource Usage Dashboard</h2>
      
      <div className="shelter-selector">
        <label htmlFor="shelter-select">Select Shelter:</label>
        <select 
          id="shelter-select" 
          value={selectedShelterId} 
          onChange={handleShelterChange}
        >
          <option value="">-- Select a Shelter --</option>
          {shelters.map(shelter => (
            <option key={shelter._id} value={shelter._id}>
              {shelter.location}
            </option>
          ))}
        </select>
      </div>
      
      {selectedShelter && (
        <div className="shelter-info">
          <h3>Shelter: {selectedShelter.location}</h3>
          <p><strong>Capacity:</strong> {selectedShelter.inmates}/{selectedShelter.totalCapacity}</p>
          <p><strong>Contact:</strong> {selectedShelter.contactDetails}</p>
          {selectedShelter.owner && (
            <p><strong>Owner:</strong> {selectedShelter.owner.name || selectedShelter.owner}</p>
          )}
        </div>
      )}

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
      
      {!loading && Object.keys(groupedUsage).length > 0 ? (
        <div className="usage-records-list">
          {Object.entries(groupedUsage).map(([date, records]) => (
            <div key={date} className="usage-date-group">
              <div className="date-header">
                <h4>Date: {date}</h4>
              </div>
              
              {records.map((record) => (
                <div key={record._id} className="usage-card">
                  <div className="usage-header">
                    <h5>Recorded: {formatDate(record.createdAt)}</h5>
                    <span className="recorded-by">By: {record.volunteer?.name || "Unknown"}</span>
                  </div>
                  
                  <table className="resources-table">
                    <thead>
                      <tr>
                        <th>Resource</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {record.resources.map((resource, index) => (
                        <tr key={index}>
                          <td>{resource.resourceType?.name || "Unknown"}</td>
                          <td>{resource.quantity}</td>
                          <td>{resource.unit}</td>
                          <td>{resource.description || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {record.notes && <div className="usage-notes"><strong>Notes:</strong> {record.notes}</div>}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        !loading && <p className="no-data">No resource usage records found.</p>
      )}
    </div>
  );
};

export default AdminViewResourceUsage;