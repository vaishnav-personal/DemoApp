import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";


const AdminPanel = () => {
  const [applications, setApplications] = useState([]);
  const [logs, setLogs] = useState([]);

  // Connect socket
  useEffect(() => {
const socket = io(import.meta.env.VITE_API_URL || "http://localhost:3002", {
  withCredentials: true,
});

  socket.on("connect", () => console.log("🟢 Connected to socket"));
  socket.on("disconnect", () => console.log("🔴 Disconnected"));

  // ✅ Listen for real-time applications
  socket.on("newApplication", (app) => {
    if (prev.find((a) => a._id === app._id)) return prev;
      return [...prev, app];
  });

  return () => socket.disconnect();
}, []);


  // Fetch applications when admin panel loads
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:3002"}/admin/applications`,
          { withCredentials: true }
        );
        setApplications(res.data);
      } catch (err) {
        console.error("Error fetching applications:", err);
      }
    };

    fetchApplications();
  }, []);

  // Approve application
  const handleApprove = async (id) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL || "http://localhost:3002"}/admin/applications/${id}`,
        { status: "approved" },
        { withCredentials: true }
      );

      setApplications((apps) =>
        apps.map((a) => (a._id === id ? { ...a, status: "approved" } : a))
      );
    } catch (err) {
      console.error("Error approving:", err);
    }
  };

  // Reject application
  const handleReject = async (id) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL || "http://localhost:3002"}/admin/applications/${id}`,
        { status: "rejected" },
        { withCredentials: true }
      );

      setApplications((apps) =>
        apps.map((a) => (a._id === id ? { ...a, status: "rejected" } : a))
      );
    } catch (err) {
      console.error("Error rejecting:", err);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Admin Panel</h2>

      {/* Applications Section */}
      <h3>Station Applications</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Station</th>
            <th>Location</th>
            <th>Owner</th>
            <th>Status</th>
            <th>Document</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app._id}>
              <td>{app.stationName}</td>
              <td>{app.location}</td>
              <td>{app.ownerEmail || "N/A"}</td>
              <td>{app.status}</td>
              <td>
                {app.documentUrl ? (
                  <a href={app.documentUrl} target="_blank" rel="noreferrer">
                    View
                  </a>
                ) : (
                  "No file"
                )}
              </td>
              <td>
                {app.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleApprove(app._id)}
                      className="btn btn-success btn-sm me-2"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(app._id)}
                      className="btn btn-danger btn-sm"
                    >
                      Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Logs Section */}
      <h3>System Logs</h3>
      <pre>{logs.join("\n")}</pre>
    </div>
  );
};

export default AdminPanel;
