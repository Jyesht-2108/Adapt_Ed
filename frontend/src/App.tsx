/**
 * Main App component with routing
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Generating from './pages/Generating';
import Curriculum from './pages/Curriculum';
import Sandbox from './pages/Sandbox';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generating/:generationId" element={<Generating />} />
        <Route path="/curriculum/:lessonId" element={<Curriculum />} />
        <Route path="/sandbox/:lessonId" element={<Sandbox />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
