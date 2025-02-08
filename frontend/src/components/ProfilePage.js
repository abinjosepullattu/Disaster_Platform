import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/ProfilePage.css";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load profile." });
    }
  };

  const handleFileChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handlePhotoUpload = async () => {
    if (!photo) {
      setMessage({ type: "error", text: "Please select a photo first." });
      return;
    }

    const formData = new FormData();
    formData.append("photo", photo);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put("http://localhost:5000/api/profile/update-photo", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage({ type: "success", text: response.data.message });
      fetchProfile(); // Refresh profile after updating
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update profile photo." });
    }
  };

  if (!user) return <p>Loading profile...</p>;

  return (
    <div className="profile-container">
      <h2>My Profile</h2>
      {message && <p className={message.type === "error" ? "error-message" : "success-message"}>{message.text}</p>}
      <div className="profile-photo-container">
        {user.profilePhotoUrl ? (
          <img src={user.profilePhotoUrl} alt="Profile" className="profile-photo" />
        ) : (
          <p>No profile photo</p>
        )}
      </div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handlePhotoUpload}>Update Photo</button>

      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Phone:</strong> {user.phone}</p>
      <p><strong>Address:</strong> {user.address}</p>
      <p><strong>Age:</strong> {user.age}</p>
    </div>
  );
};

export default ProfilePage;
