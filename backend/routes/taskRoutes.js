const express = require('express');
const router = express.Router();
const Volunteer = require('../models/Volunteer');
const Incident = require('../models/Incident');
const Shelter = require('../models/Shelter');
const Task = require('../models/Task');
const TaskType = require('../models/TaskType');
const ResourceType = require('../models/ResourceType');
const TransportationTask = require('../models/TransportationTask');
const FoodTask = require('../models/FoodTask');
const RescueTask = require('../models/RescueTask');

// Generate the next available typeId
const getNextTypeId = async () => {
  const lastTask = await TaskType.find().sort({ typeId: -1 }).limit(1);
  return lastTask.length > 0 ? lastTask[0].typeId + 1 : 1; // Start from 1 if empty
};

// ✅ Add Task Type
router.post("/insert", async (req, res) => {
  try {
    const { name } = req.body;

    // Check if the task type already exists
    let existingTask = await TaskType.findOne({ name });
    if (existingTask) {
      return res.status(400).json({ message: "Task type already exists" });
    }

    const typeId = await getNextTypeId(); // Generate a unique typeId
    const task = new TaskType({ typeId, name });
    await task.save();

    res.status(201).json({ message: "Task type added successfully", task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get all Task Types
router.get("/list", async (req, res) => {
  try {
    const tasks = await TaskType.find().sort({ typeId: 1 }); // Sort by typeId
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Delete a Task Type
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTask = await TaskType.findByIdAndDelete(id);
    if (!deletedTask) {
      return res.status(404).json({ message: "Task type not found" });
    }
    res.status(200).json({ message: "Task type deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// Get List of Unique Skills from Volunteers
router.get('/skills', async (req, res) => {
  try {
    const skills = await Volunteer.distinct("skills");
    res.json(skills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Get Volunteers by Skill and Task Status
router.get('/volunteers/:skill', async (req, res) => {
  try {
    const { skill } = req.params;
    const volunteers = await Volunteer.find({
      skills: skill,
      taskStatus: 0 // Only available volunteers
    }).populate("userId", "name email phone"); // Fetch name, email, and phone from users
    ;
    res.json(volunteers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Get Volunteers
router.get('/res-types', async (req, res) => {
  try {
    const restypes = await ResourceType.find();
    res.json(restypes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch ResourceType" });
  }
});



// Get Volunteers
router.get('/volunteers', async (req, res) => {
  try {
    const volunteers = await Volunteer.find();
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch volunteers" });
  }
});

router.get('/incidents', async (req, res) => {
  try {
    const incidents = await Incident.find();
    if (!incidents || incidents.length === 0) {
      return res.status(404).json({ error: "No incidents found" });
    }
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch incidents" });
  }
});


// Get Shelters
router.get('/shelters', async (req, res) => {
  try {
    const shelters = await Shelter.find();
    res.json(shelters);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch shelters" });
  }
});

// Get Volunteers with "Rescue Operator" skill
router.get('/rescueVolunteers', async (req, res) => {
  try {
    const rescueVolunteers = await Volunteer.find({ skills: "Rescue Operator" });
    res.json(rescueVolunteers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rescue volunteers" });
  }
});

// Assign Task
router.post("/add", async (req, res) => {
  try {
    const { task, extraData } = req.body;

    // Step 1: Save common task details
    const newTask = new Task({ ...task });
    const savedTask = await newTask.save();

    // Step 2: If Transportation Task, save extra details with task ID
    if (task.taskType === "Transportation and Distribution") {
      const transportTask = new TransportationTask({
        taskId: savedTask._id, // Reference to main task
        shelter: extraData.shelter,
        resourceType: extraData.resourceType,
        deliveryDateTime: extraData.deliveryDateTime
      });
      await transportTask.save();
    }
    // Step 2: If Preparing and Serving Food Task, save extra details with task ID
    if (task.taskType === "Preparing and Serving Food") {
      const foodTask = new FoodTask({
        taskId: savedTask._id, // Reference to main task
        shelter: extraData.shelter,

      });
      await foodTask.save();
    }
    // Step 2: If Rescue Task, save extra details with task ID
    if (task.taskType === "Rescue Operation Management") {
      const rescueTask = new RescueTask({
        taskId: savedTask._id // Reference to main task

      });
      await rescueTask.save();
    }
    // Step 2: If Rescue Task, save extra details with task ID
    if (task.taskType === "Rescue Operator") {
      const rescueTask = new RescueTask({
        taskId: savedTask._id // Reference to main task

      });
      await rescueTask.save();
    }
    // Step 3: Update volunteer's taskStatus to 1 (Assigned)
    await Volunteer.findByIdAndUpdate(task.volunteer, { taskStatus: 1 });

    res.status(201).json({ message: "Task assigned successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to assign task" });
  }
});

module.exports = router;
