import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AdminCompletedTaskView.css';
import { useUser } from "../context/UserContext";

import FeedbackModal from './FeedbackAdmin'; // We'll create this component next

const AdminCompletedTasksView = () => {
  const { user } = useUser();
  const [taskTypes, setTaskTypes] = useState([]);
  const [selectedTaskType, setSelectedTaskType] = useState('');
  const [latestTask, setLatestTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verifyingTask, setVerifyingTask] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // Fetch all task types on component mount
  useEffect(() => {
    const fetchTaskTypes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/tasks/list');
        setTaskTypes(response.data);
      } catch (err) {
        console.error('Error fetching task types:', err);
        setError('Failed to load task types');
      }
    };

    fetchTaskTypes();
  }, []);

  // Fetch completed tasks when a task type is selected or on initial load
  useEffect(() => {
    fetchLatestCompletedTask(selectedTaskType);
  }, [selectedTaskType]);

  // Check for existing feedback when a task is loaded
  useEffect(() => {
    if (latestTask) {
      checkExistingFeedback(latestTask._id);
    } else {
      setExistingFeedback(null);
    }
  }, [latestTask]);

  const fetchLatestCompletedTask = async (taskType) => {
    setLoading(true);
    setError('');
    try {
      // Fetch tasks with status 4 (completed)
      const response = await axios.get(`http://localhost:5000/api/tasks/completed/${taskType}`);
      
      if (response.data.length > 0) {
        // Find the task with the most recent createdAt date
        const sortedTasks = response.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        // Set only the latest task
        setLatestTask(sortedTasks[0]);
      } else {
        setLatestTask(null);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching completed tasks:', err);
      setLoading(false);
    }
  };

  const checkExistingFeedback = async (taskId) => {
    setFeedbackLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/feedback/task/${taskId}`);
      setExistingFeedback(response.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        // No feedback found is not an error
        setExistingFeedback(null);
      } else {
        console.error('Error checking for existing feedback:', err);
      }
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Handle task type selection change
  const handleTaskTypeChange = (e) => {
    setSelectedTaskType(e.target.value);
  };

  // Handle verify completion button click
  const handleVerifyCompletion = async (taskId) => {
    setVerifyingTask(true);
    try {
      await axios.patch(`http://localhost:5000/api/tasks/verify-completion/${taskId}`, {
        status: 0 // Set status back to 0 (Available)
      });
      alert("✅ Completion Verified");

      // Clear the current task and fetch the next latest one
      setLatestTask(null);
      fetchLatestCompletedTask(selectedTaskType);
      
    } catch (err) {
      console.error('Error verifying task completion:', err);
      setError('Failed to verify task completion');
    } finally {
      setVerifyingTask(false);
    }
  };

  // Open feedback modal
  const handleOpenFeedbackModal = () => {
    setShowFeedbackModal(true);
  };

  // Close feedback modal
  const handleCloseFeedbackModal = () => {
    setShowFeedbackModal(false);
  };

  // Submit feedback
  const handleSubmitFeedback = async (feedbackData) => {
    setFeedbackSubmitting(true);
    try {
      const response = await axios.post('http://localhost:5000/api/feedback/submit', {
        taskId: latestTask._id,
        volunteerId: latestTask.volunteer?._id,
        adminId: user.id,
        rating: feedbackData.rating,
        comments: feedbackData.comments,
        status: 0 // Initial status - not viewed
      });
      
      alert("✅ Feedback submitted successfully");
      setShowFeedbackModal(false);
      setExistingFeedback(response.data.feedback);
      
    } catch (err) {
      console.error('Error submitting feedback:', err);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  // Render appropriate details based on task type
  const renderTaskDetails = (task) => {
    switch (task.taskType) {
      case 'Transportation and Distribution':
        return (
          <div className="task-details">
            <p><strong>Shelter:</strong> {task.shelter}</p>
            <p><strong>Resource Type:</strong> {task.resourceType}</p>
            <p><strong>Delivery Date & Time:</strong> {new Date(task.deliveryDateTime).toLocaleString()}</p>
          </div>
        );
      case 'Preparing and Serving Food':
        return (
          <div className="task-details">
            <p><strong>Shelter:</strong> {task.shelter}</p>
          </div>
        );
      case 'Rescue Operation Management':
      case 'Rescue Operator':
        return null; // No additional details for rescue tasks
      default:
        return null;
    }
  };

  // Render feedback information if it exists
  const renderFeedbackInfo = () => {
    if (feedbackLoading) {
      return <div className="feedback-info loading">Checking feedback status...</div>;
    }
    
    if (existingFeedback) {
      return (
        <div className="feedback-info submitted">
          <p className="feedback-status">
            <span className="feedback-icon">✓</span> 
            Feedback submitted ({existingFeedback.rating}/4)
          </p>
          {existingFeedback.status === 1 && (
            <span className="feedback-viewed-badge">Viewed by volunteer</span>
          )}
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="admin-completed-tasks container">
      <h2>Completed Task Verification</h2>
      
      <div className="task-filter">
        <label htmlFor="taskType">Filter by Task Type:</label>
        <select
          id="taskType"
          className="form-control"
          value={selectedTaskType}
          onChange={handleTaskTypeChange}
        >
          <option value="" disabled>Select Task Type</option>
          {taskTypes.map(type => (
            <option key={type._id} value={type.name}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      <div className="sort-info">
        {/* <p><i>Showing only the most recent completed task</i></p> */}
      </div>

      {loading && <div className="loading">Loading latest completed task...</div>}
      
      {error && <div className="error-message">{error}</div>}
      
      {!loading && !error && !latestTask && (
        <div className="no-tasks">No completed tasks found.</div>
      )}

      {!loading && latestTask && (
        <div className="tasks-list">
          <div className="task-card completed-task">
            <div className="task-header">
              <h3>{latestTask.taskType}</h3>
              <span className="task-status status-completed">Completed</span>
            </div>
            
            <div className="task-content">
              <div className="task-description">
                <p><strong>Description:</strong> {latestTask.description}</p>
                <p><strong>Created:</strong> {new Date(latestTask.createdAt).toLocaleString()}</p>
              </div>
              
              <div className="task-incident">
                <h4>Incident Details</h4>
                {latestTask.incident ? (
                  <>
                    <p><strong>Location:</strong> {latestTask.incident.location}</p>
                    <p><strong>Type:</strong> {latestTask.incident.type}</p>
                    <p><strong>Severity:</strong> {latestTask.incident.severity}</p>
                  </>
                ) : (
                  <p>No incident details available</p>
                )}
              </div>
              
              <div className="task-volunteer">
                <h4>Volunteer Details</h4>
                {latestTask.volunteer ? (
                  <>
                    <p><strong>Name:</strong> {latestTask.volunteer.name}</p>
                    <p><strong>Email:</strong> {latestTask.volunteer.email}</p>
                    <p><strong>Phone:</strong> {latestTask.volunteer.phone}</p>
                  </>
                ) : (
                  <p>No volunteer information available</p>
                )}
              </div>
              
              {/* Render type-specific details */}
              {renderTaskDetails(latestTask)}
              
              {/* Feedback information */}
              {renderFeedbackInfo()}
              
              {/* Verification section with button */}
              <div className="task-verification">
                <button 
                  className="btn btn-primary verify-btn"
                  onClick={() => handleVerifyCompletion(latestTask._id)}
                  disabled={verifyingTask}
                >
                  {verifyingTask ? 'Verifying...' : 'Verify Completion'}
                </button>
                
                {/* Feedback Button - only show if no feedback exists */}
                {!existingFeedback && latestTask.volunteer && (
                  <button 
                    className="btn btn-secondary feedback-btn"
                    onClick={handleOpenFeedbackModal}
                  >
                    Provide Feedback
                  </button>
                )}
                
                <p className="verification-note">
                  Verifying will mark this task as available for new assignments
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && latestTask && (
        <FeedbackModal
          show={showFeedbackModal}
          onClose={handleCloseFeedbackModal}
          onSubmit={handleSubmitFeedback}
          volunteer={latestTask.volunteer}
          task={latestTask}
          isSubmitting={feedbackSubmitting}
        />
      )}
    </div>
  );
};

export default AdminCompletedTasksView;