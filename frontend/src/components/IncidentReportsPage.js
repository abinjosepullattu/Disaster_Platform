import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/IncidentReportsPage.css";

// Map component to display incident location
const IncidentMap = ({ latitude, longitude }) => {
  return (
    <div className="incident-map">
      <iframe
        title="Incident Location"
        width="100%"
        height="200"
        frameBorder="0"
        src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
        allowFullScreen
      ></iframe>
    </div>
  );
};

// Detail Modal Component
const IncidentDetailModal = ({ show, onClose, incident }) => {
  if (!show || !incident) {
    return null;
  }

  // Get severity label based on severity level
  const getSeverityLabel = (level) => {
    switch (level) {
      case 1: return "Very Low";
      case 2: return "Low";
      case 3: return "Medium";
      case 4: return "High";
      case 5: return "Critical";
      default: return "Unknown";
    }
  };

  // Get status label based on status code
  const getStatusLabel = (statusCode) => {
    switch (statusCode) {
      case 0: return "Reported";
      case 1: return "Under Investigation";
      case 2: return "Resolved";
      case 3: return "Closed";
      default: return "Unknown";
    }
  };

  return (
    <div className="incident-modal-overlay">
      <div className="incident-modal">
        <div className="incident-modal-header">
          <h3>Incident Details</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="incident-modal-body">
          <div className="incident-details">
            <div className="detail-row">
              <span className="detail-label">Location:</span>
              <span className="detail-value">{incident.location}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Type:</span>
              <span className="detail-value">{incident.type}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Severity:</span>
              <span className={`detail-value severity-level-${incident.severity}`}>
                {getSeverityLabel(incident.severity)}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <span className={`detail-value status-${incident.status}`}>
                {getStatusLabel(incident.status)}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Reported On:</span>
              <span className="detail-value">{new Date(incident.createdAt).toLocaleString()}</span>
            </div>
            {/* <div className="detail-row">
              <span className="detail-label">Reported By:</span>
              <span className="detail-value">{incident.reportedBy?.name || "Anonymous"}</span>
            </div> */}
            <div className="detail-row">
              <span className="detail-label">Description:</span>
              <span className="detail-value">{incident.description}</span> 
            </div>
          </div>
          
          <div className="incident-location-map">
            <h4>Location</h4>
            <IncidentMap latitude={incident.latitude} longitude={incident.longitude} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Response Modal Component for updating incident status
const ResponseModal = ({ show, onClose, onSubmit, incident, isSubmitting }) => {
  const [status, setStatus] = useState(incident?.status || 0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (incident) {
      setStatus(incident.status || 0);
      setNotes('');
    }
  }, [incident]);

  // Handle status change
  const handleStatusChange = (e) => {
    setStatus(parseInt(e.target.value));
  };

  // Handle notes change
  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ status, notes });
  };

  if (!show || !incident) {
    return null;
  }

  return (
    <div className="response-modal-overlay">
      <div className="response-modal">
        <div className="response-modal-header">
          <h3>Update Incident Status</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="response-modal-body">
          <div className="incident-info">
            <p><strong>Location:</strong> {incident.location}</p>
            <p><strong>Type:</strong> {incident.type}</p>
            <p><strong>Current Status:</strong> {
              incident.status === 0 ? "Reported" :
              incident.status === 1 ? "Under Investigation" :
              incident.status === 2 ? "Resolved" :
              incident.status === 3 ? "Closed" : "Unknown"
            }</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="status">Update Status:</label>
              <select
                id="status"
                name="status"
                value={status}
                onChange={handleStatusChange}
                required
              >
                <option value="0">Reported</option>
                <option value="1">Under Investigation</option>
                <option value="2">Resolved</option>
                <option value="3">Closed</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="notes">Notes (Optional):</label>
              <textarea
                id="notes"
                name="notes"
                rows="4"
                value={notes}
                onChange={handleNotesChange}
                placeholder="Add any relevant notes about this status update..."
              ></textarea>
            </div>
            
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const IncidentReportsPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Filter states
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
    type: "",
    severity: "",
    location: ""
  });
  
  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Base URL for API endpoints
  const apiBaseUrl = "http://localhost:5000/api/incidents";

  useEffect(() => {
    // Fetch initial data when component mounts
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(apiBaseUrl);
      setIncidents(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching incidents:", err);
      setError("Failed to load incidents. Please try again.");
      setIncidents([]);
    } finally {
      setLoading(false);
    }
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
      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.status) params.append("status", filters.status);
      if (filters.type) params.append("type", filters.type);
      if (filters.severity) params.append("severity", filters.severity);
      if (filters.location) params.append("location", filters.location);
      
      const response = await axios.get(`${apiBaseUrl}/filter?${params}`);
      setIncidents(response.data);
    } catch (err) {
      console.error("Error applying filters:", err);
      setError("Failed to filter incidents.");
    } finally {
      setLoading(false);
    }
  };

  // Reset filters to default
  const resetFilters = async () => {
    setFilters({
      startDate: "",
      endDate: "",
      status: "",
      type: "",
      severity: "",
      location: ""
    });
    await fetchIncidents();
  };

  // Format date for display
  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  // Get severity label and class
  const getSeverityInfo = (level) => {
    let label, className;
    
    switch (level) {
      case 1:
        label = "Very Low";
        className = "severity-very-low";
        break;
      case 2:
        label = "Low";
        className = "severity-low";
        break;
      case 3:
        label = "Medium";
        className = "severity-medium";
        break;
      case 4:
        label = "High";
        className = "severity-high";
        break;
      case 5:
        label = "Critical";
        className = "severity-critical";
        break;
      default:
        label = "Unknown";
        className = "";
    }
    
    return { label, className };
  };

  // Get status label and class
  const getStatusInfo = (statusCode) => {
    let label, className;
    
    switch (statusCode) {
      case 0:
        label = "Reported";
        className = "status-reported";
        break;
      case 1:
        label = "Under Investigation";
        className = "status-investigating";
        break;
      case 2:
        label = "Resolved";
        className = "status-resolved";
        break;
      case 3:
        label = "Closed";
        className = "status-closed";
        break;
      default:
        label = "Unknown";
        className = "";
    }
    
    return { label, className };
  };

  // Handle opening the detail modal
  const handleOpenDetailModal = (incident) => {
    setSelectedIncident(incident);
    setShowDetailModal(true);
  };

  // Handle opening the response modal
  const handleOpenResponseModal = (incident) => {
    setSelectedIncident(incident);
    setShowResponseModal(true);
    // Clear any previous success message
    setSuccess("");
  };

  // Handle status update submission
  const handleSubmitStatusUpdate = async ({ status, notes }) => {
    if (!selectedIncident) {
      return;
    }

    setIsSubmitting(true);
    try {
      const responseData = await axios.patch(`${apiBaseUrl}/${selectedIncident._id}`, {
        status,
        notes
      });

      console.log("Status updated:", responseData.data);
      
      // Update the incident in the local state
      setIncidents(incidents.map(incident => 
        incident._id === selectedIncident._id 
          ? { 
              ...incident, 
              status,
              updatedAt: new Date().toISOString()
            } 
          : incident
      ));
      
      setSuccess("Incident status updated successfully!");
      setShowResponseModal(false);
    } catch (error) {
      console.error("Error updating status:", error);
      setError("Failed to update incident status. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get unique incident types for filter dropdown
  const incidentTypes = [...new Set(incidents.map(incident => incident.type))];
  
  // Get unique locations for filter dropdown
  const locations = [...new Set(incidents.map(incident => incident.location))];

  return (
    <div className="incident-reports-container">
      <h2>Incident Reports</h2>
      
      {success && (
        <div className="success-message">
          {success}
          <button onClick={() => setSuccess("")} className="close-btn">×</button>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError("")} className="close-btn">×</button>
        </div>
      )}
      
      <div className="filter-section">
        {/* <h4>Filter Incidents</h4> */}
        <div className="filter-controls">
          <div className="filter-row">
            <div className="filter-group">
              <label>From Date:</label>
              <input 
                type="date" 
                name="startDate" 
                value={filters.startDate} 
                onChange={handleFilterChange} 
              />
            </div>
            
            <div className="filter-group">
              <label>To Date:</label>
              <input 
                type="date" 
                name="endDate" 
                value={filters.endDate} 
                onChange={handleFilterChange} 
              />
            </div>
            
            <div className="filter-group">
              <label>Status:</label>
              <select 
                name="status" 
                value={filters.status} 
                onChange={handleFilterChange}
              >
                <option value="">All Status</option>
                <option value="0">Reported</option>
                <option value="1">Under Investigation</option>
                <option value="2">Resolved</option>
                <option value="3">Closed</option>
              </select>
            </div>
          </div>
          
          <div className="filter-row">
            <div className="filter-group">
              <label>Type:</label>
              <select 
                name="type" 
                value={filters.type} 
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
                {incidentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Severity:</label>
              <select 
                name="severity" 
                value={filters.severity} 
                onChange={handleFilterChange}
              >
                <option value="">All Severity</option>
                <option value="1">Very Low</option>
                <option value="2">Low</option>
                <option value="3">Medium</option>
                <option value="4">High</option>
                <option value="5">Critical</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Location:</label>
              <select 
                name="location" 
                value={filters.location} 
                onChange={handleFilterChange}
              >
                <option value="">All Locations</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="filter-actions">
            <button onClick={applyFilters} className="filter-button">Apply Filters</button>
            <button onClick={resetFilters} className="reset-button">Reset</button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading incidents...</div>
      ) : incidents.length > 0 ? (
        <div className="incidents-list">
          {incidents.map((incident) => {
            const severityInfo = getSeverityInfo(incident.severity);
            const statusInfo = getStatusInfo(incident.status);
            
            return (
              <div key={incident._id} className="incident-card">
                <div className="incident-header">
                  <h3>{incident.type} at {incident.location}</h3>
                  <div className="incident-indicators">
                    <span className={`incident-severity ${severityInfo.className}`}>
                      {severityInfo.label}
                    </span>
                    <span className={`incident-status ${statusInfo.className}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
                
                <div className="incident-content">
                  <div className="incident-info">
                    <p className="incident-description">
                      {incident.description.length > 150 
                        ? `${incident.description.substring(0, 150)}...` 
                        : incident.description}
                    </p>
                    <p className="incident-date">
                      <span>Reported on: {formatDate(incident.createdAt)}</span>
                      {incident.updatedAt !== incident.createdAt && (
                        <span> | Updated: {formatDate(incident.updatedAt)}</span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="incident-actions">
                  <button 
                    className="detail-button"
                    onClick={() => handleOpenDetailModal(incident)}
                  >
                    View Details
                  </button>
                  
                  {/* <button 
                    className="status-update-button"
                    onClick={() => handleOpenResponseModal(incident)}
                  >
                    Update Status
                  </button> */}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="no-incidents">
          <p>No incidents found matching your criteria.</p>
        </div>
      )}
      
      {/* Detail Modal */}
      <IncidentDetailModal 
        show={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        incident={selectedIncident}
      />
      
      {/* Response Modal (Admin/Staff only) */}
      {/* {isAdminOrStaff && (
        <ResponseModal 
          show={showResponseModal}
          onClose={() => setShowResponseModal(false)}
          onSubmit={handleSubmitStatusUpdate}
          incident={selectedIncident}
          isSubmitting={isSubmitting}
        />
      )} */}
    </div>
  );
};

export default IncidentReportsPage;