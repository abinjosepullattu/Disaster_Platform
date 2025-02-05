import React, { useState } from 'react';
import axios from 'axios';
import "../styles/SignupPage.css";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    age: '',
    role: 'public',
    skills: '',
    photo: null,
    idProof: null,
    experienceCertificate: null,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.files[0] });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
  
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
  
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
  
    try {
      // ✅ Correct API URL
      const response = await axios.post("http://localhost:5000/api/users/signup", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Signup successful! Please wait for admin approval.");
    } catch (error) {
      alert("Signup failed: " + (error.response?.data?.error || "Unknown error"));
      console.error(error);
    }
  };
  

  return (
    <div className="signup-container">
      <div className="signup-box">
        <div className="circle circle-one"></div>
        <div className="form-container">
          <h1 className="opacity">SIGN UP</h1>
          <form onSubmit={handleSignup} encType="multipart/form-data">
            <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
            <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
            <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required />
            <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
            <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required />
            
            <label>Upload Photo</label>
            <input type="file" name="photo" onChange={handleFileChange} required />

            <label>Role</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="volunteer">Volunteer</option>
              <option value="public">Public</option>
            </select>

            {formData.role === "volunteer" && (
              <>
                <input type="text" name="skills" placeholder="Skills (e.g., Medical, Cooking)" value={formData.skills} onChange={handleChange} required />
                <label>Upload ID Proof</label>
                <input type="file" name="idProof" onChange={handleFileChange} required />
                <label>Upload Experience Certificate</label>
                <input type="file" name="experienceCertificate" onChange={handleFileChange} required />
              </>
            )}

            <button type="submit">Signup</button>
          </form>
        </div>
        <div className="circle circle-two"></div>
      </div>
    </div>
  );
};

export default SignupPage;
