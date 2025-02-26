import React, { useState } from "react";
import axios from "axios";
import "../styles/LoginPage.css";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { user,setUser} = useUser();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      setUser({id : response.data._id , role: response.data.role , name:response.data.name})
      console.log(user);
      if (response.data.role === "admin") navigate("/admin-home");
      else if (response.data.role === "volunteer"){
        localStorage.setItem("volunteerId", response.data.volunteerId); // Ensure volunteerId is stored
        navigate("/volunteer-home");
      }
      else if (response.data.role === "public") navigate("/public-home");
    } catch (error) {
      setError(error.response ? error.response.data.message : "Login failed");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
      <button onClick={() => navigate("/signup")} className="signup-btn">Signup</button>
    </div>
  );
};

export default LoginPage;