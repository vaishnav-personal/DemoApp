import "./App.css";
import "../src/styles.css";
import EVMapPage from "./components/EVMapPage";  // renamed for clarity
import MainPage from "./components/MainPage";
import axios from "axios";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { useIsMobile } from "./external/vite-sdk";
import TrialPage from "./components/TrialPage";

function App() {
  axios.defaults.withCredentials = true; // keep cookies
  window.maxCnt = useIsMobile() ? 2 : 5;
  window.formLayout = "doubleColumns";

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/trial" element={<TrialPage />} />
        <Route path="/map" element={<EVMapPage />} /> {/* ✅ renamed */}
      </Routes>
    </Router>
  );
}

export default App;
