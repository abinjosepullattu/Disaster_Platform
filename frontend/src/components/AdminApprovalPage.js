import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AdminApprovalPage.css"; // Create this CSS file for styling

const AdminApprovalPage = () => {
  const [volunteers, setVolunteers] = useState([]);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/pending-volunteers");
      setVolunteers(response.data);
    } catch (error) {
      console.error("Error fetching volunteers:", error);
    }
  };

  const handleApproval = async (volunteerId, status) => {
    try {
      await axios.post("http://localhost:5000/api/admin/approve-volunteer", {
        volunteerId,
        status,
      });
      alert(`Volunteer ${status}`);
      fetchVolunteers(); // Refresh list
    } catch (error) {
      console.error("Error updating volunteer status:", error);
    }
  };

  return (
    <div className="admin-approval-container">
      <h2>Pending Volunteer Approvals</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Skills</th>
            <th>ID Proof</th>
            <th>Experience Certificate</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {volunteers.length === 0 ? (
            <tr>
              <td colSpan="7">No pending approvals</td>
            </tr>
          ) : (
            volunteers.map((volunteer) => (
              <tr key={volunteer._id}>
                <td>{volunteer.name}</td>
                <td>{volunteer.email}</td>
                <td>{volunteer.phone}</td>
                <td>{volunteer.skills}</td>
                <td><a href={`http://localhost:5000/${volunteer.idProof}`} target="_blank" rel="noopener noreferrer">View</a></td>
                <td><a href={`http://localhost:5000/${volunteer.experienceCertificate}`} target="_blank" rel="noopener noreferrer">View</a></td>
                <td>
                  <button onClick={() => handleApproval(volunteer._id, "approved")} className="approve-btn">Approve</button>
                  <button onClick={() => handleApproval(volunteer._id, "rejected")} className="reject-btn">Reject</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminApprovalPage;
