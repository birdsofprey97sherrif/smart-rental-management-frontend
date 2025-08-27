import React, { useState } from "react";
import PaymentHistory from "./PaymentHistory";
import axios from "../utils/axiosInstance";
import { useToast } from "../context/ToastContext";

export default function TenantPaymentPage() {
  const { showToast } = useToast();
  const [showHistory, setShowHistory] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("M-Pesa");
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // 🔑 force re-fetch payments

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      return showToast("Please enter a valid amount", "warning");
    }
    setLoading(true);
    try {
      await axios.post("/rents/pay-rent", { amount, method });
      showToast("Payment successful ✅", "success");
      setAmount("");
      setMethod("M-Pesa");
      setRefreshKey((prev) => prev + 1); // 🔄 refresh history
    } catch (err) {
      showToast("Payment failed. Try again ❌", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-lg border-0">
        <div className="card-body">
          <h4 className="mb-3 text-center">🏠 Tenant Payments</h4>
          <p className="text-muted text-center">
            Pay your rent securely and keep track of your history.
          </p>

          {/* Payment Form */}
          <form className="row g-3 mt-3" onSubmit={handlePayment}>
            <div className="col-md-6">
              <label className="form-label">Amount (KES)</label>
              <input
                type="number"
                className="form-control"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Payment Method</label>
              <select
                className="form-select"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option>M-Pesa</option>
                <option>Bank Transfer</option>
                <option>Cash</option>
              </select>
            </div>
            <div className="col-12 text-center">
              <button
                type="submit"
                className="btn btn-primary px-4"
                disabled={loading}
              >
                {loading ? (
                  <span>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    Processing...
                  </span>
                ) : (
                  "Pay Now"
                )}
              </button>
            </div>
          </form>

          {/* History Toggle */}
          <div className="text-center mt-4">
            <button
              className="btn btn-outline-secondary px-4"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? "Hide Payment History" : "View Payment History"}
            </button>
          </div>
        </div>
      </div>

      {/* Payment History */}
      {showHistory && (
        <div className="mt-4 animate__animated animate__fadeIn">
          <PaymentHistory refreshKey={refreshKey} />
        </div>
      )}
    </div>
  );
}
