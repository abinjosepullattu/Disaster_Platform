import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
const ViewAssignedShelters = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [shelters, setShelters] = useState([]);
    const [volunteerId, setVolunteerId] = useState(null);

    useEffect(() => {
        const fetchVolunteerIdAndShelters = async () => {
            if (!user || !user.id) {
                console.error("User ID missing. Please log in again.");
                return;
            }

            try {
                const volunteerResponse = await axios.get(`http://localhost:5000/api/shelters/volunteer-id/${user.id}`);
                const fetchedVolunteerId = volunteerResponse.data.volunteerId;
                setVolunteerId(fetchedVolunteerId);

                if (fetchedVolunteerId) {
                    const sheltersResponse = await axios.get(`http://localhost:5000/api/shelters/assigned-shelters/${fetchedVolunteerId}`);
                    setShelters(sheltersResponse.data);
                }
            } catch (error) {
                console.error("Error fetching volunteer ID or assigned shelters:", error);
            }
        };

        fetchVolunteerIdAndShelters();
    }, [user]);

    const handleTaskAction = async (shelterId, status) => {
        if (!volunteerId) {
            console.error("Volunteer ID is missing.");
            return;
        }
    
        try {
            await axios.put(`http://localhost:5000/api/shelters/update-task/${shelterId}/${volunteerId}`, { taskStatus: status });
    
            // Update UI after status change
            setShelters(shelters.map(shelter =>
                shelter._id === shelterId ? { ...shelter, taskStatus: status } : shelter
            ));
        } catch (error) {
            console.error("Error updating task status:", error);
        }
    };
    

    return (
        <div style={{ maxWidth: "800px", margin: "auto", padding: "20px" }}>
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>View Assigned Shelters</h2>
            {shelters.length === 0 ? (
                <p style={{ textAlign: "center" }}>No shelters assigned yet.</p>
            ) : (
                <div>
                    {shelters.map((shelter) => (
                        <div key={shelter._id} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "15px", marginBottom: "15px", background: "#f9f9f9" }}>
                            <h3>{shelter.location}</h3>
                            <p><strong>Contact:</strong> {shelter.contactDetails}</p>
                            <p><strong>Capacity:</strong> {shelter.totalCapacity}</p>
                            <p><strong>Inmates:</strong>{shelter.inmates}</p>

                            <button 
                                onClick={() => window.open(`https://maps.google.com/?q=${shelter.latitude},${shelter.longitude}`, "_blank")}
                                style={{ marginRight: "10px", padding: "8px 12px", background: "#007bff", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
                            >
                                View on Map
                            </button>

                            {/* {shelter.taskStatus === 1 && (
                                <> */}
                                    <button 
                                        onClick={() => handleTaskAction(shelter._id, 2)} 
                                        style={{ marginRight: "10px", padding: "8px 12px", background: "green", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
                                    >
                                        Accept Task
                                    </button>
                                    <button 
                                        onClick={() => handleTaskAction(shelter._id, 3)} 
                                        style={{ padding: "8px 12px", background: "red", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
                                    >
                                        Reject Task
                                    </button>
                                {/* </> */}
                            {/* )} */}

                            {shelter.taskStatus === 2 && <p style={{ color: "green", fontWeight: "bold" }}>✅ Task Accepted</p>}
                            {shelter.taskStatus === 3 && <p style={{ color: "red", fontWeight: "bold" }}>❌ Task Rejected</p>}
                            <button onClick={() => navigate("/volunteer-home")}>Back</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ViewAssignedShelters;
