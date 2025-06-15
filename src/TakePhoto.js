import React, { useRef, useState, useEffect } from 'react';
import { FaCamera, FaRedoAlt } from 'react-icons/fa';
import './TakePhoto.css';

const filters = [
    { name: 'Normal', class: '' },
    { name: 'Grayscale', class: 'grayscale' },
    { name: 'Sepia', class: 'sepia' },
    { name: 'Invert', class: 'invert' },
    { name: 'Brightness+', class: 'brightness' },
];

const TakePhoto = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [showCamera, setShowCamera] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('');

    const startCamera = async () => {
        setErrorMessage('');
        setCapturedImage(null);
        setShowCamera(true);
        setSelectedFilter(''); // Reset filter

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
        <div className="photo-container">
            <h1 className="title">📸 Take a Photo</h1>

            {errorMessage && <p className="error">{errorMessage}</p>}

            {!showCamera && !capturedImage && (
                <button className="btn start-btn" onClick={startCamera}>
                    <FaCamera /> Open Camera
                </button>
            )}

            {showCamera && (
                <div className="camera-wrapper">
                    <div className="video-box">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className={`video-preview ${selectedFilter}`}
                        />
                        <div className="recording-label">
                            ● Live Preview
                        </div>
                    </div>

                    <div className="filter-buttons">
                        {filters.map((filter) => (
                            <button
                                key={filter.name}
                                className={`btn filter-btn ${selectedFilter === filter.class ? 'active' : ''}`}
                                onClick={() => setSelectedFilter(filter.class)}
                            >
                                {filter.name}
                            </button>
                        ))}
                    </div>

                    <button className="btn capture-btn" onClick={capturePhoto}>
                        <FaCamera /> Capture Photo
                    </button>
                </div>
            )}

            {capturedImage && (
                <div className="result-section">
                    <h2 className="subtitle">Captured Image:</h2>
                    <img
                        src={capturedImage}
                        alt="Captured"
                        className={`captured-image ${selectedFilter}`}
                    />
                    <div className="filter-buttons">
                        {filters.map((filter) => (
                            <button
                                key={filter.name}
                                className={`btn filter-btn ${selectedFilter === filter.class ? 'active' : ''}`}
                                onClick={() => setSelectedFilter(filter.class)}
                            >
                                {filter.name}
                            </button>
                        ))}
                    </div>
                    <button className="btn retake-btn" onClick={startCamera}>
                        <FaRedoAlt /> Retake Photo
                    </button>
                </div>
            )}

            <canvas ref={canvasRef} className="hidden-canvas" />
        </div>
    );
};

export default TakePhoto;
