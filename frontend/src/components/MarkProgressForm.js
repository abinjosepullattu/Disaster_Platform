import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import '../styles/MarkProgressForm.css';

const TaskProgressForm = () => {
  const { user } = useUser();  // We'll handle the update differently since updateUser is not working
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [task, setTask] = useState(null);
  const [formData, setFormData] = useState({
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

  // Extract taskId from URL or state
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const taskId = searchParams.get('taskId') || (location.state && location.state.taskId);
    
    if (!taskId) {
      setError('No task selected. Please go back and select a task.');
      return;
    }

    const fetchTaskDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/tasks/${taskId}`);
        setTask(response.data);
        
        try {
          // Check if there's existing progress
          const progressResponse = await axios.get(`http://localhost:5000/api/taskprogress/task/${taskId}`);
          if (progressResponse.data) {
            setFormData(progressResponse.data);
          }
        } catch (progressErr) {
          console.log("No existing progress found, using defaults");
          // Just continue with default values if no progress exists
        }
        
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError('Failed to load task details. Please try again.');
        console.error(err);
      }
    };

    fetchTaskDetails();
  }, [location]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!task || !user) {
      setError('Missing task or user information');
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        ...formData,
        taskId: task._id,
        volunteerId: user.id,
        lastUpdated: new Date()
      };

      // Add current progress description as an update
      if (formData.progressDescription.trim()) {
        submitData.updates = [
          ...formData.updates,
          {
            description: formData.progressDescription,
            timestamp: new Date()
          }
        ];
      }

      const response = await axios.post('http://localhost:5000/api/taskprogress', submitData);
      setSuccess('Progress updated successfully!');
      
      // Note: We're not updating the user context here anymore since updateUser is not a function
      // The backend will handle updating the volunteer's taskStatus to 4
      
      setLoading(false);
      
      // Redirect after a short delay
      setTimeout(() => {
        if (formData.completed) {
          // For a completed task, refresh the page or update user info via a new API call
          // Let's force a refresh to get the updated user data from the server
          window.location.href = '/volunteer-home';
        } else {
          navigate('/volunteer/accepted-tasks');
        }
      }, 2000);
    } catch (err) {
      setLoading(false);
      setError('Failed to update progress. Please try again.');
      console.error(err);
    }
  };

  // Render different form fields based on task type
  const renderTaskSpecificFields = () => {
    if (!task) return null;

    switch (task.taskType) {
      case 'Transportation and Distribution':
        return (
          <div className="form-section">
            <h3>Transportation Details</h3>
            <div className="form-group">
              <label>Delivery Status:</label>
              <select
                name="deliveryStatus"
                value={formData.deliveryStatus}
                onChange={handleInputChange}
                className="form-control"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>
        );
      
      case 'Preparing and Serving Food':
        return (
          <div className="form-section">
            <h3>Food Service Details</h3>
            <div className="form-group">
              <label>Meals Served:</label>
              <input
                type="number"
                name="mealsServed"
                value={formData.mealsServed}
                onChange={handleInputChange}
                className="form-control"
                min="0"
              />
            </div>
          </div>
        );
      
      case 'Rescue Operation Management':
        return (
          <div className="form-section">
            <h3>Rescue Operation Details</h3>
            <div className="form-group">
              <label>People Found:</label>
              <input
                type="number"
                name="peopleFound"
                value={formData.peopleFound}
                onChange={handleInputChange}
                className="form-control"
                min="0"
              />
            </div>
            <div className="form-group">
              <label>People Hospitalized:</label>
              <input
                type="number"
                name="peopleHospitalized"
                value={formData.peopleHospitalized}
                onChange={handleInputChange}
                className="form-control"
                min="0"
              />
            </div>
            <div className="form-group">
              <label>People Missing:</label>
              <input
                type="number"
                name="peopleMissing"
                value={formData.peopleMissing}
                onChange={handleInputChange}
                className="form-control"
                min="0"
              />
            </div>
            <div className="form-group">
              <label>People Lost:</label>
              <input
                type="number"
                name="peopleLost"
                value={formData.peopleLost}
                onChange={handleInputChange}
                className="form-control"
                min="0"
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Show loading state
  if (loading && !task) {
    return <div className="loading">Loading task details...</div>;
  }

  // Show error
  if (error && !task) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="task-progress-form container">
      <h2>Update Task Progress</h2>
      
      {task && (
        <div className="task-info">
          <h3>{task.taskType}</h3>
          <p>{task.description}</p>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>General Progress</h3>
          <div className="form-group">
            <label>Progress Description:</label>
            <textarea
              name="progressDescription"
              value={formData.progressDescription}
              onChange={handleInputChange}
              className="form-control"
              rows="4"
              placeholder="Describe your current progress..."
              required
            />
          </div>

          <div className="form-group">
            <label>Progress Percentage: {formData.progressPercentage}%</label>
            <input
              type="range"
              name="progressPercentage"
              value={formData.progressPercentage}
              onChange={handleInputChange}
              className="form-control-range"
              min="0"
              max="100"
              step="5"
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="completed"
                checked={formData.completed}
                onChange={handleInputChange}
              />
              Mark as Completed
            </label>
          </div>
        </div>

        {/* Render task-specific fields */}
        {renderTaskSpecificFields()}

        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/volunteer/accepted-tasks')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Progress'}
          </button>
        </div>
      </form>

      {/* Display previous updates if any */}
      {formData.updates && formData.updates.length > 0 && (
        <div className="previous-updates">
          <h3>Previous Updates</h3>
          <ul className="updates-list">
            {formData.updates.map((update, index) => (
              <li key={index} className="update-item">
                <div className="update-time">
                  {new Date(update.timestamp).toLocaleString()}
                </div>
                <div className="update-description">{update.description}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TaskProgressForm;