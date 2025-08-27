import { useCallback, useEffect, useState, useRef } from 'react';
import axios from "../utils/axiosInstance";
import { Button } from './ui/button';
import { useToast } from '../context/ToastContext';

export default function TenantChatRoom({ houseId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const { showToast } = useToast();
  const chatRef = useRef();

  const loadMessages = useCallback(async () => {
    try {
      const res = await axios.get(`/messages/${houseId}`);
      setMessages(res.data.messages);
    } catch {
      showToast('Failed to load messages', 'error');
    }
  }, [houseId, showToast]);

  useEffect(() => {
    if (houseId) loadMessages();
  }, [houseId, showToast, loadMessages]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await axios.post('/messages/send', {
        houseId,
        receiverId: getCaretakerIdFromMessages(),
        text,
      });
      setText('');
      loadMessages();
    } catch {
      showToast('Failed to send message', 'error');
    }
  };

  const getCaretakerIdFromMessages = () => {
    const caretakerMsg = messages.find(m => m.senderId?.role === 'caretaker' || m.receiverId?.role === 'caretaker');
    return caretakerMsg?.senderId?._id || caretakerMsg?.receiverId?._id;
  };

  return (
    <div className="border rounded p-4 space-y-4">
      <div className="font-bold text-lg">💬 Chat with Caretaker</div>
      <div
        ref={chatRef}
        className="h-64 overflow-y-auto bg-gray-50 rounded p-3 space-y-2"
      >
        {messages.map((msg) => (
          <div key={msg._id} className={`p-2 rounded-md max-w-[70%] ${msg.senderId.role === 'tenant' ? 'bg-blue-100 self-end ml-auto' : 'bg-gray-200'}`}>
            <strong>{msg.senderId.fullName}:</strong> <br />
            <span>{msg.text}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="flex space-x-2">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 border px-3 py-2 rounded"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}
