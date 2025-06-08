"use client"
import { useEffect, useState } from "react"
import { Search, Sun, Moon, CheckCircle, Clock, AlertTriangle, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

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

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Chargement des données principales...")
      const response = await fetch("/backend/data/data.json")

      if (!response.ok) {
        console.warn(`Réponse HTTP non OK: ${response.status} ${response.statusText}`)
        throw new Error(`Erreur HTTP! Statut: ${response.status}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.warn(`Type de contenu inattendu: ${contentType}`)
        throw new Error("La réponse n'est pas du JSON valide")
      }

      const data = await response.json()

      if (!Array.isArray(data)) {
        throw new Error("Format de données invalide: un tableau est attendu")
      }

      console.log(`Données principales chargées: ${data.length} éléments`)
      const normalizedData = normalizeData(data)
      setReworkData(normalizedData)
      setStatsData(calculateStats(data))
      setChartData(prepareChartData(normalizedData))
      setLastUpdate(new Date())

      // Calculer les données FTQ initiales
      const defectsCount = data.length
      const plannedProduction = 1000
      const ftq = 1 - defectsCount / plannedProduction
      const ftqPercentage = Math.round(ftq * 100)

      setFtqData({
        current: ftqPercentage,
        target: 95,
        defects: defectsCount,
        production: plannedProduction,
      })
    } catch (err) {
      console.error("Erreur de chargement des données:", err)
      setError(err instanceof Error ? err.message : "Une erreur inconnue est survenue")

      // Générer des données de fallback plus réalistes
      const fallbackData = Array.from({ length: 50 }, (_, i) => ({
        ORDNR: `ORD${String(i + 1).padStart(3, "0")}`,
        Area: i % 2 === 0 ? "Motor" : "Interior",
        Line: `L${(i % 3) + 1}`,
        REWORK_DATE: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        Rework_time: Math.floor(Math.random() * 90) + 20,
        defect_type: ["Terminal", "Connecteur", "Sécurité", "Autre"][Math.floor(Math.random() * 4)],
      }))

      console.log("Utilisation des données de fallback principales:", fallbackData.length, "éléments")
      const normalizedFallback = normalizeData(fallbackData)
      setReworkData(normalizedFallback)
      setStatsData(calculateStats(fallbackData))
      setChartData(prepareChartData(normalizedFallback))
      setLastUpdate(new Date())

      // Calculer les données FTQ de fallback
      const defectsCount = fallbackData.length
      const plannedProduction = 1000
      const ftq = 1 - defectsCount / plannedProduction
      const ftqPercentage = Math.round(ftq * 100)

      setFtqData({
        current: ftqPercentage,
        target: 95,
        defects: defectsCount,
        production: plannedProduction,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
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
                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-lg backdrop-blur-sm"
                    >
                      <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
                      Live
                    </Badge>
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
