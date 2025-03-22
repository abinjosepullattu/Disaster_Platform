import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";
import "../styles/ViewContributionsAdmin.css";

const AdminContributions = () => {
  const { user } = useUser();
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [filters, setFilters] = useState({
    shelter: "",
    status: "",
    date: ""
  });
  const [shelters, setShelters] = useState([]);

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchAllContributions();
      fetchShelters();
    } else {
      setLoading(false);
      setError("You don't have permission to view this page.");
    }
  }, [user]);

  const fetchShelters = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/resourceTypes/shelters");
      setShelters(response.data);
    } catch (err) {
      console.error("Error fetching shelters:", err);
    }
  };

  const fetchAllContributions = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/resourceTypes/contributions");
      
      // Sort by date (newest first)
      const sortedContributions = response.data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setContributions(sortedContributions);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching contributions:", err);
      setError("Failed to load contributions. Please try again.");
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const clearFilters = () => {
    setFilters({
      shelter: "",
      status: "",
      date: ""
    });
  };

  const verifyContribution = async (contributionId) => {
    try {
      setLoading(true);
      await axios.put(
        `http://localhost:5000/api/resourceTypes/approve-contribution/${contributionId}`
      );
      
      // Update the local state
      setContributions(prevContributions => 
        prevContributions.map(contribution => 
          contribution._id === contributionId 
            ? { ...contribution, status: 1 } 
            : contribution
        )
      );
      
      setSuccessMessage("Contribution verified successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      
      setLoading(false);
    } catch (err) {
      console.error("Error verifying contribution:", err);
      setError("Failed to verify contribution. Please try again.");
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 0:
        return <span className="status-pending">Pending</span>;
      case 1:
        return <span className="status-verified">Verified</span>;
      default:
        return <span className="status-unknown">Unknown</span>;
    }
  };

  // Filter contributions based on selected filters
  const filteredContributions = contributions.filter(contribution => {
    const matchesShelter = filters.shelter ? contribution.shelter._id === filters.shelter : true;
    const matchesStatus = filters.status !== "" ? contribution.status === parseInt(filters.status) : true;
    
    let matchesDate = true;
    if (filters.date) {
      const filterDate = new Date(filters.date).setHours(0, 0, 0, 0);
      const contributionDate = new Date(contribution.createdAt).setHours(0, 0, 0, 0);
      matchesDate = filterDate === contributionDate;
    }
    
    return matchesShelter && matchesStatus && matchesDate;
  });

  return (
    <div className="admin-contributions-container">
      <h2>All Contributions</h2>
      {error && <p className="error">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      {!loading && user && user.role === "admin" && (
        <div className="filters-section">
          <h3>Filter Contributions</h3>
          <div className="filters-form">
            <div className="filter-group">
              <label htmlFor="shelter">Shelter:</label>
              <select 
                id="shelter" 
                name="shelter" 
                value={filters.shelter} 
                onChange={handleFilterChange}
              >
                <option value="">All Shelters</option>
                {shelters.map(shelter => (
                  <option key={shelter._id} value={shelter._id}>
                    {shelter.location}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="status">Status:</label>
              <select 
                id="status" 
                name="status" 
                value={filters.status} 
                onChange={handleFilterChange}
              >
                <option value="">All Statuses</option>
                <option value="0">Pending</option>
                <option value="1">Verified</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="date">Date:</label>
              <input 
                type="date" 
                id="date" 
                name="date" 
                value={filters.date} 
                onChange={handleFilterChange}
              />
            </div>
            
            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : user && user.role === "admin" ? (
        <>
          <div className="contributions-summary">
            <div className="summary-card">
              <h4>Total Contributions</h4>
              <p className="count">{contributions.length}</p>
            </div>
            <div className="summary-card">
              <h4>Pending</h4>
              <p className="count pending">{contributions.filter(c => c.status === 0).length}</p>
            </div>
            <div className="summary-card">
              <h4>Verified</h4>
              <p className="count verified">{contributions.filter(c => c.status === 1).length}</p>
            </div>
          </div>

          {filteredContributions.length > 0 ? (
            <div className="contributions-list">
              {filteredContributions.map((contribution) => (
                <div key={contribution._id} className="contribution-card">
                  <div className="contribution-header">
                    <h3>Contribution from {contribution.contributorName}</h3>
                    <div className="contribution-meta">
                      <span className="contribution-date">
                        Date: {formatDate(contribution.createdAt)}
                      </span>
                      <span className="contribution-status">
                        Status: {getStatusLabel(contribution.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="shelter-info">
                    <p><strong>Shelter:</strong> {contribution.shelter.location}</p>
                  </div>
                  
                  <div className="resources-table-container">
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
                        {contribution.resources.map((resource, index) => (
                          <tr key={index}>
                            <td>{resource.resourceType.name}</td>
                            <td>{resource.quantity}</td>
                            <td>{resource.unit}</td>
                            <td>{resource.description || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="contribution-contact">
                    <p><strong>Contributor:</strong> {contribution.contributorName}</p>
                    <p><strong>Contact:</strong> {contribution.contributorContact}</p>
                    {contribution.contributorId && (
                      <p><strong>Contributor ID:</strong> {contribution.contributorId}</p>
                    )}
                  </div>
                  
                  {contribution.status === 0 && (
                    <div className="verify-actions">
                      <button
                        onClick={() => verifyContribution(contribution._id)}
                        className="verify-button"
                      >
                        Verify Contribution
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-contributions">
              <p>No contributions match your filter criteria.</p>
            </div>
          )}
        </>
      ) : (
        <div className="access-denied">
          <p>You don't have permission to view this page. Please log in as an administrator.</p>
        </div>
      )}
    </div>
  );
};

export default AdminContributions;