import image_adf3a2c3cf8ac57f3434f58f1db39bba506cdf49 from 'figma:asset/adf3a2c3cf8ac57f3434f58f1db39bba506cdf49.png'
import logoContinental from "../../assets/Logo continental.png";
import { Outlet, NavLink } from "react-router";
import { AgentInfoCard } from "./AgentInfoCard";
import { useAppStore } from "../store/appStore";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useEffect } from "react";

export function DashboardLayout() {
  const availableCount = useAppStore((state) => 
    state.operations.filter(op => op.status === "disponible").length
  );

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      {/* Header */}
      <header className="bg-[#00184C] text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-30 h-13  rounded-lg flex items-center justify-center overflow-hidden">
                <ImageWithFallback 
                  src={logoContinental}
                  alt="Logo Continental"
                  className="w-full h-full object-contain"
                />
              </div>
              
            </div>
            
            {/* Navigation */}
            <nav className="flex gap-1">
              <NavLink
                to="/resumen"
                className={({ isActive }) =>
                  `px-6 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-[#43D3FF] text-[#00184C] font-semibold'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                Resumen
              </NavLink>
              <NavLink
                to="/cartera"
                className={({ isActive }) =>
                  `px-6 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-[#43D3FF] text-[#00184C] font-semibold'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                Cartera
              </NavLink>
              <NavLink
                to="/facturar"
                className={({ isActive }) =>
                  `px-6 py-3 rounded-lg transition-all duration-200 relative ${
                    isActive
                      ? 'bg-[#43D3FF] text-[#00184C] font-semibold'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                Facturar
                {availableCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#F9D35A] text-[#00184C] text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {availableCount}
                  </span>
                )}
              </NavLink>
              <NavLink
                to="/historial"
                className={({ isActive }) =>
                  `px-6 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-[#43D3FF] text-[#00184C] font-semibold'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                Historial
              </NavLink>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        <AgentInfoCard />
        <div className="mt-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}