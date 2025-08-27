import React, { useEffect, useState, useCallback } from "react";
import axios from '../utils/axiosInstance';
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Modal, Button, Form } from "react-bootstrap";
import { Card, CardContent } from './ui/card';

export default function TenantDashboard() {
  useAuth();
  const { showToast } = useToast();

  const [rentalInfo, setRentalInfo] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [paying, setPaying] = useState(false);

  // ✅ Fetch rental info
  const fetchRentalInfo = useCallback(async () => {
    try {
      const { data } = await axios.get("/rents/my-rent");
      setRentalInfo(data);
    } catch (err) {
      showToast("Failed to load rental info", "error");
    }
  }, [showToast]);

  useEffect(() => {
    fetchRentalInfo();
  }, [fetchRentalInfo]);

  const handlePayment = async () => {
    setPaying(true);
    try {
      await axios.post("/rents/pay-rent", { amount });
      showToast("Payment successful!", "success");
      setShowPayModal(false);
      setAmount("");
      fetchRentalInfo();
    } catch (err) {
      showToast("Payment failed. Try again.", "error");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="container py-6">
      <h2 className="fw-bold mb-5 text-success">🏠 Tenant Dashboard</h2>

      {rentalInfo ? (
        <>
          {/* ===== Quick Summary Cards ===== */}
          <div className="row mb-4">
            <QuickCard
              icon="✅"
              title="Rental Status"
              subtitle="Active Lease, Rent due 5th"
              colorClass="text-success"
            />
            <QuickCard
              icon="🔧"
              title="Maintenance"
              subtitle="2 open requests"
              colorClass="text-primary"
            />
            <QuickCard
              icon="🚚"
              title="Relocations"
              subtitle="1 pending relocation"
              colorClass="text-warning"
            />
          </div>

          {/* Rental Info */}
          <Card className="mb-6 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-success">My Rental Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <p><strong>House:</strong> {rentalInfo.houseName}</p>
                <p><strong>Location:</strong> {rentalInfo.location}</p>
                <p><strong>Monthly Rent:</strong> KES {rentalInfo.rentAmount}</p>
                <p><strong>Status:</strong> {rentalInfo.isActive ? "Active" : "Terminated"}</p>
                <p><strong>Landlord:</strong> {rentalInfo.landlordName}</p>
                <p><strong>Caretaker:</strong> {rentalInfo.caretakerName}</p>
                <p><strong>Next Rent Due:</strong> {new Date(rentalInfo.nextDueDate).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Rent Payment */}
          <Card className="mb-6 shadow-sm border-l-4 border-yellow-500">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-yellow-700 mb-2">💸 Rent Payment</h3>
                <p className="text-gray-600">
                  <strong>Current Balance:</strong> KES {rentalInfo.balance || rentalInfo.rentAmount}
                </p>
              </div>
              <Button variant="success" size="lg" onClick={() => setShowPayModal(true)}>
                Pay Now
              </Button>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="alert alert-info">Loading rental info...</div>
      )}

      {/* Payment Modal */}
      <Modal show={showPayModal} onHide={() => setShowPayModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Simulated M-Pesa Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Amount (KES)</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPayModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handlePayment} disabled={paying}>
            {paying ? "Processing..." : "Confirm Payment"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}





function QuickCard({ icon, title, subtitle, colorClass }) {
  return (
    <div className="col-md-4 mb-3">
      <div className="card shadow-sm border-0 text-center h-100">
        <div className="card-body p-4">
          <div className="display-6 mb-2">{icon}</div>
          <h5 className={`fw-semibold mb-1 ${colorClass}`}>{title}</h5>
          <p className="text-muted small mb-0">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
