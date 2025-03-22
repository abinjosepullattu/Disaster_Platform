import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";
import "../styles/ViewResourceUsage.css";

const ViewResourceUsage = () => {
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
  // Update base URLs to match your actual endpoints
  const resourceTypesBaseUrl = "http://localhost:5000/api/resourceTypes";
  const volunteersBaseUrl = "http://localhost:5000/api/resourceTypes";

  useEffect(() => {
    if (user) {
      // Fetch initial data when component mounts
      fetchInitialData();
    }
  }, [user]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // First, check if the user is a volunteer
      const volunteerRes = await axios.get(`${volunteersBaseUrl}/user/${user.id}`);
      
      let sheltersList = [];
      
      if (volunteerRes.data && volunteerRes.data._id) {
        // User is a volunteer, get assigned shelters
        const sheltersRes = await axios.get(`${volunteersBaseUrl}/volunteer/${volunteerRes.data._id}`);
        sheltersList = sheltersRes.data;
      } else {
        // If not found as volunteer, try to find as shelter owner
        const ownerSheltersRes = await axios.get(`${resourceTypesBaseUrl}/shelters/owner/${user.id}`);
        if (ownerSheltersRes.data) {
          // Handle if API returns single shelter or array
          sheltersList = Array.isArray(ownerSheltersRes.data) 
            ? ownerSheltersRes.data 
            : [ownerSheltersRes.data];
        }
      }
      
      setShelters(sheltersList);
      
      // Set the first shelter as selected by default if available
      if (sheltersList.length > 0) {
        setSelectedShelterId(sheltersList[0]._id);
        await fetchUsageRecords(sheltersList[0]._id);
      }
      
      // Get resource types list
      const typesRes = await axios.get(`${resourceTypesBaseUrl}/list`);
      setResourceTypes(typesRes.data);
      
      if (sheltersList.length === 0) {
        setError("No shelters found for your account.");
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
      // Use createdAt field instead of usedAt to match your schema
      const date = new Date(record.createdAt).toLocaleDateString();
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(record);
    });
    return grouped;
  };

  const groupedUsage = groupUsageByDate();
  
  // Find the currently selected shelter object
  const selectedShelter = shelters.find(shelter => shelter._id === selectedShelterId);

  if (loading && shelters.length === 0) return <div className="loading">Loading...</div>;
  if (error && shelters.length === 0) return <div className="error">{error}</div>;
  if (shelters.length === 0) return <p className="error">No shelters found for your account.</p>;

  return (
    <div className="view-usage-container">
      <h2>Resource Usage Records</h2>
      
      {shelters.length > 1 && (
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
      )}
      
      {selectedShelter && (
        <div className="shelter-info">
          <h3>Shelter: {selectedShelter.location}</h3>
          <p><strong>Capacity:</strong> {selectedShelter.inmates}/{selectedShelter.totalCapacity}</p>
          <p><strong>Contact:</strong> {selectedShelter.contactDetails}</p>
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
                    {/* Use createdAt instead of usedAt */}
                    <h5>Recorded: {formatDate(record.createdAt)}</h5>
                    {/* Use volunteer instead of recordedBy */}
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

export default ViewResourceUsage;