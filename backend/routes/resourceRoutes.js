const express = require('express');
const router = express.Router();
const ResourceType = require('../models/ResourceType');
const ResourceAllocation=require('../models/ResourceAllocation')
const Shelter=require('../models/Shelter')
const Volunteer=require('../models/Volunteer')
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

// Get shelter assigned to a volunteer
// Get shelter assigned to a volunteer (based on userId)
router.get("/shelter-assigned/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Find volunteer using userId
    const volunteer = await Volunteer.findOne({ userId: userId });

    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }

    // Fetch assigned shelter using volunteer ID
    const shelter = await Shelter.findOne({ assignedVolunteer: volunteer._id });

    if (!shelter) {
      return res.status(404).json({ message: "No shelter assigned to this volunteer" });
    }

    res.json(shelter);
  } catch (error) {
    console.error("Error fetching assigned shelter:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

const ContributedResource = require("../models/ContributedResource");
// Add a new contribution (multiple resources in an array)
router.post("/add-contribution", async (req, res) => {
  try {
      const { resources, shelter, contributorName, contributorContact, contributorId } = req.body;

      // // Log the received data for debugging
      // console.log("Received contribution data:", {
      //     resources,
      //     shelter,
      //     contributorName,
      //     contributorContact,
      //     contributorId
      // });

      if (!resources || resources.length === 0 || !shelter || !contributorName || !contributorContact) {
          return res.status(400).json({ message: "All required fields must be filled!" });
      }

      // Create the contribution object, handling the contributorId properly
      const newContribution = new ContributedResource({
          resources,
          shelter,
          contributorName,
          contributorContact,
          // Only add contributorId if it's not null/undefined
          ...(contributorId && { contributorId }),
          status: 0 // Default is pending
      });

      // Log the contribution object before saving
      console.log("Contribution document to be saved:", newContribution);

      await newContribution.save();
      res.status(201).json({ 
          message: "Contribution submitted successfully!", 
          contribution: newContribution 
      });
  } catch (error) {
      console.error("Error adding contribution:", error);
      res.status(500).json({ message: "Server error. Please try again." });
  }
});

// Get all contributions with populated data (enhanced version)
router.get("/contributions", async (req, res) => {
  try {
    const contributions = await ContributedResource.find()
      .populate({
        path: 'shelter',
        select: 'location'
      })
      .populate({
        path: 'resources.resourceType',
        select: 'name category'
      })
      .sort({ createdAt: -1 }); // Sort by newest first
    
    res.json(contributions);
  } catch (error) {
    console.error("Error fetching all contributions:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Approve contribution (Admin action)
router.put("/approve-contribution/:id", async (req, res) => {
    try {
        const contribution = await ContributedResource.findById(req.params.id);
        if (!contribution) {
            return res.status(404).json({ message: "Contribution not found." });
        }

        contribution.status = 1; // Mark as verified
        await contribution.save();

        res.json({ message: "Contribution approved successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
});


router.get('/user-contributions/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Find all contributions without trying to convert userId to ObjectId
    const contributions = await ContributedResource.find({ contributorId: userId })
    .populate({
      path: 'resources.resourceType',
      select: 'name category'
    })
    .populate({
      path: 'shelter',
      select: 'location'
    })
      .sort({ createdAt: -1 });
    
    // Log what we found to help with debugging
    console.log(`Found ${contributions.length} contributions for user ${userId}`);
    
    res.status(200).json(contributions);
  } catch (error) {
    console.error('Error fetching user contributions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get("/shelter-contributions/:shelterId", async (req, res) => {
  try {
    const { shelterId } = req.params;
    
    const contributions = await ContributedResource.find({ shelter: shelterId })
      .populate({
        path: 'resources.resourceType',
        select: 'name category'
      })
      .populate({
        path: 'shelter',
        select: 'location'
      })
      .sort({ createdAt: -1 }); // Sort by most recent first
    
    res.json(contributions);
  } catch (error) {
    console.error("Error fetching shelter contributions:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

module.exports = router;
