import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import "../styles/ViewComplaintStatus.css";

const ViewComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        if (!user || !user.id) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/complaints/user/${user.id}`);
        setComplaints(response.data.complaints);
        setLoading(false);
      } catch (error) {
        setError("Failed to load complaints. Please try again later.");
        setLoading(false);
        console.error("Error fetching complaints:", error);
      }
    };

    fetchComplaints();
  }, [user]);

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
  };

  const closeDetails = () => {
    setSelectedComplaint(null);
  };

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Function to determine status badge color
  const getStatusColorClass = (status) => {
    switch (status) {
      case "Pending":
        return "status-pending";
      case "Under Review":
        return "status-review";
      case "Resolved":
        return "status-resolved";
      case "Dismissed":
        return "status-dismissed";
      default:
        return "status-pending";
    }
  };

  if (loading) {
    return (
      <div className="complaints-container">
        <h2>My Complaints</h2>
        <div className="loading">Loading your complaints...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="complaints-container">
        <h2>My Complaints</h2>
        <div className="error-message">{error}</div>
        <button onClick={() => navigate(-1)} className="back-btn">
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="complaints-container">
      <h2>My Complaints</h2>
      
      {complaints.length === 0 ? (
        <div className="no-complaints">
          <p>You haven't submitted any complaints yet.</p>
          <button onClick={() => navigate("/report-complaint")} className="new-complaint-btn">
            Submit a Complaint
          </button>
        </div>
      ) : (
        <>
          <div className="complaints-list">
            {complaints.map((complaint) => (
              <div key={complaint.reportedId} className="complaint-card">
                <div className="complaint-header">
                  <span className="complaint-id">{complaint.reportedId}</span>
                  <span className={`status-badge ${getStatusColorClass(complaint.status)}`}>
                    {complaint.status}
                  </span>
                </div>
                <div className="complaint-details">
                  <h3>{complaint.complaintType}</h3>
                  <p className="complaint-date">Submitted: {formatDate(complaint.createdAt)}</p>
                  <p className="complaint-preview">
                    {complaint.description.substring(0, 100)}
                    {complaint.description.length > 100 ? "..." : ""}
                  </p>
                </div>
                <button 
                  onClick={() => handleViewDetails(complaint)} 
                  className="view-details-btn"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
          
          <div className="buttons-container">
            <button onClick={() => navigate("/report-complaint")} className="new-complaint-btn">
              Submit New Complaint
            </button>
            <button onClick={() => navigate(-1)} className="back-btn">
              Back
            </button>
          </div>
        </>
      )}

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <div className="complaint-modal-overlay">
          <div className="complaint-modal">
            <div className="modal-header">
              <h3>Complaint Details</h3>
              <button className="close-btn" onClick={closeDetails}>×</button>
            </div>
            <div className="modal-content">
              <div className="modal-id-status">
                <div className="modal-id">
                  <span className="label">Reference ID:</span>
                  <span className="value">{selectedComplaint.reportedId}</span>
                </div>
                <div className="modal-status">
                  <span className="label">Status:</span>
                  <span className={`status-badge ${getStatusColorClass(selectedComplaint.status)}`}>
                    {selectedComplaint.status}
                  </span>
                </div>
              </div>
              
              <div className="modal-section">
                <span className="label">Complaint Type:</span>
                <span className="value">{selectedComplaint.complaintType}</span>
              </div>
              
              <div className="modal-section">
                <span className="label">Description:</span>
                <p className="value description-text">{selectedComplaint.description}</p>
              </div>

              <div className="modal-dates">
                <div>
                  <span className="label">Submitted on:</span>
                  <span className="value">{formatDate(selectedComplaint.createdAt)}</span>
                </div>
                {selectedComplaint.updatedAt !== selectedComplaint.createdAt && (
                  <div>
                    <span className="label">Last updated:</span>
                    <span className="value">{formatDate(selectedComplaint.updatedAt)}</span>
                  </div>
                )}
              </div>
              
              {selectedComplaint.adminComments && (
                <div className="modal-section admin-comments">
                  <span className="label">Admin Comments:</span>
                  <p className="value">{selectedComplaint.adminComments}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={closeDetails} className="modal-close-btn">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewComplaints;