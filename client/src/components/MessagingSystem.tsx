import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function MessagingSystem() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { id: 1, sender: "Host", content: "Welcome to the property! Let me know if you need anything." },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const sendMessage = () => {
    if (newMessage.trim() === "" && !file) return;

    const newMessageObject = {
      id: messages.length + 1,
      sender: user?.name || "Guest",
      content: newMessage,
      file: file ? URL.createObjectURL(file) : null,
    };

    setMessages((prev) => [...prev, newMessageObject]);
    setNewMessage("");
    setFile(null);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Simulate automated responses
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].sender !== "Host") {
      const timer = setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { id: prev.length + 1, sender: "Host", content: "Thank you for your message! I'll get back to you shortly." },
        ]);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [messages]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Messaging System</h1>

      <div className="border rounded-lg p-4 mb-4 h-64 overflow-y-auto">
        {messages.map((message) => (
          <div key={message.id} className="mb-2">
            <strong>{message.sender}:</strong> <span>{message.content}</span>
            {message.file && (
              <div>
                <a href={message.file} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                  View Attachment
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-2">
        <Input
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <input type="file" onChange={handleFileChange} />
        {file && <span className="text-sm text-gray-500">{file.name}</span>}
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Enable Notifications</label>
        <input
          type="checkbox"
          checked={notificationsEnabled}
          onChange={(e) => setNotificationsEnabled(e.target.checked)}
        />
      </div>
    </div>
  );
}