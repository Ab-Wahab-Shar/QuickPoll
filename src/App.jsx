import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PollProvider } from './context/PollContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VotingPage from './pages/VotingPage';
import Results from './pages/Results';
import TeacherDashboard from './pages/TeacherDashboard';
import Profile from './pages/Profile';
import './App.css';

function App() {
  return (
    <PollProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vote/:id" element={<VotingPage />} />
          <Route path="/results" element={<Results />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </PollProvider>
  );
}

export default App;
