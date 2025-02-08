import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import AdminHome from "./components/AdminHome";
import VolunteerHome from "./components/VolunteerHome";
import PublicHome from "./components/PublicHome";
import ProfilePage from "./components/ProfilePage";
import EditProfile from "./components/EditProfile";
import ChangePassword from "./components/ChangePassword";
import AdminSkills from "./components/AdminSkills";
import AdminApprovalPage from "./components/AdminApprovalPage";
import VolunteerAccepted from "./components/VolunteerAccepted";
import VolunteerRejected from "./components/VolunteerRejected";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/admin-home" element={<AdminHome />} />
        <Route path="/volunteer-home" element={<VolunteerHome />} />
        <Route path="/public-home" element={<PublicHome />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/admin-skills" element={<AdminSkills />} />
        <Route path="/admin-approval" element={<AdminApprovalPage />} />
        <Route path="/volunteer-accepted" element={<VolunteerAccepted />} />
        <Route path="/volunteer-rejected" element={<VolunteerRejected />} />
      </Routes>
    </Router>
  );
}

export default App;
