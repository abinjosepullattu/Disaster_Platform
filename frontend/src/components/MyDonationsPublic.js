import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "../context/UserContext";
import "../styles/MyDonationsPublic.css";

const MyDonations = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showBill, setShowBill] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    const fetchDonations = async () => {
      if (!user || !user.id) {
        setError("Please log in to view your donations");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/donations/user/${user.id}`);
        
        // Fetch campaign details for each donation
        const donationsWithCampaignDetails = await Promise.all(
          response.data.map(async (donation) => {
            try {
              const campaignResponse = await axios.get(
                `http://localhost:5000/api/donations/campaigns/${donation.campaignId}`
              );
              return {
                ...donation,
                campaign: campaignResponse.data
              };
            } catch (err) {
              console.error("Error fetching campaign details:", err);
              return {
                ...donation,
                campaign: { title: "Unknown Campaign" }
              };
            }
          })
        );
        
        setDonations(donationsWithCampaignDetails);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching donations:", err);
        setError("Failed to load your donations");
        setLoading(false);
      }
    };

    fetchDonations();
  }, [user]);

  const handleGenerateBill = (donation) => {
    setSelectedDonation(donation);
    setShowBill(true);
  };

  const handlePrint = useCallback(() => {
    if (printRef.current) {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        alert("Please allow pop-ups to print the receipt");
        return;
      }
      
      // Get the HTML content from our receipt container
      const content = printRef.current.innerHTML;
      
      // Add necessary styles directly to the print window
      printWindow.document.write(`
        <html>
          <head>
            <title>Donation Receipt</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                color: #333;
                line-height: 1.5;
                padding: 20px;
              }
              .donation-bill {
                max-width: 800px;
                margin: 0 auto;
                border: 1px solid #ddd;
                padding: 30px;
              }
              .bill-header h1 {
                color: #2c3e50;
                margin-bottom: 5px;
              }
              .org-details h2 {
                color: #3498db;
                margin-bottom: 5px;
              }
              .org-details p {
                margin: 3px 0;
              }
              .bill-info, .donor-details, .donation-details {
                margin: 20px 0;
              }
              .bill-row {
                display: flex;
                margin: 8px 0;
              }
              .bill-label {
                font-weight: bold;
                width: 120px;
              }
              h3 {
                border-bottom: 1px solid #eee;
                padding-bottom: 5px;
                color: #2c3e50;
              }
              .bill-footer {
                margin-top: 40px;
                border-top: 1px solid #eee;
                padding-top: 20px;
              }
              .small-text {
                font-size: 0.8em;
                color: #7f8c8d;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            ${content}
          </body>
        </html>
      `);
      
      // Wait for content to load, then print
      printWindow.document.close();
      
      // Allow time for styles to apply
      setTimeout(() => {
        printWindow.print();
        
        // Close the window after printing (or after a delay if user cancels)
        setTimeout(() => {
          if (!printWindow.closed) {
            printWindow.close();
          }
        }, 500);
      }, 300);
    }
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="loading">Loading your donations...</div>;
  }

  if (error && donations.length === 0) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button className="login-button" onClick={() => navigate("/login")}>
          Go to Login
        </button>
      </div>
    );
  }

  if (donations.length === 0 && !loading) {
    return (
      <div className="no-donations-container">
        <h2>My Donations</h2>
        <p>You haven't made any donations yet.</p>
        {/* <button className="view-campaigns-button" onClick={() => navigate()}>
          View Available Campaigns
        </button> */}
      </div>
    );
  }

  return (
    <div className="my-donations-container">
      {showBill ? (
        <div className="donation-bill-container">
          <div id="donation-bill" className="donation-bill" ref={printRef}>
            <div className="bill-header">
              <h1>Donation Receipt</h1>
              <div className="org-details">
                <h2>Disaster Relief Fund</h2>
                <p> Observatory Hills, Vikas Bhavan P.O, Thiruvananthapuram – 695033</p>
                <p>Email: drap7907@gmail.com | Phone: +91 7907067848</p>
              </div>
            </div>
            
            <div className="bill-info">
              <div className="bill-row">
                <span className="bill-label">Receipt No:</span>
                <span className="bill-value">{selectedDonation.razorpay_payment_id}</span>
              </div>
              <div className="bill-row">
                <span className="bill-label">Date:</span>
                <span className="bill-value">{formatDate(selectedDonation.createdAt)}</span>
              </div>
            </div>
            
            <div className="donor-details">
              <h3>Donor Information</h3>
              <div className="bill-row">
                <span className="bill-label">Name:</span>
                <span className="bill-value">{user.name}</span>
              </div>
              <div className="bill-row">
                <span className="bill-label">Email:</span>
                <span className="bill-value">{user.email}</span>
              </div>
              {user.phone && (
                <div className="bill-row">
                  <span className="bill-label">Phone:</span>
                  <span className="bill-value">{user.phone}</span>
                </div>
              )}
            </div>
            
            <div className="donation-details">
              <h3>Donation Details</h3>
              <div className="bill-row">
                <span className="bill-label">Campaign:</span>
                <span className="bill-value">{selectedDonation.campaign.title}</span>
              </div>
              <div className="bill-row">
                <span className="bill-label">Amount:</span>
                <span className="bill-value">₹{selectedDonation.amount.toFixed(2)}</span>
              </div>
              <div className="bill-row">
                <span className="bill-label">Status:</span>
                <span className="bill-value">{selectedDonation.status}</span>
              </div>
            </div>
            
            <div className="bill-footer">
              <p>Thank you for your generous donation!</p>
              <p>Your contribution helps us provide essential relief to those affected by disasters.</p>
              <p className="small-text">This is an official receipt for your donation. Please keep it for tax purposes.</p>
            </div>
          </div>
          
          <div className="bill-actions">
            <button className="print-button" onClick={handlePrint}>
              Print Receipt
            </button>
            <button className="print-button" onClick={() => setShowBill(false)}>
              Back to Donations
            </button>
          </div>
        </div>
      ) : (
        <>
          <h2>My Donations</h2>
          <div className="donations-list">
            {donations.map((donation) => (
              <div key={donation._id} className="donation-card">
                <div className="donation-details">
                  <h3>{donation.campaign.title}</h3>
                  <p className="donation-amount">₹{donation.amount.toFixed(2)}</p>
                  <p className="donation-date">Donated on: {formatDate(donation.createdAt)}</p>
                  <p className={`donation-status ${donation.status.toLowerCase()}`}>
                    Status: {donation.status}
                  </p>
                  <p className="donation-id">Payment ID: {donation.razorpay_payment_id}</p>
                </div>
                <div className="donation-actions">
                  <button
                    className="generate-bill-button"
                    onClick={() => handleGenerateBill(donation)}
                  >
                    Generate Receipt
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            className="back-button"
            onClick={() => navigate(-1)}
          >
            Back to Campaigns
          </button>
        </>
      )}
    </div>
  );
};

export default MyDonations;