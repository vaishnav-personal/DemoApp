import "./App.css";
import MainPage from "./components/MainPage";
import axios from "axios";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { useIsMobile } from "./external/vite-sdk";

function App() {
  axios.defaults.withCredentials = true; // ⬅️ Important!
  window.maxCnt = useIsMobile() ? 2 : 5;
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
        </Routes>
      </Router>
    </>
  );
}
export default App;
