import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import { getRecentPayments } from "../firebase/paymentService";
import { getAllEmployees } from "../firebase/employeeService";
import PaymentTimeline from "../components/PaymentTimeline";

function Dashboard({ setActivePage }) {
  const navigate = useNavigate();
  const [recentPayments, setRecentPayments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [paymentStats, setPaymentStats] = useState({
    totalPaid: 0,
    employeeCount: 0,
    paymentCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch data from Firebase
        const [paymentsData, employeesData] = await Promise.all([
          getRecentPayments(2), // Get 2 most recent payments
          getAllEmployees(),
        ]);

        setRecentPayments(paymentsData);
        setEmployees(employeesData);

        // Calculate summary stats
        const totalPaid = paymentsData.reduce(
          (total, payment) => total + parseFloat(payment.amount || 0),
          0
        );

        setPaymentStats({
          totalPaid: totalPaid,
          employeeCount: employeesData.length,
          paymentCount: paymentsData.length,
        });

        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const goToPayments = () => {
    setActivePage("payments");
    navigate("/payments");
  };

  const goToPaymentHistory = () => {
    setActivePage("payment-history");
    navigate("/payment-history");
  };

  const goToEmployees = () => {
    setActivePage("employees");
    navigate("/employees");
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <h1 className="page-title">Dashboard</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-grid">
        <div className="card summary-card">
          <h2 className="card-title">Payment Summary</h2>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-value">
                ${paymentStats.totalPaid.toFixed(2)}
              </span>
              <span className="stat-label">Total Paid</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{paymentStats.employeeCount}</span>
              <span className="stat-label">Employees</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{paymentStats.paymentCount}</span>
              <span className="stat-label">Payments</span>
            </div>
          </div>
        </div>

        <div className="card recent-payments-card">
          <div className="card-header">
            <h2 className="card-title">Recent Payments</h2>
            <button
              className="view-all-link"
              onClick={() => {
                setActivePage("payment-history");
                navigate("/payment-history");
              }}
            >
              View All Payments
            </button>
          </div>
          <div className="recent-payments">
            {recentPayments.length === 0 ? (
              <div className="no-data-message">No recent payments</div>
            ) : (
              recentPayments.slice(0, 2).map((payment) => (
                <div className="payment-item" key={payment.id}>
                  <div className="payment-info">
                    <span className="payment-employee">{payment.employee}</span>
                    <span className="payment-date">{payment.date}</span>
                  </div>
                  <span className="payment-amount">
                    ${parseFloat(payment.amount).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card quick-actions-card">
          <h2 className="card-title">Quick Actions</h2>
          <div className="quick-actions">
            <button className="btn btn-primary" onClick={goToPayments}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path
                  fill="currentColor"
                  d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
                />
              </svg>
              New Payment
            </button>
            <button className="btn btn-secondary" onClick={goToPaymentHistory}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path
                  fill="currentColor"
                  d="M13.5 8H12v5l4.28 2.54.72-1.21-3.5-2.08V8zM13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 1 0 0-18z"
                />
              </svg>
              View All Payments
            </button>
            <button className="btn btn-secondary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path
                  fill="currentColor"
                  d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"
                />
                <path
                  fill="currentColor"
                  d="M7 12h2v5H7zm4-7h2v12h-2zm4 4h2v8h-2z"
                />
              </svg>
              Generate Report
            </button>
            <button className="btn btn-secondary" onClick={goToEmployees}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path
                  fill="currentColor"
                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                />
              </svg>
              Add Employee
            </button>
          </div>
        </div>
      </div>

      <PaymentTimeline employees={employees} />
    </div>
  );
}

export default Dashboard;
