import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gauge, BarChart3, PieChartIcon, Activity } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { DonutChart } from "./donut-chart"
import { MOTOR_LINE_COLORS } from "@/lib/constants"
import type { ChartData, ReworkData } from "@/lib/types"

interface MotorViewProps {
  chartData: ChartData
  theme?: "dark" | "light"
}

export const MotorView = ({ chartData, theme = "dark" }: MotorViewProps) => {
  const headingText = theme === "dark" ? "text-slate-100" : "text-gray-900"
  const cardBg = theme === "dark" ? "bg-slate-800/50" : "bg-white"
  const cardBorder = theme === "dark" ? "border-slate-700/50" : "border-gray-200"

  if (!chartData || !chartData.motorReworksByLine || !chartData.motorDefectData || !chartData.recentMotorCables) {
    return <div className={`p-4 ${theme === "dark" ? "text-slate-400" : "text-gray-600"}`}>Loading Motor Data...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
          <Gauge className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className={`text-3xl font-bold ${headingText}`}>Motor Area Analysis</h2>
          <p className="text-slate-400">Detailed rework analysis for motor cable production</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className={`${cardBg} ${cardBorder} hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm`}>
          <CardHeader>
            <CardTitle className="flex items-center text-base font-medium">
              <BarChart3 className="mr-2 h-4 w-4 text-blue-500" />
              Motor Reworks by Line (Daily)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.motorReworksByLine}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip />
                <Legend />
                {Object.keys(MOTOR_LINE_COLORS).map((lineKey) => (
                  <Bar
                    key={lineKey}
                    dataKey={lineKey}
                    stackId="a"
                    fill={MOTOR_LINE_COLORS[lineKey as keyof typeof MOTOR_LINE_COLORS]}
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
              Motor Defect Split
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <DonutChart data={chartData.motorDefectData} title="Motor Defect Distribution" />
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card className={`${cardBg} ${cardBorder} hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm`}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5 text-cyan-500" />
                Recent Cables in Motor Rework Area
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="h-[300px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-slate-900 z-10">
                      <tr className="border-b border-slate-700 text-slate-400 text-left">
                        <th className="pb-2 pl-2">Cable</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Line</th>
                        <th className="pb-2">Priority</th>
                        <th className="pb-2 pr-2 text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.recentMotorCables.map((item: ReworkData, index: number) => {
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
                          <tr key={index} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                            <td className="py-2 pl-2 font-mono text-xs">{item.ORDNR}</td>
                            <td className="py-2 text-xs">{item.Area}</td>
                            <td className="py-2 text-xs">{item.Line}</td>
                            <td className="py-2">
                              <Badge variant="outline" className={`text-xs ${priorityClass}`}>
                                {priority}
                              </Badge>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
