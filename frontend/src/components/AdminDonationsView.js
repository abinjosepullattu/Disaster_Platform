import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AdminDonationsView.css";

const AdminCampaignDonationsView = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [campaignsLoading, setCampaignsLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedDonation, setSelectedDonation] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            setCampaignsLoading(true);
            setError("");
            const response = await axios.get("http://localhost:5000/api/donations/campaigns");
            setCampaigns(response.data);
        } catch (err) {
            console.error("Error fetching campaigns:", err);
            setError("Failed to load campaigns. Please try again.");
        } finally {
            setCampaignsLoading(false);
        }
    };

    const fetchCampaignDonations = async (campaignId) => {
        try {
            setLoading(true);
            setError("");
            const response = await axios.get(`http://localhost:5000/api/donations/h/campaigns/${campaignId}`);

            const donationsWithUserDetails = await Promise.all(
                response.data.map(async (donation) => {
                    try {
                        const userResponse = await axios.get(`http://localhost:5000/api/donations/users/${donation.donorId}`);
                        return { ...donation, user: userResponse.data };
                    } catch (err) {
                        console.error("Error fetching user details:", err);
                        return { ...donation, user: { name: "Unknown User", email: "unknown@example.com" } };
                    }
                })
            );

            // Aggregate donations by user email
            const aggregatedDonations = donationsWithUserDetails.reduce((acc, donation) => {
                const existingEntry = acc.find((d) => d.user.email === donation.user.email);
                if (existingEntry) {
                    existingEntry.amount += donation.amount; // Sum donation amounts
                } else {
                    acc.push({ ...donation }); // Add new user entry
                }
                return acc;
            }, []);

            setDonations(aggregatedDonations);
        } catch (err) {
            console.error("Error fetching campaign donations:", err);
            setError("Failed to load donations for this campaign");
        } finally {
            setLoading(false);
        }
    };


    const handleSelectCampaign = (campaign) => {
        setSelectedCampaign(campaign);
        fetchCampaignDonations(campaign._id);
    };

    const handleChangeCampaign = (e) => {
        const campaignId = e.target.value;
        if (!campaignId) {
            setSelectedCampaign(null);
            setDonations([]);
            return;
        }
        const campaign = campaigns.find(c => c._id === campaignId);
        handleSelectCampaign(campaign);
    };

    const handleViewDetails = (donation) => {
        setSelectedDonation(donation);
        setShowDetails(true);
    };

    const handleVerifyPayment = async (donationId) => {
        try {
            await axios.put(`http://localhost:5000/api/donations/verify/${donationId}`);
            setDonations((prevDonations) =>
                prevDonations.map((donation) =>
                    donation._id === donationId ? { ...donation, status: "Paid" } : donation
                )
            );
        } catch (error) {
            console.error("Error verifying payment:", error);
            alert("Failed to verify payment.");
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
        });
    };

    const formatCurrency = (amount) => `₹${parseFloat(amount).toFixed(2)}`;

    return (
        <div className="admin-donations-container">
            <h2>View Donations</h2>
            {!showDetails ? (
                <div className="campaign-selection-section">
                    <div className="dropdown-container">
                        <label htmlFor="campaign-select">Select Campaign:</label>
                        <select id="campaign-select" className="campaign-select" onChange={handleChangeCampaign} disabled={campaignsLoading} value={selectedCampaign ? selectedCampaign._id : ""}>
                            <option value="">-- Select a Campaign --</option>
                            {campaigns.map(campaign => <option key={campaign._id} value={campaign._id}>{campaign.title}</option>)}
                        </select>
                    </div>
                    {campaignsLoading && <div className="loading">Loading campaigns...</div>}
                    {selectedCampaign && !loading && donations.length > 0 && (
                        <table>
                            <thead>
                                <tr>
                                    <th>Donor</th>
                                    <th>Email</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {donations.map(donation => (
                                    <tr key={donation._id}>
                                        <td className="donation-donor">{donation.user.name}</td>
                                        <td className="donation-email">{donation.user.email}</td>
                                        <td className="donation-amount">₹{parseFloat(donation.amount).toFixed(2)}</td>
                                        <td className="donation-date">
                                            {new Date(donation.createdAt).toLocaleDateString(undefined, {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                            <br />
                                            at
                                            <br />
                                            {new Date(donation.createdAt).toLocaleTimeString(undefined, {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td>
                                            <span className={`donation-status status-${donation.status.toLowerCase()}`}>
                                                {donation.status}
                                            </span>
                                        </td>
                                        <td className="donation-actions">
                                            <button className="view-details-button" onClick={() => handleViewDetails(donation)}>
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            ) : (
                <div className="donation-details-container">
                    <h3>Donation Details</h3>
                    <div className="donation-details-card">
                        <div className="detail-section">
                            <h4>Payment Information</h4>
                            <div className="detail-row"><div className="detail-label">Payment ID:</div><div className="detail-value">{selectedDonation.razorpay_payment_id || "N/A"}</div></div>
                            <div className="detail-row"><div className="detail-label">Amount:</div><div className="detail-value">{formatCurrency(selectedDonation.amount)}</div></div>
                            <div className="detail-row"><div className="detail-label">Status:</div><div className={`detail-value status-${selectedDonation.status.toLowerCase()}`}>{selectedDonation.status}</div></div>
                            <div className="detail-row"><div className="detail-label">Date:</div><div className="detail-value">{formatDate(selectedDonation.createdAt)}</div></div>
                        </div>
                    </div>
                    <button className="back-button" onClick={() => setShowDetails(false)}>Back</button>
                </div>
            )}
        </div>
    );
};

export default AdminCampaignDonationsView;
