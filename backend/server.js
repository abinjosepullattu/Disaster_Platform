const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes"); // ✅ Added admin routes
const skillRoutes = require("./routes/skillRoutes"); // ✅ Added skill routes
const authRoutes = require("./routes/authRoutes"); // ✅ Added authentication routes
const ProfileRoutes=require("./routes/ProfileRoutes");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // ✅ Serve uploaded files
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes); // ✅ Register admin routes
app.use("/api/skills", skillRoutes); // ✅ Register skill routes
app.use("/api/auth", authRoutes); // ✅ Register authentication routes
app.use("/api/profile", ProfileRoutes); 

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((error) => console.error("MongoDB connection failed:", error));
