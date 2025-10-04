import { useEffect, useState } from "react";

import LoginSignupPage from "./LoginSignupPage";
import axios from "axios";
import { BeatLoader } from "react-spinners";

import { useNavigate } from "react-router-dom";


export default function MainPage() {
  let [selectedEntity, setSelectedEntity] = useState("");
  let [user, setUser] = useState("");
  let [view, setView] = useState("loginSignup");
  let [message, setMessage] = useState("");
  let [selectedMenuIndex, setSelectedMenuIndex] = useState(-1);
  let [selectedEntityIndex, setSelectedEntityIndex] = useState(-1);
  let [flagCheckSession, setFlagCheckSession] = useState(false);
  let [list,setList]=useState([]);
  
  useEffect(() => {
    checkSessionExists();
  }, []);
  const navigate = useNavigate();   // ✅ hook for navigation

  // 👇 function to navigate
   function handleStartTracking() {
   // 1. Detect current location
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        console.log("User location:", lat, lng);

      // 2. Fetch nearby EV stations
      // const url = `${import.meta.env.VITE_API_URL}/api/ev/nearby?lat=${lat}&lng=${lng}&radius=6000&limit=8`;
      // console.log(url);
      // const res = await fetch(url);
      // const data = await res.json();
      // console.log(data);
      // const stations = data.candidates || [];
      
         try {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL || "http://localhost:3002"}/api/ev/stations`
          );
          const stations = await res.json();
          setList(stations);
          //3.find nearest

      const toRad = (x) => (x * Math.PI) / 180;
          const haversine = (aLat, aLng, bLat, bLng) => {
            const R = 6371e3;
            const dLat = toRad(bLat - aLat);
            const dLng = toRad(bLng - aLng);
            const A =
              Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(aLat)) *
                Math.cos(toRad(bLat)) *
                Math.sin(dLng / 2) ** 2;
            return 2 * R * Math.atan2(Math.sqrt(A), Math.sqrt(1 - A));
          };
          const nearest = [...stations].sort(
            (a, b) =>
              haversine(lat, lng, a.lat, a.lng) -
              haversine(lat, lng, b.lat, b.lng)
          )[0];

      // 4. Pass all data to /map page
      navigate("/map", {
            state: { origin: { lat, lng }, list: stations, nearest },
          });
        } catch (err) {
          console.error("Error fetching stations:", err);
        }
    },
    (err) => {
        console.error("Location error:", err);
        alert("Unable to detect location");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };
  async function checkSessionExists() {
    setFlagCheckSession(true);
    try {
      let response = await axios.get(
        import.meta.env.VITE_API_URL + "/users/hello"
      );
      console.log("done");
      
      response = response.data;
      setFlagCheckSession(false);
      if (!response) {
      } else {
        //already logged in
        setUser(response);
        setView("home");
      }
    } catch (err) {
      setFlagCheckSession(false);
      console.log(err);
    }
  }
  function handleEntityClick(selectedIndex) {
    if (!user) {
      showMessage("Please log in to access this option.");
      return;
    }
    if (
      selectedEntity.name ==
      adminMenus[selectedMenuIndex].entities[selectedIndex].name
    ) {
      setSelectedMenuIndex(-1);
      setSelectedEntityIndex(-1);
      setView("home");
      return;
    }
    setSelectedEntityIndex(selectedIndex);
    setSelectedEntity(adminMenus[selectedMenuIndex].entities[selectedIndex]);
    setView("content");
  } 
  function handleSideBarMenuClick(index) {
    if (!user) {
      showMessage("Please log in to access menu options.");
      return;
    }
    if (selectedMenuIndex == index) {
      setSelectedMenuIndex(-1);
    } else {
      setSelectedMenuIndex(index);
    }
    setSelectedEntityIndex(-1);
    setSelectedEntity("");
  }
  function handleLogInSignupButtonClick() {
    setView("loginSignup");
  }
  function setLoggedinUser(loggedinUser) {
    setView("home");
    setUser(loggedinUser);
  }
  function handleSignoutClick() {
    setUser("");
    setView("home");
    // remove jwt token from backend
    axios.post(import.meta.env.VITE_API_URL + "/users/signout");
  }
  function handleCloseLoginSignupPageClose() {
    setView("home");
  }
  function handleBackButtonClick() {
    setView("home");
    setSelectedMenuIndex(-1);
    setSelectedEntityIndex(-1);
    setSelectedEntity("");
  }
  if (flagCheckSession) {
    return (
      <div className="my-5 text-center">
        <BeatLoader size={24} color={"blue"} />
      </div>
    );
  }
  


  return (
    <>
      {message && (
        <div className="text-center bg-danger text-white w-50 mx-auto mb-2 p-1">
          {message.toUpperCase()}
        </div>
      )}
      {view === "home" && (
        <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-gradient-primary-light p-3">
          <div className="col-lg-5 col-md-7 col-sm-9 p-4 bg-white rounded-3 shadow-lg text-center animate__animated animate__fadeInDown">
            {user && (
              <div className="mb-4 fs-5 text-dark">
                Welcome,
                <span className="fw-semibold text-success">{user.name}</span>!
              </div>
            )}
            <div className="mb-5 d-flex justify-content-center flex-wrap">
              {!user && (
                <button
                  className="btn btn-primary btn-lg px-4 me-3 shadow-sm animate__animated animate__pulse animate__infinite" // Added animation
                  onClick={handleLogInSignupButtonClick}
                >
                  Login / Signup
                </button>
              )}
              {user && (
                <button
                  className="btn btn-outline-danger btn-lg px-4 shadow-sm m-2"
                  onClick={handleSignoutClick }
                >
                  Signout
                </button> 
                
              )}
                {user && (
                <>
                  
                  <button
                    className="btn btn-success btn-lg px-4 shadow-sm m-2"
                    onClick={handleStartTracking}
                  >
                    Start Tracking
                  </button>
                </>
              )}
              
            </div>
          </div>
        </div>
      )}
      <div className="container-fluid py-4">
        {!user && (
          <LoginSignupPage
            setLoggedinUser={setLoggedinUser}
            onCloseLoginSignupPageClose={handleCloseLoginSignupPageClose}
            onBackButtonClick={handleBackButtonClick}
          />
        )}
        
      </div>
    </>
  );
}
