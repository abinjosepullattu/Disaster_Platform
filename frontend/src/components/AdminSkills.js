import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar"; // Adjust the path as needed

const AdminAddSkill = () => {
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [editingSkill, setEditingSkill] = useState(null);
  const [updatedName, setUpdatedName] = useState("");

  // Inline CSS for the main content (from your original code)
  const styles = {
    container: {
      display: "flex",
      height: "100vh",
      fontFamily: "'Roboto', sans-serif",
      background: "#f0f2f5",
    },
    mainContent: {
      flex: 1,
      padding: "30px",
      background: "#ffffff",
      overflowY: "auto",
    },
    pageTitle: {
      textAlign: "center",
      color: "#2c3e50",
      marginBottom: "30px",
      fontSize: "2.2rem",
      fontWeight: "bold",
    },
    inputContainer: {
      marginBottom: "30px",
      display: "flex",
      justifyContent: "center",
      gap: "15px",
    },
    input: {
      padding: "12px",
      width: "300px",
      borderRadius: "6px",
      border: "2px solid #3498db",
      transition: "all 0.3s ease",
      fontSize: "1rem",
    },
    addButton: {
      padding: "12px 20px",
      background: "#2ecc71",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      fontSize: "1rem",
    },
    table: {
      width: "100%",
      borderRadius: "10px",
      overflow: "hidden",
      boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
    },
    tableHeader: {
      background: "linear-gradient(to right, #3498db, #2980b9)",
      color: "white",
    },
    tableCell: {
      padding: "15px",
      border: "1px solid #e0e0e0",
    },
    editInput: {
      width: "100%",
      padding: "10px",
      border: "2px solid #3498db",
      borderRadius: "6px",
      fontSize: "1rem",
    },
    actionButton: {
      padding: "10px 15px",
      margin: "0 5px",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      fontSize: "0.9rem",
    },
    editButton: {
      background: "#f39c12",
      color: "white",
    },
    saveButton: {
      background: "#2ecc71",
      color: "white",
    },
    deleteButton: {
      background: "#e74c3c",
      color: "white",
    },
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/skills");
      setSkills(response.data);
    } catch (error) {
      console.error("Error fetching skills:", error);
      alert("Error fetching skills: " + error.message);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) {
      alert("Skill name cannot be empty");
      return;
    }
    
    try {
      const response = await axios.post("http://localhost:5000/api/skills", { name: newSkill.trim() });
      setSkills([...skills, response.data]);
      setNewSkill("");
    } catch (error) {
      console.error("Error adding skill:", error);
      alert("Error adding skill: " + (error.response?.data?.error || error.message));
    }
  };

  const handleUpdateSkill = async (id) => {
    if (!updatedName.trim()) {
      alert("Skill name cannot be empty");
      return;
    }
    
    try {
      const response = await axios.put(`http://localhost:5000/api/skills/${id}`, { name: updatedName.trim() });
      setSkills(skills.map((skill) => (skill._id === id ? response.data : skill)));
      setEditingSkill(null);
    } catch (error) {
      console.error("Error updating skill:", error);
      alert("Error updating skill: " + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteSkill = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/skills/${id}`);
      setSkills(skills.filter((skill) => skill._id !== id));
    } catch (error) {
      console.error("Error deleting skill:", error);
      alert("Error deleting skill: " + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div style={styles.container}>
      {/* Sidebar imported as separate component */}
      <AdminSidebar />
      
      {/* Main Content */}
      <main style={styles.mainContent}>
        <h2 style={styles.pageTitle}>Manage Skills</h2>
        <div style={styles.inputContainer}>
          <input
            type="text"
            placeholder="Enter Skill Name"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleAddSkill} style={styles.addButton}>
            Add Skill
          </button>
        </div>

        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.tableCell}>Skill</th>
              <th style={styles.tableCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {skills.map((skill) => (
              <tr key={skill._id}>
                <td style={styles.tableCell}>
                  {editingSkill === skill._id ? (
                    <input
                      type="text"
                      value={updatedName}
                      onChange={(e) => setUpdatedName(e.target.value)}
                      style={styles.editInput}
                    />
                  ) : (
                    skill.name
                  )}
                </td>
                <td style={styles.tableCell}>
                  {editingSkill === skill._id ? (
                    <button
                      onClick={() => handleUpdateSkill(skill._id)}
                      style={{ ...styles.actionButton, ...styles.saveButton }}
                    >
                      Save
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingSkill(skill._id);
                          setUpdatedName(skill.name);
                        }}
                        style={{ ...styles.actionButton, ...styles.editButton }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSkill(skill._id)}
                        style={{ ...styles.actionButton, ...styles.deleteButton }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default AdminAddSkill;
