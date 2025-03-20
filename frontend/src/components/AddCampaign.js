import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/campaign.css";

const CampaignPage = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [goalAmount, setGoalAmount] = useState("");
    // Add these state variables
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Fetch campaigns
    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/donations/campaigns");
            setCampaigns(response.data);
        } catch (error) {
            console.error("Error fetching campaigns:", error);
        }
    };

    const handleAddCampaign = async (e) => {
        e.preventDefault();
        try {
            const newCampaign = {
                title,
                description,
                targetAmount: Number(goalAmount), // Rename to match your schema
                startDate,
                endDate
            };
            await axios.post("http://localhost:5000/api/donations/campaigns", newCampaign);
            fetchCampaigns(); // Refresh campaigns list
            setTitle("");
            setDescription("");
            setGoalAmount("");
            setStartDate("");
            setEndDate("");
            alert("Campaign added Successfully");
        } catch (error) {
            console.error("Error adding campaign:", error);
        }
    };
        // Add the delete handler function
        const handleDeleteCampaign = async (campaignId) => {
            if (window.confirm("Are you sure you want to delete this campaign?")) {
                try {
                    await axios.delete(`http://localhost:5000/api/donations/campaigns/${campaignId}`);
                    alert("Campaign deleted successfully");
                    fetchCampaigns(); // Refresh the list after deletion
                } catch (error) {
                    console.error("Error deleting campaign:", error);
                    alert("Failed to delete campaign");
                }
            }
        };

    return (
        <div className="campaign-container">
            <h2>Donation Campaigns</h2>

            {/* Add Campaign Form */}
            <div className="campaign-form">
                <h3>Add New Campaign</h3>
                <form onSubmit={handleAddCampaign}>
                    <input
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    <textarea
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                    <input
                        type="number"
                        placeholder="Goal Amount"
                        value={goalAmount}
                        onChange={(e) => setGoalAmount(e.target.value)}
                        required
                    />
                    <input
                        type="date"
                        placeholder="Start Date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                    />
                    <input
                        type="date"
                        placeholder="End Date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                    />
                    <button type="submit">Add Campaign</button>
                </form>
            </div>

            {/* View Campaigns in Table Format */}
            <div className="campaign-list">
                <h3>Existing Campaigns</h3>
                {campaigns.length === 0 ? (
                    <p>No campaigns available.</p>
                ) : (
                    <table className="campaign-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Description</th>
                                <th>Goal Amount</th>
                                <th>Collected Amount</th>
                                <th>End Date</th>
                                <th>Actions</th>

                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.map((campaign) => (
                                <tr key={campaign._id}>
                                    <td>{campaign.title}</td>
                                    <td>{campaign.description}</td>
                                    <td>₹{campaign.targetAmount}</td>
                                    <td>₹{campaign.collectedAmount || 0}</td>
                                    <td>{new Date(campaign.endDate).toISOString().slice(0, 10)}</td>
                                    <td>
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDeleteCampaign(campaign._id)}
                                        >
                                            Delete
                                        </button>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default CampaignPage;
