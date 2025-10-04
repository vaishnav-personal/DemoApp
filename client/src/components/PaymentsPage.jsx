
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PaymentsPage() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);

  // Mock API call (replace with your backend later)
  useEffect(() => {
    const mockPayments = [
      {
        id: 1,
        date: "2025-09-28",
        station: "EV Station - Pune",
        amount: 250,
        method: "UPI",
        status: "Success",
      },
      {
        id: 2,
        date: "2025-09-21",
        station: "EV Station - Mumbai",
        amount: 300,
        method: "Credit Card",
        status: "Success",
      },
      {
        id: 3,
        date: "2025-09-15",
        station: "EV Station - Nashik",
        amount: 200,
        method: "Wallet",
        status: "Pending",
      },
    ];
    setPayments(mockPayments);
  }, []);

  const backgroundStyle = {
    backgroundImage: `url(https://images.unsplash.com/photo-1666919643134-d97687c1826c?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    minHeight: "100vh",
    color: "white",
  };

  return (
    <div style={backgroundStyle} className="d-flex align-items-center justify-content-center p-4">
      <div className="col-lg-9 col-md-10 col-sm-12 p-5 bg-light bg-opacity-50 rounded-4 shadow-lg animate__animated animate__fadeInDown">
        <h1 className="fw-bold text-info text-center mb-4">💳 Payment History</h1>

        {payments.length === 0 ? (
          <p className="text-center fs-5">No payments found.</p>
        ) : (
          <table className="table text-dark table-striped table-hover text-center rounded-3 overflow-hidden">
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Station</th>
                <th>Amount (₹)</th>
                <th>Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr key={payment.id}>
                  <td>{index + 1}</td>
                  <td>{payment.date}</td>
                  <td>{payment.station}</td>
                  <td>{payment.amount}</td>
                  <td>{payment.method}</td>
                  <td>
                    <span
                      className={`badge ${
                        payment.status === "Success"
                          ? "bg-success"
                          : payment.status === "Pending"
                          ? "bg-warning text-dark"
                          : "bg-danger"
                      }` }
                    >
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="text-center mt-4">
          <button
            className="btn btn-light btn-lg px-5"
            onClick={() => navigate("/")}
          >
            ⬅ Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

