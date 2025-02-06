import React, { useState, useEffect } from 'react';
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
    role: '',
    skills: '',
    photo: null,
    idProof: null,
    experienceCertificate: null,
  });

  const [skillsList, setSkillsList] = useState([]); // Store admin-defined skills

  useEffect(() => {
    axios.get("http://localhost:5000/api/skills")
      .then(response => setSkillsList(response.data))
      .catch(error => console.error("Error fetching skills:", error));
  }, []);

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
        <div className="form-container">
          <h1 className="opacity">SIGN UP</h1>
          <form onSubmit={handleSignup} encType="multipart/form-data">
            <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
            <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
            <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
            <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
            <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required />

            {/* Role Dropdown with Placeholder */}
            <select name="role" value={formData.role} onChange={handleChange} required>
              <option value="" disabled>Select Role</option>
              <option value="volunteer">Volunteer</option>
              <option value="public">Public</option>
            </select>

            {/* Photo Upload */}
            <div className="file-input">
              <input type="file" name="photo" onChange={handleFileChange} required />
              <span>Upload Photo</span>
            </div>

            {formData.role === "volunteer" && (
              <>
                {/* Skills Dropdown with Placeholder */}
                <select name="skills" value={formData.skills} onChange={handleChange} required>
                  <option value="" disabled>Select Skill</option>
                  {skillsList.map((skill) => (
                    <option key={skill._id} value={skill.name}>{skill.name}</option>
                  ))}
                </select>

                {/* ID Proof & Experience Certificate Upload - Aligned Side by Side */}
                <div className="file-input-group">
                  <div className="file-input">
                    <input type="file" name="idProof" onChange={handleFileChange} required />
                    <span>Upload ID Proof</span>
                  </div>
                  <div className="file-input">
                    <input type="file" name="experienceCertificate" onChange={handleFileChange} required />
                    <span>Upload Experience Certificate</span>
                  </div>
                </div>
              </>
            )}

            <button type="submit">Signup</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage
