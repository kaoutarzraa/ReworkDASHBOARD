"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Skeleton } from "@/components/ui/prepareChartData"
import type { ReworkData } from "@/lib/data-utils"

interface OverviewProps {
  data: ReworkData[]
  loading: boolean
}

interface ChartData {
  name: string
  Motor: number
  Interior: number
}

export function Overview({ data, loading }: OverviewProps) {
  const [chartData, setChartData] = useState<ChartData[]>([])

  useEffect(() => {
    if (data.length === 0) return

    // Group data by line and area
    const lineData: Record<string, { Motor: number; Interior: number }> = {}

    data.forEach((item) => {
      if (!lineData[item.line]) {
        lineData[item.line] = { Motor: 0, Interior: 0 }
      }

      if (item.area === "Motor") {
        lineData[item.line].Motor += 1
      } else if (item.area === "Interior") {
        lineData[item.line].Interior += 1
      }
    })

    // Convert to chart format
    const formattedData = Object.entries(lineData).map(([line, counts]) => ({
      name: line,
      Motor: counts.Motor,
      Interior: counts.Interior,
    }))

    // Sort by line name
    formattedData.sort((a, b) => a.name.localeCompare(b.name))

    setChartData(formattedData)
  }, [data])

  if (loading) {
    return <Skeleton className="h-full w-full bg-slate-800/50" />
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} barSize={12}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
        <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(15, 23, 42, 0.8)",
            borderColor: "#475569",
            color: "#f8fafc",
            fontSize: "12px",
          }}
        />
        <Bar dataKey="Motor" fill="#3b82f6" name="Motor Area" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Interior" fill="#10b981" name="Interior Area" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
