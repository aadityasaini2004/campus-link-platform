import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import AODashboard from './pages/AODasboard.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import StaffDashboard from './pages/StaffDashboard.jsx';
import FacultyDashboard from "./pages/FacultyDashboard.jsx"

function App() {
  return (
    <Routes>
      {/* Default route user ko login page par bhej dega */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Login Route */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* AO Dashboard Route */}
      <Route path="/ao-dashboard" element={<AODashboard />} />
      
      {/* Student Dashboard Route */}
      <Route path="/student-dashboard" element={<StudentDashboard />} />
      
      {/* Staff Dashboard */}
      <Route path="/staff-dashboard" element={<StaffDashboard />} />

      {/* Faculty Dashboard */}
      <Route path="/faculty-dashboard" element={<FacultyDashboard />} />

    </Routes>
  );
}

export default App;