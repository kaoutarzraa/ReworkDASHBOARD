import type { ReworkData, DashboardData, ChartData } from "./types"
import { COLORS } from "./constants"

export const normalizeData = (data: any[]): ReworkData[] => {
  return data.map((item) => ({
    ...item,
    Area: String(item.Area || "").trim(),
    Rework_time:
      typeof item.Rework_time === "number"
        ? item.Rework_time
        : typeof item.Rework_time === "string"
          ? Number.parseInt(item.Rework_time.trim(), 10) || 0
          : 0,
    Success:
      item.Success === 1 ||
      item.Success === "1" ||
      item.Success === true ||
      (typeof item.Success === "string" && item.Success.trim() !== ""),
    Priority: String(item.Priority || "")
      .toLowerCase()
      .trim(),
    ORDNR: String(item.ORDNR || ""),
    REWORK_DATE: String(item.REWORK_DATE || ""),
    SUBPROD: String(item.SUBPROD || ""),
    RWRK_CODE: String(item.RWRK_CODE || ""),
    DESCR: String(item.DESCR || ""),
    RWRK_DETAIL: String(item.RWRK_DETAIL || ""),
    Line: String(item.Line || ""),
    Defect_type: String(item.Defect_type || ""),
    Defect_description: String(item.Defect_description || ""),
    Status: String(item.Status || ""),
    knr: String(item.ORDNR || item.knr || ""),
    shift: item.shift || "",
    production: item.production !== undefined ? Number(item.production) : undefined,
    target: item.target !== undefined ? Number(item.target) : undefined,
  }))
}

export const calculateStats = (rawData: any[]): DashboardData => {
  const data = normalizeData(rawData)
  const motorData = data.filter((item) => item.Area.toLowerCase() === "motor")
  const interiorData = data.filter((item) => item.Area.toLowerCase() === "interior")

  const successCount = data.filter((item) => item.Success).length
  const motorSuccessCount = motorData.filter((item) => item.Success).length
  const interiorSuccessCount = interiorData.filter((item) => item.Success).length

  const successRate = data.length > 0 ? ((successCount / data.length) * 100).toFixed(1) + "%" : "0%"
  const motorSuccessRate = motorData.length > 0 ? ((motorSuccessCount / motorData.length) * 100).toFixed(1) + "%" : "0%"
  const interiorSuccessRate =
    interiorData.length > 0 ? ((interiorSuccessCount / interiorData.length) * 100).toFixed(1) + "%" : "0%"

  const totalTime = data.reduce((sum, item) => sum + item.Rework_time, 0)
  const motorTotalTime = motorData.reduce((sum, item) => sum + item.Rework_time, 0)
  const interiorTotalTime = interiorData.reduce((sum, item) => sum + item.Rework_time, 0)

  const avgTime = data.length > 0 ? Math.round(totalTime / data.length) + " min" : "0 min"
  const motorAvgTime = motorData.length > 0 ? Math.round(motorTotalTime / motorData.length) + " min" : "0 min"
  const interiorAvgTime =
    interiorData.length > 0 ? Math.round(interiorTotalTime / interiorData.length) + " min" : "0 min"

  const failedCount = data.filter((item) => !item.Success).length
  const failureRate = data.length > 0 ? ((failedCount / data.length) * 100).toFixed(1) + "%" : "0%"

  return {
    successRate: {
      overall: successRate,
      completedToday: successCount,
      motor: motorSuccessRate,
      interior: interiorSuccessRate,
    },
    avgReworkTime: {
      overall: avgTime,
      pendingItems: Math.round(data.length * 0.15),
      motor: motorAvgTime,
      interior: interiorAvgTime,
    },
    totalReworks: {
      overall: data.length,
      percentageOfTotal: "100%",
      motor: motorData.length,
      interior: interiorData.length,
    },
    reworkHar: {
      overall: failedCount,
      failureRate: failureRate,
      motor: motorData.filter((item) => !item.Success).length,
      interior: interiorData.filter((item) => !item.Success).length,
    },
  }
}

export const prepareChartData = (reworkData: ReworkData[]): ChartData => {
  // Success rate by line
  const successRateByLine = ["Line 1", "Line 2", "Line 3"].map((line) => {
    const lineData = reworkData.filter((item) => item.Line === line)
    const successCount = lineData.filter((item) => item.Success).length
    const rate = lineData.length > 0 ? (successCount / lineData.length) * 100 : 0
    return {
      name: line,
      value: Number.parseFloat(rate.toFixed(1)),
      count: lineData.length,
    }
  })

  // Priority distribution
  const priorityDistribution = [
    { name: "Urgent", value: reworkData.filter((item) => item.Priority === "urgent").length, fill: "#ef4444" },
    { name: "Medium", value: reworkData.filter((item) => item.Priority === "medium").length, fill: "#f97316" },
    { name: "Normal", value: reworkData.filter((item) => item.Priority === "normal").length, fill: "#3b82f6" },
  ]

  // Average time by area
  const avgTimeByArea = [
    {
      name: "Motor",
      value:
        reworkData.filter((item) => item.Area === "motor").reduce((sum, item) => sum + item.Rework_time, 0) /
        Math.max(1, reworkData.filter((item) => item.Area === "motor").length),
    },
    {
      name: "Interior",
      value:
        reworkData.filter((item) => item.Area === "interior").reduce((sum, item) => sum + item.Rework_time, 0) /
        Math.max(1, reworkData.filter((item) => item.Area === "interior").length),
    },
  ]

  // Defect trends
  const defectTrend = Array.from(new Set(reworkData.map((item) => item.Defect_type)))
    .map((defectType) => ({
      name: defectType || "Inconnu",
      count: reworkData.filter((item) => item.Defect_type === defectType).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Rework trend by hour
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const reworkTrendByHour = hours.map((hour) => {
    const hourData = reworkData.filter((item) => {
      const date = new Date(item.REWORK_DATE)
      return date.getHours() === hour
    })
    return {
      name: `${hour}h`,
      reworks: hourData.length,
      success: hourData.filter((item) => item.Success).length,
      failed: hourData.filter((item) => !item.Success).length,
    }
  })

  // Rework by shift
  const shifts = ["matin", "soir", "nuit"]
  const reworkByShift = shifts
    .map((shift) => ({
      name: shift.charAt(0).toUpperCase() + shift.slice(1),
      value: reworkData.filter((item) => item.shift === shift).length,
    }))
    .filter((item) => item.value > 0)

  // Production data
  const productionByDateArea: Record<
    string,
    { motorProd: number; motorTarget: number; interiorProd: number; interiorTarget: number; date: string }
  > = {}

  reworkData.forEach((item) => {
    const dateStr = item.REWORK_DATE.split(" ")[0]

    if (!productionByDateArea[dateStr]) {
      productionByDateArea[dateStr] = {
        date: dateStr,
        motorProd: 0,
        motorTarget: 0,
        interiorProd: 0,
        interiorTarget: 0,
      }
    }

    const prodValue = item.production !== undefined ? item.production : 1
    const targetValue =
      item.target !== undefined ? item.target : item.production !== undefined ? item.production * 1.2 : 1.2

    if (item.Area.toLowerCase() === "motor") {
      productionByDateArea[dateStr].motorProd += prodValue
      productionByDateArea[dateStr].motorTarget += targetValue
    } else if (item.Area.toLowerCase() === "interior") {
      productionByDateArea[dateStr].interiorProd += prodValue
      productionByDateArea[dateStr].interiorTarget += targetValue
    }
  })

  // Convert to array and sort by date
  const productionData = Object.values(productionByDateArea).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  // Prepare motor and interior production data
  const motorProduction = productionData.map((item) => ({
    date: item.date,
    production: item.motorProd,
    target: item.motorTarget > 0 ? Math.round(item.motorTarget / (item.motorProd / item.motorTarget)) : 0,
  }))

  const interiorProduction = productionData.map((item) => ({
    date: item.date,
    production: item.interiorProd,
    target: item.interiorTarget > 0 ? Math.round(item.interiorTarget / (item.interiorProd / item.interiorTarget)) : 0,
  }))

  // Defects by area
  const analyzeDefects = (area: string) => {
    const defects = reworkData
      .filter((item) => item.Area.toLowerCase() === area.toLowerCase())
      .reduce(
        (acc, item) => {
          const defectType = item.Defect_type || "Inconnu"
          acc[defectType] = (acc[defectType] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

    return Object.entries(defects)
      .map(([name, value]) => ({
        name,
        value,
        fill: COLORS[Object.keys(defects).indexOf(name) % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value)
  }

  const motorDefectData = analyzeDefects("motor")
  const interiorDefectData = analyzeDefects("interior")

  // Defect details with descriptions
  const analyzeDefectDetails = (area: string) => {
    const defects = reworkData
      .filter((item) => item.Area.toLowerCase() === area.toLowerCase())
      .reduce(
        (acc, item) => {
          const key = `${item.Defect_type} - ${item.Defect_description}`
          acc[key] = (acc[key] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

    return Object.entries(defects)
      .map(([name, value]) => ({
        name,
        value,
        fill: COLORS[Object.keys(defects).indexOf(name) % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
  }

  const motorDefectDetails = analyzeDefectDetails("motor")
  const interiorDefectDetails = analyzeDefectDetails("interior")

  // List of cables in rework area
  const recentReworks = reworkData
    .sort((a, b) => new Date(b.REWORK_DATE).getTime() - new Date(a.REWORK_DATE).getTime())
    .slice(0, 5)

  // Data for extracted views
  const aggregateReworksByLineAndDate = (data: ReworkData[]) => {
    const aggregated: Record<string, Record<string, number>> = {}
    data.forEach((item) => {
      const dateStr = item.REWORK_DATE.split(" ")[0]
      const line = item.Line || "Unknown"
      if (!dateStr) return
      if (!aggregated[dateStr]) {
        aggregated[dateStr] = {}
      }
      aggregated[dateStr][line] = (aggregated[dateStr][line] || 0) + 1
    })
    return Object.entries(aggregated)
      .map(([date, lineCounts]) => ({ date, ...lineCounts }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30)
  }

  const motorData = reworkData.filter((item) => item.Area.toLowerCase() === "motor")
  const interiorData = reworkData.filter((item) => item.Area.toLowerCase() === "interior")

  const motorReworksByLine = aggregateReworksByLineAndDate(motorData)
  const interiorReworksByLine = aggregateReworksByLineAndDate(interiorData)

  const recentMotorCables = motorData
    .sort((a, b) => new Date(b.REWORK_DATE).getTime() - new Date(a.REWORK_DATE).getTime())
    .slice(0, 20)

  const recentInteriorCables = interiorData
    .sort((a, b) => new Date(b.REWORK_DATE).getTime() - new Date(a.REWORK_DATE).getTime())
    .slice(0, 20)

  return {
    successRateByLine,
    priorityDistribution,
    avgTimeByArea,
    defectTrend,
    reworkTrendByHour,
    reworkByShift,
    motorProduction,
    interiorProduction,
    motorDefectData,
    interiorDefectData,
    motorDefectDetails,
    interiorDefectDetails,
    recentReworks,
    motorReworksByLine,
    interiorReworksByLine,
    recentMotorCables,
    recentInteriorCables,
  }
}
