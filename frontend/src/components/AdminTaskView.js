import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AdminTaskView.css';

const AdminTaskView = () => {
  const [taskTypes, setTaskTypes] = useState([]);
  const [selectedTaskType, setSelectedTaskType] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  // Fetch tasks when a task type is selected
  useEffect(() => {
    if (selectedTaskType) {
      fetchTasks(selectedTaskType);
    }
  }, [selectedTaskType]);

  const fetchTasks = async (taskType) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`http://localhost:5000/api/tasks/by-type/${taskType}`);
      
      // Group tasks by volunteer ID and find the latest one for each volunteer
      const tasksByVolunteer = {};
      
      response.data.forEach(task => {
        if (task.volunteer && task.volunteer.taskStatus !== 0) {
          const volunteerId = task.volunteer._id || task.volunteer.id;
          
          // If we don't have this volunteer yet, or if this task is newer than the one we have
          if (!tasksByVolunteer[volunteerId] || 
              new Date(task.createdAt) > new Date(tasksByVolunteer[volunteerId].createdAt)) {
            tasksByVolunteer[volunteerId] = task;
          }
        }
      });
      
      // Convert the object back to an array
      const latestTasksPerVolunteer = Object.values(tasksByVolunteer);
      
      setTasks(latestTasksPerVolunteer);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks');
      setLoading(false);
    }
  };

  // Handle task type selection change
  const handleTaskTypeChange = (e) => {
    setSelectedTaskType(e.target.value);
  };

  // Get status text based on volunteer task status
  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return ''; // Changed from 'Available' to empty string
      case 1:
        return 'Waiting for volunteer approval';
      case 2:
        return 'Task accepted by volunteer';
      case 3:
        return 'Task rejected by volunteer';
      case 4:
        return 'Task completed';
      default:
        return 'Unknown status';
    }
  };

  // Get status class for styling
  const getStatusClass = (status) => {
    switch (status) {
      case 0:
        return 'status-available';
      case 1:
        return 'status-waiting';
      case 2:
        return 'status-accepted';
      case 3:
        return 'status-rejected';
      case 4:
        return 'status-completed';
      default:
        return '';
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

  return (
    <div className="admin-task-view container">
      <h2>Assigned Tasks</h2>
      <div className="task-filter">
        <label htmlFor="taskType">Filter by Task Type:</label>
        <select
          id="taskType"
          className="form-control"
          value={selectedTaskType}
          onChange={handleTaskTypeChange}
        >
          <option value="">Select Task Type</option>
          {taskTypes.map(type => (
            <option key={type._id} value={type.name}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <div className="loading">Loading tasks...</div>}

      {error && <div className="error-message">{error}</div>}

      {!loading && !error && tasks.length === 0 && selectedTaskType && (
        <div className="no-tasks">No tasks found for the selected type.</div>
      )}

      {!loading && tasks.length > 0 && (
        <div className="tasks-list">
          {tasks.map(task => (
            <div key={task._id} className="task-card">
              <div className="task-header">
                <h3>{task.taskType}</h3>
                <span className={`task-status ${getStatusClass(task.volunteer.taskStatus)}`}>
                  {getStatusText(task.volunteer.taskStatus)}
                </span>
              </div>

              <div className="task-content">
                <div className="task-description">
                  <p><strong>Description:</strong> {task.description}</p>
                  <p><strong>Created:</strong> {new Date(task.createdAt).toLocaleString()}</p>
                </div>

                <div className="task-incident">
                  <h4>Incident Details</h4>
                  {task.incident ? (
                    <>
                      <p><strong>Location:</strong> {task.incident.location}</p>
                      <p><strong>Type:</strong> {task.incident.type}</p>
                      <p><strong>Severity:</strong> {task.incident.severity}</p>
                    </>
                  ) : (
                    <p>No incident details available</p>
                  )}
                </div>

                <div className="task-volunteer">
                  <h4>Volunteer Details</h4>
                  {task.volunteer ? (
                    <>
                      <p><strong>Name:</strong> {task.volunteer.name}</p>
                      <p><strong>Email:</strong> {task.volunteer.email}</p>
                      <p><strong>Phone:</strong> {task.volunteer.phone}</p>
                    </>
                  ) : (
                    <p>No volunteer assigned</p>
                  )}
                </div>

                {/* Render type-specific details */}
                {renderTaskDetails(task)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTaskView;