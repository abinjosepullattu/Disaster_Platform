import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar"; // Adjust this path as required

const AdminApprovalPage = () => {
  const navigate = useNavigate();
  const [volunteers, setVolunteers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/pending-volunteers");
      setVolunteers(response.data);
    } catch (err) {
      console.error("Error fetching volunteers:", err);
      setError("Failed to load pending volunteers.");
    }
  };

  const handleApproval = async (volunteerId, status) => {
    try {
      const applicationStatus = status === "approved" ? 1 : 2;
      await axios.post("http://localhost:5000/api/admin/approve-volunteer", {
        volunteerId,
        applicationStatus,
      });
      alert(`Application ${status === "approved" ? "Accepted" : "Rejected"}`);
      setVolunteers((prevVolunteers) =>
        prevVolunteers.filter((volunteer) => volunteer._id !== volunteerId)
      );
    } catch (err) {
      console.error("Error updating volunteer status:", err);
      alert("Failed to update volunteer status.");
    }
  };

  // Inline CSS with unique 7-character class names
  const styles = {
    container: {
      display: "flex",
      background: "#f4f4f4",
      color: "#333",
      height: "100vh",
    },
    mainContent: {
      flex: 1,
      padding: "30px",
      textAlign: "center",
    },
    pageTitle: {
      fontSize: "28px",
      marginBottom: "20px",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    tableHeader: {
      background: "#555",
      color: "white",
    },
    tableCell: {
      padding: "10px",
      border: "1px solid #ddd",
    },
    errorMessage: {
      color: "red",
    },
  };

  return (
    <div style={styles.container} className="A1B2C3D">
      {/* Sidebar imported from your existing component */}
      <AdminSidebar />

      {/* Main Content */}
      <div style={styles.mainContent} className="E4F5G6H">
        <h2 style={styles.pageTitle} className="I7J8K9L">Pending Volunteer Approvals</h2>
        {error && <p style={styles.errorMessage} className="M0N1O2P">{error}</p>}
        <table style={styles.table} className="Q3R4S5T">
          <thead>
            <tr style={styles.tableHeader} className="U6V7W8X">
              <th style={styles.tableCell} className="Y9Z0A1B">Name</th>
              <th style={styles.tableCell} className="C2D3E4F">Email</th>
              <th style={styles.tableCell} className="G5H6I7J">Phone</th>
              <th style={styles.tableCell} className="K8L9M0N">Skills</th>
              <th style={styles.tableCell} className="O1P2Q3R">ID Proof</th>
              <th style={styles.tableCell} className="S4T5U6V">Experience Certificate</th>
              <th style={styles.tableCell} className="W7X8Y9Z">Application Status</th>
              <th style={styles.tableCell} className="A1B2C3E">Actions</th>
            </tr>
          </thead>
          <tbody className="D4E5F6G">
            {volunteers.length === 0 ? (
              <tr>
                <td colSpan="8" style={styles.tableCell} className="H7I8J9K">
                  No pending approvals
                </td>
              </tr>
            ) : (
              volunteers.map((volunteer) => (
                <tr key={volunteer._id} className="L0M1N2O">
                  <td style={styles.tableCell} className="P3Q4R5S">
                    {volunteer.userId?.name || "N/A"}
                  </td>
                  <td style={styles.tableCell} className="T6U7V8W">
                    {volunteer.userId?.email || "N/A"}
                  </td>
                  <td style={styles.tableCell} className="X9Y0Z1A">
                    {volunteer.userId?.phone || "N/A"}
                  </td>
                  <td style={styles.tableCell} className="B2C3D4E">
                    {volunteer.skills.join(", ")}
                  </td>
                  <td style={styles.tableCell} className="F5G6H7I">
                    <a href={`http://localhost:5000/${volunteer.idProof}`} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </td>
                  <td style={styles.tableCell} className="J8K9L0M">
                    <a href={`http://localhost:5000/${volunteer.experienceCertificate}`} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </td>
                  <td style={styles.tableCell} className="N1O2P3Q">
                    {volunteer.applicationStatus === 0
                      ? "Pending"
                      : volunteer.applicationStatus === 1
                      ? "Accepted"
                      : "Rejected"}
                  </td>
                  <td style={styles.tableCell} className="R4S5T6U">
                    <button onClick={() => handleApproval(volunteer._id, "approved")} className="V7W8X9Y" style={{ marginRight: "5px" }}>
                      Approve
                    </button>
                    <button onClick={() => handleApproval(volunteer._id, "rejected")} className="Z0A1B2C">
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminApprovalPage;
