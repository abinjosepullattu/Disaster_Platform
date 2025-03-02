import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import '../styles/VolunteerTaskView.css';

const VolunteerTaskView = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
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

        setTasks(tasksWithStatus);
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
  
      // Update task status locally without reloading
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === taskId ? { ...task, taskStatus: status } : task
        )
      );
  
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

  const renderActionButtons = (task) => {
    const taskStatus = typeof volunteer.taskStatus === 'number' ? volunteer.taskStatus : 1;
  
    if (taskStatus === 2) {
      return <div className="task-status accepted">✅ You have accepted this task</div>;
    } else if (taskStatus === 3) {
      return <div className="task-status rejected">❌ You have rejected this task</div>;
    } else {
      // Show buttons only when taskStatus is pending (1)
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
    }
  };
  

  if (loading) {
    return <div className="loading-spinner">Loading your tasks...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="volunteer-task-view container">
      <h2>Your Assigned Tasks</h2>

      {tasks.length === 0 ? (
        <div className="no-tasks">
          <p>You don't have any assigned tasks at the moment.</p>
        </div>
      ) : (
        <div className="tasks-list">
          {tasks.map(task => (
            <div key={task._id} className="task-card">
              <div className="task-header">
                <h3>{task.taskType}</h3>
                <span className="task-date">{new Date(task.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="task-content">
                <div className="task-description">
                  <p>{task.description}</p>
                </div>

                <div className="task-incident">
                  <div className="incident-header">
                    <h4>Incident Details</h4>
                    {task.incident && task.incident.latitude && task.incident.longitude && (
                      <button 
                        className="map-button"
                        onClick={() => openMap(task.incident.latitude, task.incident.longitude, 'Incident')}
                      >
                        View Incident Map
                      </button>
                    )}
                  </div>
                  {task.incident ? (
                    <div className="incident-details">
                      <p><strong>Location:</strong> {task.incident.location}</p>
                      <p><strong>Type:</strong> {task.incident.type}</p>
                      <p><strong>Severity:</strong> {task.incident.severity}</p>
                    </div>
                  ) : (
                    <p>No incident details available</p>
                  )}
                </div>

                {renderTaskDetails(task)}
                {renderActionButtons(task)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VolunteerTaskView;