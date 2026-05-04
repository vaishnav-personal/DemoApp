import { useNavigate } from "react-router-dom";

function Ownermaindash({ owner }) {
  const navigate = useNavigate();

  if (owner?.status === "approved") {
    return (
      <div className="container mt-5">
        <h2>Owner Dashboard</h2>
        <p>Welcome, {owner.email}!</p>

        {/* Buttons */}
        <div className="d-flex flex-column gap-3 mt-4" style={{ maxWidth: "250px" }}>
          <button className="btn btn-primary" onClick={() => navigate("Profile")}>
            Profile
          </button>

          <button className="btn btn-primary" onClick={() => navigate("Requests")}>
            Requests of Users
          </button>

          <button className="btn btn-primary" onClick={() => navigate("Help")}>
            Help
          </button>

          <button className="btn btn-primary" onClick={() => navigate("About")}>
            About Us
          </button>

          <button className="btn btn-primary" onClick={() => navigate("Complaint")}>
            Complaint
          </button>

          <button className="btn btn-primary" onClick={() => navigate("userhistory")}>
            History
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default Ownermaindash;
