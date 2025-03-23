import React, { useState } from "react";
import axios from "axios";
import "../styles/ReportComplaint.css";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const ReportComplaint = () => {
  const [complaintType, setComplaintType] = useState("");
  const [otherComplaintType, setOtherComplaintType] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();

  const complaintTypes = [
    "Service Issue",
    "Technical Problem",
    "Volunteer Conduct",
    "Safety Concern",
    "Program Feedback",
    "Other"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Determine the final complaint type value
    const finalComplaintType = complaintType === "Other" ? otherComplaintType : complaintType;

    // Validate that "Other" type has been filled out
    if (complaintType === "Other" && !otherComplaintType.trim()) {
      setError("Please specify the complaint type");
      setIsSubmitting(false);
      return;
    }

    try {
      // Send userId from context
      const complaintData = {
        userId: user.id,
        complaintType: finalComplaintType,
        description
      };
      
      // reportedId and createdAt will be set automatically on the server
      const response = await axios.post("http://localhost:5000/api/complaints/report", complaintData);
      
      setSuccess(true);
      setComplaintType("");
      setOtherComplaintType("");
      setDescription("");
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      setError(error.response ? error.response.data.message : "Failed to submit complaint");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="complaint-container">
      <h2>Report a Complaint</h2>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">Complaint submitted successfully!</p>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="complaintType">Complaint Type</label>
          <select 
            id="complaintType"
            value={complaintType} 
            onChange={(e) => setComplaintType(e.target.value)}
            required
          >
            <option value="">Select a complaint type</option>
            {complaintTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        
        {complaintType === "Other" && (
          <div className="form-group">
            <label htmlFor="otherComplaintType">Specify Complaint Type</label>
            <input
              type="text"
              id="otherComplaintType"
              value={otherComplaintType}
              onChange={(e) => setOtherComplaintType(e.target.value)}
              placeholder="Please specify the complaint type"
              required
            />
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please provide details about your complaint"
            rows="6"
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Complaint"}
        </button>
      </form>
      
      <button onClick={() => navigate(-1)} className="back-btn">
        Back
      </button>
    </div>
  );
};

export default ReportComplaint;