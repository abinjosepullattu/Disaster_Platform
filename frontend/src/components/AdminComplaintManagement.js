import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";
import "../styles/AdminComplaintManagement.css";

const AdminComplaintManagement = () => {
  const { user } = useUser();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: ""
  });
  
// Response Modal Component
const ResponseModal = ({ show, onClose, onSubmit, complaint, isSubmitting }) => {
    const [response, setResponse] = useState('');
    const [status, setStatus] = useState('1'); // Default to 'In Progress'
  
    useEffect(() => {
      if (complaint) {
        // Set initial status based on complaint if available
        setStatus(complaint.status || '1');
      }
    }, [complaint]);
  
    // Handle response change
    const handleResponseChange = (e) => {
      setResponse(e.target.value);
    };
  
    // Handle status change
    const handleStatusChange = (e) => {
      setStatus(e.target.value);
    };
  
    // Handle form submission
    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit({ response, status });
    };
  
    if (!show) {
      return null;
    }
  
    return (
      <div className="response-modal-overlay">
        <div className="response-modal">
          <div className="response-modal-header">
            <h3>Respond to Complaint</h3>
            <button className="close-btn" onClick={onClose}>&times;</button>
          </div>
          
          <div className="response-modal-body">
            <div className="complaint-info">
              <p><strong>From:</strong> {complaint?.name || "Unknown"}</p>
              <p><strong>Subject:</strong> {complaint?.subject || "No subject"}</p>
              <p><strong>Complaint:</strong> {complaint?.description || "No description"}</p>
              <p><strong>Date:</strong> {new Date(complaint?.createdAt).toLocaleString()}</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="response">Your Response:</label>
                <textarea
                  id="response"
                  name="response"
                  rows="4"
                  value={response}
                  onChange={handleResponseChange}
                  placeholder="Type your response to this complaint..."
                  required
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="status">Update Status:</label>
                <select
                  id="status"
                  name="status"
                  value={status}
                  onChange={handleStatusChange}
                  required
                >
                  <option value="0">Open</option>
                  <option value="1">In Progress</option>
                  <option value="2">Resolved</option>
                  <option value="3">Closed</option>
                </select>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Response'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };
  
  
  // Response state
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  
  // Base URL for API endpoints
  const complaintsBaseUrl = "http://localhost:5000/api/complaints";

  useEffect(() => {
    // Fetch initial data when component mounts
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${complaintsBaseUrl}/all`);
      setComplaints(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setError("Failed to load complaints. Please try again.");
      setComplaints([]);
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
      
      const response = await axios.get(`${complaintsBaseUrl}/filter?${params}`);
      setComplaints(response.data);
    } catch (err) {
      console.error("Error applying filters:", err);
      setError("Failed to filter complaints.");
    } finally {
      setLoading(false);
    }
  };

  // Reset filters to default
  const resetFilters = async () => {
    setFilters({ startDate: "", endDate: "", status: "" });
    await fetchComplaints();
  };

  // Format date for display
  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  // Get status label based on status code
  const getStatusLabel = (statusCode) => {
    switch (statusCode) {
      case 0:
      case "Pending":
        return "Open";
      case 1:
      case "Under Review":
        return "In Progress";
      case 2:
      case "Resolved":
        return "Resolved";
      case 3:
      case "Dismissed":
        return "Closed";
      default:
        return "Unknown";
    }
  };

  // Get status class for styling
  const getStatusClass = (statusCode) => {
    switch (statusCode) {
      case 0:
        return "status-open";
      case 1:
        return "status-in-progress";
      case 2:
        return "status-resolved";
      case 3:
        return "status-closed";
      default:
        return "";
    }
  };

  // Handle opening the response modal
  const handleOpenResponseModal = (complaint) => {
    setSelectedComplaint(complaint);
    setShowResponseModal(true);
    // Clear any previous success message
    setSuccess("");
  };

  // Handle response submission
  const handleSubmitResponse = async ({ response, status }) => {
    if (!selectedComplaint) {
      return;
    }
  
    setIsSubmittingResponse(true);
    try {
      const responseData = await axios.post(`${complaintsBaseUrl}/respond`, {
        complaintId: selectedComplaint._id, // Make sure this is the MongoDB _id
        adminId: user._id, 
        response: response,
        status: status
      });
  
      console.log("Response submitted:", responseData.data);
      
      // Update the complaint in the local state
      setComplaints(complaints.map(complaint => 
        complaint._id === selectedComplaint._id 
          ? { 
              ...complaint, 
              status: parseInt(status), 
              adminResponse: response,
              responseDate: new Date().toISOString()
            } 
          : complaint
      ));
      
      setSuccess("Response submitted successfully!");
      setShowResponseModal(false);
    } catch (error) {
      console.error("Error submitting response:", error);
      setError("Failed to submit response. Please try again.");
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  return (
    <div className="admin-complaint-container">
      <h2>Complaint Management</h2>
      
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
        <h4>Filter Complaints</h4>
        <div className="filter-controls">
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
              <option value="0">Open</option>
              <option value="1">In Progress</option>
              <option value="2">Resolved</option>
              <option value="3">Closed</option>
            </select>
          </div>
          
          <div className="filter-actions">
            <button onClick={applyFilters} className="filter-button">Apply Filters</button>
            <button onClick={resetFilters} className="reset-button">Reset</button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading complaints...</div>
      ) : complaints.length > 0 ? (
        <div className="complaints-list">
          {complaints.map((complaint) => (
            <div key={complaint._id} className="complaint-card">
              <div className="complaint-header">
                <h3>{complaint.subject}</h3>
                <span className={`complaint-status ${getStatusClass(complaint.status)}`}>
                  {getStatusLabel(complaint.status)}
                </span>
              </div>
              
              <div className="complaint-content">
                <div className="complaint-info">
                  <p><strong>From:</strong> {complaint.name}</p>
                  <p><strong>Email:</strong> {complaint.email}</p>
                  <p><strong>Submitted on:</strong> {formatDate(complaint.createdAt)}</p>
                  <p><strong>Description:</strong> {complaint.description}</p>
                </div>
                
                {complaint.adminResponse && (
                  <div className="admin-response">
                    <h4>Admin Response</h4>
                    <p>{complaint.adminResponse}</p>
                    <p className="response-date">Responded on: {formatDate(complaint.responseDate)}</p>
                  </div>
                )}
              </div>
              
              <div className="complaint-actions">
                <button 
                  className="response-button"
                  onClick={() => handleOpenResponseModal(complaint)}
                >
                  {complaint.adminResponse ? 'Update Response' : 'Respond'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-complaints">
          <p>No complaints found matching your criteria.</p>
        </div>
      )}
      
      {/* Response Modal */}
      <ResponseModal 
        show={showResponseModal}
        onClose={() => setShowResponseModal(false)}
        onSubmit={handleSubmitResponse}
        complaint={selectedComplaint}
        isSubmitting={isSubmittingResponse}
      />
    </div>
  );
};

export default AdminComplaintManagement;