export interface ReworkData {
  REWORK_DATE: string
  ORDNR: string
  SUBPROD: string
  RWRK_CODE: string
  DESCR: string
  RWRK_DETAIL: string
  Line: string
  Area: string
  Rework_time: number
  Success: boolean
  Priority: string
  Defect_type: string
  Defect_description: string
  Status: string
  knr: string
  shift?: string
  production?: number
  target?: number
}

export interface DashboardData {
  successRate: {
    overall: string
    completedToday: number
    motor: string
    interior: string
  }
  avgReworkTime: {
    overall: string
    pendingItems: number
    motor: string
    interior: string
  }
  totalReworks: {
    overall: number
    percentageOfTotal: string
    motor: number
    interior: number
  }
  reworkHar: {
    overall: number
    failureRate: string
    motor: number
    interior: number
  }
}

export interface CableProductionData {
  date: string
  production: number
  target: number
}

export interface ChartData {
  successRateByLine: any[]
  priorityDistribution: any[]
  avgTimeByArea: any[]
  defectTrend: any[]
  reworkTrendByHour: any[]
  reworkByShift: any[]
  motorProduction: any[]
  interiorProduction: any[]
  motorDefectData: any[]
  interiorDefectData: any[]
  motorDefectDetails: any[]
  interiorDefectDetails: any[]
  recentReworks: any[]
  motorReworksByLine: any[]
  interiorReworksByLine: any[]
  recentMotorCables: ReworkData[]
  recentInteriorCables: ReworkData[]
}
