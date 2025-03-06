const express = require('express');
const router = express.Router();
const TaskProgress = require('../models/TaskProgress');
const Task = require('../models/Task');
const Volunteer = require('../models/Volunteer');

// Get progress for a specific task
router.get('/:taskId/:volunteerId', async (req, res) => {
  try {
    const { taskId, volunteerId } = req.params;
    
    // Check if task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Get the task progress
    let progress = await TaskProgress.findOne({ taskId, volunteerId });
    
    // If no progress entry exists yet, return an empty template
    if (!progress) {
      return res.status(200).json({
        taskId,
        volunteerId,
        progressDescription: '',
        progressPercentage: 0,
        completed: false,
        updates: []
      });
    }
    
    res.status(200).json(progress);
  } catch (error) {
    console.error('Error fetching task progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update task progress
router.post('/:taskId/:volunteerId', async (req, res) => {
  try {
    const { taskId, volunteerId } = req.params;
    const progressData = req.body;
    
    // Check if task exists and is assigned to this volunteer
    const task = await Task.findOne({ _id: taskId, volunteer: volunteerId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found or not assigned to this volunteer' });
    }
    
    // Check if progress already exists
    let taskProgress = await TaskProgress.findOne({ taskId, volunteerId });
    
    if (taskProgress) {
      // If an update description is provided, add it to the updates array
      if (progressData.updateDescription) {
        taskProgress.updates.push({
          description: progressData.updateDescription,
          timestamp: new Date()
        });
        delete progressData.updateDescription; // Remove it from the main update
      }
      
      // Update existing progress
      Object.keys(progressData).forEach(key => {
        if (key !== '_id' && key !== 'updates') {
          taskProgress[key] = progressData[key];
        }
      });
      
      // Update the lastUpdated timestamp
      taskProgress.lastUpdated = new Date();
      
      await taskProgress.save();
      res.status(200).json({ message: 'Progress updated successfully', progress: taskProgress });
    } else {
      // Create new progress
      const newProgress = new TaskProgress({
        taskId,
        volunteerId,
        ...progressData,
        lastUpdated: new Date()
      });
      
      // Add initial update if provided
      if (progressData.updateDescription) {
        newProgress.updates = [{
          description: progressData.updateDescription,
          timestamp: new Date()
        }];
        delete newProgress.updateDescription;
      }
      
      await newProgress.save();
      res.status(201).json({ message: 'Progress created successfully', progress: newProgress });
    }
  } catch (error) {
    console.error('Error updating task progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark task as completed
router.put('/complete/:taskId/:volunteerId', async (req, res) => {
  try {
    const { taskId, volunteerId } = req.params;
    
    // Update the progress to completed
    const taskProgress = await TaskProgress.findOneAndUpdate(
      { taskId, volunteerId },
      { completed: true, progressPercentage: 100 },
      { new: true }
    );
    
    if (!taskProgress) {
      return res.status(404).json({ message: 'Task progress not found' });
    }
    
    res.status(200).json({ message: 'Task marked as completed', progress: taskProgress });
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;