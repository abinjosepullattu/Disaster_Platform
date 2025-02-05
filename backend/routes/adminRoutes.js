const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Volunteer = require("../models/Volunteer");
const nodemailer = require("nodemailer");

const router = express.Router();

// Email Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

// Admin Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await User.findOne({ email, role: "admin" });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Middleware to Verify Admin
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token.split(" ")[1], process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Forbidden" });
    req.adminId = decoded.adminId;
    next();
  });
};

// Get Pending Volunteers
router.get("/pending-volunteers", verifyAdmin, async (req, res) => {
  try {
    const volunteers = await User.find({ role: "volunteer", isApproved: false }).populate("volunteerData");
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Approve/Reject Volunteers
router.post("/approve-volunteer", verifyAdmin, async (req, res) => {
  const { volunteerId, status } = req.body;

  try {
    const volunteer = await User.findById(volunteerId);
    if (!volunteer) return res.status(404).json({ message: "Volunteer not found" });

    if (status === "approved") {
      volunteer.isApproved = true;
      await volunteer.save();
    } else if (status === "rejected") {
      await User.findByIdAndDelete(volunteerId);
      await Volunteer.findOneAndDelete({ userId: volunteerId });
    }

    // Send Email
    const emailMessage = status === "approved"
      ? "Your volunteer application has been approved! You can now log in."
      : "Your volunteer application has been rejected.";

    await transporter.sendMail({
      from: '"Disaster Relief" <drap7907@gmail.com>',
      to: volunteer.email,
      subject: "Volunteer Application Status",
      text: emailMessage,
    });

    res.json({ message: `Volunteer ${status}` });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
