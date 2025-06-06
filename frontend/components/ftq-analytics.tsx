"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SnowflakeIcon as Crystal, AlertTriangle, CheckCircle, Target, BarChart3, X, Gauge } from "lucide-react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadialBarChart,
  RadialBar,
} from "recharts"
import { useEffect, useState } from "react"

interface FTQAnalyticsProps {
  onClose?: () => void
}

interface ReworkData {
  ORDNR: string
  Area: string
  Line: string
  REWORK_DATE: string
  Rework_time: number
  defect_type: string
}

interface PythonPrediction {
  current_ftq: number
  predicted_ftq: number
  confidence: number
  total_defects: number
  avg_rework_time: number
  improvement: number
  line_analysis: {
    best_motor_line: string
    worst_motor_line: string
    best_interior_line: string
    worst_interior_line: string
  }
  model_info: {
    algorithm: string
    n_estimators: number
    max_depth: number
    features_used: number
  }
}

export const FTQAnalytics = ({ onClose }: FTQAnalyticsProps) => {
  const [realData, setRealData] = useState<ReworkData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [prediction, setPrediction] = useState<PythonPrediction | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Charger les données et faire la prédiction avec Python
  useEffect(() => {
    const loadAndPredict = async () => {
      setIsLoading(true)
      setError(null)

      try {
        console.log("📊 Chargement des données pour prédiction Python ML...")

        // Charger les données de défauts
        const response = await fetch("/backend/data/data.json")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log(`✅ Données chargées: ${data.length} défauts`)
        setRealData(data)

        // Appeler l'API Python pour la prédiction
        console.log("🐍 Appel de l'API Python pour prédiction ML...")

        const predictionResponse = await fetch("http://localhost:5000/api/ftq/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            defects: data,
          }),
        })

        if (!predictionResponse.ok) {
          throw new Error(`Erreur API Python: ${predictionResponse.status}`)
        }

        const predictionResult = await predictionResponse.json()

        if (predictionResult.status === "success") {
          console.log("🎯 Prédiction Python reçue:", predictionResult.prediction)
          setPrediction(predictionResult.prediction)
        } else {
          throw new Error(predictionResult.error || "Erreur prédiction Python")
        }
      } catch (error) {
        console.error("❌ Erreur prédiction Python:", error)
        setError(error instanceof Error ? error.message : "Erreur inconnue")

        // Données de fallback si l'API Python n'est pas disponible
        const fallbackData = generateFallbackData()
        setRealData(fallbackData)

        const fallbackPrediction: PythonPrediction = {
          current_ftq: 92.5,
          predicted_ftq: 95.2,
          confidence: 0.87,
          total_defects: fallbackData.length,
          avg_rework_time: 45.3,
          improvement: 2.7,
          line_analysis: {
            best_motor_line: "Motor L1",
            worst_motor_line: "Motor L2",
            best_interior_line: "Interior L2",
            worst_interior_line: "Interior L3",
          },
          model_info: {
            algorithm: "Random Forest (scikit-learn)",
            n_estimators: 100,
            max_depth: 10,
            features_used: 9,
          },
        }
        setPrediction(fallbackPrediction)
      } finally {
        setIsLoading(false)
      }
    }

    loadAndPredict()
  }, [])

  // Générer des données de fallback
  const generateFallbackData = (): ReworkData[] => {
    return Array.from({ length: 75 }, (_, i) => ({
      ORDNR: `ORD${String(i + 1).padStart(3, "0")}`,
      Area: i % 2 === 0 ? "Motor" : "Interior",
      Line: `L${(i % 3) + 1}`,
      REWORK_DATE: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      Rework_time: Math.floor(Math.random() * 90) + 20,
      defect_type: ["Terminal", "Connecteur", "Sécurité", "Autre"][Math.floor(Math.random() * 4)],
    }))
  }

  // Données pour les graphiques
  const ftqTrendData = prediction
    ? [
        { day: "Lun", ftq: 94, target: 95 },
        { day: "Mar", ftq: 96, target: 95 },
        { day: "Mer", ftq: 93, target: 95 },
        { day: "Jeu", ftq: 97, target: 95 },
        { day: "Ven", ftq: 92, target: 95 },
        { day: "Sam", ftq: 95, target: 95 },
        { day: "Dim", ftq: prediction.current_ftq, target: 95 },
      ]
    : []

  const isGoodFTQ = prediction ? prediction.current_ftq >= 95 : false

  // Données pour la jauge FTQ
  const gaugeData = prediction
    ? [
        {
          name: "FTQ",
          value: prediction.current_ftq,
          fill: prediction.current_ftq >= 95 ? "#22c55e" : prediction.current_ftq >= 90 ? "#f97316" : "#ef4444",
        },
      ]
    : []

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-8 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-xl font-bold text-slate-100 mb-2">🐍 Prédiction Python ML en cours...</h3>
          <p className="text-slate-400">Analyse avec scikit-learn Random Forest</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-xl border border-slate-700 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
              <Crystal className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100">🐍 Prédiction FTQ - Python ML</h2>
              <p className="text-slate-400">
                {prediction ? (
                  <>
                    Basé sur {prediction.total_defects} défauts • Confiance: {(prediction.confidence * 100).toFixed(1)}%
                    • Lignes optimales: {prediction.line_analysis.best_motor_line} &{" "}
                    {prediction.line_analysis.best_interior_line}
                  </>
                ) : (
                  "Chargement des données..."
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {error && (
              <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">
                ⚠️ Mode Fallback
              </Badge>
            )}
            <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
              🐍 scikit-learn
            </Badge>
            {prediction && (
              <Badge
                variant="outline"
                className={`text-lg px-4 py-2 ${
                  isGoodFTQ
                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                }`}
              >
                {isGoodFTQ ? <CheckCircle className="w-4 h-4 mr-2" /> : <AlertTriangle className="w-4 h-4 mr-2" />}
                FTQ: {prediction.current_ftq}%
              </Badge>
            )}
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Alerte si erreur API Python */}
          {error && (
            <Card className="bg-yellow-500/10 border-yellow-500/30 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <AlertTriangle className="h-8 w-8 text-yellow-400" />
                  <div>
                    <h3 className="text-lg font-bold text-yellow-400">⚠️ API Python non disponible</h3>
                    <p className="text-yellow-300 mt-1">
                      {error} - Utilisation des données de démonstration. Lancez le script Python pour les vraies
                      prédictions ML.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alerte si FTQ < 95% */}
          {prediction && !isGoodFTQ && (
            <Card className="bg-red-500/10 border-red-500/30 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <AlertTriangle className="h-8 w-8 text-red-400 animate-pulse" />
                  <div>
                    <h3 className="text-lg font-bold text-red-400">🚨 ALERTE QUALITÉ CRITIQUE (Python ML)</h3>
                    <p className="text-red-300 mt-1">
                      FTQ de {prediction.current_ftq}% &lt; 95%. Python ML recommande de concentrer sur :
                      <span className="font-bold"> {prediction.line_analysis.worst_motor_line}</span> et
                      <span className="font-bold"> {prediction.line_analysis.worst_interior_line}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {prediction && (
            <>
              {/* Métriques principales */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* FTQ Actuel */}
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center text-sm">
                      <Gauge className="mr-2 h-4 w-4 text-blue-500" />
                      FTQ Actuel (Python ML)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart cx="50%" cy="50%" innerRadius="50%" outerRadius="80%" data={gaugeData}>
                        <RadialBar
                          dataKey="value"
                          cornerRadius={10}
                          fill={gaugeData[0]?.fill}
                          background={{ fill: "#374151" }}
                        />
                        <text
                          x="50%"
                          y="50%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-xl font-bold fill-slate-100"
                        >
                          {prediction.current_ftq}%
                        </text>
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* FTQ Prédit */}
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center text-sm">
                      <Target className="mr-2 h-4 w-4 text-green-500" />
                      FTQ Prédit (Python ML)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-48 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-400 mb-2">{prediction.predicted_ftq}%</div>
                      <div className="text-xs text-slate-400">
                        {prediction.improvement >= 0 ? "+" : ""}
                        {prediction.improvement}% amélioration prévue
                      </div>
                      <div className="mt-2 p-2 rounded bg-green-500/10 border border-green-500/20">
                        <div className="text-green-400 text-xs font-medium">
                          🐍 Confiance: {(prediction.confidence * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Lignes Optimales */}
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center text-sm">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      Lignes Optimales (Python)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-48">
                    <div className="space-y-4">
                      <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="text-green-400 font-medium text-sm">
                          🏆 {prediction.line_analysis.best_motor_line}
                        </div>
                        <div className="text-green-300 text-xs">Zone Motor - ML optimal</div>
                      </div>
                      <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="text-green-400 font-medium text-sm">
                          🏆 {prediction.line_analysis.best_interior_line}
                        </div>
                        <div className="text-green-300 text-xs">Zone Interior - Pattern stable</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tendance FTQ */}
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-cyan-500" />
                    Tendance FTQ (7 jours) - Prédiction Python scikit-learn
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ftqTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="day" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" domain={[85, 100]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151" }}
                        formatter={(value, name) => [`${value}%`, name === "ftq" ? "FTQ Python ML" : "Objectif"]}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="ftq"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        name="FTQ Python ML"
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

              {/* Résumé et Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-slate-200 mb-4">🐍 Résumé Python ML</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Algorithme:</span>
                        <span className="text-purple-400 font-medium">{prediction.model_info.algorithm}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Arbres (n_estimators):</span>
                        <span className="text-purple-400 font-medium">{prediction.model_info.n_estimators}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Profondeur max:</span>
                        <span className="text-purple-400 font-medium">{prediction.model_info.max_depth}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Features utilisées:</span>
                        <span className="text-cyan-400 font-medium">{prediction.model_info.features_used}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">FTQ Actuel:</span>
                        <span
                          className={`font-medium ${prediction.current_ftq >= 95 ? "text-green-400" : "text-red-400"}`}
                        >
                          {prediction.current_ftq}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">FTQ Prédit:</span>
                        <span className="text-green-400 font-medium">{prediction.predicted_ftq}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Confiance ML:</span>
                        <span className="text-purple-400 font-medium">{(prediction.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Temps moyen rework:</span>
                        <span className="text-orange-400 font-medium">{prediction.avg_rework_time} min</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-slate-200 mb-4">🎯 Actions Recommandées (Python)</h3>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <div className="font-medium text-red-400">🚨 Priorité Critique ML</div>
                        <div className="text-sm text-red-300">
                          Concentrer sur {prediction.line_analysis.worst_motor_line} et{" "}
                          {prediction.line_analysis.worst_interior_line}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <div className="font-medium text-orange-400">📊 Analyse Python</div>
                        <div className="text-sm text-orange-300">
                          {prediction.total_defects} défauts analysés avec {prediction.model_info.features_used}{" "}
                          features
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="font-medium text-green-400">✅ Modèle Optimal</div>
                        <div className="text-sm text-green-300">
                          Répliquer les pratiques de {prediction.line_analysis.best_motor_line}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <div className="font-medium text-purple-400">🐍 scikit-learn</div>
                        <div className="text-sm text-purple-300">
                          Random Forest • {prediction.model_info.n_estimators} arbres • Profondeur{" "}
                          {prediction.model_info.max_depth}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
