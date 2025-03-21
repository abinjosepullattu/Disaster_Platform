const express = require('express');
const router = express.Router();
const ResourceType = require('../models/ResourceType');
const ResourceAllocation=require('../models/ResourceAllocation')
const Shelter=require('../models/Shelter')
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
  


  // Get all shelters for dropdown
router.get("/shelters", async (req, res) => {
  try {
    const shelters = await Shelter.find();
    res.json(shelters);
  } catch (error) {
    console.error("Error fetching shelters:", error);
    res.status(500).json({ error: "Failed to fetch shelters" });
  }
});

// Allocate resources to a shelter
router.post("/allocate", async (req, res) => {
  try {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    const { shelter, resources } = req.body;
    
    // Create allocation without calculating amountPerUnit
    const allocation = new ResourceAllocation({
      shelter: shelter,
      resources: resources
    });
    
    await allocation.save();
    res.status(201).json({ message: "Resources allocated successfully!" });
  } catch (error) {
    console.error("Error allocating resources:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// Add this to your existing routes file, e.g., routes/resourceTypes.js

// Get all allocations for a specific shelter
router.get("/allocations/:shelterId", async (req, res) => {
  try {
    const { shelterId } = req.params;
    
    // Find all allocations for the given shelter and populate resourceType details
    const allocations = await ResourceAllocation.find({ shelter: shelterId })
      .populate({
        path: 'resources.resourceType',
        select: 'name category'
      })
      .populate({
        path: 'shelter',
        select: 'location'
      })
      .sort({ createdAt: -1 }); // Sort by most recent first
    
    res.json(allocations);
  } catch (error) {
    console.error("Error fetching allocations:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

module.exports = router;
