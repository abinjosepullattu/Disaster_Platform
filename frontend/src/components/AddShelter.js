import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { GoogleMap, LoadScript, Marker, Autocomplete } from "@react-google-maps/api";
import "../styles/AddShelter.css";

const AddShelter = () => {
    const [location, setLocation] = useState("");
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [totalCapacity, setTotalCapacity] = useState("");
    const [contactDetails, setContactDetails] = useState("");
    const [assignedVolunteer, setAssignedVolunteer] = useState("");
    const [volunteers, setVolunteers] = useState([]);
    const autocompleteRef = useRef(null);
    const navigate = useNavigate();

    const GOOGLE_MAPS_API_KEY = "AIzaSyCvDmFuDpXO7aDEpSqQ6LScHge8wy8Jx1o"; // ✅ Add API Key from .env

    useEffect(() => {
        axios.get("http://localhost:5000/api/users/available-volunteers") // ✅ Corrected URL
            .then(response => setVolunteers(response.data))
            .catch(error => console.error("Error fetching volunteers", error));
    }, []);

    // ✅ Function to handle location selection from search box
    const handlePlaceSelect = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();
            if (place && place.geometry) {
                setLocation(place.formatted_address);
                setLatitude(place.geometry.location.lat());
                setLongitude(place.geometry.location.lng());
            }
        }
    };

    // ✅ Function to handle map click (update location dynamically)
    const handleMapClick = async (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setLatitude(lat);
        setLongitude(lng);

        // Reverse Geocode to get Address from Lat/Lng
        try {
            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
            );
            if (response.data.results.length > 0) {
                setLocation(response.data.results[0].formatted_address);
            }
        } catch (error) {
            console.error("Error getting address:", error);
        }
    };

    // ✅ Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!latitude || !longitude) {
            return alert("⚠️ Please select a location using search or by clicking on the map.");
        }

        const shelterData = { location, latitude, longitude, totalCapacity, inmates: 0, contactDetails, assignedVolunteer };

        try {
            await axios.post("http://localhost:5000/api/shelters/add", shelterData);
            alert("✅ Shelter added successfully!");
            navigate("/admin-home");
        } catch (error) {
            alert("❌ Error adding shelter");
        }
    };

    return (
        <div className="shelter-container">
            <h2>Add Shelter</h2>

            <form onSubmit={handleSubmit}>
                {/* Google Maps Search Box */}
                <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
                    <Autocomplete onLoad={(ref) => (autocompleteRef.current = ref)} onPlaceChanged={handlePlaceSelect}>
                        <input type="text" placeholder="Search for a location..." className="search-box" />
                    </Autocomplete>

                    {/* Google Map */}
                    <GoogleMap
                        mapContainerStyle={{ width: "100%", height: "400px" }}
                        zoom={10}
                        center={{ lat: latitude || 12.9716, lng: longitude || 77.5946 }}
                        onClick={handleMapClick}
                    >
                        {latitude && longitude && <Marker position={{ lat: latitude, lng: longitude }} />}
                    </GoogleMap>
                </LoadScript>

                {/* Location Name Field */}
                <input type="text" value={location} placeholder="Location Name" onChange={(e) => setLocation(e.target.value)} required />

                <input type="number" placeholder="Total Capacity" value={totalCapacity} onChange={(e) => setTotalCapacity(e.target.value)} required />
                <input type="text" placeholder="Contact Details" value={contactDetails} onChange={(e) => setContactDetails(e.target.value)} required />

                {/* Volunteer Selection Dropdown */}
                <select value={assignedVolunteer} onChange={(e) => setAssignedVolunteer(e.target.value)} required>
    <option value=""disabled selected>Select Volunteer</option>
    {volunteers.length > 0 ? (
        volunteers.map((volunteer) => (
            <option key={volunteer._id} value={volunteer._id}>
                {volunteer.userDetails.name || "Unnamed Volunteer"}
            </option>
        ))
    ) : (
        <option disabled>No available volunteers</option>
    )}
</select>

                <button type="submit">Add Shelter</button>
            </form>

            {/* ✅ Back Button Below the Map */}
            <button className="back-button" onClick={() => navigate(-1)}>⬅️ Back</button>
        </div>
    );
};

export default AddShelter;
