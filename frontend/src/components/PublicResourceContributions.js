import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";
import "../styles/PublicResourceContributions.css";

const ViewUserContributions = () => {
  const { user } = useUser();
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      // Use either _id or id, whichever is available
      const userId = user._id || user.id;
      fetchContributions(userId);
    } else {
      setLoading(false);
      setError("Please log in to view your contributions.");
    }
  }, [user]);

  const fetchContributions = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/resourceTypes/user-contributions/${userId}`
      );
      // Add this in your fetchContributions function after the API call
console.log("First contribution data:", JSON.stringify(response.data[0], null, 2));
if (response.data[0] && response.data[0].resources && response.data[0].resources.length > 0) {
  console.log("First resource data:", JSON.stringify(response.data[0].resources[0], null, 2));
  console.log("ResourceType data:", response.data[0].resources[0].resourceType);
}
      //console.log("Response data:", response.data); // For debugging
      setContributions(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching contributions:", err);
      setError("Failed to load contributions. Please try again.");
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

  // Simple function to get resource name safely
  const getResourceName = (resource) => {
    // If resourceType is an object with a name property
    if (resource.resourceType && resource.resourceType.name) {
      return resource.resourceType.name;
    }
    // Fallback to a default value
    return "Unknown Resource";
  };

  return (
    <div className="view-contributions-container">
      <h2>My Contributions</h2>
      {error && <p className="error">{error}</p>}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : contributions.length > 0 ? (
        <div className="contributions-list">
          {contributions.map((contribution) => (
            <div key={contribution._id} className="contribution-card">
              <div className="contribution-header">
                <h3>Contribution to {contribution.shelter?.location || "Unknown Shelter"}</h3>
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
                <p><strong>Submitted as:</strong> {contribution.contributorName}</p>
                <p><strong>Contact:</strong> {contribution.contributorContact}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-contributions">
          <p>You haven't made any contributions yet.</p>
          <button 
            onClick={() => window.location.href = "/public/contribute-res"} 
            className="contribute-button"
          >
            Contribute Now
          </button>
        </div>
      )}
    </div>
  );
};

export default ViewUserContributions;