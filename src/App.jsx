import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./Auth/AuthContext"
import ProtectedRoute from "./Auth/ProtectedRoute"
import DashboardLayout from "./components/AdminDashboard"
import ScannerPage from "./components/ScannerPage"
import LoginPage from "./components/Login"
import MagazineCrud from "./components/MagazineCrud"
import FridgeCrud from "./components/FridgeCrud"

function AppRoutes() {
  const { logout } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route
        path="/dashboard" element={
          <ProtectedRoute allowedRoles={[1]}>
            <DashboardLayout onLogout={logout} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard/create" replace />} />
        <Route path="create" element={<ScannerPage />} />
        <Route path="magazine" element={<MagazineCrud />} />
        <Route path="fridge" element={<FridgeCrud />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}

export default App