import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import '../styles/VolunteerTaskView.css';

const VolunteerTaskView = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [latestTask, setLatestTask] = useState(null);
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVolunteerData = async () => {
      if (!user || !user.id) {
        console.error("User ID missing. Please log in again.");
        navigate('/login');
        return;
      }

      try {
        // Get volunteer info using user ID
        const volunteerRes = await axios.get(`http://localhost:5000/api/tasks/user/${user.id}`);
        const volunteerData = volunteerRes.data;

        if (!volunteerData || !volunteerData._id) {
          setError("Volunteer profile not found.");
          setLoading(false);
          return;
        }

        setVolunteer(volunteerData);

        // Fetch assigned tasks
        const tasksRes = await axios.get(`http://localhost:5000/api/tasks/volunteer/${volunteerData._id}`);
        
        // For each task, fetch the volunteer's status for that task
        const tasksWithStatus = await Promise.all(tasksRes.data.map(async (task) => {
          try {
            const statusRes = await axios.get(`http://localhost:5000/api/tasks/status/${volunteerData._id}/${task._id}`);
            return { ...task, taskStatus: statusRes.data.taskStatus };
          } catch (err) {
            console.error(`Error fetching status for task ${task._id}:`, err);
            return { ...task, taskStatus: 1 }; // Default to pending (1) if error
          }
        }));

        // Sort tasks by createdAt date (newest first)
        const sortedTasks = tasksWithStatus.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );

        // Find the first pending task (status 1) that needs action
        const pendingTask = sortedTasks.find(task => task.taskStatus === 1);
        
        // If no pending task, just get the most recent task of any status
        const mostRecentTask = pendingTask || (sortedTasks.length > 0 ? sortedTasks[0] : null);
        
        setLatestTask(mostRecentTask);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Failed to load tasks. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteerData();
  }, [user, navigate]);

  const handleTaskAction = async (taskId, status) => {
    if (!volunteer || !volunteer._id) {
      console.error("Volunteer ID is missing.");
      return;
    }
  
    try {
      setLoading(true);
      await axios.put(`http://localhost:5000/api/tasks/update-status/${volunteer._id}/${taskId}`, { status });
      
      // Update task status locally
      setLatestTask(prev => prev ? { ...prev, taskStatus: status } : null);
      
      alert(status === 2 ? "Task accepted successfully!" : "Task rejected.");
    } catch (err) {
      console.error("Error updating task status:", err);
      setError("Failed to update task status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openMap = (latitude, longitude, label) => {
    // Open Google Maps with the given coordinates
    window.open(`https://www.google.com/maps?q=${latitude},${longitude}&label=${label}`, '_blank');
  };

  const renderTaskDetails = (task) => {
    switch (task.taskType) {
      case 'Transportation and Distribution':
        return (
          <div className="task-details">
            <div className="detail-with-map">
              <p><strong>Shelter:</strong> {task.shelter}</p>
              {task.shelterLatitude && task.shelterLongitude && (
                <button 
                  className="map-button"
                  onClick={() => openMap(task.shelterLatitude, task.shelterLongitude, 'Shelter')}
                >
                  View Shelter Map
                </button>
              )}
            </div>
            <p><strong>Resource Type:</strong> {task.resourceType}</p>
            <p><strong>Delivery Date & Time:</strong> {new Date(task.deliveryDateTime).toLocaleString()}</p>
          </div>
        );
      case 'Preparing and Serving Food':
        return (
          <div className="task-details">
            <div className="detail-with-map">
              <p><strong>Shelter:</strong> {task.shelter}</p>
              {task.shelterLatitude && task.shelterLongitude && (
                <button 
                  className="map-button"
                  onClick={() => openMap(task.shelterLatitude, task.shelterLongitude, 'Shelter')}
                >
                  View Shelter Map
                </button>
              )}
            </div>
          </div>
        );
      case 'Rescue Operation Management':
      case 'Rescue Operator':
        return null;
      default:
        return null;
    }
  };

  const renderTaskStatus = (task) => {
    const taskStatus = typeof volunteer.taskStatus === 'number' ? volunteer.taskStatus : 1;
    
    switch (taskStatus) {
      case 0:
        return <div className="task-status accepted">Wait For The New Task</div>;

      case 1:
        return (
          <div className="task-actions">
            <button 
              className="btn-accept"
              onClick={() => handleTaskAction(task._id, 2)}
              disabled={loading}
            >
              Accept Task
            </button>
            <button 
              className="btn-reject"
              onClick={() => handleTaskAction(task._id, 3)}
              disabled={loading}
            >
              Reject Task
            </button>
          </div>
        );
      case 2:
        return <div className="task-status accepted">✅ Task is accepted</div>;
      case 3:
        return <div className="task-status rejected">❌ Task is rejected</div>;
      case 4:
        return <div className="task-status completed">✓ Task is completed</div>;
      default:
        return <div className="task-status unknown">Unknown status</div>;
    }
  };
  
  if (loading) {
    return <div className="loading-spinner">Loading your task...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="volunteer-task-view container">
      <h2>My Assigned Tasks</h2>

      {!latestTask ? (
        <div className="no-tasks">
          <p>You don't have any assigned tasks at the moment.</p>
        </div>
      ) : (
        <div className="task-card">
          <div className="task-header">
            <h3>{latestTask.taskType}</h3>
            <span className="task-date">{new Date(latestTask.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="task-content">
            <div className="task-description">
              <p>{latestTask.description}</p>
            </div>

            <div className="task-incident">
              <div className="incident-header">
                <h4>Incident Details</h4>
                {latestTask.incident && latestTask.incident.latitude && latestTask.incident.longitude && (
                  <button 
                    className="map-button"
                    onClick={() => openMap(latestTask.incident.latitude, latestTask.incident.longitude, 'Incident')}
                  >
                    View Incident Map
                  </button>
                )}
              </div>
              {latestTask.incident ? (
                <div className="incident-details">
                  <p><strong>Location:</strong> {latestTask.incident.location}</p>
                  <p><strong>Type:</strong> {latestTask.incident.type}</p>
                  <p><strong>Severity:</strong> {latestTask.incident.severity}</p>
                </div>
              ) : (
                <p>No incident details available</p>
              )}
            </div>

            {renderTaskDetails(latestTask)}
            {renderTaskStatus(latestTask)}
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerTaskView;