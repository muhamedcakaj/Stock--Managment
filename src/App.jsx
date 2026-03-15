import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./components/AdminDashboard";
import ScannerPage from "./components/ScannerPage";
import LoginPage from "./components/Login";
import MagazineCrud from './components/MagazineCrud';
import FridgeCrud from './components/FridgeCrud';

function App() {
  const handleLogout = () => {
  };

  return (
    <Router>
      <Routes>
          <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardLayout onLogout={handleLogout} />}>
          <Route index element={<Navigate to="/dashboard/create" replace />} />
          <Route path="create" element={<ScannerPage />} />
          <Route path="magazine" element={<MagazineCrud />} />
          <Route path="fridge" element={<FridgeCrud />} />
          </Route>
        <Route path="*" element={<Navigate to="/dashboard/create" replace />} />
      </Routes>
    </Router>
  );
}

export default App;