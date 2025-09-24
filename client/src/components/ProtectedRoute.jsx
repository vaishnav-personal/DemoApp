import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ role, children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const url =
          role === "admin"
            ? "/admin/hello"
            : "/owner/hello";

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:3002"}${url}`,
          { withCredentials: true }
        );
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [role]);

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to={`/${role}/login`} replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
