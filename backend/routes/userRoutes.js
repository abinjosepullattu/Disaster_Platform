const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const multer = require("multer");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const Volunteer = require("../models/Volunteer");
const Public = require("../models/Public");

require("dotenv").config();

// ✅ Configure Email Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ File Upload Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ✅ Signup API Route (With Email Notification for Volunteers)
router.post("/signup", upload.fields([{ name: "photo" }, { name: "idProof" }, { name: "experienceCertificate" }]), async (req, res) => {
  try {
    const { name, email, password, phone, address, age, role, skills } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      age,
      role,
      photo: req.files["photo"][0].path,
      isApproved: role !== "volunteer", // Volunteers need admin approval
    });

    await user.save();

    if (role === "volunteer") {
      await new Volunteer({
        userId: user._id,
        skills,
        idProof: req.files["idProof"][0].path,
        experienceCertificate: req.files["experienceCertificate"][0].path,
      }).save();

      // ✅ Send Email Notification to Volunteer
      const mailOptions = {
        from: `"Disaster Relief Platform" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Volunteer Application Received - Awaiting Approval",
        html: `
          <h3>Hello ${name},</h3>
          <p>Thank you for signing up as a volunteer on our platform.</p>
          <p>Your application is currently under review by an admin. You will receive another email once your application is approved.</p>
          <p>We appreciate your willingness to help in disaster relief efforts.</p>
          <p>Best Regards,<br>Disaster Relief Assistance Team</p>
        `,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error("Email Error:", err);
        } else {
          console.log("Email Sent: " + info.response);
        }
      });
    } else {
      await new Public({ userId: user._id }).save();
    }

    res.status(201).json({ message: "Signup successful! If you're a volunteer, please wait for admin approval." });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
