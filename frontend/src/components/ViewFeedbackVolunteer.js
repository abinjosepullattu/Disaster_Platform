import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from "../context/UserContext";
import '../styles/ViewFeedbackVolunteer.css';

const VolunteerFeedbackView = () => {
  const { user } = useUser();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingAsViewed, setMarkingAsViewed] = useState(false);

  // Fetch all feedback for the current volunteer
  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      try {
        if (!user || !user.id) {
          setError('User not authenticated.');
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/feedback/volunteer/${user.id}`);
        setFeedbackList(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setError('Failed to load feedback');
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [user]);

  // Mark feedback as viewed
  const markFeedbackAsViewed = async (feedbackId) => {
    setMarkingAsViewed(true);
    try {
      await axios.patch(`http://localhost:5000/api/feedback/${feedbackId}/view`, {
        status: 1 // Mark as viewed
      });
      
      // Update the local state to reflect the change
      setFeedbackList(prevList => 
        prevList.map(feedback => 
          feedback._id === feedbackId ? { ...feedback, status: 1 } : feedback
        )
      );
      
    } catch (err) {
      console.error('Error marking feedback as viewed:', err);
      alert('Failed to mark feedback as viewed. Please try again.');
    } finally {
      setMarkingAsViewed(false);
    }
  };

  // Format date to a readable string
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Render star rating
  const renderStarRating = (rating) => {
    const stars = [];
    for (let i = 1; i <= 4; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "star filled" : "star"}>
          ★
        </span>
      );
    }
    return <div className="star-rating">{stars}</div>;
  };

  return (
    <div className="volunteer-feedback container">
      <h2>My Feedback</h2>
      
      {loading && <div className="loading">Loading your feedback...</div>}
      
      {error && <div className="error-message">{error}</div>}
      
      {!loading && !error && feedbackList.length === 0 && (
        <div className="no-feedback">
          <p>You haven't received any feedback yet.</p>
          <p>Feedback will appear here after you complete tasks and administrators review your work.</p>
        </div>
      )}
      
      {!loading && !error && feedbackList.length > 0 && (
        <div className="feedback-list">
          {feedbackList.map(feedback => (
            <div key={feedback._id} className={`feedback-card ${feedback.status === 1 ? 'viewed' : 'new'}`}>
              <div className="feedback-header">
                <h3>
                  {feedback.taskId?.taskType || 'Task'}
                  {feedback.status === 0 && <span className="new-badge">New</span>}
                </h3>
                <div className="feedback-date">{formatDate(feedback.createdAt)}</div>
              </div>
              
              <div className="feedback-content">
                <div className="feedback-rating">
                  {renderStarRating(feedback.rating)}
                  <span className="rating-text">{feedback.rating}/4</span>
                </div>
                
                {feedback.comments && (
                  <div className="feedback-comments">
                    <h4>Comments</h4>
                    <p>{feedback.comments}</p>
                  </div>
                )}
                
                <div className="feedback-details">
                  <p><strong>From:</strong> {feedback.adminId?.name || 'Administrator'}</p>
                  <p><strong>Task:</strong> {feedback.taskId?.description || 'Task description not available'}</p>
                </div>
                
                {feedback.status === 0 && (
                  <button 
                    className="btn btn-primary mark-viewed-btn"
                    onClick={() => markFeedbackAsViewed(feedback._id)}
                    disabled={markingAsViewed}
                  >
                    {markingAsViewed ? 'Marking...' : 'Mark as Viewed'}
                  </button>
                )}
                
                {feedback.status === 1 && (
                  <div className="viewed-status">
                    <span className="viewed-icon">✓</span> You've viewed this feedback
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VolunteerFeedbackView;