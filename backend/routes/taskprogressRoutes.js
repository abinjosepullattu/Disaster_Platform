const express = require('express');
const router = express.Router();
const TaskProgress = require('../models/TaskProgress');
const Task = require('../models/Task');
const mongoose = require('mongoose');

// Create or update task progress
router.post('/', async (req, res) => {
  try {
    const { 
      taskId, 
      volunteerId, 
      progressDescription, 
      progressPercentage, 
      completed,
      deliveryStatus,
      mealsServed,
      peopleFound,
      peopleHospitalized,
      peopleMissing,
      peopleLost,
      updates
    } = req.body;

    // Check if progress already exists for this task
    let taskProgress = await TaskProgress.findOne({ taskId, volunteerId });

    if (taskProgress) {
      // Update existing progress
      taskProgress.progressDescription = progressDescription;
      taskProgress.progressPercentage = progressPercentage;
      taskProgress.completed = completed;
      taskProgress.lastUpdated = Date.now();
      
      // Update task-specific fields if provided
      if (deliveryStatus) taskProgress.deliveryStatus = deliveryStatus;
      if (mealsServed !== undefined) taskProgress.mealsServed = mealsServed;
      if (peopleFound !== undefined) taskProgress.peopleFound = peopleFound;
      if (peopleHospitalized !== undefined) taskProgress.peopleHospitalized = peopleHospitalized;
      if (peopleMissing !== undefined) taskProgress.peopleMissing = peopleMissing;
      if (peopleLost !== undefined) taskProgress.peopleLost = peopleLost;
      
      // Handle updates array
      if (updates && updates.length > 0) {
        taskProgress.updates = updates;
      }

      await taskProgress.save();
    } else {
      // Create new progress
      taskProgress = new TaskProgress({
        taskId,
        volunteerId,
        progressDescription,
        progressPercentage,
        completed,
        deliveryStatus,
        mealsServed,
        peopleFound,
        peopleHospitalized,
        peopleMissing,
        peopleLost,
        updates
      });

      await taskProgress.save();
    }

    // If task is marked as completed, update the task status
    if (completed) {
      console.log("helooooooo");
      await Task.findByIdAndUpdate(taskId, { status: 'Completed' });
      const Volunteer = require('../models/Volunteer'); // Import the Volunteer model

      await Volunteer.findOneAndUpdate({userId : volunteerId}, { taskStatus: 4 });
    }

    res.status(200).json(taskProgress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get task progress by task ID
router.get('/task/:taskId', async (req, res) => {
  try {
    const taskProgress = await TaskProgress.findOne({ taskId: req.params.taskId });
    
    if (!taskProgress) {
      // Instead of returning 404, return an empty progress object
      return res.json({
        taskId: req.params.taskId,
        progressDescription: '',
        progressPercentage: 0,
        completed: false,
        deliveryStatus: 'Not Started',
        mealsServed: 0,
        peopleFound: 0,
        peopleHospitalized: 0,
        peopleMissing: 0,
        peopleLost: 0,
        updates: []
      });
    }
    
    res.json(taskProgress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get all progress updates by volunteer ID
router.get('/volunteer/:volunteerId', async (req, res) => {
  try {
    const taskProgresses = await TaskProgress.find({ volunteerId: req.params.volunteerId })
      .populate('taskId', 'taskType description status')
      .sort({ lastUpdated: -1 });
    
    res.json(taskProgresses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get progress summary for a specific task type
router.get('/summary/:taskType', async (req, res) => {
  try {
    const { taskType } = req.params;
    
    // Get all tasks of the specified type
    const tasks = await Task.find({ taskType });
    const taskIds = tasks.map(task => task._id);
    
    // Get progress for these tasks
    const progressData = await TaskProgress.find({ taskId: { $in: taskIds } });
    
    // Calculate summary based on task type
    let summary = {
      totalTasks: tasks.length,
      completedTasks: progressData.filter(p => p.completed).length,
      averageProgress: 0
    };
    
    // Calculate average progress
    if (progressData.length > 0) {
      const totalProgress = progressData.reduce((sum, p) => sum + p.progressPercentage, 0);
      summary.averageProgress = Math.round(totalProgress / progressData.length);
    }
    
    // Add task-specific summaries
    switch (taskType) {
      case 'Transportation':
        summary.deliveryStatuses = {
          notStarted: progressData.filter(p => p.deliveryStatus === 'Not Started').length,
          inTransit: progressData.filter(p => p.deliveryStatus === 'In Transit').length,
          delivered: progressData.filter(p => p.deliveryStatus === 'Delivered').length,
        };
        break;
        
      case 'Food Service':
        summary.totalMealsServed = progressData.reduce((sum, p) => sum + p.mealsServed, 0);
        break;
        
      case 'Rescue Operation':
        summary.totalPeopleFound = progressData.reduce((sum, p) => sum + p.peopleFound, 0);
        summary.totalPeopleHospitalized = progressData.reduce((sum, p) => sum + p.peopleHospitalized, 0);
        summary.totalPeopleMissing = progressData.reduce((sum, p) => sum + p.peopleMissing, 0);
        summary.totalPeopleLost = progressData.reduce((sum, p) => sum + p.peopleLost, 0);
        break;
    }
    
    res.json(summary);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete task progress
router.delete('/:id', async (req, res) => {
  try {
    const taskProgress = await TaskProgress.findById(req.params.id);
    
    if (!taskProgress) {
      return res.status(404).json({ msg: 'Task progress not found' });
    }
    
    await taskProgress.remove();
    res.json({ msg: 'Task progress removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.get('/volunteer/:volunteerId/completed', async (req, res) => {
  try {
    const { volunteerId } = req.params;

    // Validate if volunteerId is a valid ObjectId
    if (!mongoose.isValidObjectId(volunteerId)) {
      return res.status(400).json({ error: 'Invalid Volunteer ID' });
    }

    // Find task progress records that are marked as completed for this volunteer
    const completedTaskProgresses = await TaskProgress.find({
      volunteerId: new mongoose.Types.ObjectId(volunteerId),
      completed: true
    }).populate({
      path: 'taskId',
      select: 'taskType description location startDate endDate priority status'
    }).sort({ lastUpdated: -1 });

    res.json(completedTaskProgresses);
  } catch (err) {
    console.error('Error fetching completed tasks:', err.message);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

module.exports = router;