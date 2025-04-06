import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";
import AdminSidebar from "./AdminSidebar";
import "../styles/EditProfile.css";

const EditProfile = () => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    age: "",
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/profile/${user.id}`);
      setFormData(response.data);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load profile." });
    } finally {
      setLoading(false);
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
      setLoading(true);
      const response = await axios.put(
        `http://localhost:5000/api/profile/edit/${user.id}`,
        formData
      );
      setMessage({ type: "success", text: response.data.message });
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || "Failed to update profile." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="a1234567890b12">
      <AdminSidebar />
      <main className="b2234567890b12">
        <div className="c3234567890b12-container">
          <h2 className="d4234567890b12-title">Edit Profile</h2>
          
          {message && (
            <div className={`e5234567890b12-message ${message.type === "error" ? "f6234567890b12-error" : "g7234567890b12-success"}`}>
              {message.text}
              <button 
                onClick={() => setMessage(null)} 
                className="h8234567890b12-close-btn"
              >
                &times;
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="i9234567890b12-form">
            <div className="j0234567890b12-form-group">
              <label className="k1234567890b12-label">Full Name</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                className="l2234567890b12-input"
                required 
              />
            </div>
            
            <div className="m3234567890b12-form-group">
              <label className="n4234567890b12-label">Phone Number</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                className="o5234567890b12-input"
                required 
              />
            </div>
            
            <div className="p6234567890b12-form-group">
              <label className="q7234567890b12-label">Address</label>
              <input 
                type="text" 
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                className="r8234567890b12-input"
                required 
              />
            </div>
            
            <div className="s9234567890b12-form-group">
              <label className="t0234567890b12-label">Age</label>
              <input 
                type="number" 
                name="age" 
                value={formData.age} 
                onChange={handleChange} 
                className="u1234567890b12-input"
                min="18"
                max="100"
                required 
              />
            </div>
            
            <button 
              type="submit" 
              className="v2234567890b12-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="w3234567890b12-spinner"></span>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditProfile;