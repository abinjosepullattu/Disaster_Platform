import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AdminApprovalPage.css";

const AdminApprovalPage = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/pending-volunteers");
      setVolunteers(response.data);
    } catch (error) {
      console.error("Error fetching volunteers:", error);
      setError("Failed to load pending volunteers.");
    }
  };

  const handleApproval = async (volunteerId, status) => {
    try {
      const applicationStatus = status === "approved" ? 1 : 2;
      const response = await axios.post("http://localhost:5000/api/admin/approve-volunteer", {
        volunteerId,
        applicationStatus, // Ensure the correct field is sent
      });

      alert(`Application ${status === "approved" ? "Accepted" : "Rejected"}`); // Show alert

      // Remove the approved/rejected volunteer from the state immediately
      setVolunteers((prevVolunteers) =>
        prevVolunteers.filter((volunteer) => volunteer._id !== volunteerId)
      );
    } catch (error) {
      console.error("Error updating volunteer status:", error);
      alert("Failed to update volunteer status.");
    }
  };

  return (
    <div className="admin-approval-container">
      <h2>Pending Volunteer Approvals</h2>
      {error && <p className="error-message">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Skills</th>
            <th>ID Proof</th>
            <th>Experience Certificate</th>
            <th>Application Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {volunteers.length === 0 ? (
            <tr>
              <td colSpan="8">No pending approvals</td>
            </tr>
          ) : (
            volunteers.map((volunteer) => (
              <tr key={volunteer._id}>
                <td>{volunteer.userId?.name || "N/A"}</td>
                <td>{volunteer.userId?.email || "N/A"}</td>
                <td>{volunteer.userId?.phone || "N/A"}</td>
                <td>{volunteer.skills.join(", ")}</td>
                <td><a href={`http://localhost:5000/${volunteer.idProof}`} target="_blank" rel="noopener noreferrer">View</a></td>
                <td><a href={`http://localhost:5000/${volunteer.experienceCertificate}`} target="_blank" rel="noopener noreferrer">View</a></td>
                <td>{volunteer.applicationStatus === 0 ? "Pending" : volunteer.applicationStatus === 1 ? "Accepted" : "Rejected"}</td>
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
