import React, { useEffect, useState } from "react";
import axios from "axios";
import emailjs from "emailjs-com";
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

  //email to owner
  const handleUpdateStatus = async (id, status) => {
    try {
      // 1. Update DB
      const { data } = await axios.put(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3002"
        }/ownersetting/${id}`,
        { status },
        { withCredentials: true }
      );
      if (!data) {
      alert("Application not found or already deleted.");
      return;
}
      console.log("📩 Email data returned from backend:", data);
      // 2. Prepare dynamic message
      let subject = "";
      let customMessage = "";

      if (status === "approved") {
        subject = " Your Station Application Has Been Approved!";
        customMessage = `Great news! Your station "${data.stationName}" has been approved and added to our EV charging network.`;
      } else if (status === "rejected") {
        subject = " Your Station Application Has Been Rejected";
        customMessage = `Unfortunately, your station "${data.stationName}" has been rejected. Please correct the details and reapply.`;
      }
      console.log("Prepared email content:", { subject, customMessage });
      // 3. Send Email via EmailJS
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_OWNER, // single template
        {
          to_email: data.ownerEmail,
          ownerName: data.ownerName,
          stationName: data.stationName,
          location: data.location,
          status,
          subject,
          customMessage,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      alert("✅ Status updated and email sent!");
    } catch (err) {
      console.error("⚠️ Error updating status or sending email:", err);
    }
  };

  // Fetch applications when admin panel loads
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:3002"
          }/admin/applications`,
          { withCredentials: true }
        );
        setApplications(res.data);
      } catch (err) {
        console.error("Error fetching applications:", err);
      }
    };

    fetchApplications();
  }, []);

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
                      className="btn btn-success btn-sm me-2"
                      onClick={() => handleUpdateStatus(app._id, "approved")}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(app._id, "rejected")}
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
