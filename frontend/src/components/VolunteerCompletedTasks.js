import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import '../styles/VolunteerCompletedTasks.css'; // Import the CSS file

const VolunteerCompletedTasks = ({ volunteerId }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTask, setExpandedTask] = useState(null);

  useEffect(() => {
    if (!user || !user.id) {
      navigate('/login');
      return;
    }
  
    const fetchCompletedTasks = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/taskprogress/volunteer/${user.id}/completed`);
        const completed = response.data.filter(task => task.completed);
        setCompletedTasks(completed);
      } catch (err) {
        setError('Failed to fetch completed tasks');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchCompletedTasks();
  }, [volunteerId]);
  

  const getTaskTypeSpecificDetails = (task) => {
    switch (task.taskId?.taskType) {
      case 'Transportation and Distribution':
        return (
          <div className="task-specific-details">
            <p><span className="detail-label">Delivery Status:</span> {task.deliveryStatus}</p>
          </div>
        );
      case 'Preparing and Serving Food':
        return (
          <div className="task-specific-details">
            <p><span className="detail-label">Meals Served:</span> {task.mealsServed}</p>
          </div>
        );
      case 'Rescue Operation Management':
        return (
          <div className="task-specific-details">
            <p><span className="detail-label">People Found:</span> {task.peopleFound}</p>
            <p><span className="detail-label">People Hospitalized:</span> {task.peopleHospitalized}</p>
          </div>
        );
      default:
        return null;
    }
  };

  const getExpandedTaskDetails = (task) => {
    return (
      <div className="expanded-details">
        <h4 className="expanded-heading">Detailed Information</h4>
        
        {/* Task Type Specific Additional Details */}
        {task.taskId?.taskType === 'Rescue Operation Management' && (
          <div>
            
            <p><span className="detail-label">People Missing:</span> {task.peopleMissing}</p>
            <p><span className="detail-label">People Lost:</span> {task.peopleLost}</p>

          </div>
        )}
        
        {/* Progress Updates */}
        <div>
          <h5 className="detail-label">Updates History:</h5>
          {task.updates && task.updates.length > 0 ? (
            <ul className="updates-list">
              {task.updates.map((update, index) => (
                <li key={index} className="update-item">
                  <p>{update.description}</p>
                  <p className="update-timestamp">
                    {format(new Date(update.timestamp), 'PPp')}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="detail-value">No updates recorded</p>
          )}
        </div>
        
        {/* Created and Last Updated Timestamps */}
        <div className="timestamp-info">
          <p>Created: {format(new Date(task.createdAt), 'PPp')}</p>
          <p>Last Updated: {format(new Date(task.lastUpdated), 'PPp')}</p>
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading-state">Loading completed tasks...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="completed-tasks-container">
      <h2 className="completed-tasks-heading">Completed Tasks</h2>
      
      {completedTasks.length === 0 ? (
        <div className="empty-state">
          <p className="empty-message">No completed tasks found</p>
        </div>
      ) : (
        <div className="completed-tasks-grid">
          {completedTasks.map((task) => (
            <div key={task._id} className="task-card">
              {/* Basic Task Information */}
              <div className="task-header">
                <h3 className="task-type">
                  {task.taskId?.taskType || 'Unknown Task Type'}
                </h3>
                <span className="completed-badge">
                  Completed
                </span>
              </div>
              
              <p className="task-description">
                {task.taskId?.description || 'No description available'}
              </p>
              
              <div className="progress-container">
                <div className="progress-bar-background">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `100%` }}
                  ></div>
                </div>
                <p className="progress-text">100% Complete</p>
              </div>
              
              {/* Task Type Specific Basic Details */}
              {getTaskTypeSpecificDetails(task)}
              
              {/* Progress Description */}
              <div className="task-status">
                <p><span className="detail-label">Status:</span> {task.progressDescription}</p>
              </div>
              
              {/* Toggle Button for Additional Details */}
              <button
                onClick={() => setExpandedTask(expandedTask === task._id ? null : task._id)}
                className="show-more-button"
              >
                {expandedTask === task._id ? 'Show Less' : 'Show More'}
                <svg 
                  className={`chevron-icon ${expandedTask === task._id ? 'rotated' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Expanded Task Details */}
              {expandedTask === task._id && getExpandedTaskDetails(task)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VolunteerCompletedTasks;