import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/TaskTypeForm.css";

const TaskTypeForm = () => {
  const [form, setForm] = useState({ name: "" });
  const [taskTypes, setTaskTypes] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTaskTypes();
  }, []);

  const fetchTaskTypes = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/tasks/list");
      setTaskTypes(response.data);
    } catch (error) {
      console.error("Error fetching task types:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setMessage({ text: "⚠️ Please enter a task type.", type: "danger" });
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/tasks/insert", { name: form.name });
      setMessage({ text: "✅ Task Type added successfully!", type: "success" });
      setForm({ name: "" });
      fetchTaskTypes();
    } catch (error) {
      console.error(error);
      setMessage({ text: "❌ Error adding task type.", type: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/delete/${id}`);
      setMessage({ text: "🗑️ Task Type deleted successfully!", type: "success" });
      fetchTaskTypes();
    } catch (error) {
      console.error("Error deleting task type:", error);
      setMessage({ text: "❌ Error deleting task type.", type: "danger" });
    }
  };

  return (
    <div className="task-container">
      <h2>📦 Manage Task Types</h2>

      {message.text && <div className={`alert ${message.type}`}>{message.text}</div>}

      <form onSubmit={handleSubmit} className="task-form">
        <input
          type="text"
          value={form.name}
          placeholder="Enter task type"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "➕ Add Task"}
        </button>
      </form>

      <h3>📋 Existing Task Types</h3>
      {taskTypes.length > 0 ? (
        <div className="task-list">
          {taskTypes.map((task) => (
            <div key={task._id} className="task-item">
              <span>#{task.typeId} - {task.name}</span>
              <button className="delete-btn" onClick={() => handleDelete(task._id)}>🗑️</button>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-tasks">No task types added yet.</p>
      )}
    </div>
  );
};

export default TaskTypeForm;
