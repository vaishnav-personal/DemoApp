import "./App.css";
import MainPage from "./components/MainPage";
import axios from "axios";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { useIsMobile } from "./external/vite-sdk";
import TrialPage from "./components/TrialPage";
function App() {
  axios.defaults.withCredentials = true; // ⬅️ Important!
  window.maxCnt = useIsMobile() ? 2 : 5;
  window.formLayout = "doubleColumns"; // doubleColumns
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/trial" element={<TrialPage />} />
        </Routes>
      </Router>
    </>
  );
}
export default App;
