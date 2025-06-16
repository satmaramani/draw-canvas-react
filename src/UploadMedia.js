import React, { useRef, useState } from 'react';
import { FaPlay, FaPause, FaStop, FaRedoAlt, FaUpload } from 'react-icons/fa';
import './UploadMedia.css';

const filters = [
  { name: 'None', class: '' },
  { name: 'Grayscale', class: 'grayscale' },
  { name: 'Sepia', class: 'sepia' },
  { name: 'Invert', class: 'invert' },
  { name: 'Brightness', class: 'brightness' },
];

const UploadMedia = () => {
  const [mediaURL, setMediaURL] = useState(null);
  const [isVideo, setIsVideo] = useState(false);
  const [filter, setFilter] = useState('');
  const videoRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const type = file.type;

    setIsVideo(type.startsWith('video'));
    setMediaURL(url);
    setFilter('');
  };

  const playVideo = () => videoRef.current?.play();
  const pauseVideo = () => videoRef.current?.pause();
  const stopVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const restart = () => {
    setMediaURL(null);
    setFilter('');
  };

  return (
    <div className="upload-container">
      <h1 className="title">🎞️ Upload Media (Photo Or Video)</h1>

      {!mediaURL && (
        <div className="upload-section">
          <input type="file" accept="image/*,video/*" onChange={handleFileChange} />
        </div>
      )}

      {mediaURL && (
        <div className="media-section">
          {isVideo ? (
            <video
              ref={videoRef}
              src={mediaURL}
              controls={false}
              className="media-preview"
              width="480"
              height="360"
            />
          ) : (
            <img
              src={mediaURL}
              alt="Uploaded"
              className={`media-preview ${filter}`}
            />
          )}

          {isVideo ? (
            <div className="controls">
              <button className="btn blue" onClick={playVideo}><FaPlay /> Play</button>
              <button className="btn yellow" onClick={pauseVideo}><FaPause /> Pause</button>
              <button className="btn red" onClick={stopVideo}><FaStop /> Stop</button>
            </div>
          ) : (
            <div className="filters">
              {filters.map(f => (
                <button
                  key={f.name}
                  className={`btn filter-btn ${filter === f.class ? 'active' : ''}`}
                  onClick={() => setFilter(f.class)}
                >
                  {f.name}
                </button>
              ))}
            </div>
          )}

{mediaURL && (
  <div className="restart-section">
    <button className="btn restart-btn" onClick={restart}>
      <FaRedoAlt /> Upload Another
    </button>
  </div>
)}
        </div>
      )}
    </div>
  );
};

export default UploadMedia;
