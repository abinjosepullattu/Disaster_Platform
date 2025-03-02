import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/ResourceTypeForm.css";

const ResourceTypeForm = () => {
  const [form, setForm] = useState({ name: "" });
  const [resourceTypes, setResourceTypes] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchResourceTypes();
  }, []);

  const fetchResourceTypes = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/resourceTypes/list");
      setResourceTypes(response.data);
    } catch (error) {
      console.error("Error fetching resource types:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setMessage({ text: "⚠️ Please enter a resource type.", type: "danger" });
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/resourceTypes/add", { name: form.name });
      setMessage({ text: "✅ Resource Type added successfully!", type: "success" });
      setForm({ name: "" });
      fetchResourceTypes();
    } catch (error) {
      console.error(error);
      setMessage({ text: "❌ Error adding resource type.", type: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/resourceTypes/delete/${id}`);
      setMessage({ text: "🗑️ Resource Type deleted successfully!", type: "success" });
      fetchResourceTypes();
    } catch (error) {
      console.error("Error deleting resource type:", error);
      setMessage({ text: "❌ Error deleting resource type.", type: "danger" });
    }
  };

  return (
    <div className="resource-container">
      <h2>📦 Manage Resource Types</h2>

      {message.text && <div className={`alert ${message.type}`}>{message.text}</div>}

      <form onSubmit={handleSubmit} className="resource-form">
        <input
          type="text"
          value={form.name}
          placeholder="Enter resource type"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "➕ Add Resource"}
        </button>
      </form>

      <h3>📋 Existing Resource Types</h3>
      {resourceTypes.length > 0 ? (
        <div className="resource-list">
          {resourceTypes.map((resource) => (
            <div key={resource._id} className="resource-item">
              <span>{resource.name}</span>
              <button className="delete-btn" onClick={() => handleDelete(resource._id)}>🗑️</button>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-resources">No resource types added yet.</p>
      )}
    </div>
  );
};

export default ResourceTypeForm;
