import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Payments.css";
import { getAllEmployees } from "../firebase/employeeService";
import { getAllPayments, addPayment } from "../firebase/paymentService";
import WalletConnection from "../components/WalletConnection";
import { useSolana } from "../contexts/SolanaContext";
import { convertUsdToSol } from "../services/solana";
import PaymentDetailsModal from "../components/PaymentDetailsModal";
import SuccessNotification from "../components/SuccessNotification";
import { useWise } from "../contexts/WiseContext";

function Payments({ setActivePage, connection }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { walletAddress, sendSolanaPayment } = useSolana();
  const {
    wiseProfile,
    currencies,
    getRate,
    createWiseQuote,
    createWiseTransfer,
    createQuote,
    createTransfer,
  } = useWise();
  const [solConversion, setSolConversion] = useState(null);
  // State for data
  const [payments, setPayments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Form state
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Solana");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Additional state variables
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Set active page on mount
  useEffect(() => {
    setActivePage("payments");
  }, [setActivePage]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch employees and payments in parallel
        const [employeesData, paymentsData] = await Promise.all([
          getAllEmployees(),
          getAllPayments(),
        ]);

        setEmployees(employeesData);
        setPayments(paymentsData);
        setError(null);

        // Check for employee parameter in URL
        const params = new URLSearchParams(location.search);
        const employeeName = params.get("employee");
        if (employeeName) {
          const employee = employeesData.find(
            (emp) => emp.name === employeeName
          );
          if (employee) {
            setSelectedEmployee(employee.id);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.search]);

  // Update payment method when employee changes
  useEffect(() => {
    if (selectedEmployee) {
      const employee = employees.find((emp) => emp.id === selectedEmployee);
      setPaymentMethod(employee?.["payment-method"] || "Solana");
    } else {
      setPaymentMethod("Solana");
    }
  }, [selectedEmployee, employees]);

  // Add effect to update SOL conversion when amount changes
  useEffect(() => {
    const updateSolConversion = async () => {
      if (amount && selectedEmployee) {
        const employee = employees.find((emp) => emp.id === selectedEmployee);
        if (employee && employee["payment-method"] === "Solana") {
          try {
            const solAmount = await convertUsdToSol(parseFloat(amount));
            setSolConversion(solAmount);
          } catch (error) {
            console.error("Error calculating SOL conversion:", error);
            setSolConversion(null);
          }
        } else {
          setSolConversion(null);
        }
      } else {
        setSolConversion(null);
      }
    };

    updateSolConversion();
  }, [amount, selectedEmployee, employees]);

  // Fetch recent payments
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const paymentsData = await getAllPayments();
        // Sort payments by date in descending order and take only the last 5
        const recentPayments = paymentsData
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);
        setPayments(recentPayments);
        setError(null);
      } catch (err) {
        console.error("Error fetching payments:", err);
        setError("Failed to load recent payments");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const handleEmployeeChange = (e) => {
    setSelectedEmployee(e.target.value);
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee || !amount) {
      setError("Please select an employee and enter an amount");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const selectedEmployeeData = employees.find(
        (emp) => emp.id === selectedEmployee
      );

      if (!selectedEmployeeData) {
        throw new Error("Selected employee not found");
      }

      let transactionHash = null;
      let wiseTransferId = null;

      if (paymentMethod === "Solana") {
        // Handle Solana payment
        const result = await sendSolanaPayment(
          selectedEmployeeData.solanaAddress,
          parseFloat(amount)
        );
        transactionHash = result;

        // Save payment to Firebase after successful Solana payment
        const newPayment = {
          employee: selectedEmployeeData.name,
          employeeId: selectedEmployeeData.name,
          amount: parseFloat(amount),
          method: paymentMethod,
          status: "completed",
          transactionHash: result,
          description: description || `Payment to ${selectedEmployeeData.name}`,
        };

        await addPayment(newPayment);

        // Show success notification
        setSuccessMessage(
          `Successfully sent ${amount} USD (${solConversion.toFixed(
            4
          )} SOL) to ${selectedEmployeeData.name}`
        );
        setShowSuccess(true);

        // Reset form
        setSelectedEmployee("");
        setAmount("");
        setDescription("");
        setPaymentMethod("Solana");

        // Refresh payments list
        const paymentsData = await getAllPayments();
        const recentPayments = paymentsData
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);
        setPayments(recentPayments);
      } else if (paymentMethod === "Wise") {
        // Handle Wise payment by redirecting to their payment page
        try {
          // Construct the Wise payment URL with pre-filled data
          const wisePaymentUrl = new URL("https://wise.com/pay/transfer");
          wisePaymentUrl.searchParams.append("amount", amount);
          wisePaymentUrl.searchParams.append(
            "currency",
            selectedEmployeeData.currency || "USD"
          );
          wisePaymentUrl.searchParams.append(
            "recipient",
            selectedEmployeeData.wiseAccountId
          );
          wisePaymentUrl.searchParams.append(
            "reference",
            `Payment to ${selectedEmployeeData.name}`
          );

          // Save payment to Firebase with pending status
          const newPayment = {
            employee: selectedEmployeeData.name,
            employeeId: selectedEmployeeData.name,
            amount: parseFloat(amount),
            method: paymentMethod,
            status: "pending",
            transactionHash: "",
            description:
              description || `Payment to ${selectedEmployeeData.name}`,
          };

          await addPayment(newPayment);

          // Open Wise payment form in a new window
          window.open(wisePaymentUrl.toString(), "_blank");

          // Show success notification
          setSuccessMessage(
            `Redirecting to Wise payment page for ${amount} ${
              selectedEmployeeData.currency || "USD"
            } to ${selectedEmployeeData.name}`
          );
          setShowSuccess(true);

          // Reset form
          setSelectedEmployee("");
          setAmount("");
          setDescription("");
          setPaymentMethod("Solana");

          // Refresh payments list
          const paymentsData = await getAllPayments();
          const recentPayments = paymentsData
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
          setPayments(recentPayments);

          // Show success message
          setError(null);
        } catch (wiseError) {
          console.error("Wise payment error:", wiseError);
          throw new Error(
            `Failed to initiate Wise payment: ${wiseError.message}`
          );
        }
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "Failed to process payment");
    } finally {
      setLoading(false);
    }
  };

  const getTransactionUrl = (payment) => {
    if (payment.method === "Solana" && payment.transactionHash) {
      return `https://explorer.solana.com/tx/${payment.transactionHash}`;
    }
    return null;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="payments-page">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="payments-page">
      {showSuccess && (
        <SuccessNotification
          message={successMessage}
          onClose={() => setShowSuccess(false)}
        />
      )}
      <div className="payments-header">
        <h1 className="page-title">Payments</h1>
        <WalletConnection />
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="card new-payment-card">
        <h2 className="card-title">Create Payment</h2>
        <form className="payment-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="employee">Employee</label>
            <select
              id="employee"
              name="employee"
              required
              value={selectedEmployee}
              onChange={handleEmployeeChange}
              disabled={formSubmitting}
            >
              <option value="">Select Employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount">Amount ($)</label>
              <input
                type="number"
                id="amount"
                name="amount"
                min="0"
                step="0.01"
                placeholder="0.00"
                required
                value={amount}
                onChange={handleAmountChange}
                disabled={formSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="method">Payment Method</label>
              <input
                type="text"
                id="method"
                name="method"
                value={paymentMethod}
                readOnly
                placeholder="Select an employee first"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows="3"
              placeholder="Payment details..."
              value={description}
              onChange={handleDescriptionChange}
              disabled={formSubmitting}
            ></textarea>
          </div>

          {selectedEmployee && paymentMethod === "Solana" && (
            <div className="form-group">
              <label htmlFor="solanaAddress">Recipient Solana Address</label>
              <input
                type="text"
                id="solanaAddress"
                name="solanaAddress"
                value={
                  employees.find((emp) => emp.id === selectedEmployee)
                    ?.solanaAddress || ""
                }
                readOnly
                className="readonly-input"
              />
              {amount && solConversion && (
                <p className="conversion-info">
                  {amount} USD = {solConversion.toFixed(4)} SOL
                </p>
              )}
              {!walletAddress && (
                <p className="warning-message">
                  Please connect your wallet to make a Solana payment
                </p>
              )}
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={formSubmitting || !selectedEmployee || !amount}
            >
              {formSubmitting ? "Processing..." : "Process Payment"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setSelectedEmployee("");
                setAmount("");
                setDescription("");
              }}
              disabled={formSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <div className="card payments-card">
        <div className="card-header">
          <h2>Recent Payments</h2>
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

export default Payments;
