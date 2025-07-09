// App.js
import React from 'react';
import './App.css'; // Import your custom CSS
import ColoringBookApp from "./Coloring";
import VideoRecorder from "./Videorecorder";
import CanvasDrawingApp from "./Canvas";
import BoyAndGirlColoring from "./BoyAndGirl";
import TakePhoto from "./TakePhoto";
import UploadMedia from "./UploadMedia";
import UploadPage from "./Uploadpage1";
import ServerUploadReact from "./ServerUploadReact"
import ColoringCanvas from './ColoringLatest';
import UploadStep2 from "./UploadStep2"
import UploadCombined from "./UploadCombined"
import ColoringBoyAndGirl from "./ColoringBoyAndGirl"
import TextCanvasEditor from "./TextCanvasEditor"

import BackgroundRemover from "./BackgroundRemover"
import ImageFilters from "./ImageFilters";

import ImageUploader from "./ImageUploaderNode"
import BackgroundRemoverMediapipe from "./BackgroundRemoverMediapipe"
import PythonClient from "./PythonClient"
import PhotoFilterCanvas from "./PhotoFilterCanvas";

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
      case '/UploadPage': return <div className="w-full max-w-3xl mx-auto"><UploadPage /></div>;
      case '/ServerUploadReact' :  return <ServerUploadReact />;
      case "/ColoringCanvas" : return <ColoringCanvas />;
      case "/UploadStep2" : return <UploadStep2 />;
      case "/UploadCombined" : return <UploadCombined />;
      case "/ColoringBoyAndGirl" : return <ColoringBoyAndGirl />;
      case "/TextCanvasEditor" : return <TextCanvasEditor />;
      case "/BackgroundRemover" : return <BackgroundRemover />;
      case "/ImageFilters" : return <ImageFilters />;
      case "/ImageUploader" : return <ImageUploader />;
      case "/BackgroundRemoverMediapipe" : return <BackgroundRemoverMediapipe />;
      case "/PythonClient" : return <PythonClient />;
      case "/PhotoFilterCanvas" : return <PhotoFilterCanvas />;
      
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

    {/* <li>
      <button onClick={() => navigate('/UploadPage')}>Upload Page</button>
    </li> */}
    <li>
      <button onClick={() => navigate('/ServerUploadReact')}>QR Code Sync Upload Images - backend </button>
    </li>
    <li>
      <button onClick={() => navigate('/ColoringCanvas')}>Coloring  Picaso Image </button>
    </li>
    <li>
      <button onClick={() => navigate('/ColoringBoyAndGirl')}>Coloring Boy and Girl </button>
    </li>

    {/* <li>
      <button onClick={() => navigate('/UploadStep2')}>UploadStep2 </button>
    </li> */}
    <li>
      <button onClick={() => navigate('/UploadCombined')}>Upload Step Combined </button>
    </li>
    
    <li>
      <button onClick={() => navigate('/TextCanvasEditor')}>Text & Image Editor </button>
    </li>

    <li>
      <button onClick={() => navigate('/BackgroundRemover')}>Frontend BackgroundRemover </button>
    </li>
    {/* <li>
      <button onClick={() => navigate('/ImageFilters')}>6 Image Filters </button>
    </li> */}

<li>
      <button onClick={() => navigate('/ImageUploader')}>Node Image Uploader </button>
    </li>

    <li>
      <button onClick={() => navigate('/BackgroundRemoverMediapipe')}>MediaPipe BackgroundRemover </button>
    </li>

    <li>
      <button onClick={() => navigate('/PythonClient')}>Python Client Bg Remove</button>
    </li>

    <li>
      <button onClick={() => navigate('/PhotoFilterCanvas')}>Photo 6 Filter Canvas</button>
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
