const express = require('express');
const router = express.Router();
const Shelter = require('../models/Shelter');
const Volunteer = require("../models/Volunteer");
const User = require("../models/user");

// ✅ Add Shelter and Update Assigned Volunteer Task Status
router.post("/add", async (req, res) => {
    try {
        const { location, latitude, longitude, totalCapacity, contactDetails, assignedVolunteer } = req.body;

        // ✅ Step 1: Create and save the shelter
        const newShelter = new Shelter({
            location,
            latitude,
            longitude,
            totalCapacity,
            inmates: 0, // Default inmates count
            contactDetails,
            assignedVolunteer
        });

        await newShelter.save();
        console.log("✅ Shelter created successfully!");

        // ✅ Step 2: Update taskStatus of the assigned volunteer
        if (assignedVolunteer) {
            await Volunteer.findByIdAndUpdate(assignedVolunteer, { taskStatus: 1 });
            console.log(`✅ Volunteer ${assignedVolunteer} taskStatus updated to 1`);
        }

        res.status(201).json({ message: "✅ Shelter added successfully!" });

    } catch (error) {
        console.error("❌ Error adding shelter:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ✅ Get all shelters with populated volunteer details
router.get("/view", async (req, res) => {
    try {
      const shelters = await Shelter.find().lean();
  
      const sheltersWithVolunteers = await Promise.all(
        shelters.map(async (shelter) => {
          if (!shelter.assignedVolunteer) {
            return { ...shelter, volunteer: null };
          }
  
          // Fetch the volunteer details
          const volunteer = await Volunteer.findById(shelter.assignedVolunteer).lean();
          if (!volunteer) return { ...shelter, volunteer: null };
  
          // If taskStatus is 1, show "Volunteer approval waiting"
          if (volunteer.taskStatus === 1) {
            return { ...shelter, volunteer: { approvalStatus: "Volunteer approval waiting" } };
          }
  
          // Fetch user details from users collection
          const user = await User.findById(volunteer.userId).lean();
          return {
            ...shelter,
            volunteer: user
              ? { name: user.name, email: user.email, phone: user.phone }
              : null,
          };
        })
      );
  
      res.json(sheltersWithVolunteers);
    } catch (error) {
      console.error("❌ Error fetching shelters:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  

// ✅ Update shelter inmates count (updated by assigned volunteer)
router.put('/update-inmates/:id', async (req, res) => {
    try {
        const { inmates } = req.body;
        const shelter = await Shelter.findById(req.params.id);
        if (!shelter) return res.status(404).json({ message: 'Shelter not found' });

        if (inmates > shelter.totalCapacity) {
            return res.status(400).json({ message: 'Inmates count cannot exceed total capacity' });
        }

        shelter.inmates = inmates;
        await shelter.save();
        res.json({ message: '✅ Inmates count updated successfully!' });
    } catch (error) {
        console.error("❌ Error updating inmates count:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// ✅ Delete Shelter and Reset Volunteer Task Status
router.delete("/delete/:shelterId", async (req, res) => {
    try {
        const { shelterId } = req.params;
        const shelter = await Shelter.findById(shelterId);

        if (!shelter) {
            return res.status(404).json({ error: "❌ Shelter not found!" });
        }

        // ✅ Reset volunteer's taskStatus to 0
        if (shelter.assignedVolunteer) {
            await Volunteer.findByIdAndUpdate(shelter.assignedVolunteer, { taskStatus: 0 });
            console.log(`✅ Volunteer ${shelter.assignedVolunteer} taskStatus reset to 0`);
        }

        // ✅ Delete the shelter
        await Shelter.findByIdAndDelete(shelterId);

        res.json({ message: "✅ Shelter deleted and volunteer task status reset!" });
    } catch (error) {
        console.error("❌ Error deleting shelter:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
//list assigned shelters
router.get("/assigned-shelters/:volunteerId", async (req, res) => {
  try {
      const { volunteerId } = req.params;

      // Find shelters assigned to this volunteer
      const shelters = await Shelter.find({ assignedVolunteer: volunteerId });

      res.json(shelters);
  } catch (error) {
      res.status(500).json({ message: "Server Error", error });
  }
});
//to accept task
router.put("/accept-task/:shelterId", async (req, res) => {
  try {
      const { shelterId } = req.params;

      // Update taskStatus to 2 (Accepted)
      await Shelter.findByIdAndUpdate(shelterId, { taskStatus: 2 });

      res.json({ message: "Task accepted successfully" });
  } catch (error) {
      res.status(500).json({ message: "Server Error", error });
  }
});



router.get("/volunteer-id/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const volunteer = await Volunteer.findOne({ userId });

    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }

    res.json({ volunteerId: volunteer._id });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
