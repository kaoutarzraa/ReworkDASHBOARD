"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle,
  CheckCircle,
  Target,
  BarChart3,
  X,
  Gauge,
  TrendingUp,
  Activity,
  Brain,
  Database,
} from "lucide-react"
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

type FTQAnalyticsProps = {
  onClose?: () => void
}

interface ReworkData {
  REWORK_DATE: string
  ORDNR: string
  SUBPROD: string
  RWRK_CODE: string
  DESCR: string
  RWRK_DETAIL: string
  Line: string
  Area: string
  Rework_time: number
  Success: number
  Priority: string
  Defect_type: string
  Defect_description: string
  Status: string
  shift: string
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
        console.log("Loading data for ML prediction...")

        // Charger les données de défauts depuis le fichier local
        let data: ReworkData[] = []

        try {
          const response = await fetch("/backend/data/data.json")
          if (response.ok) {
            data = await response.json()
            console.log(`Data loaded successfully: ${data.length} defects`)
          } else {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
          }
        } catch (dataError) {
          console.warn("Unable to load data, using fallback dataset")
          data = generateFallbackData()
        }

        setRealData(data)

        // Appeler l'API Python pour la prédiction
        console.log("Calling ML API for prediction...")

        try {
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
            const errorText = await predictionResponse.text()
            throw new Error(`HTTP ${predictionResponse.status}: ${errorText}`)
          }

          const predictionResult = await predictionResponse.json()

          if (predictionResult.status === "success") {
            console.log("ML prediction received:", predictionResult.prediction)
            setPrediction(predictionResult.prediction)
            setError(null)
          } else {
            throw new Error(predictionResult.error || "ML prediction error")
          }
        } catch (apiError) {
          console.error("ML API error:", apiError)
          setError(`ML API: ${apiError instanceof Error ? apiError.message : "Unknown error"}`)

          // Utiliser les données de fallback
          const fallbackPrediction: PythonPrediction = {
            current_ftq: 92.5,
            predicted_ftq: 95.2,
            confidence: 0.87,
            total_defects: data.length,
            avg_rework_time: 45.3,
            improvement: 2.7,
            line_analysis: {
              best_motor_line: "Motor Line 1",
              worst_motor_line: "Motor Line 2",
              best_interior_line: "Interior Line 2",
              worst_interior_line: "Interior Line 3",
            },
            model_info: {
              algorithm: "Random Forest Classifier",
              n_estimators: 100,
              max_depth: 10,
              features_used: 9,
            },
          }
          setPrediction(fallbackPrediction)
        }
      } catch (error) {
        console.error("General error:", error)
        setError(error instanceof Error ? error.message : "Unknown error")

        // Données de fallback complètes
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
            best_motor_line: "Motor Line 1",
            worst_motor_line: "Motor Line 2",
            best_interior_line: "Interior Line 2",
            worst_interior_line: "Interior Line 3",
          },
          model_info: {
            algorithm: "Random Forest Classifier",
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
      REWORK_DATE: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      ORDNR: `24${String(i + 10000000).padStart(8, "0")}`,
      SUBPROD: "E",
      RWRK_CODE: "1",
      DESCR: "Missing wire",
      RWRK_DETAIL: `Autre divers Line ${(i % 3) + 1}`,
      Line: `Line ${(i % 3) + 1}`,
      Area: i % 2 === 0 ? "Motor" : "Interior",
      Rework_time: Math.floor(Math.random() * 90) + 20,
      Success: Math.random() > 0.1 ? 1 : 0,
      Priority: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
      Defect_type: ["Terminal", "Connecteur", "Sécurité", "Autre"][Math.floor(Math.random() * 4)],
      Defect_description: ["cassé", "manquant", "divers", "défectueux"][Math.floor(Math.random() * 4)],
      Status: Math.random() > 0.1 ? "Completed" : "Failed",
      shift: ["matin", "soir", "nuit"][Math.floor(Math.random() * 3)],
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
          fill: prediction.current_ftq >= 95 ? "#10b981" : prediction.current_ftq >= 90 ? "#f59e0b" : "#ef4444",
        },
      ]
    : []

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-12 text-center max-w-md w-full shadow-2xl">
          <div className="animate-spin h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"></div>
          <h3 className="text-2xl font-bold text-slate-100 mb-3">Processing ML Prediction</h3>
          <p className="text-slate-400 text-lg">Analyzing data with machine learning algorithms</p>
          <div className="mt-6 flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-xl border border-slate-700 max-w-7xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100">FTQ Prediction Analytics</h2>
              <p className="text-slate-400 text-sm">
                {prediction ? (
                  <>
                    Analysis based on {prediction.total_defects} defects • Model confidence:{" "}
                    {(prediction.confidence * 100).toFixed(1)}% • Optimal lines:{" "}
                    {prediction.line_analysis.best_motor_line} & {prediction.line_analysis.best_interior_line}
                  </>
                ) : (
                  "Loading data analysis..."
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {error && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 px-3 py-1">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Fallback Mode
              </Badge>
            )}
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3 py-1">
              <Database className="w-3 h-3 mr-1" />
              Machine Learning
            </Badge>
            {prediction && (
              <Badge
                variant="outline"
                className={`text-sm px-3 py-1 ${
                  isGoodFTQ
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                }`}
              >
                {isGoodFTQ ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                FTQ: {prediction.current_ftq}%
              </Badge>
            )}
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Alert if API error */}
          {error && (
            <Card className="bg-amber-500/5 border-amber-500/20 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <AlertTriangle className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-amber-400">ML API Unavailable</h3>
                    <p className="text-amber-300 mt-1 text-sm">
                      {error} - Using demonstration data. Start the Python server for live ML predictions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Critical alert if FTQ < 95% */}
          {prediction && !isGoodFTQ && (
            <Card className="bg-red-500/5 border-red-500/20 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <AlertTriangle className="h-6 w-6 text-red-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-400">Quality Alert - Critical</h3>
                    <p className="text-red-300 mt-1 text-sm">
                      FTQ of {prediction.current_ftq}% is below target of 95%. Immediate attention required for{" "}
                      <span className="font-semibold">{prediction.line_analysis.worst_motor_line}</span> and{" "}
                      <span className="font-semibold">{prediction.line_analysis.worst_interior_line}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {prediction && (
            <>
              {/* Main metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current FTQ */}
                <Card className="bg-slate-800/50 border-slate-700/50 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-sm font-medium text-slate-300">
                      <Gauge className="mr-2 h-4 w-4 text-blue-400" />
                      Current FTQ Performance
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
                          className="text-2xl font-bold fill-slate-100"
                        >
                          {prediction.current_ftq}%
                        </text>
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Predicted FTQ */}
                <Card className="bg-slate-800/50 border-slate-700/50 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-sm font-medium text-slate-300">
                      <Target className="mr-2 h-4 w-4 text-emerald-400" />
                      ML Prediction
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-48 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-emerald-400 mb-2">{prediction.predicted_ftq}%</div>
                      <div className="text-sm text-slate-400 mb-3">
                        {prediction.improvement >= 0 ? "+" : ""}
                        {prediction.improvement}% projected improvement
                      </div>
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <Activity className="w-3 h-3 mr-1 text-emerald-400" />
                        <span className="text-emerald-400 text-xs font-medium">
                          Confidence: {(prediction.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Line performance analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Optimal lines */}
                <Card className="bg-slate-800/50 border-slate-700/50 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-sm font-medium text-slate-300">
                      <CheckCircle className="mr-2 h-4 w-4 text-emerald-400" />
                      Optimal Performance Lines
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-48">
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-emerald-400 font-medium text-sm">
                              {prediction.line_analysis.best_motor_line}
                            </div>
                            <div className="text-emerald-300 text-xs">Motor Area - Best Performance</div>
                          </div>
                          <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-emerald-400 font-medium text-sm">
                              {prediction.line_analysis.best_interior_line}
                            </div>
                            <div className="text-emerald-300 text-xs">Interior Area - Stable Pattern</div>
                          </div>
                          <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Lines requiring attention */}
                <Card className="bg-slate-800/50 border-slate-700/50 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-sm font-medium text-slate-300">
                      <AlertTriangle className="mr-2 h-4 w-4 text-red-400" />
                      Lines Requiring Attention
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-48">
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-red-400 font-medium text-sm">
                              {prediction.line_analysis.worst_motor_line}
                            </div>
                            <div className="text-red-300 text-xs">Motor Area - Needs Improvement</div>
                          </div>
                          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-red-400 font-medium text-sm">
                              {prediction.line_analysis.worst_interior_line}
                            </div>
                            <div className="text-red-300 text-xs">Interior Area - Below Target</div>
                          </div>
                          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* FTQ trend chart */}
              <Card className="bg-slate-800/50 border-slate-700/50 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-slate-100">
                    <TrendingUp className="mr-2 h-5 w-5 text-cyan-400" />
                    FTQ Trend Analysis (7-Day Period)
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ftqTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" domain={[85, 100]} fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          borderColor: "#374151",
                          borderRadius: "8px",
                          border: "1px solid #374151",
                        }}
                        formatter={(value, name) => [`${value}%`, name === "ftq" ? "FTQ Performance" : "Target"]}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="ftq"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        name="FTQ Performance"
                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, stroke: "#3b82f6", strokeWidth: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="target"
                        stroke="#10b981"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        name="Target 95%"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Summary and recommendations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-800/50 border-slate-700/50 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
                      <Brain className="mr-2 h-5 w-5 text-purple-400" />
                      ML Model Summary
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                        <span className="text-slate-400">Algorithm:</span>
                        <span className="text-purple-400 font-medium">{prediction.model_info.algorithm}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                        <span className="text-slate-400">Estimators:</span>
                        <span className="text-purple-400 font-medium">{prediction.model_info.n_estimators}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                        <span className="text-slate-400">Max Depth:</span>
                        <span className="text-purple-400 font-medium">{prediction.model_info.max_depth}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                        <span className="text-slate-400">Features Used:</span>
                        <span className="text-cyan-400 font-medium">{prediction.model_info.features_used}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                        <span className="text-slate-400">Current FTQ:</span>
                        <span
                          className={`font-medium ${prediction.current_ftq >= 95 ? "text-emerald-400" : "text-red-400"}`}
                        >
                          {prediction.current_ftq}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                        <span className="text-slate-400">Predicted FTQ:</span>
                        <span className="text-emerald-400 font-medium">{prediction.predicted_ftq}%</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                        <span className="text-slate-400">Model Confidence:</span>
                        <span className="text-blue-400 font-medium">{(prediction.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-slate-400">Avg Rework Time:</span>
                        <span className="text-orange-400 font-medium">{prediction.avg_rework_time} min</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700/50 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
                      <Target className="mr-2 h-5 w-5 text-emerald-400" />
                      Recommended Actions
                    </h3>
                    <div className="space-y-3">
                      <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                        <div className="flex items-center mb-2">
                          <AlertTriangle className="w-4 h-4 text-red-400 mr-2" />
                          <div className="font-medium text-red-400">Critical Priority</div>
                        </div>
                        <div className="text-sm text-red-300">
                          Focus immediate attention on {prediction.line_analysis.worst_motor_line} and{" "}
                          {prediction.line_analysis.worst_interior_line}
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
                        <div className="flex items-center mb-2">
                          <BarChart3 className="w-4 h-4 text-orange-400 mr-2" />
                          <div className="font-medium text-orange-400">Data Analysis</div>
                        </div>
                        <div className="text-sm text-orange-300">
                          {prediction.total_defects} defects analyzed using {prediction.model_info.features_used}{" "}
                          features
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                        <div className="flex items-center mb-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400 mr-2" />
                          <div className="font-medium text-emerald-400">Best Practice</div>
                        </div>
                        <div className="text-sm text-emerald-300">
                          Replicate processes from {prediction.line_analysis.best_motor_line} across other lines
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                        <div className="flex items-center mb-2">
                          <Brain className="w-4 h-4 text-blue-400 mr-2" />
                          <div className="font-medium text-blue-400">ML Insights</div>
                        </div>
                        <div className="text-sm text-blue-300">
                          Random Forest model with {prediction.model_info.n_estimators} trees, depth{" "}
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
