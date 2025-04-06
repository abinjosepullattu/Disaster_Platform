import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/ProfilePage.css";
import { useUser } from "../context/UserContext";

const VolunteerProfilePage = () => {
  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/profile/${user.id}`);
      setProfile(response.data);
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
    formData.append("userId", user.id); // Send userId in request body

    try {
      const response = await axios.put("http://localhost:5000/api/profile/update-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage({ type: "success", text: response.data.message });
      fetchProfile(); // Refresh profile after updating
    } catch (error) {
      console.error("Error response:", error.response?.data);
      setMessage({ type: "error", text: "Failed to update profile photo." });
    }
  };

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div className="profile-container">
      <h2>My Profile</h2>
      {message && <p className={message.type === "error" ? "error-message" : "success-message"}>{message.text}</p>}
      <div className="profile-photo-container">
        {profile.profilePhotoUrl ? (
          <img src={profile.profilePhotoUrl} alt="Profile" className="profile-photo" />
        ) : (
          <p>No profile photo</p>
        )}
      </div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handlePhotoUpload}>Update Photo</button>

      <p><strong>Name:</strong> {profile.name}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Phone:</strong> {profile.phone}</p>
      <p><strong>Address:</strong> {profile.address}</p>
      <p><strong>Age:</strong> {profile.age}</p>
    </div>
  );
};

export default VolunteerProfilePage;
