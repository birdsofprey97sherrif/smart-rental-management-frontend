// pages/VerifyAccountPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/axiosInstance";

export default function VerifyAccountPage() {
  const { token } = useParams();
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    axios.get(`/auth/verify-account/${token}`)
      .then(res => setMessage(res.data.message))
      .catch(() => setMessage("Verification failed or token expired."));
  }, [token]);

  return (
    <div className="text-center mt-20">
      <h1 className="text-2xl font-bold">{message}</h1>
    </div>
  );
}
