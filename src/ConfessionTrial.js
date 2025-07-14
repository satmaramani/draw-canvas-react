import React, { useState, useRef } from "react";

function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const [transcribedText, setTranscribedText] = useState("");
  const mediaRecorderRef = useRef(null);
  const chunks = useRef([]);

  const startRecording = async () => {
    setTranscribedText("");
    setAudioURL("");

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => chunks.current.push(e.data);

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks.current, { type: "audio/wav" });
      chunks.current = [];

      const formData = new FormData();
      formData.append("file", blob, "recording.wav");

      const response = await fetch("http://localhost:8000/transcribe", {
        method: "POST",
        body: formData,
      });

      const text = response.headers.get("X-Transcribed-Text");
      setTranscribedText(text);

      const audioBlob = await response.blob();
      const audioURL = URL.createObjectURL(audioBlob);
      setAudioURL(audioURL);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🎤 Voice to Text & Audio Response</h2>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? "⏹️ Stop" : "▶️ Start Recording"}
      </button>

      {transcribedText && (
        <div>
          <h3>📝 Transcribed Text:</h3>
          <p>{transcribedText}</p>
        </div>
      )}

      {audioURL && (
        <div>
          <h3>🔊 AI Response:</h3>
          <audio controls src={audioURL}></audio>
        </div>
      )}
    </div>
  );
}

export default AudioRecorder;