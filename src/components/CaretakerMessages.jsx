import React, { useEffect, useState, useRef } from "react";
import axios from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function CaretakerMessages() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [houses, setHouses] = useState([]);
  const [selectedHouse, setSelectedHouse] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  const fetchHouses = React.useCallback( async () => {
    try {
      const res = await axios.get("/caretaker/houses-managed", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHouses(res.data.houses);
      if (res.data.houses.length > 0) {
        setSelectedHouse(res.data.houses[0]._id);
      }
    } catch {
      showToast("Failed to load houses", "error");
    }
  }, [token, showToast]);

  const fetchMessages = React.useCallback( async () => {
    if (!selectedHouse) return;
    try {
      const res = await axios.get(`/messages/house/${selectedHouse}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data.messages);
    } catch {
      showToast("Failed to load messages", "error");
    }
  }, [selectedHouse, token, showToast]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await axios.post(
        "/messages/send",
        { houseId: selectedHouse, content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessage("");
      fetchMessages();
    } catch {
      showToast("Failed to send message", "error");
    }
  };

  useEffect(() => {
    fetchHouses();
  }, [fetchHouses]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="bg-white p-4 rounded shadow flex flex-col h-[80vh]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Messages</h2>
        <select
          value={selectedHouse}
          onChange={(e) => setSelectedHouse(e.target.value)}
          className="border rounded px-2 py-1"
        >
          {houses.map((h) => (
            <option key={h._id} value={h._id}>
              {h.title} - {h.location}
            </option>
          ))}
        </select>
      </div>

      {/* Message history */}
      <div className="flex-1 overflow-y-auto border p-3 rounded mb-4">
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages yet.</p>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-2 p-2 rounded ${
                msg.senderRole === "caretaker"
                  ? "bg-blue-100 self-end text-right"
                  : "bg-gray-200 self-start"
              }`}
            >
              <p className="text-sm text-gray-700">{msg.content}</p>
              <span className="text-xs text-gray-500">
                {msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}
