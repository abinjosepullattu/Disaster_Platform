import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import '../styles/AcceptedTaskView.css';

const AcceptedTasksView = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
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
        setTasks(response.data);
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

  return (
    <div className="accepted-tasks-view container">
      <h2>Your Accepted Tasks</h2>

      {error && <p className="error">{error}</p>}

      {tasks.length === 0 ? (
        <p>No accepted tasks at the moment.</p>
      ) : (
        <div className="tasks-list">
          {tasks.map(task => (
            <div key={task._id} className="task-card">
              <div className="task-header">
                <h3>{task.taskType}</h3>
                <span className="task-date">{task.updatedAt ? formatDate(task.updatedAt).split(',')[0] : ''}</span>
              </div>
              
              <p className="task-instruction">{task.description || 'Do it fast'}</p>

              <div className="details-section">
                <div className="section-title">Incident Details</div>
                {task.incident && (
                  <div className="incident-details">
                    <p><strong>Location:</strong> {task.incident.location}</p>
                    <p><strong>Type:</strong> {task.incident.type}</p>
                    <p><strong>Severity:</strong> {task.incident.severity}</p>
                    {task.incident.latitude && task.incident.longitude && (
                      <button 
                        className="map-button"
                        onClick={() => openMap(task.incident.latitude, task.incident.longitude, 'Incident')}
                      >
                        View Incident Map
                      </button>
                    )}
                  </div>
                )}
              </div>

              {task.shelter && (
                <div className="details-section">
                  <div className="section-title">Shelter</div>
                  <div className="shelter-details">
                    <p>
                      {task.shelter.name || ''} {task.shelter.location || ''}
                    </p>
                    {task.shelter.latitude && task.shelter.longitude && (
                      <button 
                        className="map-button"
                        onClick={() => openMap(task.shelter.latitude, task.shelter.longitude, 'Shelter')}
                      >
                        View Shelter Map
                      </button>
                    )}
                  </div>
                </div>
              )}

              {task.resourceType && (
                <div className="details-section">
                  <div className="resource-details">
                    <p><strong>Resource Type:</strong> {task.resourceType}</p>
                  </div>
                </div>
              )}

              {task.deliveryDate && (
                <div className="details-section">
                  <div className="delivery-details">
                    <p><strong>Delivery Date & Time:</strong> {formatDate(task.deliveryDate)}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AcceptedTasksView;