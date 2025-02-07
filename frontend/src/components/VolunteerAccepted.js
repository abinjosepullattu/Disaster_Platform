import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/VolunteerAccepted.css";

const VolunteerAccepted = () => {
  const [volunteers, setVolunteers] = useState([]);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/accepted-volunteers");
      setVolunteers(response.data);
    } catch (error) {
      console.error("Error fetching accepted volunteers:", error);
    }
  };

  return (
    <div className="volunteer-list">
      <h2>Accepted Volunteers</h2>
      <ul>
        {volunteers.map((volunteer) => (
          <li key={volunteer._id}>{volunteer.userId.name} - {volunteer.userId.email}</li>
        ))}
      </ul>
    </div>
  );
};

export default VolunteerAccepted;
