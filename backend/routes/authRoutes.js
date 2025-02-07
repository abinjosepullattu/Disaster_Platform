const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Volunteer = require("../models/Volunteer");
const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(400).json({ message: "Invalid credentials" });

    if (user.role === "volunteer") {
      const volunteer = await Volunteer.findOne({ userId: user._id });
      if (!volunteer || volunteer.applicationStatus !== 1) {
        return res.status(403).json({ message: "Your application is not approved yet." });
      }
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;