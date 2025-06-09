"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle } from "lucide-react"

export function Overview() {
  const ftqMetrics = {
    overall: 99.2,
    motor: 99.0,
    interior: 99.4,
    trend: "up",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">Vue d'ensemble FTQ</h2>
          <p className="text-slate-400">Métriques de qualité première fois en temps réel</p>
        </div>
        <Badge variant={ftqMetrics.overall >= 95 ? "default" : "destructive"} className="text-sm px-3 py-1">
          {ftqMetrics.trend === "up" ? (
            <>
              <TrendingUp className="w-4 h-4 mr-1" /> Tendance Positive
            </>
          ) : (
            <>
              <TrendingDown className="w-4 h-4 mr-1" /> Tendance Négative
            </>
          )}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              FTQ Global
            </CardTitle>
            <CardDescription>Performance globale de qualité</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-100 mb-2">{ftqMetrics.overall}%</div>
            <Progress value={ftqMetrics.overall} className="mb-2" />
            <p className="text-sm text-slate-400">8 défauts sur 1000 unités</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-blue-400 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Ligne Motor
            </CardTitle>
            <CardDescription>Qualité ligne de production motor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-100 mb-2">{ftqMetrics.motor}%</div>
            <Progress value={ftqMetrics.motor} className="mb-2" />
            <p className="text-sm text-slate-400">5 défauts sur 500 unités</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-500/30">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Ligne Interior
            </CardTitle>
            <CardDescription>Qualité ligne de production interior</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-100 mb-2">{ftqMetrics.interior}%</div>
            <Progress value={ftqMetrics.interior} className="mb-2" />
            <p className="text-sm text-slate-400">3 défauts sur 500 unités</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
              Points Forts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Ligne Interior stable</span>
              <Badge className="bg-green-900/20 text-green-400">99.4%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Tendance d'amélioration</span>
              <Badge className="bg-green-900/20 text-green-400">+2.1%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Objectif qualité atteint</span>
              <Badge className="bg-green-900/20 text-green-400">✓</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-400" />
              Points d'Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Défauts câbles cassés</span>
              <Badge variant="destructive">3 occurrences</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Station A1 à surveiller</span>
              <Badge variant="secondary">2 défauts</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Formation opérateur OP001</span>
              <Badge variant="outline">Recommandé</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
