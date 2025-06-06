"use client"
import { useEffect, useState } from "react"
import { Clock } from "lucide-react"

export const LiveClock = () => {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex items-center space-x-2 bg-slate-800/50 rounded-lg px-3 py-2 border border-slate-700/50 backdrop-blur-sm">
      <Clock className="h-4 w-4 text-cyan-400" />
      <div className="text-sm">
        <div className="text-slate-100 font-mono">
          {time.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </div>
        <div className="text-xs text-slate-400">
          {time.toLocaleDateString("fr-FR", {
            weekday: "short",
            day: "numeric",
            month: "short",
          })}
        </div>
      </div>
    </div>
  )
}
