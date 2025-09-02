import "./App.css";
import "../src/styles.css";

import MainPage from "./components/MainPage";
import axios from "axios";
;
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";

import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { useIsMobile } from "./external/vite-sdk";
import TrialPage from "./components/TrialPage";
import EVTracker from "./components/evTracker";


function App() {
  axios.defaults.withCredentials = true; // keep cookies
  window.maxCnt = useIsMobile() ? 2 : 5;
  window.formLayout = "doubleColumns";

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/trial" element={<TrialPage />} />
        <Route path="/map" element={<EVTracker />} />
      </Routes>
    </Router>
  );
}

export default App;
