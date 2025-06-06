
"use client"
import { useState } from "react"
import { SidebarComponent } from "./sidebar-component"

export default function Dashboard() {
  const [activeView, setActiveView] = useState<"dashboard" | "motor" | "interior" | "map">("dashboard")
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [theme] = useState<"dark" | "light">("dark")

  const renderActiveView = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-slate-100 mb-4">Dashboard Overview</h1>
            <p className="text-slate-400">Vue d'ensemble du tableau de bord avec prédiction FTQ intégrée</p>
            <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <h2 className="text-xl font-semibold text-slate-200 mb-2">🔮 Prédiction FTQ Disponible</h2>
              <p className="text-slate-400">
                Cliquez sur le bouton "🔮 Prédire FTQ" dans la sidebar pour analyser les données de qualité et obtenir
                des prédictions basées sur les défauts actuels.
              </p>
            </div>
          </div>
        )
      case "motor":
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-slate-100 mb-4">Motor Cable Analysis</h1>
            <p className="text-slate-400">Analyse des câbles moteur</p>
          </div>
        )
      case "interior":
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-slate-100 mb-4">Interior Cable Analysis</h1>
            <p className="text-slate-400">Analyse des câbles intérieurs</p>
          </div>
        )
      case "map":
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-slate-100 mb-4">Factory Map Zone</h1>
            <p className="text-slate-400">Carte des zones d'usine</p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      <SidebarComponent
        theme={theme}
        activeView={activeView}
        setActiveView={setActiveView}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <main className="flex-1 overflow-auto">{renderActiveView()}</main>
    </div>
  )
}
