import { Outlet, useNavigate, useLocation } from "react-router-dom"
import logo from "../assets/stock-managment.png"
import { useState } from "react"

const DashboardLayout = ({ onLogout }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(location.pathname)

  const handleNavigation = (path) => {
    setActiveTab(path)
    navigate(path)
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-sans text-[#2D2D2D] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#F1E9E4] px-6 py-5 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#2D2D2D] rounded-lg flex items-center justify-center">
          <img src={logo} alt="Sound Production Logo" className="w-full h-full object-contain"/>
          </div>
          <span className="font-serif text-sm tracking-[0.15em] uppercase font-bold">Menagjimi i Stokut</span>
        </div>
        <button
          onClick={onLogout}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-gray-300 text-gray-700  shadow-sm transition duration-200  hover:bg-red-500 hover:text-white hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 "
        >
          Dil
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <footer className="bg-white border-t border-[#F1E9E4] px-4 py-3 flex justify-around items-center sticky bottom-0">
        <button
          onClick={() => handleNavigation("/dashboard/create")}
          className={`flex flex-col items-center gap-1 ${activeTab === "/dashboard/create" ? "text-[#D4AF37]" : "text-[#B0B0B0] hover:text-[#2D2D2D]"} transition-colors`}
        >
          <span>➕</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Add Stock</span>
        </button>

        <button
          onClick={() => handleNavigation("/dashboard/magazine")}
          className={`flex flex-col items-center gap-1 ${activeTab === "/dashboard/magazine"
            ? "text-[#D4AF37]"
            : "text-[#B0B0B0] hover:text-[#2D2D2D]"
            } transition-colors`}
        >
          <span>📦</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">
            Magazine
          </span>
        </button>

        <button
          onClick={() => handleNavigation("/dashboard/fridge")}
          className={`flex flex-col items-center gap-1 ${activeTab === "/dashboard/fridge" ? "text-[#D4AF37]" : "text-[#B0B0B0] hover:text-[#2D2D2D]"} transition-colors`}
        >
          <span>🧊</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Fridge</span>
        </button>
      </footer>
    </div>
  )
}

export default DashboardLayout