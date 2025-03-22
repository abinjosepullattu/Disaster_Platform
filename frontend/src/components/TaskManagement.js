import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/TaskManagement.css';
import { useNavigate } from 'react-router-dom';

const TaskManagement = () => {
  const navigate = useNavigate();
  const [taskType, setTaskType] = useState('');
  const [description, setDescription] = useState('');
  const [incident, setIncident] = useState('');
  const [volunteer, setVolunteer] = useState('');
  const [shelter, setShelter] = useState('');
  // const [resourceType, setResourceType] = useState('');
  const [resourceType, setResourceType] = useState(''); // Single value instead of array
  const [deliveryDateTime, setDeliveryDateTime] = useState('');

  const [shelterFood, setShelterFood] = useState('');
  const [rescueVolunteer, setRescueVolunteer] = useState('');

  // const [resourceType, setResourceType] = useState([]);

  const [taskTypes, setTaskTypes] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [resourceTypes, setResourceTypes] = useState([]);
  const [skill, setSkill] = useState('');  // Ensure this is added
  const [skills, setSkills] = useState([]); // Ensure this is added
  const [selectedTaskType, setSelectedTaskType] = useState(null);


  useEffect(() => {
    // axios.get('http://localhost:5000/api/tasks/skills').then(res => setTaskTypes(res.data));
    axios.get('http://localhost:5000/api/tasks/skills')
      .then(res => setSkills(res.data))
      .catch(err => console.error(err));
    if (skill) {
      axios.get(`http://localhost:5000/api/tasks/volunteers/${skill}`)
        .then(res => setVolunteers(res.data))
        .catch(err => console.error(err));
    }

    // axios.get('http://localhost:5000/api/tasks/incidents').then(res => setIncidents(res.data));
    // axios.get('http://localhost:5000/api/tasks/shelters').then(res => setShelters(res.data));
    // axios.get('http://localhost:5000/api/tasks/rescueVolunteers').then(res => setRescueVolunteers(res.data));

    axios.get('http://localhost:5000/api/tasks/list')
      .then(res => setTaskTypes(res.data))
      .catch(err => console.error("Failed to fetch task types", err));

    axios.get('http://localhost:5000/api/tasks/res-types')
      .then(res => setResourceTypes(Array.isArray(res.data) ? res.data : []))
      .catch(err => {
        console.error("Failed to fetch resource types", err);
        setResourceTypes([]); // Ensure it's always an array
      });


    axios.get('http://localhost:5000/api/tasks/incidents')
      .then(res => setIncidents(res.data))
      .catch(err => console.error("Failed to fetch incidents", err));

    axios.get('http://localhost:5000/api/tasks/shelters')
      .then(res => setShelters(res.data))
      .catch(err => console.error("Failed to fetch shelters", err));
  }, [skill]);

  //fetch volunteers based on skills


  // useEffect(() => {
  //   if (selectedSkill) {
  //     axios.get(`http://localhost:5000/api/tasks/volunteers/${selectedSkill}`)
  //       .then(res => setVolunteers(res.data))
  //       .catch(err => console.error("Failed to fetch volunteers", err));
  //   }
  // }, [selectedSkill]);


  const handleSubmit = (e) => {
    e.preventDefault();

    const task = { taskType, description, incident, volunteer };

    const getExtraData = (taskType) => {
      switch (taskType) {
        case 1: // Transportation and Distribution
          return { shelter, resourceType, deliveryDateTime };

        case 2: // Preparing and Serving Food
          return { shelter };

        case 3: // Rescue Operation Management
        case 4: // Rescue Operator
          return { incident };
        case 5: // Resource Distribution
        return { shelter };

        default:
          return {}; // Ensures it's always an object
      }
    };
    
      // Determine extra data based on `taskType`
      let extraData = {};

      if (task.taskType === "Transportation and Distribution") {  // Transportation and Distribution
        extraData = { shelter, resourceType, deliveryDateTime };
      } else if (task.taskType === "Preparing and Serving Food") {  // Preparing and Serving Food
        extraData = {shelter};
      } else if (task.taskType === "Rescue Operation Management" || task.taskType === "Rescue Operator") {  // Rescue Operations
        extraData = { incident };
      }else if (task.taskType === "Resource Distribution") {  // Preparing and Serving Food
        extraData = {shelter};
      }

      const selectedTask = taskTypes.find(task => task.name === taskType);

      //debugging code
      console.log("Task:", task);
      console.log("Extra Data:", extraData);
      console.log("Selected Task:", selectedTask);


      axios.post('http://localhost:5000/api/tasks/add', { task, extraData })
      .then(() => {
          alert('Task assigned successfully!');
          navigate(-1); // Navigate back to the previous page
      })
      .catch(err => console.error(err));
};
    // const taskName = selectedTask ? selectedTask.name : "Unknown Task";

    // const extraData = getExtraData(selectedTaskType);
    // const selectedTask = taskTypes.find(task => task._id === selectedTaskType);
    // const taskName = selectedTask ? selectedTask.name : "Unknown Task";


    // axios.post('http://localhost:5000/api/tasks/add', { task, extraData })
    //   .then(() => alert('Task assigned successfully!'))
    //   .catch(err => console.error(err));
  

  return (
    <div className="container task-management">
      <h2>Task Management</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Task Type</label>
          <select className="form-control" value={taskType} onChange={(e) => setTaskType(e.target.value)} required>
            <option value="">Select Task Type</option>
            {taskTypes.map(type => <option key={type.name} value={type.name}>{type.name}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Incident</label>
          <select className="form-control" value={incident} onChange={(e) => setIncident(e.target.value)} required>
            <option value="">Select Incident</option>
            {incidents.map(inc => <option key={inc._id} value={inc._id}>{inc.location} Incident Type:{inc.type}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Required Skill</label>
          <select className="form-control" value={skill} onChange={(e) => setSkill(e.target.value)} required>
            <option value="">Select Required Skill</option>
            {skills.map((skill, index) => (
              <option key={index} value={skill}>{skill}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Volunteer</label>
          <select className="form-control" value={volunteer} onChange={(e) => setVolunteer(e.target.value)} required>
            <option value="">Select Volunteer</option>
            {volunteers.map(vol => <option key={vol._id} value={vol._id}>{vol.userId?.name}</option>)}
          </select>
        </div>


        {taskType === 'Transportation and Distribution' && (
          <>
            <div className="form-group">
              <label>Shelter</label>
              <select className="form-control" value={shelter} onChange={(e) => setShelter(e.target.value)} required>
                <option value="">Select Shelter</option>
                {shelters.map(s => <option key={s._id} value={s._id}>{s.location}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Resource Type</label>
              <select
                className="form-control"
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                required
              >
                <option value="">Select Resource Type</option>
                {Array.isArray(resourceTypes) && resourceTypes.length > 0 ? (
                  resourceTypes.map(r => (
                    <option key={r._id} value={r._id}>{r.name}</option>
                  ))
                ) : (
                  <option disabled>No resources available</option>
                )}
              </select>

            </div>


            <div className="form-group">
              <label>Delivery Date & Time</label>
              <input type="datetime-local" className="form-control" value={deliveryDateTime} onChange={(e) => setDeliveryDateTime(e.target.value)} required />
            </div>
          </>
        )}

        {taskType === 'Preparing and Serving Food' && (
            <div className="form-group">
            <label>Shelter</label>
            <select className="form-control" value={shelter} onChange={(e) => setShelter(e.target.value)} required>
              <option value="">Select Shelter</option>
              {shelters.map(s => <option key={s._id} value={s._id}>{s.location}</option>)}
            </select>
          </div>
        )}
                {taskType === 'Resource Distribution' && (
            <div className="form-group">
            <label>Shelter</label>
            <select className="form-control" value={shelter} onChange={(e) => setShelter(e.target.value)} required>
              <option value="">Select Shelter</option>
              {shelters.map(s => <option key={s._id} value={s._id}>{s.location}</option>)}
            </select>
          </div>
        )}



        <button type="submit" className="btn btn-primary mt-3">Assign Task</button>
      </form>
    </div>
  );
};

export default TaskManagement;
