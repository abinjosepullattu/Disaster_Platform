const express = require('express');
const router = express.Router();
const ResourceType = require('../models/ResourceType');

// @route   POST /api/resourceTypes/add
// @desc    Add a new resource type
// @access  Admin only
router.post('/add', async (req, res) => {
  try {
    const { name } = req.body;

    // Check if the resource type already exists
    let existingResource = await ResourceType.findOne({ name });
    if (existingResource) {
      return res.status(400).json({ message: 'Resource type already exists' });
    }

    const resource = new ResourceType({ name });
    await resource.save();
    res.status(201).json({ message: 'Resource type added successfully', resource });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/resourceTypes/list
// @desc    Get all resource types
// @access  Public
router.get('/list', async (req, res) => {
  try {
    const resources = await ResourceType.find();
    res.json(resources);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
// @route   DELETE /api/resourceTypes/delete/:id
// @desc    Delete a resource type
// @access  Admin only
router.delete('/delete/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const deletedResource = await ResourceType.findByIdAndDelete(id);
      if (!deletedResource) {
        return res.status(404).json({ message: "Resource type not found" });
      }
      res.status(200).json({ message: "Resource type deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
module.exports = router;
