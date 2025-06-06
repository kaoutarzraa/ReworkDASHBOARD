'use client'
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Gauge, Activity, BarChart3, Search, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend, 
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Sector
} from "recharts"

interface ReworkData {
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
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const normalizeData = (data: any[]): ReworkData[] => {
  return data.map(item => ({
    ...item,
    Area: String(item.Area || "").trim(),
    Rework_time: typeof item.Rework_time === 'number' ? item.Rework_time : 
                 typeof item.Rework_time === 'string' ? parseInt(item.Rework_time.trim(), 10) || 0 : 0,
    Success: item.Success === 1 || item.Success === "1" || item.Success === true || 
             (typeof item.Success === "string" && item.Success.trim() !== ""),
    Defect_type: String(item.Defect_type || "Inconnu").trim(),
    shift: item.shift || "Unknown"
  }))
}

const prepareChartData = (reworkData: ReworkData[]) => {
  // Analyse des défauts par zone
  const analyzeDefects = (area: string) => {
    const areaData = reworkData.filter(item => 
      item.Area.toLowerCase() === area.toLowerCase()
    );
    
    const defectCounts = areaData.reduce((acc, item) => {
      const defectType = item.Defect_type;
      acc[defectType] = (acc[defectType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(defectCounts)
      .map(([name, value]) => ({
        name,
        value,
        fill: COLORS[Object.keys(defectCounts).indexOf(name) % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);
  };

  // Analyse par shift
  const analyzeByShift = () => {
    const shiftCounts = reworkData.reduce((acc, item) => {
      const shift = item.shift || "Unknown";
      acc[shift] = (acc[shift] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(shiftCounts).reduce((sum, count) => sum + count, 0);

    return Object.entries(shiftCounts)
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? Math.round((value / total) * 100) : 0,
        fill: COLORS[Object.keys(shiftCounts).indexOf(name) % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);
  };

  // Analyse des priorités
  const analyzePriorities = () => {
    const priorityCounts = reworkData.reduce((acc, item) => {
      const priority = item.Priority || "Unknown";
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(priorityCounts)
      .map(([name, value]) => ({
        name,
        value,
        fill: name === "High" ? "#FF5252" : 
              name === "Medium" ? "#FF9800" : 
              name === "Low" ? "#4CAF50" : "#9E9E9E"
      }))
      .sort((a, b) => b.value - a.value);
  };

  // Top 5 des types de défauts
  const analyzeTopDefects = () => {
    const defectCounts = reworkData.reduce((acc, item) => {
      const defectType = item.Defect_type;
      acc[defectType] = (acc[defectType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(defectCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  // Données de production simulées (30 derniers jours)
  const generateProductionData = (area: string) => {
    const data = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const areaData = reworkData.filter(item => 
        item.Area.toLowerCase() === area.toLowerCase() &&
        new Date(item.REWORK_DATE).toDateString() === date.toDateString()
      );
      
      data.push({
        date: date.toISOString().split('T')[0],
        production: areaData.length,
        target: Math.floor(Math.random() * 10) + 5 // Target simulé
      });
    }
    
    return data;
  };

  const motorDefectData = analyzeDefects("Motor");
  const interiorDefectData = analyzeDefects("Interior");
  const reworkByShift = analyzeByShift();
  const priorityDistribution = analyzePriorities();
  const defectTrend = analyzeTopDefects();
  const motorProduction = generateProductionData("Motor");
  const interiorProduction = generateProductionData("Interior");

  return {
    motorDefectData,
    interiorDefectData,
    reworkByShift,
    priorityDistribution,
    defectTrend,
    motorProduction,
    interiorProduction
  };
};

// Fonction pour le rendu actif des graphiques en secteurs
const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${value}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any>(null);
  const [reworkData, setReworkData] = useState<ReworkData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [theme, setTheme] = useState('dark');

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/backend/data/data.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error("Invalid data format: array expected");
      }

      const normalizedData = normalizeData(data);
      setReworkData(normalizedData);
      setChartData(prepareChartData(normalizedData));
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      
      // Fallback data
      setChartData({
        motorDefectData: [],
        interiorDefectData: [],
        reworkByShift: [],
        priorityDistribution: [],
        defectTrend: [],
        motorProduction: [],
        interiorProduction: []
      });
      setReworkData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Motor Defect Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5 text-orange-500" />
              Rework Area Defect Split – Motor
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {chartData?.motorDefectData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.motorDefectData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.motorDefectData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      value,
                      name
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                No data available for Motor defects
              </div>
            )}
          </CardContent>
        </Card>

        {/* Interior Defect Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5 text-orange-500" />
              Rework Area Defect Split – Interior
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {chartData?.interiorDefectData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.interiorDefectData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.interiorDefectData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      value,
                      name
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                No data available for Interior defects
              </div>
            )}
          </CardContent>
        </Card>
      </div>
          
   
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-purple-500" />
                Rework By Shift
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={chartData.reworkByShift}
                    cx="50%"
                    cy="90%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                  >
                    {chartData.reworkByShift.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
                      borderColor: theme === 'dark' ? '#374151' : '#ddd',
                      color: theme === 'dark' ? '#fff' : '#000'
                    }}
                    formatter={(value: number, name: string, props: any) => [
                      `${value} (${props.payload.percentage}%)`,
                      name
                    ]}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{
                      paddingTop: '20px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

              <Card>
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
                      <Line 
                        type="monotone" 
                        dataKey="production" 
                        name="Production" 
                        stroke="#FF5252" 
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="target"
                        name="Target" 
                        stroke="#536DFE" 
                        strokeDasharray="5 5" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
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
                      <Line 
                        type="monotone" 
                        dataKey="production" 
                        name="Production" 
                        stroke="#4CAF50" 
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="target" 
                        name="Target" 
                        stroke="#8BC34A" 
                        strokeDasharray="5 5" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-blue-500" />
                    Priority Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        data={chartData.priorityDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                        onMouseEnter={onPieEnter}
                      >
                        {chartData.priorityDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-purple-500" />
                    Top 5 Defect Types
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.defectTrend} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                      <XAxis type="number" stroke="#9ca3af" />
                      <YAxis dataKey="name" type="category" stroke="#9ca3af" width={80} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
                      />
                      <Bar dataKey="count" name="Count" fill="#8b5cf6">
                        {chartData.defectTrend.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="mr-2 h-5 w-5 text-cyan-500" />
                    List of Cables in the Rework Area
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {reworkData.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-center justify-between border-b border-slate-400/50 pb-5">
                        <div>
                          <div className="font-medium">{item.ORDNR}</div>
                          <div className="text-sm text-slate-400">
                            {item.RWRK_DETAIL} ({item.shift})
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Badge variant={item.Success ? "success" : "destructive"} className="mr-2">
                            {item.Success ? "Success" : "Failed"}
                          </Badge>
                          <Badge variant="outline">{item.Priority}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
  )
}