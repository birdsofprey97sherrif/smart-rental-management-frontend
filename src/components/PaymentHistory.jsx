import React, { useEffect, useState, useCallback } from "react";
import axios from "../utils/axiosInstance";
import { CSVLink } from "react-csv";
import { useToast } from "../context/ToastContext";

export default function PaymentHistory({ refreshKey }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchPayments = useCallback(async () => {
    try {
      const { data } = await axios.get("rents/tenant-view");
      setPayments(data);
    } catch (err) {
      showToast("Failed to fetch payments", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments, refreshKey]); // 👈 refresh when new payment made

  const csvHeaders = [
    { label: "Date", key: "paymentDate" },
    { label: "Amount", key: "amount" },
    { label: "Method", key: "method" },
  ];

  const csvData = payments.map((p) => ({
    ...p,
    paymentDate: new Date(p.paymentDate).toLocaleDateString(),
  }));

  const formatAmount = (amt) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amt);

  return (
    <div className="card shadow-sm">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">💳 Payment History</h5>
        {payments.length > 0 && (
          <CSVLink
            data={csvData}
            headers={csvHeaders}
            filename="payment_history.csv"
            className="btn btn-sm btn-outline-success"
          >
            Export CSV
          </CSVLink>
        )}
      </div>
      <div className="card-body">
        {loading ? (
          <div className="text-center my-3">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Fetching payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center text-muted py-4">
            <i className="bi bi-wallet2 fs-1"></i>
            <p className="mt-2">No payment records found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id}>
                    <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
                    <td>{formatAmount(p.amount)}</td>
                    <td>{p.method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
