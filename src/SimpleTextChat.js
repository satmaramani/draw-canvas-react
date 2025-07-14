import React, { useState, useRef, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const emotionStyles = {
  joy: { color: "#28a745", emoji: "😊" },
  sadness: { color: "#6c757d", emoji: "😔" },
  anger: { color: "#dc3545", emoji: "😠" },
  fear: { color: "#fd7e14", emoji: "😨" },
  love: { color: "#e83e8c", emoji: "❤️" },
  surprise: { color: "#17a2b8", emoji: "😲" },
  neutral: { color: "#007bff", emoji: "😐" },
};

const EmotionAssistant = () => {
  const [input, setInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const latestRef = useRef(null);

  useEffect(() => {
    if (latestRef.current) {
      latestRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [chatHistory]);

  const sendText = async () => {
    if (!input.trim()) return;
    setLoading(true);

    const res = await fetch("http://localhost:8000/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input }),
    });

    const data = await res.json();
    setLoading(false);
    setInput("");

    const audioBlob = new Blob([Uint8Array.from(data.audio.match(/.{1,2}/g).map((h) => parseInt(h, 16)))], {
      type: "audio/mp3",
    });
    const audioUrl = URL.createObjectURL(audioBlob);

    setChatHistory((prev) => [
      ...prev,
      {
        user: input,
        emotion: data.emotion,
        score: data.score,
        response: data.response,
        audioUrl,
        all_scores: data.all_scores,
      },
    ]);

    new Audio(audioUrl).play(); // Auto play voice
  };

  const reset = () => {
    setChatHistory([]);
    setInput("");
  };

  const renderChart = (scores) => {
    const data = scores.map((s) => ({
      name: s.label,
      value: Number(s.score.toFixed(3)),
    }));
    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis domain={[0, 1]} />
          <Tooltip />
          <Bar dataKey="value" fill="#007bff" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div style={{ display: "flex", fontFamily: "Arial" }}>
      {/* Main App Area */}
      <div style={{ flex: 1, padding: "2rem", maxWidth: "700px" }}>
        <h2>🤖 Sam's Emotion-Aware AI Assistant Demo 🤖 </h2>

        <style>{`
          @keyframes flashIn {
            from { background-color: #ffeeba; }
            to { background-color: #f1f1f1; }
          }
        `}</style>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          placeholder="What's on your mind?"
          style={{ width: "100%", padding: "1rem", fontSize: "1rem", marginBottom: "1rem" }}
        />
        <div style={{ display: "flex", gap: "1rem" }}>
          <button onClick={sendText} disabled={loading} style={{ padding: "0.5rem 1rem" }}>
            🔍 Analyze
          </button>
          <button onClick={reset} style={{ padding: "0.5rem 1rem", background: "#f8f9fa" }}>
            🔄 Reset
          </button>
        </div>

        {loading && <p>⏳ Processing...</p>}

        <div style={{ marginTop: "2rem" }}>
          {[...chatHistory].reverse().map((chat, index) => {
            const style = emotionStyles[chat.emotion.toLowerCase()] || {};
            return (
              <div
                key={index}
                ref={index === 0 ? latestRef : null}
                style={{
                  marginBottom: "2rem",
                  padding: "1rem",
                  background: "#f1f1f1",
                  borderRadius: "10px",
                  borderLeft: `6px solid ${style.color}`,
                  animation: index === 0 ? "flashIn 0.5s ease-in-out" : "none",
                }}
              >
                <p><strong>🧍‍♂️ You:</strong> {chat.user}</p>
                <p>
                  <strong>AI Detected:</strong>{" "}
                  <span style={{ color: style.color, fontWeight: "bold" }}>
                    {style.emoji} {chat.emotion.toUpperCase()} ({chat.score})
                  </span>
                </p>
                <p><strong>🤖 AI Response:</strong> {chat.response}</p>
                <audio controls src={chat.audioUrl} style={{ marginTop: "0.5rem" }} />
                <h4 style={{ marginTop: "1rem" }}>📊 Confidence Chart</h4>
                {renderChart(chat.all_scores)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Log on Right */}
      <div
        style={{
          width: "300px",
          borderLeft: "2px solid #ccc",
          padding: "1rem",
          height: "100vh",
          overflowY: "auto",
          position: "sticky",
          top: 0,
          background: "#fafafa",
        }}
      >
        <hr /><h3>🗨️ Conversation with AI</h3> <hr /><hr /><hr />
        {chatHistory.reverse().map((chat, index) => (
          <div key={index} style={{ marginBottom: "1rem" }}>
            <p><strong>🧍‍♂️You [{index+1}]:</strong> {chat.user}</p>
            <p><strong>🤖 AI [{index+1}]:</strong> {chat.response}</p>
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmotionAssistant;
