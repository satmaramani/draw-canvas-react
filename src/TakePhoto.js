import React, { useRef, useState, useEffect } from 'react';
import { FaCamera, FaRedoAlt } from 'react-icons/fa';

const TakePhoto = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [showCamera, setShowCamera] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const startCamera = async () => {
        setErrorMessage('');
        setCapturedImage(null);
        setShowCamera(true);

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.play();
            }
        } catch (err) {
            console.error('Camera error:', err);
            setErrorMessage('Could not access the camera. Please allow webcam permissions.');
            setShowCamera(false);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        setStream(null);
        setShowCamera(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            const context = canvas.getContext('2d');

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const dataUrl = canvas.toDataURL('image/png');
            setCapturedImage(dataUrl);
            stopCamera();
        }
    };

    useEffect(() => {
        return () => stopCamera();
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 py-6">
            <h1 className="text-3xl font-bold text-center mb-6">📸 Take a Photo</h1>

            {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}

            {!showCamera && !capturedImage && (
                <button
                    onClick={startCamera}
                    className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 shadow-md text-lg flex items-center gap-2"
                >
                    <FaCamera /> Open Camera
                </button>
            )}

            {showCamera && (
                <div className="flex flex-col items-center gap-4 mt-4">
                    <div className="relative border-4 border-blue-500 rounded-lg shadow-lg overflow-hidden">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className="rounded-lg w-full max-w-md"
                        />
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 text-xs rounded-full shadow animate-pulse">
                            ● Live Preview
                        </div>
                    </div>

                    <button
                        onClick={capturePhoto}
                        className="bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 shadow-md text-lg flex items-center gap-2"
                    >
                        <FaCamera /> Capture Photo
                    </button>
                </div>
            )}

            {capturedImage && (
                <div className="mt-6 text-center flex flex-col items-center">
                    <h2 className="text-xl font-semibold mb-2">Captured Image:</h2>
                    <img
                        src={capturedImage}
                        alt="Captured"
                        className="w-full max-w-md rounded shadow border"
                    />
                    <button
                        onClick={startCamera}
                        className="mt-4 bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 shadow-md text-lg flex items-center gap-2"
                    >
                        <FaRedoAlt /> Retake Photo
                    </button>
                </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default TakePhoto;
