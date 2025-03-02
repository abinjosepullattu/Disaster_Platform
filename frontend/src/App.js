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
import AdminReportIncident from "./components/AdminReportIncident";
import ReportIncident from "./components/ReportIncident";
import MyIncidentReports from "./components/MyIncidentReports";
import VerifyPublicReports from "./components/VerifyPublicReports";
import OngoingIncidents from "./components/OngoingIncidents";
import CompletedIncidents from "./components/CompletedIncidents";
import AdminIncidentPage from "./components/IncidentPageAdmin";
import AddShelter from "./components/AddShelter";
import ViewShelterAdmin from "./components/ViewShelterAdmin";
import ViewAssignedShelters from "./components/ViewAssignedShelters";
import AcceptedShelters from "./components/AcceptedSheltersVolunteer";
import AddInmates from "./components/AddInmates";
import { UserProvider } from "./context/UserContext";
import TaskManagement from './components/TaskManagement';
import ResourceTypeForm from "./components/ResourceTypeForm";
import TaskTypeForm from "./components/TaskTypeForm";
import AdminTaskView from './components/AdminTaskView';
import VolunteerTaskView from "./components/VolunteerTaskView";
function App() {
  return (
    <UserProvider>
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
        <Route path="/admin-incident-page" element={<AdminIncidentPage />} />
        <Route path="/admin-incident-page/admin-report-incident" element={<AdminReportIncident />} />
        <Route path="/report-incident" element={<ReportIncident />} />
        <Route path="/my-incidents" element={<MyIncidentReports />} />
        <Route path="/admin-incident-page/verify-public" element={<VerifyPublicReports />} />
        <Route path="/admin-incident-page/ongoing-incident" element={<OngoingIncidents />} />
        <Route path="/admin-incident-page/completed-incident" element={<CompletedIncidents />} />
        <Route path="/admin/add-shelter" element={<AddShelter />}/>
        <Route path="/admin/view-shelter-admin" element={<ViewShelterAdmin />}/>
        <Route path="/assigned-shelters" element={<ViewAssignedShelters />} />
        <Route path="/accepted-shelters" element={<AcceptedShelters />} />
        <Route path="/add-inmates/:shelterId" element={<AddInmates />} />
        <Route path="/admin/task-management" element={<TaskManagement />} />
        <Route path="/admin/resource-type" element={<ResourceTypeForm />} />
        <Route path="/admin/task-type" element={<TaskTypeForm />} />
        <Route path="/admin/tasks" element={<AdminTaskView />} />
        <Route path="/volunteer/tasks" element={<VolunteerTaskView />} />

      </Routes>
    </Router>
    </UserProvider>
  );
}

export default App;
