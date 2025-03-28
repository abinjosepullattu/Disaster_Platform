import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import image from "../images/image7.jpg"

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
  const [fileNames, setFileNames] = useState({
    photo: '',
    idProof: '',
    experienceCertificate: ''
  });

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
    const { name, files } = e.target;
    
    // Validate file type and size
    if (files[0]) {
      const file = files[0];
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];

      // Validate file size
      if (file.size > maxSize) {
        setErrors(prevErrors => ({
          ...prevErrors, 
          [name]: 'File size must be less than 5MB'
        }));
        return;
      }

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        setErrors(prevErrors => ({
          ...prevErrors, 
          [name]: 'Invalid file type. Please upload JPEG, PNG, GIF, or PDF'
        }));
        return;
      }

      // Clear any previous errors for this file
      const { [name]: removedError, ...rest } = errors;
      setErrors(rest);

      // Update form data and file name
      setFormData(prevData => ({ 
        ...prevData, 
        [name]: file 
      }));

      setFileNames(prevNames => ({
        ...prevNames,
        [name]: file.name
      }));
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    const validationErrors = {};
    Object.keys(formData).forEach(key => {
      if (key === 'skills' && formData.role !== 'volunteer') return;
      
      if (!formData[key] && key !== 'idProof' && key !== 'experienceCertificate') {
        validationErrors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required`;
      }
    });

    // Check for existing validation errors
    if (Object.keys(validationErrors).length > 0 || 
        Object.values(errors).some(error => error)) {
      setErrors(prevErrors => ({ ...prevErrors, ...validationErrors }));
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });

    try {
      await axios.post("http://localhost:5000/api/users/signup", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Signup successful! Please wait for admin approval.");
      navigate("/login");
    } catch (error) {
      alert("Signup failed: " + (error.response?.data?.error || "Unknown error"));
      console.error(error);
    }
  };

  const renderFileUpload = (name, label) => {
    return (
      <div className="D3E4F">
        <input 
          type="file" 
          name={name} 
          id={name}
          onChange={handleFileChange} 
          accept=".jpg,.jpeg,.png,.gif,.pdf"
        />
        <label htmlFor={name} className="P1Q2R">
          {fileNames[name] || label}
        </label>
        {errors[name] && <span className="M9N0O">{errors[name]}</span>}
      </div>
    );
  };

  return (
    <div className="X1Y2Z">
      <div className="P3Q4R">
        {/* Aside Image */}
        <div className="M5N6O">
          <img src={image} alt="Signup Illustration" />
        </div>

        <div className="L7K8J">
          <h1 className="A1B2C">SIGN UP</h1>
          <form onSubmit={handleSignup} encType="multipart/form-data">
            <input 
              type="text" 
              name="name" 
              placeholder="Full Name" 
              value={formData.name} 
              onChange={handleChange} 
            />
            {errors.name && <span className="M9N0O">{errors.name}</span>}

            <input 
              type="email" 
              name="email" 
              placeholder="Email Address" 
              value={formData.email} 
              onChange={handleChange} 
            />
            {errors.email && <span className="M9N0O">{errors.email}</span>}

            <input 
              type="password" 
              name="password" 
              placeholder="Password" 
              value={formData.password} 
              onChange={handleChange} 
            />
            {errors.password && <span className="M9N0O">{errors.password}</span>}

            <input 
              type="password" 
              name="confirmPassword" 
              placeholder="Confirm Password" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
            />
            {errors.confirmPassword && <span className="M9N0O">{errors.confirmPassword}</span>}

            <input 
              type="text" 
              name="phone" 
              placeholder="Phone Number" 
              value={formData.phone} 
              onChange={handleChange} 
            />
            {errors.phone && <span className="M9N0O">{errors.phone}</span>}

            <input 
              type="text" 
              name="address" 
              placeholder="Address" 
              value={formData.address} 
              onChange={handleChange} 
            />
            {errors.address && <span className="M9N0O">{errors.address}</span>}

            <input 
              type="number" 
              name="age" 
              placeholder="Age" 
              value={formData.age} 
              onChange={handleChange} 
            />
            {errors.age && <span className="M9N0O">{errors.age}</span>}

            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange}
            >
              <option value="" disabled>Select Role</option>
              <option value="volunteer">Volunteer</option>
              <option value="public">Public</option>
            </select>
            {errors.role && <span className="M9N0O">{errors.role}</span>}

            {renderFileUpload('photo', 'Upload Photo')}

            {formData.role === "volunteer" && (
              <>
                <select 
                  name="skills" 
                  value={formData.skills} 
                  onChange={handleChange}
                >
                  <option value="" disabled>Select Skill</option>
                  {skillsList.map((skill) => (
                    <option key={skill._id} value={skill.name}>
                      {skill.name}
                    </option>
                  ))}
                </select>
                {errors.skills && <span className="M9N0O">{errors.skills}</span>}

                <div className="G5H6I">
                  {renderFileUpload('idProof', 'Upload ID Proof')}
                  {renderFileUpload('experienceCertificate', 'Upload Experience Certificate')}
                </div>
              </>
            )}

            <button type="submit">Signup</button>
          </form>

          <button onClick={() => navigate("/login")} className="J7K8L">
            Login
          </button>
        </div>
      </div>

      {/* Internal CSS */}
      <style>{`
        .X1Y2Z {
          display: flex;
        background: linear-gradient(130deg, #0c0d19, #d4c9c412); 
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .P3Q4R {
          display: flex;
          background: #fff;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          overflow: hidden;
          max-width: 900px;
          width: 100%;
        }
        .M5N6O {
          flex: 1;
          background: #ececec;
        }
        .M5N6O img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .L7K8J {
          flex: 1;
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          overflow-y: auto;
        }
        .A1B2C {
          text-align: center;
          font-size: 28px;
          font-weight: 600;
          color: #333;
          margin-bottom: 25px;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        input, select {
          padding: 12px 15px;
          font-size: 16px;
          border: 1px solid #ccc;
          border-radius: 6px;
          transition: border 0.3s;
        }
        input:focus, select:focus {
          border-color: #007bff;
          outline: none;
        }
        .D3E4F {
          position: relative;
          margin-bottom: 10px;
        }
        .D3E4F input[type="file"] {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        .P1Q2R {
          display: block;
          background: linear-gradient(135deg, #007bff, #00a1ff);
          color: #fff;
          padding: 12px 20px;
          border-radius: 6px;
          cursor: pointer;
          text-align: center;
          font-size: 16px;
          transition: background 0.3s;
        }
        .P1Q2R:hover {
          background: linear-gradient(135deg, #0056b3, #0088cc);
        }
        .G5H6I {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }
        button {
          background: #007bff;
          color: #fff;
          padding: 12px 20px;
          font-size: 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.3s, transform 0.2s;
        }
        button:hover {
          background: #0056b3;
          transform: translateY(-2px);
        }
        .J7K8L {
          background: #28a745;
          margin-top: 20px;
        }
        .J7K8L:hover {
          background: #218838;
        }
        @media (max-width: 768px) {
          .P3Q4R {
            flex-direction: column;
            max-width: 90%;
          }
          .M5N6O {
            display: none;
          }
        }
        .M9N0O {
          color: #d9534f;
          font-size: 14px;
          margin-top: 5px;
        }
      `}</style>
    </div>
  );
};

export default SignupPage;
