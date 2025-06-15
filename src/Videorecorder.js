import React, { useRef, useState, useEffect } from 'react';
import { FaPlay, FaPause, FaStop, FaVideo } from 'react-icons/fa';
import './VideoRecorder.css'; // Link to CSS file

const VideoRecorder = () => {
    const videoRef = useRef(null);
    const playbackRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [mediaStream, setMediaStream] = useState(null);
    const [recordedChunks, setRecordedChunks] = useState([]);
    const [recordedVideoURL, setRecordedVideoURL] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [timer, setTimer] = useState(0);
    const [showPreview, setShowPreview] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => () => stopCamera(), []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setMediaStream(stream);
            setRecordedVideoURL(null);
            setShowPreview(true);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
            startRecording(stream);
        } catch (err) {
            console.error('Camera access denied:', err);
            alert('Please allow camera and microphone access.');
        }
    };

    const startRecording = (stream) => {
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        mediaRecorderRef.current = recorder;
        const chunks = [];

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            setRecordedChunks(chunks);
            setRecordedVideoURL(url);
            setShowPreview(false); // Hide camera preview after recording
        };

        recorder.start();
        setIsRecording(true);
        setTimer(0);
        timerRef.current = setInterval(() => setTimer((prev) => prev + 1), 1000);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
        clearInterval(timerRef.current);
        setIsRecording(false);
    };

    const stopCamera = () => {
        if (mediaStream) mediaStream.getTracks().forEach((track) => track.stop());
        setMediaStream(null);
        setIsRecording(false);
        clearInterval(timerRef.current);
    };

    const restartRecording = () => {
        stopRecording();
        stopCamera();
        setRecordedChunks([]);
        setRecordedVideoURL(null);
        setTimeout(() => startCamera(), 500);
    };

    return (
        <div className="container">
            <h1>Video Recorder</h1>

            {showPreview && mediaStream && (
                <div className="preview-box">
                    <video ref={videoRef} autoPlay muted playsInline className="preview-video" />
                    {isRecording && (
                        <div className="recording-badge">
                            ● Recording <span className="timer">{timer}s</span>
                        </div>
                    )}
                </div>
            )}

            <div className="controls">
                {!isRecording && !mediaStream && !recordedVideoURL && (
                    <button onClick={startCamera} className="btn start-btn">
                        <FaVideo /> Start Recording
                    </button>
                )}
                {isRecording && (
                    <button onClick={stopRecording} className="btn stop-btn">
                        <FaStop /> Stop Recording
                    </button>
                )}
                {mediaStream && (
                    <button onClick={stopCamera} className="btn gray-btn">
                        Stop Camera
                    </button>
                )}
            </div>

            {recordedVideoURL && (
                <div className="playback-section">
                    <h2>Recorded Video:</h2>
                    <video ref={playbackRef} src={recordedVideoURL} controls className="playback-video" />
                    <div className="playback-controls">
                        <button onClick={() => playbackRef.current?.play()} className="btn">
                            <FaPlay /> Play
                        </button>
                        <button onClick={() => playbackRef.current?.pause()} className="btn">
                            <FaPause /> Pause
                        </button>
                        <button
                            onClick={() => {
                                playbackRef.current.pause();
                                playbackRef.current.currentTime = 0;
                            }}
                            className="btn stop-btn"
                        >
                            <FaStop /> Stop
                        </button>
                    </div>
                    <button onClick={restartRecording} className="btn restart-btn">
                        Restart Recording
                    </button>
                </div>
            )}
        </div>
    );
};

export default VideoRecorder;
