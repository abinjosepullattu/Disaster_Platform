const express = require("express");
const router = express.Router();
const Campaign = require("../models/Campaign");
const Donation = require("../models/Donation");
const User = require("../models/user"); // Import User model
const Razorpay = require("razorpay");
const mongoose = require("mongoose");

const razorpay = new Razorpay({
  key_id: "rzp_test_cITg7ERmHMWIX4", // Replace with your Razorpay key
  key_secret: "qMPeHvrrKNUPilyJjTjboNAS", // Replace with your Razorpay secret
});

// Add this to your donation routes file
const crypto = require('crypto');

router.post("/verify-payment", async (req, res) => {
  try {
    // Extract payment information from request body
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature, 
      donorId, 
      campaignId, 
      amount 
    } = req.body;

   
    console.log(req.body);  
      // Save the donation to database
      const donation = new Donation({
        razorpay_payment_id,
        campaignId,
        donorId,
        amount: amount / 100, // Convert back from paise to rupees
        status: "Paid"
      });

      await donation.save();

      // Update campaign collected amount
      await mongoose.model('Campaign').findByIdAndUpdate(
        campaignId,
        { $inc: { collectedAmount: amount / 100 } },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully"
      });
    
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

router.post("/create-order", async (req, res) => {
  try {
    const { amount, currency, campaignId, donorId } = req.body;

    const order = await razorpay.orders.create({
      amount,
      currency,
      payment_capture: 1,
      notes: {
        campaignId,
        donorId
      }
    });

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating order");
  }
});


// Create a new donation campaign
router.post("/campaigns", async (req, res) => {
  try {
    const campaign = new Campaign(req.body);
    await campaign.save();
    res.status(201).json(campaign);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all donation campaigns
router.get("/campaigns", async (req, res) => {
  try {
    const campaigns = await Campaign.find();
    res.status(200).json(campaigns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a donation for a campaign
router.post("/donate", async (req, res) => {
  try {
    const { campaignId, donorId, amount } = req.body;

    // Ensure donor exists
    const donor = await User.findById(donorId);
    if (!donor) return res.status(404).json({ error: "User not found" });

    // Save donation
    const donation = new Donation({ campaignId, donorId, amount });
    await donation.save();

    // Update collected amount in campaign
    await Campaign.findByIdAndUpdate(campaignId, { 
      $inc: { collectedAmount: amount } 
    });

    res.status(201).json(donation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all donations for a campaign with donor details
router.get("/donations/:campaignId", async (req, res) => {
  try {
    const donations = await Donation.find({ campaignId: req.params.campaignId }).populate("donorId", "name email");
    res.status(200).json(donations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all donations made by a specific user
router.get("/user-donations/:userId", async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.params.userId }).populate("campaignId", "title");
    res.status(200).json(donations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a campaign
router.delete("/campaigns/:id", async (req, res) => {
    try {
      const campaign = await Campaign.findByIdAndDelete(req.params.id);
      
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      
      // Optionally, also delete all donations related to this campaign
      await Donation.deleteMany({ campaignId: req.params.id });
      
      res.status(200).json({ message: "Campaign deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

module.exports = router;
