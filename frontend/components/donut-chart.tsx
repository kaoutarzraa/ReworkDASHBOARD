"use client"

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"

interface DonutChartProps {
  data: Array<{
    name: string
    value: number
    color?: string
  }>
  title: string
}

// Couleurs personnalisées pour les segments
const DONUT_COLORS = [
  "#3b82f6", // blue - Terminal
  "#22c55e", // green - Connecteur
  "#8b5cf6", // purple - Autre
  "#f97316", // orange - Sécurité/Couvercle/Tapa
  "#06b6d4", // cyan - File
  "#eab308", // yellow - Seal/Bride/Composant
]

// Fonction pour calculer la position des étiquettes
const renderCustomizedLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, name, percent, index, fill } = props
  const RADIAN = Math.PI / 180
  const radius = outerRadius * 1.35
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text x={x} y={y} fill={fill} textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize="12">
      {`${name}: ${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export const DonutChart = ({ data, title }: DonutChartProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              labelLine={true}
              label={renderCustomizedLabel}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || DONUT_COLORS[index % DONUT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value} (${((value / data.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(0)}%)`,
                name,
              ]}
              contentStyle={{
                backgroundColor: "#1f2937",
                borderColor: "#374151",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Légende en bas */}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center">
            <span
              className="w-3 h-3 rounded-full mr-1"
              style={{ backgroundColor: item.color || DONUT_COLORS[index % DONUT_COLORS.length] }}
            />
            <span className="text-xs text-slate-300">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
