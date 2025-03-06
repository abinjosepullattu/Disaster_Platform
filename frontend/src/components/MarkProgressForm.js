import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import '../styles/MarkProgressForm.css';

const MarkProgressForm = () => {
  const { taskId } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [volunteer, setVolunteer] = useState(null);
  const [formData, setFormData] = useState({
    progressDescription: '',
    progressPercentage: 0,
    updateDescription: '',
    deliveryStatus: 'Not Started',
    mealsServed: 0,
    peopleFound: 0,
    peopleHospitalized: 0,
    peopleMissing: 0,
    peopleLost: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchTaskAndProgress = async () => {
      if (!user || !user.id || !taskId) {
        setError("Missing information. Please try again.");
        setLoading(false);
        return;
      }

      try {
        // Get volunteer info
        const volunteerRes = await axios.get(`http://localhost:5000/api/tasks/user/${user.id}`);
        const volunteerData = volunteerRes.data;

        if (!volunteerData || !volunteerData._id) {
          setError("Volunteer profile not found.");
          setLoading(false);
          return;
        }

        setVolunteer(volunteerData);

        // Get task details
        const taskRes = await axios.get(`http://localhost:5000/api/tasks/${taskId}`);
        setTask(taskRes.data);

        // Get existing progress
        const progressRes = await axios.get(`http://localhost:5000/api/progress/${taskId}/${volunteerData._id}`);
        
        // If progress exists, update form data
        if (progressRes.data && Object.keys(progressRes.data).length > 0) {
          const { 
            progressDescription, 
            progressPercentage, 
            deliveryStatus,
            mealsServed,
            peopleFound,
            peopleHospitalized,
            peopleMissing,
            peopleLost
          } = progressRes.data;
          
          setFormData(prevState => ({
            ...prevState,
            progressDescription: progressDescription || '',
            progressPercentage: progressPercentage || 0,
            deliveryStatus: deliveryStatus || 'Not Started',
            mealsServed: mealsServed || 0,
            peopleFound: peopleFound || 0,
            peopleHospitalized: peopleHospitalized || 0,
            peopleMissing: peopleMissing || 0,
            peopleLost: peopleLost || 0
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load task information. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskAndProgress();
  }, [taskId, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = value;
    
    // Convert number inputs to actual numbers
    if (['progressPercentage', 'mealsServed', 'peopleFound', 'peopleHospitalized', 'peopleMissing', 'peopleLost'].includes(name)) {
      parsedValue = parseInt(value, 10) || 0;
    }
    
    setFormData(prevState => ({
      ...prevState,
      [name]: parsedValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!volunteer || !volunteer._id) {
        throw new Error('Volunteer information missing');
      }

      // Submit progress data
      await axios.post(`http://localhost:5000/api/progress/${taskId}/${volunteer._id}`, formData);
      
      setSuccess('Progress updated successfully');
      
      // Reset update description field
      setFormData(prevState => ({
        ...prevState,
        updateDescription: ''
      }));
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/accepted-tasks');
      }, 2000);
    } catch (error) {
      console.error('Error updating progress:', error);
      setError('Failed to update progress. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (window.confirm('Are you sure you want to mark this task as complete? This action cannot be undone.')) {
      setLoading(true);
      try {
        await axios.put(`http://localhost:5000/api/progress/complete/${taskId}/${volunteer._id}`);
        setSuccess('Task marked as completed!');
        setTimeout(() => {
          navigate('/accepted-tasks');
        }, 2000);
      } catch (error) {
        console.error('Error completing task:', error);
        setError('Failed to complete task. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading task information...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!task) {
    return <div className="error-message">Task not found.</div>;
  }

  const renderTaskTypeSpecificFields = () => {
    switch (task.taskType) {
      case 'Transportation and Distribution':
        return (
          <div className="field-group">
            <h3>Transportation Details</h3>
            <div className="form-field">
              <label htmlFor="deliveryStatus">Delivery Status</label>
              <select
                id="deliveryStatus"
                name="deliveryStatus"
                value={formData.deliveryStatus}
                onChange={handleInputChange}
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
          <div className="field-group">
            <h3>Food Service Details</h3>
            <div className="form-field">
              <label htmlFor="mealsServed">Number of Meals Served</label>
              <input
                type="number"
                id="mealsServed"
                name="mealsServed"
                value={formData.mealsServed}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>
        );
        
      case 'Rescue Operation Management':
        return (
          <div className="field-group">
            <h3>Rescue Operation Statistics</h3>
            <div className="form-field">
              <label htmlFor="peopleFound">People Found (Total)</label>
              <input
                type="number"
                id="peopleFound"
                name="peopleFound"
                value={formData.peopleFound}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            <div className="form-field">
              <label htmlFor="peopleHospitalized">People Hospitalized</label>
              <input
                type="number"
                id="peopleHospitalized"
                name="peopleHospitalized"
                value={formData.peopleHospitalized}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            <div className="form-field">
              <label htmlFor="peopleMissing">People Still Missing</label>
              <input
                type="number"
                id="peopleMissing"
                name="peopleMissing"
                value={formData.peopleMissing}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            <div className="form-field">
              <label htmlFor="peopleLost">People Lost (Casualties)</label>
              <input
                type="number"
                id="peopleLost"
                name="peopleLost"
                value={formData.peopleLost}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="mark-progress-container">
      <h2>Update Progress for Task</h2>
      <div className="task-summary">
        <h3>{task.taskType}</h3>
        <p>{task.description}</p>
      </div>

      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field-group">
          <h3>Progress Update</h3>
          <div className="form-field">
            <label htmlFor="progressPercentage">Progress Percentage</label>
            <input
              type="range"
              id="progressPercentage"
              name="progressPercentage"
              value={formData.progressPercentage}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="5"
            />
            <span className="range-value">{formData.progressPercentage}%</span>
          </div>

          <div className="form-field">
            <label htmlFor="progressDescription">Overall Progress Description</label>
            <textarea
              id="progressDescription"
              name="progressDescription"
              value={formData.progressDescription}
              onChange={handleInputChange}
              rows="3"
              placeholder="Describe your overall progress on this task..."
            ></textarea>
          </div>

          <div className="form-field">
            <label htmlFor="updateDescription">New Update</label>
            <textarea
              id="updateDescription"
              name="updateDescription"
              value={formData.updateDescription}
              onChange={handleInputChange}
              rows="3"
              placeholder="Add a new update or progress note..."
            ></textarea>
          </div>
        </div>

        {renderTaskTypeSpecificFields()}

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-save"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Progress'}
          </button>
          
          <button 
            type="button" 
            className="btn-complete"
            onClick={handleMarkComplete}
            disabled={loading || formData.progressPercentage < 100}
          >
            Mark as Complete
          </button>
          
          <button 
            type="button" 
            className="btn-cancel"
            onClick={() => navigate('/accepted-tasks')}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default MarkProgressForm;