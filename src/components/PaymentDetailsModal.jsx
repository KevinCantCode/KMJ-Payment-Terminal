import React from "react";
import Modal from "./Modal";
import "../styles/PaymentDetailsModal.css";

function PaymentDetailsModal({ payment, onClose }) {
  const getTransactionUrl = (payment) => {
    if (payment.method === "Solana" && payment.transactionHash) {
      return `https://explorer.solana.com/tx/${payment.transactionHash}`;
    }
    return null;
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Payment Details">
      <div className="payment-details">
        <div className="detail-row">
          <span className="detail-label">Employee:</span>
          <span className="detail-value">{payment.employee}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Payment Method:</span>
          <span className="detail-value">{payment.method}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Amount:</span>
          <span className="detail-value">
            ${parseFloat(payment.amount).toFixed(2)}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Status:</span>
          <span className={`status-badge ${payment.status}`}>
            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Date:</span>
          <span className="detail-value">{payment.date}</span>
        </div>
        {payment.description && (
          <div className="detail-row">
            <span className="detail-label">Description:</span>
            <span className="detail-value">{payment.description}</span>
          </div>
        )}
        {payment.method === "Solana" && payment.transactionHash && (
          <div className="detail-row">
            <span className="detail-label">Transaction Hash:</span>
            <div className="transaction-hash">
              <span className="detail-value">{payment.transactionHash}</span>
              <a
                href={getTransactionUrl(payment)}
                target="_blank"
                rel="noopener noreferrer"
                className="view-transaction-btn"
              >
                View on Explorer
              </a>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default PaymentDetailsModal;
