import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import image from "../images/image6.jpg"

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      setUser({
        id: response.data._id,
        role: response.data.role,
        name: response.data.name,
        phone: response.data.phone,
        email: response.data.email,
      });
      console.log(user);
      if (response.data.role === "admin") navigate("/admin-home");
      else if (response.data.role === "volunteer") {
        localStorage.setItem("volunteerId", response.data.volunteerId);
        navigate("/volunteer-home");
      } else if (response.data.role === "public") navigate("/public-home");
    } catch (error) {
      setError(error.response ? error.response.data.message : "Login failed");
    }
  };

  return (
    <div className="abcd">
      <div className="efgh">
        {/* Aside Image */}
        <div className="ijkl">
          <img src={image} alt="Login Illustration" />
        </div>

        <div className="mnop">
          <h2 className="qrst">LOGIN</h2>
          {error && <p className="uvwx">{error}</p>}
          <form onSubmit={handleLogin}>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit">Login</button>
          </form>
          <button onClick={() => navigate("/signup")} className="cdef">Signup</button>
        </div>
      </div>

      {/* Internal CSS */}
      <style>
        {`

          .abcd {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
               background: linear-gradient(130deg, #d4501f, #d4c9c412);
          }
          .efgh {
            display: flex;
            background: white;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
            border-radius: 10px;
            overflow: hidden;
            max-width: 900px;
            width: 100%;
          }
          .ijkl {
            flex: 1;
            background: #ddd;
          }
          .ijkl img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .mnop {
            flex: 1;
            padding: 30px;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .qrst {
            text-align: center;
            font-size: 24px;
            margin-bottom: 20px;
          }
          form {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          input {
            padding: 10px;
            font-size: 16px;
            border: 1px solid #ccc;
            border-radius: 5px;
          }
          button {
            background: #007bff;
            color: white;
            padding: 10px;
            font-size: 16px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: 0.3s;
          }
          button:hover {
            background: #0056b3;
          }
          .cdef {
            background: #28a745;
            margin-top: 10px;
          }
          .cdef:hover {
            background: #218838;
          }
          .uvwx {
            color: red;
            text-align: center;
          }
          @media (max-width: 768px) {
            .efgh {
              flex-direction: column;
              max-width: 90%;
            }
            .ijkl {
              display: none;
            }
          }
        `}
      </style>
    </div>
  );
};

export default LoginPage;
