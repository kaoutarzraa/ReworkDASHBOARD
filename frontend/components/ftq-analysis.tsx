"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SnowflakeIcon as Crystal, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface FTQAnalysisProps {
  ftqData?: {
    current: number
    target: number
    defects: number
    production: number
  }
}

export const FTQAnalysis = ({ ftqData }: FTQAnalysisProps) => {
  // Données simulées pour les graphiques d'aide à la décision
  const ftqTrendData = [
    { day: "Lun", ftq: 94, target: 95, defects: 60 },
    { day: "Mar", ftq: 96, target: 95, defects: 40 },
    { day: "Mer", ftq: 93, target: 95, defects: 70 },
    { day: "Jeu", ftq: 97, target: 95, defects: 30 },
    { day: "Ven", ftq: 92, target: 95, defects: 80 },
    { day: "Sam", ftq: 95, target: 95, defects: 50 },
    { day: "Dim", ftq: ftqData?.current || 92, target: 95, defects: ftqData?.defects || 80 },
  ]

  const defectCategoryData = [
    { name: "Terminal", value: 35, color: "#3b82f6" },
    { name: "Connecteur", value: 25, color: "#22c55e" },
    { name: "Sécurité", value: 20, color: "#f97316" },
    { name: "Autre", value: 20, color: "#8b5cf6" },
  ]

  const actionPriorityData = [
    { action: "Contrôle Terminal", impact: 85, effort: 30, priority: "Haute" },
    { action: "Formation Équipe", impact: 70, effort: 60, priority: "Moyenne" },
    { action: "Maintenance Préventive", impact: 60, effort: 40, priority: "Moyenne" },
    { action: "Audit Processus", impact: 90, effort: 80, priority: "Haute" },
  ]

  const currentFTQ = ftqData?.current || 92
  const isGoodFTQ = currentFTQ >= 95

  return (
    <div className="space-y-6">
      {/* En-tête avec statut FTQ */}
      <div className="flex items-center space-x-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
          <Crystal className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Analyse FTQ & Aide à la Décision</h2>
          <p className="text-slate-400">Prédiction qualité et recommandations d'actions</p>
        </div>
        <div className="ml-auto">
          <Badge
            variant="outline"
            className={`text-lg px-4 py-2 ${
              isGoodFTQ
                ? "bg-green-500/10 text-green-400 border-green-500/20"
                : "bg-red-500/10 text-red-400 border-red-500/20"
            }`}
          >
            {isGoodFTQ ? <CheckCircle className="w-4 h-4 mr-2" /> : <AlertTriangle className="w-4 h-4 mr-2" />}
            FTQ: {currentFTQ}%
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendance FTQ sur 7 jours */}
        <Card className="bg-slate-800/50 border-slate-700/50 hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
              Tendance FTQ (7 jours)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ftqTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" domain={[85, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151" }}
                  formatter={(value, name) => [
                    `${value}%`,
                    name === "ftq" ? "FTQ Réelle" : name === "target" ? "Objectif" : "Défauts",
                  ]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="ftq"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  name="FTQ Réelle"
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#22c55e"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  name="Objectif 95%"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition des défauts par catégorie */}
        <Card className="bg-slate-800/50 border-slate-700/50 hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
              Répartition des Défauts
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={defectCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {defectCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151" }}
                  formatter={(value) => [`${value}%`, "Pourcentage"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Actions prioritaires recommandées */}
        <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700/50 hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-purple-500" />
              Actions Recommandées (Impact vs Effort)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={actionPriorityData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="action" type="category" stroke="#9ca3af" width={120} />
                <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151" }} />
                <Legend />
                <Bar dataKey="impact" fill="#22c55e" name="Impact %" />
                <Bar dataKey="effort" fill="#f97316" name="Effort %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recommandations d'actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actionPriorityData.map((action, index) => (
          <Card
            key={index}
            className="bg-slate-800/50 border-slate-700/50 hover:shadow-xl transition-shadow duration-300"
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-200 text-sm">{action.action}</h4>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      action.priority === "Haute"
                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                    }`}
                  >
                    {action.priority}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Impact:</span>
                    <span className="text-green-400 font-medium">{action.impact}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Effort:</span>
                    <span className="text-orange-400 font-medium">{action.effort}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(action.impact / action.effort) * 50}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerte qualité si nécessaire */}
      {!isGoodFTQ && (
        <Card className="bg-red-500/10 border-red-500/30 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <AlertTriangle className="h-8 w-8 text-red-400" />
              <div>
                <h3 className="text-lg font-bold text-red-400">Alerte Qualité - Action Immédiate Requise</h3>
                <p className="text-red-300 mt-1">
                  FTQ de {currentFTQ}% est en dessous du seuil critique de 95%. Implémentez immédiatement les actions
                  prioritaires ci-dessus.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
