import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Map } from "lucide-react"

interface MapViewProps {
  theme?: "dark" | "light"
}

export const MapView = ({ theme = "dark" }: MapViewProps) => {
  const headingText = theme === "dark" ? "text-slate-100" : "text-gray-900"
  const cardBg = theme === "dark" ? "bg-slate-800/50" : "bg-white"
  const cardBorder = theme === "dark" ? "border-slate-700/50" : "border-gray-200"

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
          <Map className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className={`text-3xl font-bold ${headingText}`}>Factory Map Zone</h2>
          <p className="text-slate-400">Interactive factory layout and rework area locations</p>
        </div>
      </div>

      <Card className={`${cardBg} ${cardBorder} backdrop-blur-sm`}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Map className="mr-2 h-5 w-5 text-green-500" />
            APTIV Rework Area Layout
          </CardTitle>
          <p className="text-sm text-slate-400 mt-2">
            Factory floor plan showing the complete rework process flow and station locations
          </p>
        </CardHeader>
        <CardContent>
          <div className="w-full rounded-lg border border-slate-700/50 overflow-hidden bg-white">
            <img
              src="/images/flux.jpg"
              alt="APTIV Rework Area Factory Layout"
              className="w-full h-auto object-contain"
              style={{ maxHeight: "600px" }}
            />
          </div>

          {/* Color Legend and Explanations */}
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-200">Zone Color Guide</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                <div className="w-4 h-4 rounded-full bg-yellow-400 mt-1 flex-shrink-0"></div>
                <div>
                  <span className="text-sm font-medium text-yellow-400">Yellow Zone</span>
                  <p className="text-xs text-slate-400 mt-1">
                    Interior Zone - Cable routing and interior component processing
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                <div className="w-4 h-4 rounded-full bg-blue-400 mt-1 flex-shrink-0"></div>
                <div>
                  <span className="text-sm font-medium text-blue-400">Blue Zone</span>
                  <p className="text-xs text-slate-400 mt-1">
                    Engine Zone - Motor cable processing and engine harness work
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                <div className="w-4 h-4 rounded-full bg-green-400 mt-1 flex-shrink-0"></div>
                <div>
                  <span className="text-sm font-medium text-green-400">Green Zone</span>
                  <p className="text-xs text-slate-400 mt-1">
                    Stations Communs - Shared workstations and quality control
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                <div className="w-4 h-4 rounded-full bg-red-400 mt-1 flex-shrink-0"></div>
                <div>
                  <span className="text-sm font-medium text-red-400">Red Zone</span>
                  <p className="text-xs text-slate-400 mt-1">Critical rework areas requiring immediate attention</p>
                </div>
              </div>
            </div>

            {/* Process Flow Information */}
            <div className="mt-6 p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
              <h4 className="text-md font-semibold text-slate-200 mb-3">Process Flow Overview</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
                <div>
                  <p className="font-medium text-cyan-400 mb-2">Main Stations:</p>
                  <ul className="space-y-1 text-xs">
                    <li>
                      • <strong>PFT:</strong> Pre-Final Testing station
                    </li>
                    <li>
                      • <strong>Rework Table:</strong> Manual repair and modification
                    </li>
                    <li>
                      • <strong>Shuttle Interior/Engine:</strong> Automated transport systems
                    </li>
                    <li>
                      • <strong>BTO:</strong> Build-to-Order processing
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-orange-400 mb-2">Board Types:</p>
                  <ul className="space-y-1 text-xs">
                    <li>
                      • <strong>Main Board:</strong> Primary circuit processing
                    </li>
                    <li>
                      • <strong>Sub Board:</strong> Secondary component handling
                    </li>
                    <li>
                      • <strong>MNHEV/PHEV:</strong> Hybrid vehicle components
                    </li>
                    <li>
                      • <strong>Expander:</strong> Capacity expansion modules
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Numbered Flow Points */}
            <div className="mt-4 p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
              <h4 className="text-md font-semibold text-slate-200 mb-3">Flow Sequence (1-10)</h4>
              <p className="text-sm text-slate-300">
                The numbered circles (1-10) indicate the sequential flow of materials through the rework process,
                ensuring proper routing from initial inspection through final quality control and packaging.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
