import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: any
  trend?: string
  motorValue: string
  interiorValue: string
  gradientFrom: string
  gradientTo: string
  iconColor: string
  borderColor: string
}

export const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  motorValue,
  interiorValue,
  gradientFrom,
  gradientTo,
  iconColor,
  borderColor,
}: StatsCardProps) => {
  return (
    <Card
      className={`relative overflow-hidden bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group backdrop-blur-sm ${borderColor}`}
    >
      {/* Animated background gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}
      />

      {/* Glowing border effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${gradientFrom} ${gradientTo} opacity-20 blur-lg group-hover:opacity-30 transition-opacity duration-300`}
      />

      <CardHeader className="relative z-10 pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors duration-300">
              {title}
            </CardTitle>
            {trend && (
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-2.5 w-2.5 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-medium">{trend}</span>
              </div>
            )}
          </div>
          <div
            className={`relative p-2 rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientTo} shadow-md group-hover:scale-105 group-hover:rotate-3 transition-all duration-300`}
          >
            <Icon className={`h-4 w-4 ${iconColor} drop-shadow-lg`} />
            <div
              className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-50 blur-md rounded-xl`}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 pt-0">
        <div className="space-y-2">
          <div className="text-xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent group-hover:from-white group-hover:to-white transition-all duration-300">
            {value}
          </div>

          <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors duration-300 font-medium">
            {subtitle}
          </p>

          <div className="flex justify-between items-center pt-2 border-t border-slate-700/50 group-hover:border-slate-600/50 transition-colors duration-300">
            <div className="text-center space-y-1">
              <div className="text-xs text-slate-500 font-medium">Motor</div>
              <div className="text-xs font-bold text-blue-400 group-hover:text-blue-300 transition-colors duration-300">
                {motorValue}
              </div>
            </div>
            <div className="w-px h-6 bg-slate-700/50 group-hover:bg-slate-600/50 transition-colors duration-300" />
            <div className="text-center space-y-1">
              <div className="text-xs text-slate-500 font-medium">Interior</div>
              <div className="text-xs font-bold text-orange-400 group-hover:text-orange-300 transition-colors duration-300">
                {interiorValue}
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
    </Card>
  )
}
