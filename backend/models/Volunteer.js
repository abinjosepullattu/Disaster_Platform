const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  skills: { type: String, required: true },
  idProof: { type: String, required: true }, // File path
  experienceCertificate: { type: String, required: true }, // File path
});

module.exports = mongoose.model("Volunteer", volunteerSchema);
