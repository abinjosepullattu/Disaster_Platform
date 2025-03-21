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
import AcceptedTasksView from "./components/AcceptedTaskView";
import MarkProgressForm from "./components/MarkProgressForm";
import VolunteerCompletedTasks from './components/VolunteerCompletedTasks';
import CampaignPage from './components/AddCampaign';
import AdminCompletedTasksView from './components/AdminCompletedTaskView';
import ViewCampaigns from "./components/ViewCampaignPublic";
import MakeDonation from "./components/MakeDonation";
import MyDonations from "./components/MyDonationsPublic";
import AdminCampaignDonationsView from "./components/AdminDonationsView";
import AdminResourceAllocation from "./components/AdminResourceAllocation";
import ViewAllocatedResources from "./components/ViewAllocatedResources";

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
        <Route path="/volunteer/accepted-task" element={<AcceptedTasksView />} />
        <Route path="/volunteer/progress-form" element={<MarkProgressForm />} />
        <Route path="/volunteer/completed-tasks" element={<VolunteerCompletedTasks />} />
        <Route path="/admin/completed-tasks" element={<AdminCompletedTasksView />} />
        <Route path="/admin/campaign-page" element={<CampaignPage />} />
        <Route path="/public/view-campaign" element={<ViewCampaigns />} />
        <Route path="/public/make-donation/:campaignId" element={<MakeDonation />} />
        <Route path="/public/my-donation" element={<MyDonations />} />
        <Route path="/admin/donation-view" element={<AdminCampaignDonationsView />} />
        <Route path="/admin/resource-allocation" element={<AdminResourceAllocation />} />
        <Route path="/admin/view-allocated" element={<ViewAllocatedResources />} />






      </Routes>
    </Router>
    </UserProvider>
  );
}

export default App;
