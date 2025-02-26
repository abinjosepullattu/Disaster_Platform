import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/EditProfile.css";
import { useUser } from "../context/UserContext";

const EditProfile = () => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    age: "",
  });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/profile/${user.id}`);
      setFormData(response.data);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load profile." });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.address || !formData.age) {
      setMessage({ type: "error", text: "All fields are required." });
      return;
    }
  
    try {
      console.log("User Data:", user);

      const response = await axios.put(
        `http://localhost:5000/api/profile/edit/${user.id}`, // Ensure correct user ID
        formData,

      );
  
      setMessage({ type: "success", text: response.data.message });
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || "Failed to update profile." 
      });
    }
  };
  

  return (
    <div className="edit-profile-container">
      <h2>Edit Profile</h2>
      {message && <p className={message.type === "error" ? "error-message" : "success-message"}>{message.text}</p>}
      <form onSubmit={handleSubmit}>
        <label>Full Name</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        <label>Phone Number</label>
        <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
        <label>Address</label>
        <input type="text" name="address" value={formData.address} onChange={handleChange} required />
        <label>Age</label>
        <input type="number" name="age" value={formData.age} onChange={handleChange} required />
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default EditProfile;