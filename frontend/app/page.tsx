"use client"
import { useEffect, useState } from "react"
import { CheckCircle, Clock, AlertTriangle, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Import components
import { LiveClock } from "@/components/live-clock"
import { StatsCard } from "@/components/stats-card"
import { SidebarComponent } from "@/components/sidebar-component"
import { MotorView } from "@/components/motor-view"
import { InteriorView } from "@/components/interior-view"
import { MapView } from "@/components/map-view"
import { DashboardCharts } from "@/components/dashboard-charts"

// Import utilities and types
import { calculateStats, prepareChartData, normalizeData } from "@/lib/data-utils"
import type { ReworkData, DashboardData, ChartData } from "@/lib/types"

export default function Dashboard() {
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statsData, setStatsData] = useState<DashboardData | null>(null)
  const [reworkData, setReworkData] = useState<ReworkData[]>([])
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<"dashboard" | "motor" | "interior" | "map" | "ftq-analysis">("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [ftqData, setFtqData] = useState<{
    current: number
    target: number
    defects: number
    production: number
  } | null>(null)
  const [showFTQGraphs, setShowFTQGraphs] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async () => {
    try {
      setRefreshing(true)
      setError(null)

      console.log("Génération des données en temps réel...")

      // Générer des données simulées directement (pas de fetch)
      // Générer des données simulées avec la vraie structure
      const fallbackData = Array.from({ length: 50 + Math.floor(Math.sin(Date.now() / 8000) * 20) }, (_, i) => {
        const shifts = ["matin", "soir", "nuit"]
        const defectTypes = ["Terminal", "Connecteur", "Sécurité", "Isolation", "Autre"]
        const defectDescriptions = ["inversion", "missing", "damaged", "loose", "wrong_position"]
        const statuses = ["Completed", "In Progress", "Pending"]
        const lines = ["Line 1", "Line 2", "Line 3", "Line 4"]
        const areas = ["Motor", "Interior"]

        const reworkTime = Math.floor(Math.random() * 90) + 20
        let priority = "normal"
        if (reworkTime > 60) priority = "urgent"
        else if (reworkTime >= 40) priority = "medium"

        return {
          REWORK_DATE: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .replace("T", " ")
            .split(".")[0],
          ORDNR: `240930${String(i + 1).padStart(4, "0")}`,
          SUBPROD: Math.random() > 0.5 ? "A" : "B",
          RWRK_CODE: String(Math.floor(Math.random() * 5) + 1),
          DESCR: "CrossWire",
          RWRK_DETAIL: `${defectTypes[Math.floor(Math.random() * defectTypes.length)]} ${defectDescriptions[Math.floor(Math.random() * defectDescriptions.length)]} ${lines[Math.floor(Math.random() * lines.length)]}`,
          Line: lines[Math.floor(Math.random() * lines.length)],
          Area: areas[i % 2],
          Rework_time: reworkTime,
          Success: Math.random() > 0.2 ? 1 : 0,
          Priority: priority,
          Defect_type: defectTypes[Math.floor(Math.random() * defectTypes.length)],
          Defect_description: defectDescriptions[Math.floor(Math.random() * defectDescriptions.length)],
          Status: statuses[Math.floor(Math.random() * statuses.length)],
          shift: shifts[Math.floor(Math.random() * shifts.length)],
        }
      })

      console.log("Données générées:", fallbackData.length, "éléments")
      const normalizedFallback = normalizeData(fallbackData)
      setReworkData(normalizedFallback)
      setStatsData(calculateStats(fallbackData))
      setChartData(prepareChartData(normalizedFallback))
      setLastUpdate(new Date())

      // Calculer les données FTQ dynamiques
      const defectsCount = fallbackData.length
      const plannedProduction = 1000 + Math.floor(Math.sin(Date.now() / 10000) * 100)
      const ftq = 1 - defectsCount / plannedProduction
      const ftqPercentage = Math.round(ftq * 100)

      setFtqData({
        current: Math.max(85, Math.min(98, ftqPercentage)),
        target: 95,
        defects: defectsCount,
        production: plannedProduction,
      })
    } catch (err) {
      console.error("Erreur lors de la génération des données:", err)
      setError("Erreur lors de la génération des données")
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial data load
    loadData()

    // Update clock every second
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Refresh data every 5 seconds
    const dataRefreshInterval = setInterval(() => {
      console.log("Actualisation automatique des données...")
      loadData()
    }, 5000)

    // Clean up both intervals on component unmount
    return () => {
      clearInterval(clockInterval)
      clearInterval(dataRefreshInterval)
    }
  }, [])

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark")

  const handleFTQPredict = (data: { ftq: number; defects: number; production: number }) => {
    setFtqData({
      current: data.ftq,
      target: 95,
      defects: data.defects,
      production: data.production,
    })
    setShowFTQGraphs(true)
    // Basculer vers le dashboard pour voir les graphiques
    setActiveView("dashboard")
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center p-6 max-w-md bg-slate-800 rounded-lg border border-red-500/50">
          <h2 className="text-xl font-bold text-red-400 mb-2">Erreur de chargement</h2>
          <p className="text-slate-300 mb-4">{error}</p>
          <p className="text-slate-400 text-sm mb-4">Le dashboard affiche des données de démonstration.</p>
          <Button
            onClick={loadData}
            variant="outline"
            className="text-cyan-400 border-cyan-400/50 hover:bg-cyan-500/10"
          >
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  if (loading || !statsData || !chartData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-lg bg-cyan-500 mb-4 animate-spin" />
          <span className="text-slate-400"></span>
        </div>
      </div>
    )
  }

  return (
    <div className={`${theme} min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-100`}>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md shadow-xl">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              {/* Large Clear APTIV Logo */}
              <div className="relative">
                <img
                  src="/images/aptiv-logo.png"
                  alt="APTIV Logo"
                  className="h-16 w-16 object-contain filter drop-shadow-lg"
                />
              </div>

              {/* Professional Separator */}
              <div className="h-12 w-px bg-gradient-to-b from-transparent via-slate-600/50 to-transparent"></div>

              {/* Dashboard Title Section */}
              <div className="flex flex-col">
                <div className="flex items-center space-x-3">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-100 via-cyan-400 to-blue-400 bg-clip-text text-transparent tracking-tight">
                    Rework Area DASHBOARD
                  </h1>
                  {lastUpdate && (
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-lg backdrop-blur-sm"
                      >
                        <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
                        Live
                      </Badge>
                      {refreshing && <span className="text-xs text-cyan-400 animate-pulse">Actualisation...</span>}
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-400 font-medium tracking-wide">Production Quality Management System</p>
              </div>
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-4">
            <LiveClock />
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <SidebarComponent
            theme={theme}
            activeView={activeView}
            setActiveView={setActiveView}
            isCollapsed={sidebarCollapsed}
            setIsCollapsed={setSidebarCollapsed}
            onFTQPredict={handleFTQPredict}
          />

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {activeView === "dashboard" && (
              <div className="p-6 space-y-6">
                {/* Graphiques FTQ si prédiction activée */}

                {/* Stats Cards - Compact Version */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard
                    title="Success Rate"
                    value={statsData.successRate.overall}
                    subtitle={`${statsData.successRate.completedToday} completed today`}
                    icon={CheckCircle}
                    trend="+2.5% from yesterday"
                    motorValue={statsData.successRate.motor}
                    interiorValue={statsData.successRate.interior}
                    gradientFrom="from-emerald-500"
                    gradientTo="to-green-600"
                    iconColor="text-white"
                    borderColor="border-emerald-500/20"
                  />

                  <StatsCard
                    title="Avg Rework Time"
                    value={statsData.avgReworkTime.overall}
                    subtitle={`${statsData.avgReworkTime.pendingItems} pending items`}
                    icon={Clock}
                    trend="-5min from yesterday"
                    motorValue={statsData.avgReworkTime.motor}
                    interiorValue={statsData.avgReworkTime.interior}
                    gradientFrom="from-blue-500"
                    gradientTo="to-indigo-600"
                    iconColor="text-white"
                    borderColor="border-blue-500/20"
                  />

                  <StatsCard
                    title="Total Reworks"
                    value={statsData.totalReworks.overall}
                    subtitle={`${statsData.totalReworks.percentageOfTotal} of total production`}
                    icon={BarChart3}
                    trend="+12 from yesterday"
                    motorValue={statsData.totalReworks.motor.toString()}
                    interiorValue={statsData.totalReworks.interior.toString()}
                    gradientFrom="from-orange-500"
                    gradientTo="to-red-600"
                    iconColor="text-white"
                    borderColor="border-orange-500/20"
                  />

                  <StatsCard
                    title="Failed Reworks"
                    value={statsData.reworkHar.overall}
                    subtitle={`${statsData.reworkHar.failureRate} failure rate`}
                    icon={AlertTriangle}
                    trend="-3 from yesterday"
                    motorValue={statsData.reworkHar.motor.toString()}
                    interiorValue={statsData.reworkHar.interior.toString()}
                    gradientFrom="from-purple-500"
                    gradientTo="to-pink-600"
                    iconColor="text-white"
                    borderColor="border-purple-500/20"
                  />
                </div>

                {/* Dashboard Charts */}
                <DashboardCharts
                  chartData={chartData}
                  reworkData={reworkData}
                  activeIndex={0}
                  onPieEnter={() => {}}
                  renderActiveShape={() => <></>}
                  theme={theme}
                  searchQuery={searchQuery}
                />
              </div>
            )}

            {activeView === "motor" && <MotorView chartData={chartData} theme={theme} />}
            {activeView === "interior" && <InteriorView chartData={chartData} theme={theme} />}
            {activeView === "map" && <MapView theme={theme} />}
            {activeView === "ftq-analysis" && ftqData && <></>}
          </main>
        </div>
      </div>
    </div>
  )
}
