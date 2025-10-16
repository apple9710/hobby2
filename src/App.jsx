import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import HobbyPage from './pages/HobbyPage';
import ManagePage from './pages/ManagePage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/hobby" element={<HobbyPage />} />
          <Route path="/manage" element={<ManagePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
