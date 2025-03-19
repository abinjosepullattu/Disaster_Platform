import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import '../styles/AcceptedTaskView.css';

const AcceptedTasksView = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [latestTask, setLatestTask] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAcceptedTasks = async () => {
      if (!user || !user.id) {
        navigate('/login');
        return;
      }

      try {
        // Fetch tasks for the logged-in volunteer
        const response = await axios.get(`http://localhost:5000/api/tasks/volunteer/${user.id}/accepted`);
        
        // Find the latest task based on createdAt or updatedAt field
        if (response.data.length > 0) {
          // Sort tasks by createdAt in descending order (newest first)
          const sortedTasks = response.data.sort((a, b) => 
            new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt)
          );
          
          // Set only the latest task
          setLatestTask(sortedTasks[0]);
        }
      } catch (err) {
        setError("Failed to load tasks. Please try again.");
      }
    };

    fetchAcceptedTasks();
  }, [user, navigate]);

  const openMap = (latitude, longitude, label) => {
    window.open(`https://www.google.com/maps?q=${latitude},${longitude}&label=${label}`, '_blank');
  };

  // Format date to display in a readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}, ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
  };
  
  const navigateToMarkProgress = (taskId) => {
    navigate(`/volunteer/progress-form?taskId=${taskId}`);
  };

  return (
    <div className="accepted-tasks-view container">
      <h2>Your Accepted Task</h2>

      {error && <p className="error">{error}</p>}

      {!latestTask ? (
        <p>No accepted tasks at the moment.</p>
      ) : (
        <div className="tasks-list">
          <div className="task-card">
            <div className="task-header">
              <h3>{latestTask.taskType}</h3>
              <span className="task-date">
                {latestTask.updatedAt ? formatDate(latestTask.updatedAt).split(',')[0] : ''}
              </span>
            </div>
            
            <p className="task-instruction">{latestTask.description || 'Do it fast'}</p>

            <div className="details-section">
              <div className="section-title">Incident Details</div>
              {latestTask.incident && (
                <div className="incident-details">
                  <p><strong>Location:</strong> {latestTask.incident.location}</p>
                  <p><strong>Type:</strong> {latestTask.incident.type}</p>
                  <p><strong>Severity:</strong> {latestTask.incident.severity}</p>
                  {latestTask.incident.latitude && latestTask.incident.longitude && (
                    <button 
                      className="map-button"
                      onClick={() => openMap(latestTask.incident.latitude, latestTask.incident.longitude, 'Incident')}
                    >
                      View Incident Map
                    </button>
                  )}
                </div>
              )}
            </div>

            {latestTask.shelter && (
              <div className="details-section">
                <div className="section-title">Shelter</div>
                <div className="shelter-details">
                  <p>
                    {latestTask.shelter.name || ''} {latestTask.shelter.location || ''}
                  </p>
                  {latestTask.shelter.latitude && latestTask.shelter.longitude && (
                    <button 
                      className="map-button"
                      onClick={() => openMap(latestTask.shelter.latitude, latestTask.shelter.longitude, 'Shelter')}
                    >
                      View Shelter Map
                    </button>
                  )}
                </div>
              </div>
            )}

            {latestTask.resourceType && (
              <div className="details-section">
                <div className="resource-details">
                  <p><strong>Resource Type:</strong> {latestTask.resourceType}</p>
                </div>
              </div>
            )}

            {latestTask.deliveryDate && (
              <div className="details-section">
                <div className="delivery-details">
                  <p><strong>Delivery Date & Time:</strong> {formatDate(latestTask.deliveryDate)}</p>
                </div>
              </div>
            )}
            
            <div className="task-actions">
              <button 
                className="progress-button"
                onClick={() => navigateToMarkProgress(latestTask._id)}
              >
                Mark Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcceptedTasksView;