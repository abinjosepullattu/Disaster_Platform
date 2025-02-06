
import SignupPage from "./components/SignupPage";
import AdminSkills from "./components/AdminSkills";

import {BrowserRouter as Router,Routes,Route} from "react-router-dom"

function App() {
  return (
<Router>
  <Routes>
    <Route path="/" element = {<SignupPage/>}/>
    <Route path ="/signup" element = {<SignupPage/>}/>
    <Route path="/admin-skills" element={<AdminSkills />} />
  </Routes>
</Router>
  );
}

export default App;
