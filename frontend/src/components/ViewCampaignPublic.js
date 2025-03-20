import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/ViewCampaignPublic.css";

const ViewCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/donations/campaigns");
      setCampaigns(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      setLoading(false);
    }
  };

  const handleMakeDonation = (campaignId) => {
    navigate(`/public/make-donation/${campaignId}`);
  };

 // Calculate progress percentage
  const calculateProgress = (collected, target) => {
    // Ensure collected and target are treated as numbers
    const collectedNum = Number(collected) || 0;
    const targetNum = Number(target) || 1; // Prevent division by zero
    
    const percentage = (collectedNum / targetNum) * 100;
    return Math.min(percentage, 100).toFixed(1);
  };

  // Calculate days remaining
  const calculateDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
  

  return (
    <div className="view-campaigns-container">
      <h2>Current Donation Campaigns</h2>
      
      {loading ? (
        <p>Loading campaigns...</p>
      ) : campaigns.length === 0 ? (
        <p>No active campaigns available.</p>
      ) : (
        <div className="campaigns-grid">
          {campaigns.map((campaign) => (
            <div className="campaign-card" key={campaign._id}>
              <h3>{campaign.title}</h3>
              <p className="campaign-description">{campaign.description}</p>
              
              <div className="campaign-progress">
                {/* <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${calculateProgress(campaign.collectedAmount || 0, campaign.targetAmount)}%` }}
                  ></div>
                </div> */}
                <div className="progress-stats">
                  <span>₹{campaign.collectedAmount || 0} raised</span>
                  <span>₹{campaign.targetAmount} goal</span>
                </div>
              </div>
              
              <div className="campaign-meta">
                {/* <p><strong>{calculateProgress(campaign.collectedAmount || 0, campaign.targetAmount)}%</strong> funded</p> */}
                <p><strong>{calculateDaysRemaining(campaign.endDate)}</strong> days left</p>
              </div>
              
              <button 
                className="donate-button" 
                onClick={() => handleMakeDonation(campaign._id)}
              >
                Make Donation
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewCampaigns;