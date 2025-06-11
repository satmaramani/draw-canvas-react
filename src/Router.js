// App.js
import React from 'react';
// Importing your actual component files
import ColoringBookApp from "./Coloring"
import VideoRecorder from "./Videorecorder"
import CanvasDrawingApp from "./Canvas"
import BoyAndGirlColoring from "./BoyAndGirl"

// Dummy component for the Home page
const Home = () => (
  <div className="p-8 bg-white rounded-lg shadow-lg text-center">
    <h2 className="text-4xl font-bold text-gray-800 mb-4">Welcome Home!</h2>
    <p className="text-lg text-gray-600">This is the main page of your application.</p>
  </div>
);

// Main App component (renamed to Router as per your code)
const Router = () => {
  // Use a simple state for current path to simulate routing without a full browser environment.
  // In a real application, react-router-dom handles this automatically.
  const [currentPath, setCurrentPath] = React.useState(window.location.pathname);

  // Function to navigate programmatically by updating the browser history and state
  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Renders the appropriate component based on the currentPath
  const renderContent = () => {
    switch (currentPath) {
      case '/':
        return <Home />;
      case '/coloring':
        return <ColoringBookApp />;
      case '/VideoRecorder':
        return <VideoRecorder />;
      case "/CanvasDrawingApp":
        return <CanvasDrawingApp />;

      case "/takephoto": 
        return <takephoto />;
      case "/BoyAndGirlColoring":
        return <BoyAndGirlColoring />
      default:
        // Handles routes that don't match any defined path (404 Not Found)
        return (
          <div className="p-8 bg-red-50 rounded-lg shadow-lg text-center">
            <h2 className="text-4xl font-bold text-red-700 mb-4">404 - Page Not Found</h2>
            <p className="text-lg text-red-600">The page you are looking for does not exist.</p>
          </div>
        );
    }
  };

  return (
    // Tailwind CSS classes are used for styling, assuming Tailwind CSS is available in your project.
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 flex flex-col items-center justify-center p-4 font-sans antialiased">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Navigation Bar */}
        <nav className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-t-xl shadow-md">
          {/* Unordered list for navigation links with flexbox for horizontal layout and responsiveness */}
          <ul className="nav-list">
            <li>
            <button className="nav-button"
                onClick={() => navigate('/')}
                
              >
                Home
              </button>
            </li>
            <li>
            <button className="nav-button"
                onClick={() => navigate('/coloring')}
                
              >
                Coloring
              </button>
            </li>
            <li>
            <button className="nav-button" 
                onClick={() => navigate('/VideoRecorder')}
                
              >
                Video Recorder
              </button>
            </li>
            <li>
            <button className="nav-button"
                onClick={() => navigate('/CanvasDrawingApp')}
                
              >
                Canvas
              </button>
            </li>
            <li>
            <button className="nav-button"
                onClick={() => navigate('/BoyAndGirlColoring')}
                
              >
                BoyAndGirlColoring
              </button>
            </li>
          </ul>
        </nav>

        {/* Main content area where routed components will be displayed */}
        <main className="p-8 flex items-center justify-center">
          {renderContent()}
        </main>
      </div>

      {/* Note about the routing simulation vs. react-router-dom */}
    </div>
  );
};

export default Router;


