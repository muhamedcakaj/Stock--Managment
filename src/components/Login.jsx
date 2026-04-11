import { useState } from "react"
import logo from "../assets/stock-managment.png"
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../Auth/AuthContext"

function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const navigate = useNavigate();

  const handleSubmit = async (e) => {

    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("https://stockmanagment-octm.onrender.com/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      })

      if (!response.ok) {
        throw new Error("Invalid username or password")
      }

      const data = await response.json()
      login(data.token)
      
      navigate("/dashboard/create")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf9f6] p-4 font-serif">
      {/* Background Decorative Elements (Optional/Subtle) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-rose-100 blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-amber-50 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-[420px]">
        {/* Logo Placeholder */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 mb-6 bg-white rounded-full shadow-sm border border-rose-100 flex items-center justify-center overflow-hidden">
            {/* Replace the SVG below with your actual <img> tag */}
            <svg className="w-12 h-12 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <img src={logo} alt="Sound Production Logo" className="w-full h-full object-contain"/>
          </div>
          <h1 className="text-2xl font-light text-gray-800 tracking-widest uppercase">
            Stock Managment
          </h1>
          <div className="h-px w-12 bg-rose-200 mt-3 mb-2"></div>
          <p className="text-shadow-rose-400 text-sm italic tracking-wide">
            Stock-Managment
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl shadow-rose-900/5 border border-white p-8 sm:p-10">

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border-l-2 border-rose-300 text-rose-700 text-sm animate-in slide-in-from-top-2 duration-300">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest ml-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-rose-100 focus:border-rose-200 outline-none transition-all text-gray-700"
                placeholder="Enter username"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest ml-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-rose-100 focus:border-rose-200 outline-none transition-all text-gray-700"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 mt-4 bg-[#2d2d2d] hover:bg-black text-white font-medium rounded-xl shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <span className="tracking-widest uppercase text-sm">Sign In</span>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()}THE WAR GAMERS &bull; Stock-Managment
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login