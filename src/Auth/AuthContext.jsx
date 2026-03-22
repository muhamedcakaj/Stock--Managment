// src/context/AuthContext.jsx
import { createContext, useContext, useState } from "react"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"))

  const login = (newToken) => {
    localStorage.setItem("token", newToken)
    setToken(newToken)
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
  }

  const getUser = () => {
    if (!token) return null
    try {
      return JSON.parse(atob(token.split(".")[1]))
    } catch {
      return null
    }
  }

  return (
    <AuthContext.Provider value={{ token, login, logout, getUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)