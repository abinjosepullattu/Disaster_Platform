const express = require("express");
const Incident = require("../models/Incident");
const User = require("../models/user");
const Volunteer = require("../models/Volunteer"); // ✅ Import Volunteer model
const nodemailer = require("nodemailer");
const router = express.Router();
// const authenticate = require("../middleware/authenticate"); // ✅ Authentication middleware

// Email Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 🔹 Severity Labels Mapping
const severityLabels = ["Very Low", "Low", "Medium", "High", "Very High"];

// ✅ Helper Function to Send Email Notifications
const sendEmailNotification = async (recipients, subject, message) => {
  try {
    if (recipients.length > 0) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: recipients,
        subject: subject,
        text: message,
      });
    }
  } catch (error) {
    console.error("❌ Error sending email notification:", error);
  }
};

// ✅ Get Verified Incidents for Index Page
router.get("/verified", async (req, res) => {
  try {
    const incidents = await Incident.find({ status: 1 }).sort({ severity: -1, createdAt: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: "Error fetching verified incidents." });
  }
});

// ✅ Verify an Incident (Admin) and Notify Volunteers
router.put("/verify/:id", async (req, res) => {
  try {
    console.log("🔹 Received verification request for:", req.params.id);

    const incident = await Incident.findByIdAndUpdate(req.params.id, { status: 1 }, { new: true });
    if (!incident) return res.status(404).json({ error: "Incident not found" });

    // ✅ Convert severity integer to text label
    const severityText = severityLabels[incident.severity - 1];

    // ✅ Google Maps Link for Incident Location
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${incident.latitude},${incident.longitude}`;

    // ✅ Fetch verified volunteers
    const volunteers = await Volunteer.find({ applicationStatus: 1 }).populate("userId", "email");
    const emailList = volunteers.map((vol) => vol.userId.email);

    if (emailList.length === 0) {
      return res.json({ message: "Incident verified successfully! No volunteers to notify." });
    }

    // ✅ Send email alerts to volunteers
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: emailList.join(","),
      subject: "🚨 New Verified Incident Alert",
      text: `A new incident has been verified!\n\n
      🔥 Type: ${incident.type}
      📍 Location: ${incident.location}
      ⚠️ Severity: ${severityText}
      📝 Description: ${incident.description}
      
      🗺️ View on Map: ${googleMapsUrl}`,
    });

    res.json({ message: "Incident verified successfully and alerts sent!", incident });
  } catch (error) {
    console.error("❌ Error verifying incident:", error);
    res.status(500).json({ error: "Error verifying incident." });
  }
});

// ✅ Admin Adds a New Incident & Sends Email Notification
router.post("/add", async (req, res) => {
  try {
    const { location, type, severity, description, latitude, longitude,userId } = req.body;
    if (!location || !type || !severity || !description || !latitude || !longitude) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    // ✅ Create a New Verified Incident
    const newIncident = new Incident({
      location,
      type,
      severity,
      description,
      latitude,
      longitude,
      status: 1, // Marked as Verified
      reportedBy: userId,
    });

    await newIncident.save();

    // ✅ Fetch verified volunteers
    const volunteers = await Volunteer.find({ applicationStatus: 1 }).populate("userId", "email");
    const emailList = volunteers.map((vol) => vol.userId.email);

    if (emailList.length > 0) {
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      const severityText = severityLabels[severity - 1];

      // ✅ Send email to volunteers
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: emailList.join(","),
        subject: "🚨 New Incident Reported by Admin",
        text: `A new verified incident has been reported!\n\n
        🔥 Type: ${type}
        📍 Location: ${location}
        ⚠️ Severity: ${severityText}
        📝 Description: ${description}
        
        🗺️ View on Map: ${googleMapsUrl}`,
      });
    }

    res.status(201).json({ message: "Incident added successfully and alerts sent!", incident: newIncident });
  } catch (error) {
    res.status(500).json({ error: "Error adding incident." });
  }
});

// ✅ Public Users Report an Incident (Initially Marked as Pending)
router.post("/report", async (req, res) => {
  try {
    const { location, type, severity, description, latitude, longitude,userId } = req.body;
    if (!location || !type || !severity || !description || !latitude || !longitude) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    const newIncident = new Incident({
      location,
      type,
      severity,
      description,
      latitude,
      longitude,
      status: 0, // Pending
      reportedBy: userId,
    });

    await newIncident.save();
    res.status(201).json({ message: "Incident reported successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error reporting incident." });
  }
});

// ✅ Get All Incidents (Sorted by Severity & Date)
router.get("/all", async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ severity: -1, createdAt: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: "Error fetching incidents." });
  }
});

// ✅ Get Incidents Reported by Logged-in User
router.get("/my-reports/:id", async (req, res) => {
  try {
    const incidents = await Incident.find({ reportedBy: req.params.id }).sort({ severity: -1, createdAt: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: "Error fetching incidents." });
  }
});

// ✅ Get Public-Reported Incidents (Pending Verification)
router.get("/public-reports",  async (req, res) => {
  try {
    const incidents = await Incident.find({ status: 0 })
      .sort({ severity: -1, createdAt: -1 })
      .populate("reportedBy", "name email phone");
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: "Error fetching public reports." });
  }
});

// ✅ Get Ongoing Incidents (status = 1)
router.get("/ongoing",  async (req, res) => {
  try {
    const incidents = await Incident.find({ status: 1 }).sort({ severity: -1, createdAt: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: "Error fetching ongoing incidents." });
  }
});

// ✅ Get Completed Incidents (status = 3)
router.get("/completed", async (req, res) => {
  try {
    const incidents = await Incident.find({ status: 3 }).sort({ createdAt: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: "Error fetching completed incidents." });
  }
});
// ✅ Mark an Incident as Completed
router.put("/complete/:id", async (req, res) => {
  try {
    const incident = await Incident.findByIdAndUpdate(req.params.id, { status: 3 }, { new: true });
    if (!incident) return res.status(404).json({ error: "Incident not found" });

    // ✅ Fetch all verified volunteers
    const volunteers = await Volunteer.find({ applicationStatus: 1 }).populate("userId", "email");
    const emailList = volunteers.map((vol) => vol.userId.email);
    // ✅ Send Email Notification
    const emailMessage = `
      🚨 Rescue Operation Completed! 🚨
      
      🔥 Type: ${incident.type}
      📍 Location: ${incident.location}
      📝 Description: ${incident.description}
      🗺️ View on Map: https://www.google.com/maps?q=${incident.latitude},${incident.longitude}

      Thank you for your support!
    `;

    if (emailList.length > 0) {
      await sendEmailNotification(emailList, "🚨 Rescue Operation Completed", emailMessage);
    }

    res.json({ message: "Incident marked as completed & notification sent!" });
  } catch (error) {
    res.status(500).json({ error: "Error completing incident." });
  }
});

// Endpoint to get active incidents
router.get('/active', async (req, res) => {
  try {
      // Get all incidents that are not resolved (status !== 3)
      const activeIncidents = await Incident.find({
          status: { $ne: 3 } // Not resolved
      }).sort({ severity: -1, createdAt: -1 }); // Sort by severity (descending) then by newest
      
      res.json(activeIncidents);
  } catch (error) {
      console.error("Error fetching active incidents:", error);
      res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
