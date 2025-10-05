
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
  let [list, setList] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    checkSessionExists();
  }, []);

  // Start tracking user location
  function handleStartTracking() {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL || "http://localhost:3002"}/api/ev/stations`
          );
          const stations = await res.json();
          setList(stations);

          // Haversine distance
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
  }

  async function checkSessionExists() {
    setFlagCheckSession(true);
    try {
      let response = await axios.get(
        import.meta.env.VITE_API_URL + "/users/hello"
      );
      response = response.data;
      setFlagCheckSession(false);
      if (response) {
        setUser(response);
        setView("home");
        console.log("hi");
      }
    } catch (err) {
      setFlagCheckSession(false);
      console.log(err);
    }
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
    axios.post(import.meta.env.VITE_API_URL + "/users/signout");
    navigate("/");
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

  const backgroundStyle = {
    backgroundImage: `url(https://images.unsplash.com/photo-1666919643134-d97687c1826c?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    minHeight: "100vh",
  };

  return (
    <div style={backgroundStyle}>
      {message && (
        <div className="text-center bg-danger text-white w-50 mx-auto mb-2 p-1">
          {message.toUpperCase()}
        </div>
      )}

      {view === "home" && (
        <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 p-3">
          <div className="col-lg-5 col-md-7 col-sm-9 p-4  shadow-lg text-center animate__animated ">
            {user && (
              <div className="mb-4 fs-5 text-light">
                <h1>Welcome,{" "}
                <span className="fw-semibold ">{user.name}</span>...!</h1>
              </div>
            )}

            <div className="mb-5 d-flex justify-content-center flex-wrap">
              {!user && (
                <button
                  className="btn btn-primary btn-lg px-4 me-3 shadow-sm animate__animated animate__pulse animate__infinite"
                  onClick={handleLogInSignupButtonClick}
                >
                  Login / Signup
                </button>
              )}

              {user && (
                <>
                  <button
                    className="btn btn-danger btn-lg px-4 shadow-sm m-2"
                    onClick={handleSignoutClick}
                  >
                    Signout
                  </button>
                  <button
                    className="btn btn-success btn-lg px-4 shadow-sm m-2"
                    onClick={handleStartTracking}
                  >
                    Start Tracking
                  </button>
                  <button className="btn btn-primary btn-lg px-4 shadow-sm m-2"
                     onClick={() => navigate("/about")}>
                    About us
                  </button>
                  <button className="btn btn-secondary btn-lg px-4 shadow-sm m-2"
                     onClick={() => navigate("/help")}>
                    Help/complaints
                  </button>
                  <button className="btn btn-warning btn-lg px-4 shadow-sm m-2"
                  onClick={() => navigate("/payments")}>
                    Payments
                  </button>
                  <button className="btn btn-info btn-lg px-4 shadow-sm m-2"
                  onClick={() => navigate("/bookingdashboard")}>
                    Book Now
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
    </div>
  );
}

