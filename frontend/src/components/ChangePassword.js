import React, { useState } from "react";
import axios from "axios";
import "../styles/ChangePassword.css";
import { useUser } from "../context/UserContext";

const ChangePassword = () => {
  const { user } = useUser(); // Get user from context
  const [formData, setFormData] = useState({ oldPassword: "", newPassword: "" });
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Sending Request:", formData);
      console.log("User Data:", user);

      const response = await axios.put(
        "http://localhost:5000/api/profile/change-password",
        { userId: user.id, ...formData } // Send userId inside the request body
      );

      setMessage({ type: "success", text: response.data.message });
    } catch (error) {
      console.error("Error response:", error.response?.data);
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || "Failed to change password." 
      });
    }
  };

  return (
    <div className="change-password-container">
      <h2>Change Password</h2>
      {message && <p className={message.type === "error" ? "error-message" : "success-message"}>{message.text}</p>}
      <form onSubmit={handleSubmit}>
        <label>Old Password</label>
        <input type="password" name="oldPassword" placeholder="Enter old password" onChange={handleChange} required />
        <label>New Password</label>
        <input type="password" name="newPassword" placeholder="Enter new password" onChange={handleChange} required />
        <button type="submit">Change Password</button>
      </form>
    </div>
  );
};

export default ChangePassword;
