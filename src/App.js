import './App.css';
import Router from "./Router";
import AdminAccess from "./components/AdminAccess";
import KioskMode from "./components/KioskMode";
// import ColoringPage from './ColoringTemp';

function App() {
  return (
    <div className="App">
      {/* <ColoringPage /> */}
      <Router />
      <AdminAccess />
      <KioskMode />
    </div>
  );
}

export default App;
