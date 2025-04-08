import { useState, useEffect } from "react";
import "../styles/PaymentHistory.css";
import { getAllPayments } from "../firebase/paymentService";
import PaymentDetailsModal from "../components/PaymentDetailsModal";

function PaymentHistory({ setActivePage }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Set active page on mount
  useEffect(() => {
    setActivePage("payment-history");
  }, [setActivePage]);

  // Fetch all payments
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const paymentsData = await getAllPayments();
        setPayments(paymentsData);
        setError(null);
      } catch (err) {
        console.error("Error fetching payments:", err);
        setError("Failed to load payment history");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const getTransactionUrl = (payment) => {
    if (payment.method === "Solana" && payment.transactionHash) {
      return `https://explorer.solana.com/tx/${payment.transactionHash}`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="payment-history-page">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="payment-history-page">
      <div className="payment-history-header">
        <h1 className="page-title">Payment History</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="card payment-history-card">
        <div className="payments-table-container">
          {payments.length === 0 ? (
            <div className="no-data-message">No payments found</div>
          ) : (
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="payment-row"
                    onClick={() => setSelectedPayment(payment)}
                  >
                    <td>{payment.employee}</td>
                    <td>${parseFloat(payment.amount).toFixed(2)}</td>
                    <td>{payment.date}</td>
                    <td>{payment.method}</td>
                    <td>
                      <span className={`status-badge ${payment.status}`}>
                        {payment.status.charAt(0).toUpperCase() +
                          payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="actions-cell">
                      {payment.method === "Solana" &&
                      payment.transactionHash ? (
                        <a
                          href={getTransactionUrl(payment)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="action-icon view-icon"
                          title="View Transaction"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="20"
                            height="20"
                          >
                            <path
                              fill="currentColor"
                              d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                            />
                          </svg>
                        </a>
                      ) : (
                        <button
                          className="action-icon view-icon"
                          title="View Details"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="20"
                            height="20"
                          >
                            <path
                              fill="currentColor"
                              d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                            />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedPayment && (
        <PaymentDetailsModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </div>
  );
}

export default PaymentHistory;
