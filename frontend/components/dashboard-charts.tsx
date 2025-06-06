"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, BarChart3 } from "lucide-react"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Label,
} from "recharts"
import { DonutChart } from "./donut-chart"
import { COLORS } from "@/lib/constants"
import type { ChartData, ReworkData } from "@/lib/types"
import type { JSX } from "react"

interface DashboardChartsProps {
  chartData: ChartData
  reworkData: ReworkData[]
  activeIndex: number
  onPieEnter: (data: any, index: number) => void
  renderActiveShape: (props: any) => JSX.Element
  theme?: "dark" | "light"
  searchQuery?: string
}

// Custom label renderer for the Rework By Shift chart
const renderCustomizedShiftLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, value, name, percent, index, fill } = props

  const RADIAN = Math.PI / 180
  const radius = outerRadius + 30
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <g>
      <text x={x} y={y} fill={fill} textAnchor="middle" dominantBaseline="middle">
        <tspan x={x} y={y} fontSize="14" fontWeight="bold">
          {value}
        </tspan>
        <tspan x={x} y={y + 20} fontSize="12">
          ({(percent * 100).toFixed(1)}%)
        </tspan>
      </text>
    </g>
  )
}

// Custom label renderer for the Priority Distribution chart
const renderCustomizedPriorityLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, value, name, percent, index, fill } = props

  const RADIAN = Math.PI / 180
  const radius = outerRadius + 30
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <g>
      <text x={x} y={y} fill={fill} textAnchor="middle" dominantBaseline="middle">
        <tspan x={x} y={y} fontSize="14" fontWeight="bold">
          {value}
        </tspan>
        <tspan x={x} y={y + 20} fontSize="12">
          ({(percent * 100).toFixed(2)}%)
        </tspan>
      </text>
    </g>
  )
}

// Custom legend for shift chart
const ShiftLegend = () => {
  return (
    <div className="flex justify-center space-x-4 mt-4">
      <div className="flex items-center">
        <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
        <span className="text-blue-500 text-sm">Matin</span>
      </div>
      <div className="flex items-center">
        <span className="w-3 h-3 rounded-full bg-green-400 mr-2"></span>
        <span className="text-green-400 text-sm">Soir</span>
      </div>
      <div className="flex items-center">
        <span className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></span>
        <span className="text-yellow-400 text-sm">Nuit</span>
      </div>
    </div>
  )
}

export const DashboardCharts = ({
  chartData,
  reworkData,
  activeIndex,
  onPieEnter,
  renderActiveShape,
  theme = "dark",
  searchQuery = "",
}: DashboardChartsProps) => {
  // Colors for the shift chart
  const shiftColors = ["#3b82f6", "#10b981", "#f59e0b"] // blue, green, yellow

  // Colors for the priority chart
  const priorityColors = ["#ef4444", "#f97316", "#3b82f6"] // red, orange, blue

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
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enhanced Priority Distribution Chart */}
        <Card className="bg-slate-800/50 border-slate-700/50 hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-blue-500" />
              Priority Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.priorityDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomizedPriorityLabel}
                  >
                    {chartData.priorityDistribution.map((entry, index) => (
                      <Cell
                        key={`priority-cell-${index}`}
                        fill={priorityColors[index % priorityColors.length]}
                        stroke="none"
                      />
                    ))}
                    <Label
                      value={chartData.priorityDistribution[0]?.name || ""}
                      position="center"
                      fill="#ef4444"
                      style={{ fontSize: "16px", fontWeight: "bold" }}
                    />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-purple-500" />
              Top 5 Defect Types
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.defectTrend} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" width={80} />
                <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151" }} />
                <Bar dataKey="count" name="Count" fill="#8b5cf6">
                  {chartData.defectTrend.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5 text-cyan-500" />
              Latest Cables in Rework Area
            </CardTitle>
            <p className="text-xs text-slate-400">Showing 50 most recent • Priority based on rework time</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {searchQuery && (
                <div className="mb-2 text-xs text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">
                  Filtered by: "{searchQuery}" - {reworkData.length} results
                </div>
              )}
              <div className="h-[225px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-900 z-10">
                    <tr className="border-b border-slate-700 text-slate-400 text-left">
                      <th className="pb-2 pl-2 w-[140px]">Cable Title</th>
                      <th className="pb-2 w-[80px]">Area</th>
                      <th className="pb-2 w-[80px]">Line</th>
                      <th className="pb-2 w-[100px]">Priority</th>
                      <th className="pb-2 w-[90px]">Date/Time</th>
                      <th className="pb-2 pr-2 w-[80px] text-right">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reworkData
                      .map((item) => {
                        const reworkTime = item.Rework_time || 0
                        let priorityOrder = 0 // 0 = urgent, 1 = medium, 2 = normal

                        if (reworkTime > 60) {
                          priorityOrder = 0 // urgent
                        } else if (reworkTime >= 40) {
                          priorityOrder = 1 // medium
                        } else {
                          priorityOrder = 2 // normal
                        }

                        return { ...item, priorityOrder }
                      })
                      .sort((a, b) => {
                        // Sort by priority first (urgent -> medium -> normal)
                        if (a.priorityOrder !== b.priorityOrder) {
                          return a.priorityOrder - b.priorityOrder
                        }
                        // Then sort by date (newest first)
                        return new Date(b.REWORK_DATE || 0).getTime() - new Date(a.REWORK_DATE || 0).getTime()
                      })
                      .slice(0, 50)
                      .map((item, index) => {
                        const reworkTime = item.Rework_time || 0
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
                            <td className="py-2 pl-2 font-mono text-xs" title={item.ORDNR || "N/A"}>
                              <div className="font-semibold text-slate-200">{item.ORDNR || "N/A"}</div>
                            </td>
                            <td className="py-2 text-xs">
                              <span className="capitalize text-slate-300">{item.Area?.toLowerCase() || "N/A"}</span>
                            </td>
                            <td className="py-2 text-xs text-slate-300">{item.Line || "N/A"}</td>
                            <td className="py-2">
                              <Badge variant="outline" className={`text-xs ${priorityClass}`}>
                                {priority}
                              </Badge>
                            </td>
                            <td className="py-2 text-xs text-slate-400">
                              <div className="flex flex-col">
                                <span>{formatDate(item.REWORK_DATE || "")}</span>
                                <span className="text-slate-500">{formatTime(item.REWORK_DATE || "")}</span>
                              </div>
                            </td>
                            <td className={`py-2 pr-2 text-right text-xs font-medium ${timeColor}`}>
                              {reworkTime} min
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-500 flex justify-between items-center">
              <span>
                Total in system: {reworkData.length} cables {searchQuery && `(filtered)`}
              </span>
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
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700/50 hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5 text-orange-500" />
              Rework Area Defect Split – Motor
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <DonutChart data={chartData.motorDefectData} title="" />
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5 text-orange-500" />
              Rework Area Defect Split – Interior
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <DonutChart data={chartData.interiorDefectData} title="" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enhanced Rework By Shift Chart */}
        <Card className="col-span-1 bg-slate-800/50 border-slate-700/50 hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-purple-500" />
              Rework By Shift
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.reworkByShift}
                    cx="50%"
                    cy="90%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomizedShiftLabel}
                  >
                    {chartData.reworkByShift.map((entry, index) => (
                      <Cell key={`shift-cell-${index}`} fill={shiftColors[index % shiftColors.length]} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ShiftLegend />
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5 text-blue-500" />
              Motor Cable Rework (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.motorProduction}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return `${date.getDate()}/${date.getMonth() + 1}`
                  }}
                />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="production" name="Target" stroke="#FF5252" strokeWidth={2} />
                <Line
                  type="monotone"
                  dataKey="target"
                  name="Reel"
                  stroke="#536DFE"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5 text-green-500" />
              Interior Cable Rework (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.interiorProduction}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return `${date.getDate()}/${date.getMonth() + 1}`
                  }}
                />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="production" name="Target" stroke="#4CAF50" strokeWidth={2} />
                <Line
                  type="monotone"
                  dataKey="target"
                  name="Reel"
                  stroke="#8BC34A"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
