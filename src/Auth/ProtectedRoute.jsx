// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom"
import { useAuth } from "./AuthContext"

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, getUser } = useAuth()

  if (!token) return <Navigate to="/" replace />
  if (allowedRoles) {
    const user = getUser()
    if (!user || user.role !== 1) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return children
}

export default ProtectedRoute