import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
const AcceptedShelters = () => {
  const { user } = useUser();
  const [shelters, setShelters] = useState([]);
  const navigate = useNavigate();
  const [volunteerId, setVolunteerId] = useState(null);


  useEffect(() => {
    const fetchVolunteerId = async () => {
        if (!user || !user.id) {
            console.error("User ID missing. Please log in again.");
            return;
        }

        try {
            const volunteerResponse = await axios.get(`http://localhost:5000/api/shelters/volunteer-id/${user.id}`);
            const fetchedVolunteerId = volunteerResponse.data.volunteerId;
            setVolunteerId(fetchedVolunteerId);

            if (fetchedVolunteerId) {
                const sheltersResponse = await axios.get(`http://localhost:5000/api/shelters/accepted/${fetchedVolunteerId}`);
                setShelters(sheltersResponse.data);
            }
        } catch (error) {
            console.error("Error fetching volunteer ID or assigned shelters:", error);
        }
    };

    fetchVolunteerId();
}, [user]);


  // useEffect(() => {


    
  //   axios
  //     .get(`http://localhost:5000/api/shelters/accepted/${user.id}`)
  //     .then((response) => setShelters(response.data))
  //     .catch((error) => console.error("Error fetching accepted shelters:", error));
  // }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Accepted Shelters</h2>
      {shelters.length === 0 ? (
        <p>No accepted shelters found.</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Location</th>
              <th>Contact</th>
              <th>Capacity</th>
              <th>Inmates</th>
              {/* <th>Volunteer</th> */}
              <th>Add Inmates</th>
            </tr>
          </thead>
          <tbody>
            {shelters.map((shelter) => (
              <tr key={shelter._id}>
                <td>{shelter.location}</td>
                <td>{shelter.contactDetails}</td>
                <td>{shelter.totalCapacity}</td>
                <td>{shelter.inmates}</td>
                {/* <td>{shelter.volunteer ? shelter.volunteer.name : "N/A"}</td> */}
                <td>
                  <button onClick={() => navigate(`/add-inmates/${shelter._id}`)}>
                    Add/Delete Inmates
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AcceptedShelters;
