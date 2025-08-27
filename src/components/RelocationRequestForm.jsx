import React, { useState } from "react";
import axios from '../utils/axiosInstance';
import { useToast } from "../context/ToastContext";

const RelocationRequestForm = () => {
  const [form, setForm] = useState({ reason: "", date: "" });
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post("/relocations/request", form);
      showToast("Relocation request submitted!", "success");
      setForm({ reason: "", date: "" });
    } catch (err) {
      showToast(
        err.response?.data?.message || "Submission failed.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card mt-4 shadow-sm">
      <div className="card-header bg-info text-white">
        📝 Relocation Request
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Reason</label>
            <textarea
              className="form-control"
              name="reason"
              rows="3"
              required
              value={form.reason}
              onChange={handleChange}
              placeholder="Why do you wish to relocate?"
            ></textarea>
          </div>

          <div className="mb-3">
            <label className="form-label">Preferred Relocation Date</label>
            <input
              type="date"
              className="form-control"
              name="date"
              required
              value={form.date}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RelocationRequestForm;
