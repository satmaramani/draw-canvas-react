// App.js
import React from 'react';
import './App.css'; // Import your custom CSS
import ColoringBookApp from "./Coloring";
import VideoRecorder from "./Videorecorder";
import CanvasDrawingApp from "./Canvas";
import BoyAndGirlColoring from "./BoyAndGirl";
import TakePhoto from "./TakePhoto";
import UploadMedia from "./UploadMedia";

const Home = () => (
  <div className="home-container">
    <h2 className="home-title">Welcome Home!</h2>
    <p className="home-text">Test home page, This is the main page of your application.</p>
  </div>
);

const Router = () => {
  const [currentPath, setCurrentPath] = React.useState(window.location.pathname);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const renderContent = () => {
    switch (currentPath) {
      
      case '/': return <div className="centered-page"><Home /></div>;;
      case '/coloring': return <div className="w-full max-w-3xl mx-auto"><ColoringBookApp /></div>;
      case '/VideoRecorder': return <div className="centered-page video-wrapper"><VideoRecorder /></div>;
      case '/CanvasDrawingApp': return <div className="w-full max-w-3xl mx-auto"><CanvasDrawingApp /></div>;
      case '/BoyAndGirlColoring': return <div className="w-full max-w-3xl mx-auto"><BoyAndGirlColoring /></div>;
      case '/Takephoto': return <div className="w-full max-w-3xl mx-auto"><TakePhoto /></div>;
      case '/UploadMedia': return <div className="w-full max-w-3xl mx-auto"><UploadMedia /></div>;
      default:
        return (
          <div className="not-found">
            <h2>404 - Page Not Found</h2>
            <p>The page you are looking for does not exist.</p>
          </div>
        );
    }
  };

  return (
    <div className="app-wrapper">
      <div className="app-card">
      <nav className="navbar">
  <ul>
    <li>
      <button onClick={() => navigate('/')}>Home</button>
    </li>
    <li>
      <button onClick={() => navigate('/CanvasDrawingApp')}>Canvas / Sketching</button>
    </li>
    <li>
      <button onClick={() => navigate('/VideoRecorder')}>Video Recorder</button>
    </li>
    <li>
      <button onClick={() => navigate('/Takephoto')}>Capture Photo</button>
    </li>
    <li>
      <button onClick={() => navigate('/UploadMedia')}>Upload Photo / Video</button>
    </li>
  </ul>
</nav>

<main className="main-content">
  {renderContent()}
</main>
      </div>
    </div>
  );
};

export default Router;
