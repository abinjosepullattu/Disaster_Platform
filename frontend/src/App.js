import SignupPage from "./components/SignupPage";
import AdminSkills from "./components/AdminSkills";
// import LoginPage from "./components/LoginPage";
// import AdminHome from "./components/AdminHome";
// import VolunteerHome from "./components/VolunteerHome";
// import PublicHome from "./components/PublicHome";
import AdminApprovalPage from "./components/AdminApprovalPage";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignupPage />} />
        <Route path="/signup" element={<SignupPage />} />
        {/* <Route path="/login" element={<LoginPage />} />
        <Route path="/admin-home" element={<AdminHome />} />
        <Route path="/volunteer-home" element={<VolunteerHome />} />
        <Route path="/public-home" element={<PublicHome />} /> */}
        <Route path="/admin-skills" element={<AdminSkills />} />
        <Route path="/admin-approval" element={<AdminApprovalPage />} />
      </Routes>
    </Router>
  );
}

export default App;
