"use client"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Layout, Gauge, Activity, Map, Cable } from "lucide-react"

interface SidebarProps {
  theme: "dark" | "light"
  activeView: "dashboard" | "motor" | "interior" | "map"
  setActiveView: (view: "dashboard" | "motor" | "interior" | "map") => void
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

export const SidebarComponent = ({ theme, activeView, setActiveView, isCollapsed, setIsCollapsed }: SidebarProps) => {
  const sidebarWidth = isCollapsed ? "w-16" : "w-64"

  const navigationItems = [
    {
      id: "dashboard",
      label: "Dashboard Overview",
      icon: Layout,
      gradient: "from-cyan-500 to-blue-600",
      color: "text-cyan-400",
    },
    {
      id: "motor",
      label: "Motor Cable Analysis",
      icon: Gauge,
      gradient: "from-blue-500 to-indigo-600",
      color: "text-blue-400",
    },
    {
      id: "interior",
      label: "Interior Cable Analysis",
      icon: Activity,
      gradient: "from-orange-500 to-red-600",
      color: "text-orange-400",
    },
    {
      id: "map",
      label: "Factory Map Zone",
      icon: Map,
      gradient: "from-green-500 to-emerald-600",
      color: "text-green-400",
    },
  ]

  return (
    <aside
      className={`${sidebarWidth} transition-all duration-300 ease-in-out flex-shrink-0 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-800/50 shadow-2xl relative`}
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 z-50 h-6 w-6 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-100 hover:bg-slate-700 shadow-lg"
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      {/* Header */}
      <div className="p-6 border-b border-slate-800/50">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg">
            <Cable size={24} className="text-white" />
          </div>
          {!isCollapsed && (
            <div className="transition-opacity duration-300">
              <h2 className="font-bold text-lg text-slate-100">Rework Areas</h2>
              <p className="text-xs text-slate-400">Production Dashboard</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {!isCollapsed && (
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Navigation</div>
        )}

        {navigationItems.map((item) => {
          const isActive = activeView === item.id
          const Icon = item.icon

          return (
            <Button
              key={item.id}
              variant="ghost"
              className={`w-full ${isCollapsed ? "justify-center px-0" : "justify-start px-4"} h-12 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                isActive
                  ? `bg-gradient-to-r ${item.gradient} bg-opacity-20 ${item.color} border border-opacity-30 shadow-lg`
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
              }`}
              onClick={() => setActiveView(item.id as any)}
            >
              {isActive && (
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}
                />
              )}

              <Icon
                size={20}
                className={`${isCollapsed ? "" : "mr-3"} relative z-10 ${isActive ? "drop-shadow-lg" : ""}`}
              />

              {!isCollapsed && (
                <span className="font-medium relative z-10 transition-all duration-300">{item.label}</span>
              )}

              {isActive && <div className="absolute right-2 w-2 h-2 rounded-full bg-current opacity-60" />}
            </Button>
          )
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-800/50">
          <div className="text-xs text-slate-500 text-center">© 2024 APTIV Rework System</div>
        </div>
      )}
    </aside>
  )
}
