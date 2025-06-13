// Variables globales pour maintenir la progression des totaux
let totalReworksBase = 3657 // Commence à 3657
let completedTodayBase = 127
const pendingItemsBase = 23
let failedReworksBase = 315 // Commence à 315

export function calculateStats(data: any[]) {
  const now = Date.now()

  // Total Reworks - TOUJOURS EN AUGMENTATION à partir de 3657
  const reworkIncrement = Math.floor(Math.abs(Math.sin(now / 10000)) * 3) // 0-3 nouveaux reworks
  totalReworksBase += reworkIncrement

  // Completed Today - AUGMENTE PROGRESSIVEMENT
  const completedIncrement = Math.floor(Math.abs(Math.cos(now / 15000)) * 2) // 0-2 nouveaux complétés
  completedTodayBase += completedIncrement

  // Pending Items - VARIE LÉGÈREMENT
  const pendingVariation = Math.floor(Math.sin(now / 12000) * 5) // -5 à +5
  const currentPending = Math.max(5, pendingItemsBase + pendingVariation)

  // Success Rate - VARIE LÉGÈREMENT (88-96%)
  const baseSuccessRate = 92 + Math.sin(now / 20000) * 4
  const baseMotorRate = 94 + Math.sin(now / 18000) * 3
  const baseInteriorRate = 90 + Math.cos(now / 22000) * 4

  // Avg Rework Time - VARIE DE QUELQUES MINUTES SEULEMENT
  const baseReworkTime = 45 + Math.sin(now / 25000) * 8 // 37-53 minutes
  const motorTime = 38 + Math.cos(now / 23000) * 5 // 33-43 minutes
  const interiorTime = 52 + Math.sin(now / 27000) * 7 // 45-59 minutes

  // Failed Reworks - AUGMENTE LENTEMENT à partir de 315
  const failedIncrement = Math.floor(Math.abs(Math.sin(now / 35000)) * 2) // 0-2 nouveaux failed
  failedReworksBase += failedIncrement

  return {
    successRate: {
      overall: `${Math.max(88, Math.min(96, baseSuccessRate)).toFixed(1)}%`,
      motor: `${Math.max(90, Math.min(98, baseMotorRate)).toFixed(1)}%`,
      interior: `${Math.max(85, Math.min(95, baseInteriorRate)).toFixed(1)}%`,
      completedToday: completedTodayBase.toString(),
    },
    avgReworkTime: {
      overall: `${Math.max(35, Math.min(60, baseReworkTime)).toFixed(0)}min`,
      motor: `${Math.max(30, Math.min(50, motorTime)).toFixed(0)}min`,
      interior: `${Math.max(40, Math.min(65, interiorTime)).toFixed(0)}min`,
      pendingItems: currentPending.toString(),
    },
    totalReworks: {
      overall: totalReworksBase.toString(),
      motor: Math.floor(totalReworksBase * 0.58), // 58% Motor
      interior: Math.floor(totalReworksBase * 0.42), // 42% Interior
      percentageOfTotal: `${(3.2 + Math.sin(now / 35000) * 0.5).toFixed(1)}%`,
    },
    reworkHar: {
      overall: failedReworksBase.toString(),
      motor: Math.floor(failedReworksBase * 0.6).toString(),
      interior: Math.floor(failedReworksBase * 0.4).toString(),
      failureRate: `${Math.max(1.5, 2.8 + Math.sin(now / 40000) * 0.8).toFixed(1)}%`,
    },
  }
}

export function prepareChartData(data: any[]) {
  const now = Date.now()

  // Generate dynamic priority distribution avec variations réalistes
  const urgentBase = 18 + Math.floor(Math.sin(now / 8000) * 6) // 12-24
  const mediumBase = 28 + Math.floor(Math.cos(now / 10000) * 8) // 20-36
  const normalBase = 65 + Math.floor(Math.sin(now / 12000) * 12) // 53-77

  // Generate dynamic defect trends avec augmentation progressive
  const defectTypes = ["Terminal", "Connecteur", "Sécurité", "Isolation", "Autre"]
  const defectTrend = defectTypes.map((type, index) => ({
    name: type,
    count: Math.max(8, 25 + Math.floor(Math.sin(now / 6000 + index) * 12)), // 13-37
  }))

  // Generate dynamic shift data avec variations réalistes
  const matinShift = 48 + Math.floor(Math.sin(now / 7000) * 12) // 36-60
  const soirShift = 38 + Math.floor(Math.cos(now / 9000) * 10) // 28-48
  const nuitShift = 22 + Math.floor(Math.sin(now / 11000) * 6) // 16-28

  // Generate motor defect data avec variations progressives
  const motorDefectData = [
    {
      name: "Terminal",
      value: 28 + Math.floor(Math.sin(now / 8000) * 8), // 20-36
      color: "#3b82f6",
    },
    {
      name: "Connecteur",
      value: 22 + Math.floor(Math.cos(now / 9000) * 6), // 16-28
      color: "#22c55e",
    },
    {
      name: "Autre",
      value: 18 + Math.floor(Math.sin(now / 10000) * 5), // 13-23
      color: "#8b5cf6",
    },
    {
      name: "Sécurité",
      value: 15 + Math.floor(Math.cos(now / 11000) * 4), // 11-19
      color: "#f97316",
    },
    {
      name: "File",
      value: 12 + Math.floor(Math.sin(now / 12000) * 3), // 9-15
      color: "#06b6d4",
    },
  ]

  // Generate interior defect data avec variations progressives
  const interiorDefectData = [
    {
      name: "Connecteur",
      value: 32 + Math.floor(Math.cos(now / 7000) * 10), // 22-42
      color: "#3b82f6",
    },
    {
      name: "Terminal",
      value: 25 + Math.floor(Math.sin(now / 8000) * 7), // 18-32
      color: "#22c55e",
    },
    {
      name: "Sécurité",
      value: 20 + Math.floor(Math.cos(now / 9000) * 6), // 14-26
      color: "#8b5cf6",
    },
    {
      name: "Autre",
      value: 17 + Math.floor(Math.sin(now / 10000) * 5), // 12-22
      color: "#f97316",
    },
    {
      name: "File",
      value: 13 + Math.floor(Math.cos(now / 11000) * 4), // 9-17
      color: "#06b6d4",
    },
  ]

  // Generate production data for last 30 days avec tendances réalistes
  const generateProductionData = (baseProduction: number, baseTarget: number) => {
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      const dayVariation = Math.sin(now / 10000 + i * 0.2) * 30 // Variation plus petite
      const targetVariation = Math.cos(now / 12000 + i * 0.15) * 20 // Variation plus petite

      return {
        date: date.toISOString(),
        production: Math.max(60, baseProduction + dayVariation),
        target: Math.max(50, baseTarget + targetVariation),
      }
    })
  }

  // Generate Motor Reworks by Line (derniers 7 jours)
  const generateLineReworkData = (lines: string[]) => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      const dateStr = date.toISOString().split("T")[0]

      const lineData: any = { date: dateStr }
      lines.forEach((line, index) => {
        lineData[line] = Math.max(2, 8 + Math.floor(Math.sin(now / 8000 + i + index) * 6))
      })
      return lineData
    })
  }

  // Generate recent cables data avec structure complète
  const generateRecentCables = (area: string, count: number) => {
    const shifts = ["matin", "soir", "nuit"]
    const defectTypes = ["Terminal", "Connecteur", "Sécurité", "Isolation", "Autre"]
    const defectDescriptions = ["inversion", "missing", "damaged", "loose", "wrong_position"]
    const statuses = ["Completed", "In Progress", "Pending"]
    const lines = ["Line 1", "Line 2", "Line 3", "Line 4"]

    return Array.from({ length: count }, (_, i) => {
      const reworkTime = 20 + Math.floor(Math.sin(now / 5000 + i) * 60)
      let priority = "normal"
      if (reworkTime > 60) priority = "urgent"
      else if (reworkTime >= 40) priority = "medium"

      const date = new Date(now - Math.random() * 7 * 24 * 60 * 60 * 1000)

      return {
        REWORK_DATE: date.toISOString().replace("T", " ").split(".")[0],
        ORDNR: `240930${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`,
        SUBPROD: Math.random() > 0.5 ? "A" : "B",
        RWRK_CODE: String(Math.floor(Math.random() * 5) + 1),
        DESCR: "CrossWire",
        RWRK_DETAIL: `${defectTypes[Math.floor(Math.random() * defectTypes.length)]} ${defectDescriptions[Math.floor(Math.random() * defectDescriptions.length)]} ${lines[Math.floor(Math.random() * lines.length)]}`,
        Line: lines[Math.floor(Math.random() * lines.length)],
        Area: area,
        Rework_time: reworkTime,
        Success: Math.random() > 0.2 ? 1 : 0,
        Priority: priority,
        Defect_type: defectTypes[Math.floor(Math.random() * defectTypes.length)],
        Defect_description: defectDescriptions[Math.floor(Math.random() * defectDescriptions.length)],
        Status: statuses[Math.floor(Math.random() * statuses.length)],
        shift: shifts[Math.floor(Math.random() * shifts.length)],
      }
    })
  }

  return {
    trends: data.map((item, index) => ({
      date: item.REWORK_DATE,
      value: item.Rework_time + Math.floor(Math.sin(now / 5000 + index) * 8),
    })),
    distribution: {
      motor: data.filter((item) => item.Area === "Motor").length + Math.floor(Math.sin(now / 8000) * 3),
      interior: data.filter((item) => item.Area === "Interior").length + Math.floor(Math.cos(now / 10000) * 3),
    },
    priorityDistribution: [
      { name: "Urgent", value: urgentBase },
      { name: "Medium", value: mediumBase },
      { name: "Normal", value: normalBase },
    ],
    defectTrend,
    reworkByShift: [
      { name: "Matin", value: matinShift },
      { name: "Soir", value: soirShift },
      { name: "Nuit", value: nuitShift },
    ],
    motorDefectData,
    interiorDefectData,
    motorProduction: generateProductionData(185, 155),
    interiorProduction: generateProductionData(225, 195),
    // Nouvelles données pour Motor et Interior views
    motorReworksByLine: generateLineReworkData(["Line 1", "Line 2", "Line 3", "Line 4"]),
    interiorReworksByLine: generateLineReworkData(["Line 1", "Line 2", "Line 3", "Line 4"]),
    recentMotorCables: generateRecentCables("Motor", 25),
    recentInteriorCables: generateRecentCables("Interior", 25),
  }
}

export function normalizeData(data: any[]) {
  const now = Date.now()

  return data.map((item, index) => {
    // Add some dynamic variation to rework times (petites variations)
    const timeVariation = Math.floor(Math.sin(now / 4000 + index) * 8) // Variation plus petite
    const newReworkTime = Math.max(15, (Number(item.Rework_time) || 0) + timeVariation)

    return {
      ...item,
      REWORK_DATE: typeof item.REWORK_DATE === "string" ? item.REWORK_DATE : new Date(item.REWORK_DATE).toISOString(),
      Rework_time: newReworkTime,
    }
  })
}
