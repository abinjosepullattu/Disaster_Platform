const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  taskType: { type: String, required: true },
  description: { type: String, required: true },
  incident: { type: String, required: true },
  volunteer: { type: String, required: true },
  // Store extra details as a mixed object
  extraDetails: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
