"use client"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Layout, Gauge, Activity, Map, Cable, SnowflakeIcon as Crystal } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { FTQAnalytics } from "./ftq-analytics"

interface SidebarProps {
  theme: "dark" | "light"
  activeView: "dashboard" | "motor" | "interior" | "map"
  setActiveView: (view: "dashboard" | "motor" | "interior" | "map") => void
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  onFTQPredict?: (data: { ftq: number; defects: number; production: number }) => void
}

function SidebarComponent({
  theme,
  activeView,
  setActiveView,
  isCollapsed,
  setIsCollapsed,
  onFTQPredict,
}: SidebarProps) {
  const [ftqPrediction, setFtqPrediction] = useState<{
    ftq: number
    defects: number
    production: number
    show: boolean
  } | null>(null)
  const [showFTQAnalytics, setShowFTQAnalytics] = useState(false)

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

  const predictFTQ = async () => {
    try {
      // Simuler des données de défauts basées sur les données réelles du dashboard
      const simulatedDefects = [
        { type: "Terminal", count: 15 },
        { type: "Connecteur", count: 8 },
        { type: "Sécurité", count: 12 },
        { type: "Autre", count: 7 },
      ]

      const defectsCount = simulatedDefects.reduce((sum, defect) => sum + defect.count, 0)
      const plannedProduction = 1000 // Production planifiée

      // Ajouter une variation aléatoire pour simuler des conditions réelles
      const variation = Math.floor(Math.random() * 20) - 10 // -10 à +10
      const adjustedDefects = Math.max(0, defectsCount + variation)

      const ftq = 1 - adjustedDefects / plannedProduction
      const ftqPercentage = Math.round(ftq * 100)

      const predictionData = {
        ftq: ftqPercentage,
        defects: adjustedDefects,
        production: plannedProduction,
      }

      setFtqPrediction({
        ...predictionData,
        show: true,
      })

      // Appeler la fonction callback pour afficher les graphiques
      if (onFTQPredict) {
        onFTQPredict(predictionData)
      }

      // Ouvrir l'analyse FTQ complète immédiatement
      setShowFTQAnalytics(true)
    } catch (error) {
      console.error("Erreur lors de la prédiction FTQ:", error)

      // Données de fallback en cas d'erreur
      const fallbackData = {
        ftq: 92,
        defects: 80,
        production: 1000,
      }

      setFtqPrediction({
        ...fallbackData,
        show: true,
      })

      if (onFTQPredict) {
        onFTQPredict(fallbackData)
      }

      // Ouvrir l'analyse même en cas d'erreur
      setShowFTQAnalytics(true)
    }
  }

  return (
    <>
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

          {/* Séparateur */}
          {!isCollapsed && <div className="border-t border-slate-700/50 my-4"></div>}

          {/* Bouton Prédire FTQ */}
          <Button
            variant="ghost"
            className={`w-full ${isCollapsed ? "justify-center px-0" : "justify-start px-4"} h-12 rounded-xl transition-all duration-300 group relative overflow-hidden bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30 hover:border-purple-400/50 hover:bg-gradient-to-r hover:from-purple-500/30 hover:to-pink-500/30 shadow-lg`}
            onClick={predictFTQ}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-10 group-hover:opacity-20 transition-opacity duration-300" />

            <Crystal size={20} className={`${isCollapsed ? "" : "mr-3"} relative z-10 drop-shadow-lg animate-pulse`} />

            {!isCollapsed && (
              <span className="font-medium relative z-10 transition-all duration-300">🔮 Prédire FTQ</span>
            )}
          </Button>

          {/* Affichage des résultats FTQ */}
          {!isCollapsed && ftqPrediction?.show && (
            <div className="mt-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="text-xs font-semibold text-purple-400 mb-2">Dernière Prédiction FTQ</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">FTQ:</span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      ftqPrediction.ftq >= 95
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}
                  >
                    {ftqPrediction.ftq}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Défauts:</span>
                  <span className="text-xs text-slate-200">{ftqPrediction.defects}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Production:</span>
                  <span className="text-xs text-slate-200">{ftqPrediction.production}</span>
                </div>
                {ftqPrediction.ftq < 95 && (
                  <div className="mt-2 p-2 rounded bg-red-500/10 border border-red-500/20">
                    <div className="text-xs text-red-400 font-medium">⚠️ Alerte Qualité</div>
                    <div className="text-xs text-red-300">FTQ &lt; 95%</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>

      </aside>

      {/* Modal d'analyse FTQ - Affiché quand showFTQAnalytics est true */}
      {showFTQAnalytics && (
        <FTQAnalytics
          ftqData={ftqPrediction}
          onClose={() => {
            setShowFTQAnalytics(false)
            console.log("Fermeture de l'analyse FTQ")
          }}
        />
      )}
    </>
  )
}

// Export par défaut ET export nommé pour assurer la compatibilité
export default SidebarComponent
export { SidebarComponent }
