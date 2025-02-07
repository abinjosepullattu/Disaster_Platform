import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/VolunteerRejected.css";

const VolunteerRejected = () => {
  const [volunteers, setVolunteers] = useState([]);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/rejected-volunteers");
      setVolunteers(response.data);
    } catch (error) {
      console.error("Error fetching rejected volunteers:", error);
    }
  };

  const handleDelete = async (volunteerId) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/delete-volunteer/${volunteerId}`);
      setVolunteers(volunteers.filter((vol) => vol._id !== volunteerId));
      alert("Volunteer deleted successfully!");
    } catch (error) {
      console.error("Error deleting volunteer:", error);
    }
  };

  return (
    <div className="volunteer-list">
      <h2>Rejected Volunteers</h2>
      <ul>
        {volunteers.map((volunteer) => (
          <li key={volunteer._id}>
            {volunteer.userId.name} - {volunteer.userId.email}
            <button onClick={() => handleDelete(volunteer._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VolunteerRejected;
