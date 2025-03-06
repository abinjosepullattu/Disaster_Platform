import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const AddInmates = () => {
  const { shelterId } = useParams();
  const [inmates, setInmates] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    place: "",
    age: "",
    contact: ""
  });

  const fetchInmates = () => {
    axios
      .get(`http://localhost:5000/api/inmates/shelters/${shelterId}/inmates`)
      .then((response) => setInmates(response.data))
      .catch((error) => console.error("Error fetching inmates:", error));
  };

  useEffect(() => {
    fetchInmates();
  }, [shelterId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddInmate = (e) => {
    e.preventDefault();
    axios
      .post(`http://localhost:5000/api/inmates/shelters/${shelterId}/inmates`, formData)
      .then((response) => {
        alert("Inmate added successfully!");
        setFormData({ name: "", place: "", age: "", contact: "" });
        fetchInmates();
      })
      .catch((error) => {
        console.error("Error adding inmate:", error);
        alert("Error adding inmate");
      });
  };

  const handleDeleteInmate = (inmateId) => {
    if (!window.confirm("Are you sure you want to delete this inmate?")) return;
    axios
      .delete(`http://localhost:5000/api/inmates/shelters/${inmateId}`)
      .then((response) => {
        alert("Inmate deleted successfully!");
        fetchInmates();
      })
      .catch((error) => {
        console.error("Error deleting inmate:", error);
        alert("Error deleting inmate");
      });
  };

  return (
    <div style={{ padding: "20px" }}>
      <center><h1>Add Inmates</h1><br/></center>
      <form onSubmit={handleAddInmate} style={{ marginBottom: "20px" }}>
        <div>
          <label>Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div>
          <label>Place:</label>
          <input type="text" name="place" value={formData.place} onChange={handleChange} required />
        </div>
        <div>
          <label>Age:</label>
          <input type="number" name="age" value={formData.age} onChange={handleChange} required />
        </div>
        <div>
          <label>Contact:</label>
          <input type="text" name="contact" value={formData.contact} onChange={handleChange} required />
        </div>
        <button type="submit">Add Inmate</button>
      </form>

      <h3>Inmate List</h3>
      {inmates.length === 0 ? (
        <p>No inmates added yet.</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Name</th>
              <th>Place</th>
              <th>Age</th>
              <th>Contact</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {inmates.map((inmate) => (
              <tr key={inmate._id}>
                <td>{inmate.name}</td>
                <td>{inmate.place}</td>
                <td>{inmate.age}</td>
                <td>{inmate.contact}</td>
                <td>
                  <button onClick={() => handleDeleteInmate(inmate._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AddInmates;
