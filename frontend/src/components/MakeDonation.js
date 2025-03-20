import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "../context/UserContext"; // Import the context hook

const MakeDonation = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser(); // Get user from context
  const [campaign, setCampaign] = useState(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  //console.log(user);

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/donations/campaigns`);
        const campaignData = response.data.find((c) => c._id === campaignId);
        
        if (campaignData) {
          setCampaign(campaignData);
        } else {
          setError("Campaign not found");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching campaign details:", error);
        setError("Failed to load campaign details");
        setLoading(false);
      }
    };

    fetchCampaignDetails();
  }, [campaignId]);

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = resolve;
      script.onerror = () => reject(new Error("Razorpay SDK failed to load"));
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      setError("Please enter a valid donation amount");
      return;
    }

    if (!user || !user.id) {
      setError("You must be logged in to make a donation");
      return;
    }

    try {
      await loadRazorpayScript();

      const response = await axios.post("http://localhost:5000/api/donations/create-order", {
        amount: parseFloat(donationAmount) * 100, // Razorpay needs amount in paise (₹1 = 100 paise)
        currency: "INR",
        campaignId,
        donorId: user.id,
      });

      const { id: order_id, amount, currency } = response.data;

      const options = {
        key: "rzp_test_cITg7ERmHMWIX4", // Replace with your Razorpay test key
        amount,
        currency,
        name: "Disaster Relief Fund",
        description: `Donation to ${campaign?.title}`,
        order_id,
        handler: async function (response) {
          try {
            const verificationResponse = await axios.post("http://localhost:5000/api/donations/verify-payment", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              donorId: user.id,
              campaignId,
              amount: parseFloat(amount),
            });

            if (verificationResponse.data.success) {
              alert("Thank you for your donation!");
              navigate(-2);
            } else {
              setError("Payment verification failed. Please contact support.");
            }
          } catch (error) {
            console.error("Payment verification failed:", error);
            setError("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone
        },
        theme: {
          color: "#3399cc",
        },
        // Fix for SVG errors - ensure SVG has proper dimensions
        modal: {
          ondismiss: function() {
            console.log("Checkout form closed");
          },
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Error initiating payment:", error);
      setError("Failed to initiate payment. Please try again.");
    }
  };

  if (loading) {
    return <div className="loading">Loading campaign details...</div>;
  }

  if (error && !campaign) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="make-donation-container">
      <div className="donation-form-wrapper">
        <h2>Make a Donation</h2>

        {error && <p className="error-message">{error}</p>}

        {!user ? (
          <div className="auth-message">
            <p>You need to be logged in to make a donation.</p>
            <button
              type="button"
              className="login-button"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </button>
          </div>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="amount">Donation Amount (₹)</label>
              <input
                type="number"
                id="amount"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                required
                min="1"
                step="any"
                placeholder="Enter donation amount"
              />
            </div>

            <div className="quick-amounts">
              <p>Quick Select:</p>
              <div className="amount-buttons">
                <button type="button" onClick={() => setDonationAmount("100")}>₹100</button>
                <button type="button" onClick={() => setDonationAmount("500")}>₹500</button>
                <button type="button" onClick={() => setDonationAmount("1000")}>₹1000</button>
                <button type="button" onClick={() => setDonationAmount("5000")}>₹5000</button>
                <button type="button" onClick={() => setDonationAmount("10000")}>₹10000</button>

              </div>
            </div>

            <button type="button" className="pay-now-button" onClick={handlePayment}>
              Pay Now
            </button>
            <button onClick={() => navigate(-2)}>Back</button>

          </>
        )}
      </div>
    </div>
  );
};

export default MakeDonation;