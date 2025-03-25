import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const SignupPage = () => {
  const navigate = useNavigate();
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

  const [errors, setErrors] = useState({});
  const [skillsList, setSkillsList] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/skills")
      .then(response => setSkillsList(response.data))
      .catch(error => console.error("Error fetching skills:", error));
  }, []);

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'name':
        if (!value.trim()) error = 'Name is required';
        break;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email';
        break;
      case 'password':
        if (value.length < 6) error = 'Password must be at least 6 characters';
        break;
      case 'confirmPassword':
        if (value !== formData.password) error = 'Passwords do not match';
        break;
      case 'phone':
        if (!/^\d{10}$/.test(value)) error = 'Invalid phone number';
        break;
      case 'age':
        if (value < 18) error = 'Must be 18 or older';
        break;
      case 'role':
        if (!value) error = 'Role is required';
        break;
      case 'skills':
        if (formData.role === 'volunteer' && !value) error = 'Skill is required';
        break;
      default:
        break;
    }
    setErrors(prevErrors => ({ ...prevErrors, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.files[0] });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (Object.values(errors).some(error => error)) return;

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    try {
      await axios.post("http://localhost:5000/api/users/signup", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Signup successful! Please wait for admin approval.");
    } catch (error) {
      alert("Signup failed: " + (error.response?.data?.error || "Unknown error"));
      console.error(error);
    }
  };

  return (
    <div className="abcd">
      <div className="efgh">
        {/* Aside Image */}
        <div className="ijkl">
          <img src="https://www.trinitymobility.com/tMobilityPortal/sites/Assets/seg_dm_image07.png" alt="Signup Illustration" />
        </div>

        <div className="mnop">
          <h1 className="qrst">SIGN UP</h1>
          <form onSubmit={handleSignup} encType="multipart/form-data">
            <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
            {errors.name && <span className="error">{errors.name}</span>}

            <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
            {errors.email && <span className="error">{errors.email}</span>}

            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
            {errors.password && <span className="error">{errors.password}</span>}

            <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
            {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}

            <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
            {errors.phone && <span className="error">{errors.phone}</span>}

            <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
            {errors.address && <span className="error">{errors.address}</span>}

            <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required />
            {errors.age && <span className="error">{errors.age}</span>}

            <select name="role" value={formData.role} onChange={handleChange} required>
              <option value="" disabled>Select Role</option>
              <option value="volunteer">Volunteer</option>
              <option value="public">Public</option>
            </select>
            {errors.role && <span className="error">{errors.role}</span>}

            <div className="uvwx">
              <input type="file" name="photo" onChange={handleFileChange} required />
              <span>Upload Photo</span>
            </div>
            {errors.photo && <span className="error">{errors.photo}</span>}

            {formData.role === "volunteer" && (
              <>
                <select name="skills" value={formData.skills} onChange={handleChange} required>
                  <option value="" disabled>Select Skill</option>
                  {skillsList.map((skill) => (
                    <option key={skill._id} value={skill.name}>{skill.name}</option>
                  ))}
                </select>
                {errors.skills && <span className="error">{errors.skills}</span>}
              </>
            )}

            <button type="submit">Signup</button>
          </form>

          <button onClick={() => navigate("/login")} className="cdef">Login</button>
        </div>
      </div>





      {/* Internal CSS */}
      <style>
        {`
          .abcd {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: #f4f4f4;
          }
          .efgh {
            display: flex;
            background: white;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
            border-radius: 10px;
            overflow: hidden;
            max-width: 900px;
            width: 100%;
          }
          .ijkl {
            flex: 1;
            background: #ddd;
          }
          .ijkl img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .mnop {
            flex: 1;
            padding: 30px;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .qrst {
            text-align: center;
            font-size: 24px;
            margin-bottom: 20px;
          }
          form {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          input, select {
            padding: 10px;
            font-size: 16px;
            border: 1px solid #ccc;
            border-radius: 5px;
          }
          .uvwx {
            position: relative;
            cursor: pointer;
          }
          .uvwx input {
            display: none;
          }
          .uvwx span {
            display: inline-block;
            background: #007bff;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            text-align: center;
          }
          .yzab {
            display: flex;
            gap: 10px;
          }
          button {
            background: #007bff;
            color: white;
            padding: 10px;
            font-size: 16px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: 0.3s;
          }
          button:hover {
            background: #0056b3;
          }
          .cdef {
            background: #28a745;
            margin-top: 10px;
          }
          .cdef:hover {
            background: #218838;
          }
          @media (max-width: 768px) {
            .efgh {
              flex-direction: column;
              max-width: 90%;
            }
            .ijkl {
              display: none;
            }
          }
        `}
      </style>
    </div>
  );
};

export default SignupPage;
