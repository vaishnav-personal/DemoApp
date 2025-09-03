import "./App.css";
import "../src/styles.css";

import MainPage from "./components/MainPage";
import axios from "axios";//need to fetch or send data to a backend API (
;
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";//mapbox api

import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { useIsMobile } from "./external/vite-sdk";
import TrialPage from "./components/TrialPage";
import EVTracker from "./components/evTracker";
import OwnerMain from "./components/OwnerMain";


function App() {
  axios.defaults.withCredentials = true; // keep cookies
  window.maxCnt = useIsMobile() ? 2 : 5;//window size
  window.formLayout = "doubleColumns"; //It’s setting a global variable (formLayout) on the browser window object,

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/trial" element={<TrialPage />} />
        <Route path="/map" element={<EVTracker />} />
        < Route path="/owner" element={<OwnerMain/>}/>
      </Routes>
    </Router>
  );
}

export default App;
