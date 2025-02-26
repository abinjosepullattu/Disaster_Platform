import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";

const ViewAssignedShelters = () => {
    const {user} = useUser();
    const [shelters, setShelters] = useState([]);
    const [volunteerId, setVolunteerId] = useState(null); // Ensure this is set on login

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

    const handleAcceptTask = async (shelterId) => {
        try {
            await axios.put(`http://localhost:5000/api/shelters/accept-task/${shelterId}`);

            // Update UI after acceptance
            setShelters(shelters.map(shelter =>
                shelter._id === shelterId ? { ...shelter, taskStatus: 2 } : shelter
            ));
        } catch (error) {
            console.error("Error updating task status:", error);
        }
    };

    return (
        <div>
            <h2>View Assigned Shelters</h2>
            {shelters.length === 0 ? (
                <p>No shelters assigned yet.</p>
            ) : (
                <ul>
                    {shelters.map((shelter) => (
                        <li key={shelter._id}>
                            <h3>{shelter.location}</h3>
                            <p>Contact: {shelter.contactDetails}</p>
                            <p>Capacity: {shelter.totalCapacity}</p>

                            <button onClick={() => window.open(`https://maps.google.com/?q=${shelter.latitude},${shelter.longitude}`, "_blank")}>
                                View on Map
                            </button>

                            {shelter.taskStatus === 1 && (
                                <button onClick={() => handleAcceptTask(shelter._id)}>Accept Task</button>
                            )}

                            {shelter.taskStatus === 2 && <p>✅ Task Accepted</p>}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ViewAssignedShelters;
