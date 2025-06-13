"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, BarChart3, PieChartIcon } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { DonutChart } from "./donut-chart"
import { INTERIOR_LINE_COLORS } from "@/lib/constants"
import type { ChartData, ReworkData } from "@/lib/types"

interface InteriorViewProps {
  chartData: ChartData
  theme?: "dark" | "light"
}

export const InteriorView = ({ chartData, theme = "dark" }: InteriorViewProps) => {
  const headingText = theme === "dark" ? "text-slate-100" : "text-gray-900"
  const cardBg = theme === "dark" ? "bg-slate-800/50" : "bg-white"
  const cardBorder = theme === "dark" ? "border-slate-700/50" : "border-gray-200"

  if (
    !chartData ||
    !chartData.interiorReworksByLine ||
    !chartData.interiorDefectData ||
    !chartData.recentInteriorCables
  ) {
    return (
      <div className={`p-4 ${theme === "dark" ? "text-slate-400" : "text-gray-600"}`}>Loading Interior Data...</div>
    )
  }

  // Format time for display
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    } catch {
      return "N/A"
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      })
    } catch {
      return "N/A"
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
          <Activity className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className={`text-3xl font-bold ${headingText}`}>Interior Area Analysis</h2>
          <p className="text-slate-400">Detailed rework analysis for interior cable production</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className={`${cardBg} ${cardBorder} hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm`}>
          <CardHeader>
            <CardTitle className="flex items-center text-base font-medium">
              <BarChart3 className="mr-2 h-4 w-4 text-orange-500" />
              Interior Reworks by Line (Daily)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.interiorReworksByLine}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151" }} />
                <Legend />
                {Object.keys(INTERIOR_LINE_COLORS).map((lineKey) => (
                  <Bar
                    key={lineKey}
                    dataKey={lineKey}
                    stackId="a"
                    fill={INTERIOR_LINE_COLORS[lineKey as keyof typeof INTERIOR_LINE_COLORS]}
                    name={lineKey}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className={`${cardBg} ${cardBorder} hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm`}>
          <CardHeader>
            <CardTitle className="flex items-center text-base font-medium">
              <PieChartIcon className="mr-2 h-4 w-4 text-orange-500" />
              Interior Defect Split
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <DonutChart data={chartData.interiorDefectData} title="Interior Defect Distribution" />
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card className={`${cardBg} ${cardBorder} hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm`}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5 text-cyan-500" />
                Recent Cables in Interior Rework Area
              </CardTitle>
              <p className="text-xs text-slate-400">
                Showing latest interior cables • Live data updates every 5 seconds
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="h-[300px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-slate-900 z-10">
                      <tr className="border-b border-slate-700 text-slate-400 text-left">
                        <th className="pb-2 pl-2 w-[120px]">Cable Title</th>
                        <th className="pb-2 w-[80px]">Line</th>
                        <th className="pb-2 w-[80px]">Priority</th>
                        <th className="pb-2 w-[90px]">Date/Time</th>
                        <th className="pb-2 w-[80px]">Duration</th>
                        <th className="pb-2 w-[80px]">Status</th>
                        <th className="pb-2 pr-2 w-[80px]">Shift</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.recentInteriorCables.map((item: ReworkData, index: number) => {
                        const reworkTime = item.Rework_time
                        let priority, priorityClass, timeColor

                        if (reworkTime > 60) {
                          priority = "urgent"
                          priorityClass = "bg-red-500/10 text-red-400 border-red-500/20"
                          timeColor = "text-red-400"
                        } else if (reworkTime >= 40) {
                          priority = "medium"
                          priorityClass = "bg-orange-500/10 text-orange-400 border-orange-500/20"
                          timeColor = "text-orange-400"
                        } else {
                          priority = "normal"
                          priorityClass = "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          timeColor = "text-blue-400"
                        }

                        return (
                          <tr
                            key={`${item.ORDNR}-${index}`}
                            className="border-b border-slate-800/50 hover:bg-slate-800/30"
                          >
                            <td className="py-2 pl-2 font-mono text-xs" title={item.ORDNR}>
                              <div className="font-semibold text-slate-200">{item.ORDNR}</div>
                            </td>
                            <td className="py-2 text-xs text-slate-300">{item.Line}</td>
                            <td className="py-2">
                              <Badge variant="outline" className={`text-xs ${priorityClass}`}>
                                {priority}
                              </Badge>
                            </td>
                            <td className="py-2 text-xs text-slate-400">
                              <div className="flex flex-col">
                                <span>{formatDate(item.REWORK_DATE)}</span>
                                <span className="text-slate-500">{formatTime(item.REWORK_DATE)}</span>
                              </div>
                            </td>
                            <td className={`py-2 text-xs font-medium ${timeColor}`}>{reworkTime} min</td>
                            <td className="py-2 text-xs">
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  item.Status === "Completed"
                                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                                    : item.Status === "In Progress"
                                      ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                      : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                                }`}
                              >
                                {item.Status}
                              </Badge>
                            </td>
                            <td className="py-2 pr-2 text-xs text-slate-300 capitalize">{item.shift}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mt-2 text-xs text-slate-500 flex justify-between items-center">
                <span>Total interior cables: {chartData.recentInteriorCables.length}</span>
                <div className="flex items-center space-x-2">
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span>
                    Urgent
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-orange-500 mr-1"></span>
                    Medium
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span>
                    Normal
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
