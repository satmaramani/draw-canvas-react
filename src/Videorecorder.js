import React, { useRef, useState } from 'react';
import { FaPlay, FaPause, FaStop, FaVideo } from 'react-icons/fa';

const VideoRecorder = () => {
    const videoRef = useRef(null);
    const playbackRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [mediaStream, setMediaStream] = useState(null);
    const [recordedChunks, setRecordedChunks] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedVideoURL, setRecordedVideoURL] = useState(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            setMediaStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            startRecording(stream);
        } catch (error) {
            console.error('Camera access error:', error);
            alert('Please allow camera and microphone access.');
        }
    };

    const startRecording = (stream) => {
        const options = { mimeType: 'video/webm; codecs=vp9,opus' };
        const recorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = recorder;
        const chunks = [];

        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunks.push(event.data);
            }
        };

        recorder.onstop = () => {
            if (chunks.length === 0) return;
            const blob = new Blob(chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            setRecordedChunks(chunks);
            setRecordedVideoURL(url);
        };

        recorder.start();
        setRecordedChunks([]);
        setIsRecording(true);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const stopCamera = () => {
        if (mediaStream) {
            mediaStream.getTracks().forEach((track) => track.stop());
            setMediaStream(null);
        }
        setIsRecording(false);
    };

    const restartRecording = () => {
        stopRecording();
        setRecordedVideoURL(null);
        setRecordedChunks([]);
        startCamera();
    };

    const playVideo = () => playbackRef.current?.play();
    const pauseVideo = () => playbackRef.current?.pause();
    const stopVideo = () => {
        if (playbackRef.current) {
            playbackRef.current.pause();
            playbackRef.current.currentTime = 0;
        }
    };

    return (
        <div className="p-6 bg-gradient-to-br from-white to-gray-100 min-h-screen flex flex-col items-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Video Recorder</h1>

            {mediaStream && (
                <div className="relative">
                    <video
                        ref={videoRef}
                        className="rounded-lg border shadow-lg w-[480px] h-[360px]"
                        muted
                        autoPlay
                    />
                    {isRecording && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm animate-pulse">
                            ● Recording
                        </div>
                    )}
                </div>
            )}

            <div className="mt-4 flex gap-4">
                {!isRecording && !mediaStream && (
                    <button
                        onClick={startCamera}
                        className="px-6 py-2 bg-green-600 text-white rounded-full shadow hover:bg-green-700 flex items-center gap-2"
                    >
                        <FaVideo /> Start Recording
                    </button>
                )}
                {mediaStream && isRecording && (
                    <button
                        onClick={stopRecording}
                        className="px-6 py-2 bg-red-600 text-white rounded-full shadow hover:bg-red-700"
                    >
                        Stop Recording
                    </button>
                )}
                {mediaStream && (
                    <button
                        onClick={stopCamera}
                        className="px-6 py-2 bg-gray-600 text-white rounded-full shadow hover:bg-gray-700"
                    >
                        Stop Camera
                    </button>
                )}
            </div>

            {recordedVideoURL && (
                <div className="mt-8 w-full max-w-xl flex flex-col items-center">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Recorded Video</h2>
                    <video
                        ref={playbackRef}
                        src={recordedVideoURL}
                        className="rounded-lg border shadow-lg"
                        width="480"
                        height="360"
                    />
                    <div className="mt-3 flex gap-3">
                        <button
                            onClick={playVideo}
                            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 flex items-center gap-1"
                        >
                            <FaPlay /> Play
                        </button>
                        <button
                            onClick={pauseVideo}
                            className="px-4 py-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 flex items-center gap-1"
                        >
                            <FaPause /> Pause
                        </button>
                        <button
                            onClick={stopVideo}
                            className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center gap-1"
                        >
                            <FaStop /> Stop
                        </button>
                    </div>
                    <button
                        onClick={restartRecording}
                        className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600"
                    >
                        Restart Recording
                    </button>
                </div>
            )}
        </div>
    );
};

export default VideoRecorder;
