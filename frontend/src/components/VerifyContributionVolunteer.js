import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";
import "../styles/VerifyContributionVolunteer.css";

const VerifyContributions = () => {
  const { user } = useUser();
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shelter, setShelter] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (user) {
      const userId = user._id || user.id;
      fetchAssignedShelter(userId);
    } else {
      setLoading(false);
      setError("Please log in to verify contributions.");
    }
  }, [user]);

  const fetchAssignedShelter = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/resourceTypes/shelter-assigned/${userId}`
      );
      setShelter(response.data);
      
      // After getting the shelter, fetch its contributions
      if (response.data && response.data._id) {
        fetchShelterContributions(response.data._id);
      }
    } catch (err) {
      console.error("Error fetching assigned shelter:", err);
      setError("You don't have any assigned shelters to verify contributions for.");
      setLoading(false);
    }
  };

  const fetchShelterContributions = async (shelterId) => {
    try {
      // Create a dedicated endpoint for fetching shelter-specific contributions
      const response = await axios.get(
        `http://localhost:5000/api/resourceTypes/shelter-contributions/${shelterId}`
      );
      
      setContributions(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching shelter contributions:", err);
      setError("Failed to load contributions. Please try again.");
      setLoading(false);
    }
  };

  const verifyContribution = async (contributionId) => {
    try {
      setLoading(true); // Show loading while verification is in progress
      await axios.put(
        `http://localhost:5000/api/resourceTypes/approve-contribution/${contributionId}`
      );
      
      // Show success message
      setSuccessMessage("Contribution verified successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      
      // Refresh the contributions list directly
      if (shelter && shelter._id) {
        fetchShelterContributions(shelter._id);
      }
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

  return (
    <div className="verify-contributions-container">
      <h2>Verify Contributions</h2>
      {error && <p className="error">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : shelter ? (
        <>
          <div className="shelter-info">
            <h3>Assigned Shelter: {shelter.location}</h3>
          </div>

          {contributions.length > 0 ? (
            <div className="contributions-list">
              {contributions.map((contribution) => (
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
              <p>There are no contributions for this shelter yet.</p>
            </div>
          )}
        </>
      ) : (
        <div className="no-shelter">
          <p>You don't have any assigned shelters. Please contact an administrator.</p>
        </div>
      )}
    </div>
  );
};

export default VerifyContributions;