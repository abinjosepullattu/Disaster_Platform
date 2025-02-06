import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AdminSkills.css";

const AdminSkills = () => {
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [editingSkill, setEditingSkill] = useState(null);
  const [updatedName, setUpdatedName] = useState("");

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/skills");
      setSkills(response.data);
    } catch (error) {
      console.error("Error fetching skills:", error);
    }
  };

  const handleAddSkill = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/skills", { name: newSkill });
      setSkills([...skills, response.data]);
      setNewSkill("");
    } catch (error) {
      alert("Error adding skill: " + error.response?.data?.error);
    }
  };

  const handleUpdateSkill = async (id) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/skills/${id}`, { name: updatedName });
      setSkills(skills.map(skill => skill._id === id ? response.data : skill));
      setEditingSkill(null);
    } catch (error) {
      alert("Error updating skill: " + error.response?.data?.error);
    }
  };

  const handleDeleteSkill = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/skills/${id}`);
      setSkills(skills.filter(skill => skill._id !== id));
    } catch (error) {
      alert("Error deleting skill: " + error.response?.data?.error);
    }
  };

  return (
    <div className="admin-skills-container">
      <h2>Manage Skills</h2>

      <div className="add-skill">
        <input
          type="text"
          placeholder="Enter Skill Name"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
        />
        <button onClick={handleAddSkill}>Add Skill</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Skill</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {skills.map(skill => (
            <tr key={skill._id}>
              <td>
                {editingSkill === skill._id ? (
                  <input
                    type="text"
                    value={updatedName}
                    onChange={(e) => setUpdatedName(e.target.value)}
                  />
                ) : (
                  skill.name
                )}
              </td>
              <td>
                {editingSkill === skill._id ? (
                  <button onClick={() => handleUpdateSkill(skill._id)}>Save</button>
                ) : (
                  <>
                    <button onClick={() => { setEditingSkill(skill._id); setUpdatedName(skill.name); }}>Edit</button>
                    <button onClick={() => handleDeleteSkill(skill._id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminSkills;
