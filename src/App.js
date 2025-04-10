import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import PromptsPage from './components/Dashboard/PromptPage';  // ✅ Import PromptsPage
import ScreeningResultView from './components/Dashboard/ScreeningResultView';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/prompts" element={<PromptsPage />} />  {/* ✅ New PromptsPage route */}
          <Route path="/screeningresultview" element={<ScreeningResultView />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
 
export default App;