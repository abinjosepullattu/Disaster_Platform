
import SignupPage from "./components/SignupPage";

import {BrowserRouter as Router,Routes,Route} from "react-router-dom"

function App() {
  return (
<Router>
  <Routes>
    <Route path="/" element = {<SignupPage/>}/>
    <Route path ="/signup" element = {<SignupPage/>}/>
  </Routes>
</Router>
  );
}

export default App;
