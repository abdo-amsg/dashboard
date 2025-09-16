import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Target, TrendingUp, BarChart3, LinkIcon, X, Info, ChevronRight } from "lucide-react"

const categoryConfig = {
  strategic: { color: "#10b981", textColor: "#ffffff", shape: "diamond" },
  managerial: { color: "#3b82f6", textColor: "#ffffff", shape: "hexagon" },
  operational: { color: "#f59e0b", textColor: "#ffffff", shape: "circle" },
}

const levelConfig = {
  strategic: { color: "#059669", textColor: "#ffffff", size: 160 },
  managerial: { color: "#2563eb", textColor: "#ffffff", size: 140 },
  operational: { color: "#d97706", textColor: "#ffffff", size: 120 },
}

const kpiData = [
  // Strategic KPIs (34 total) - top level
  {
    id: "s1",
    name: "Revenue Growth",
    description: "Year-over-year revenue growth percentage",
    category: "strategic",
    value: "15.2%",
    target: "12%",
    trend: "up",
    connectedTo: ["m1", "m2", "m3"],
  },
  {
    id: "s2",
    name: "Market Share",
    description: "Percentage of total market captured",
    category: "strategic",
    value: "23.5%",
    target: "25%",
    trend: "up",
    connectedTo: ["m4", "m5"],
  },
  {
    id: "s3",
    name: "Customer Lifetime Value",
    description: "Total value a customer brings over their lifetime",
    category: "strategic",
    value: "$2,450",
    target: "$2,200",
    trend: "up",
    connectedTo: ["m6", "m7", "m8"],
  },
  {
    id: "s4",
    name: "ROI",
    description: "Overall return on company investments",
    category: "strategic",
    value: "18.7%",
    target: "15%",
    trend: "up",
    connectedTo: ["m9", "m10"],
  },
  {
    id: "s5",
    name: "Brand Awareness",
    description: "Percentage of target market aware of brand",
    category: "strategic",
    value: "67%",
    target: "70%",
    trend: "stable",
  },
  // Generate more strategic KPIs
  ...Array.from({ length: 29 }, (_, i) => ({
    id: `s${i + 6}`,
    name: `Strategic KPI ${i + 6}`,
    description: `Strategic metric ${i + 6}`,
    category: "strategic",
    value: `${Math.floor(Math.random() * 100)}%`,
    target: `${Math.floor(Math.random() * 100)}%`,
    trend: ["up", "down", "stable"][Math.floor(Math.random() * 3)],
    connectedTo:
      Math.random() > 0.3
        ? [`m${Math.floor(Math.random() * 37) + 1}`, `m${Math.floor(Math.random() * 37) + 1}`]
        : undefined,
  })),

  // Managerial KPIs (37 total) - middle level
  {
    id: "m1",
    name: "Sales Performance",
    description: "Team sales achievement vs targets",
    category: "managerial",
    value: "112%",
    target: "100%",
    trend: "up",
    connectedTo: ["o1", "o2", "o3"],
  },
  {
    id: "m2",
    name: "Marketing ROI",
    description: "Return on marketing investments",
    category: "managerial",
    value: "4.2x",
    target: "3.5x",
    trend: "up",
    connectedTo: ["o4", "o5"],
  },
  {
    id: "m3",
    name: "Product Development",
    description: "New product launch success rate",
    category: "managerial",
    value: "78%",
    target: "75%",
    trend: "up",
    connectedTo: ["o6", "o7", "o8"],
  },
  {
    id: "m4",
    name: "Market Penetration",
    description: "Success in new market segments",
    category: "managerial",
    value: "34%",
    target: "30%",
    trend: "up",
    connectedTo: ["o9", "o10"],
  },
  {
    id: "m5",
    name: "Competitive Position",
    description: "Position relative to competitors",
    category: "managerial",
    value: "2nd",
    target: "Top 3",
    trend: "stable",
    connectedTo: ["o11", "o12"],
  },
  {
    id: "m6",
    name: "Customer Retention",
    description: "Rate of customer retention",
    category: "managerial",
    value: "89%",
    target: "85%",
    trend: "up",
    connectedTo: ["o13", "o14", "o15"],
  },
  {
    id: "m7",
    name: "Service Quality",
    description: "Overall service quality metrics",
    category: "managerial",
    value: "4.6/5",
    target: "4.5/5",
    trend: "up",
    connectedTo: ["o16", "o17"],
  },
  {
    id: "m8",
    name: "Cross-sell Success",
    description: "Success rate of cross-selling",
    category: "managerial",
    value: "23%",
    target: "20%",
    trend: "up",
    connectedTo: ["o18", "o19"],
  },
  {
    id: "m9",
    name: "Cost Management",
    description: "Operational cost efficiency",
    category: "managerial",
    value: "92%",
    target: "90%",
    trend: "up",
    connectedTo: ["o20", "o21", "o22"],
  },
  {
    id: "m10",
    name: "Resource Utilization",
    description: "Efficiency of resource usage",
    category: "managerial",
    value: "87%",
    target: "85%",
    trend: "up",
    connectedTo: ["o23", "o24"],
  },
  // Generate more managerial KPIs
  ...Array.from({ length: 27 }, (_, i) => ({
    id: `m${i + 11}`,
    name: `Managerial KPI ${i + 11}`,
    description: `Management metric ${i + 11}`,
    category: "managerial",
    value: `${Math.floor(Math.random() * 100)}%`,
    target: `${Math.floor(Math.random() * 100)}%`,
    trend: ["up", "down", "stable"][Math.floor(Math.random() * 3)],
    connectedTo:
      Math.random() > 0.2
        ? [`o${Math.floor(Math.random() * 42) + 1}`, `o${Math.floor(Math.random() * 42) + 1}`]
        : undefined,
  })),

  // Operational KPIs (42 total) - bottom level
  {
    id: "o1",
    name: "Lead Conversion Rate",
    description: "Rate of converting leads to customers",
    category: "operational",
    value: "12.3%",
    target: "10%",
    trend: "up",
  },
  {
    id: "o2",
    name: "Sales Cycle Length",
    description: "Average time to close a sale",
    category: "operational",
    value: "45 days",
    target: "50 days",
    trend: "up",
  },
  {
    id: "o3",
    name: "Deal Size",
    description: "Average deal value",
    category: "operational",
    value: "$15,200",
    target: "$12,000",
    trend: "up",
  },
  {
    id: "o4",
    name: "Website Traffic",
    description: "Monthly unique visitors",
    category: "operational",
    value: "125K",
    target: "100K",
    trend: "up",
  },
  {
    id: "o5",
    name: "Email Open Rate",
    description: "Email campaign open rate",
    category: "operational",
    value: "24.5%",
    target: "20%",
    trend: "up",
  },
  // Generate more operational KPIs
  ...Array.from({ length: 37 }, (_, i) => ({
    id: `o${i + 6}`,
    name: `Operational KPI ${i + 6}`,
    description: `Operational metric ${i + 6}`,
    category: "operational",
    value: `${Math.floor(Math.random() * 100)}%`,
    target: `${Math.floor(Math.random() * 100)}%`,
    trend: ["up", "down", "stable"][Math.floor(Math.random() * 3)]
  })),
]

export default function KPIMindmap() {
  const svgRef = useRef(null)
  const [selectedKPI, setSelectedKPI] = useState(null)
  const [highlightedNodes, setHighlightedNodes] = useState(new Set())
  const [isFilteredView, setIsFilteredView] = useState(false)
  const simulationRef = useRef(null)
  const [showInfoIcon, setShowInfoIcon] = useState(null)

  useEffect(() => {

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove() // cleanup before redraw


    // Zoom & Pan
    const g = svg.append("g")
    svg.call(
      d3.zoom()
        .scaleExtent([0.1, 3])
        .on("zoom", e => {
          g.attr("transform", e.transform)
        })
    )

    // Create level nodes
    const levelNodes = [
      { id: "level_strategic", name: "Strategic", category: "strategic", isLevel: true, count: kpiData.filter(d => d.category === "strategic").length },
      { id: "level_managerial", name: "Managerial", category: "managerial", isLevel: true, count: kpiData.filter(d => d.category === "managerial").length },
      { id: "level_operational", name: "Operational", category: "operational", isLevel: true, count: kpiData.filter(d => d.category === "operational").length }
    ]

    // Build graph data
    const nodes = [...levelNodes, ...kpiData.map(d => ({ ...d }))]
    const links = []

    // Add connections from level nodes to their KPIs
    kpiData.forEach(kpi => {
      links.push({
        source: `level_${kpi.category}`,
        target: kpi.id,
        isLevelConnection: true
      })

      // Add existing KPI to KPI connections
      if (kpi.connectedTo) {
        kpi.connectedTo.forEach(targetId => {
          if (kpiData.find(k => k.id === targetId)) {
            links.push({
              source: kpi.id,
              target: targetId,
              isLevelConnection: false
            })
          }
        })
      }
    })

    // Force Simulation with increased separation
    const simulation = d3
      .forceSimulation(nodes)
      .force("link", d3.forceLink(links)
        .id(d => d.id)
        .distance(d => d.isLevelConnection ? 200 : 120)) // Increased distance
      .force("charge", d3.forceManyBody()
        .strength(d => d.isLevel ? -1500 : -300)) // Stronger repulsion
      .force("center", d3.forceCenter(600, 400))
      .force("collision", d3.forceCollide()
        .radius(d => d.isLevel ? levelConfig[d.category].size / 2 + 20 : 30)) // Increased collision radius
      .force("x", d3.forceX()
        .strength(0.1)
        .x(d => {
          if (d.isLevel) {
            return d.category === "strategic" ? 200 :
              d.category === "managerial" ? 600 :
                1000;
          }
          return null;
        }))
      .force("y", d3.forceY()
        .strength(0.1)
        .y(d => {
          if (d.isLevel) return 400;
          // Add some vertical separation based on category
          if (d.category === "strategic") return 250
          if (d.category === "managerial") return 400
          return 550;
        }))

    simulationRef.current = simulation

    // Draw links
    const link = g
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", d => d.isLevelConnection ? "#666" : "#999")
      .attr("stroke-opacity", d => d.isLevelConnection ? 0.4 : 0.6)
      .attr("stroke-width", d => d.isLevelConnection ? 2 : 1.5)
      .attr("class", "link")

    // Create drag behavior
    const drag = d3.drag()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on("drag", (event, d) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
      })

    // Function to create different shapes
    const createShape = (selection, d) => {
      if (d.isLevel) {
        const size = levelConfig[d.category].size
        const color = levelConfig[d.category].color

        switch (d.category) {
          case "strategic":
            // Diamond shape
            selection.append("polygon")
              .attr("points", `0,${-size / 2} ${size / 2},0 0,${size / 2} ${-size / 2},0`)
              .attr("fill", color)
              .attr("stroke", "#fff")
              .attr("stroke-width", 3)
            break
          case "managerial":
            // Hexagon shape
            const hexPoints = []
            for (let i = 0; i < 6; i++) {
              const angle = (i * 60) * (Math.PI / 180)
              const x = (size / 2) * Math.cos(angle)
              const y = (size / 2) * Math.sin(angle)
              hexPoints.push(`${x},${y}`)
            }
            selection.append("polygon")
              .attr("points", hexPoints.join(" "))
              .attr("fill", color)
              .attr("stroke", "#fff")
              .attr("stroke-width", 3)
            break
          case "operational":
            // Circle shape
            selection.append("circle")
              .attr("r", size / 2)
              .attr("fill", color)
              .attr("stroke", "#fff")
              .attr("stroke-width", 3)
            break
        }
      } else {
        // Regular KPI rectangle
        selection.append("rect")
          .attr("rx", 8)
          .attr("ry", 8)
          .attr("width", Math.max(120, d.name.length * 8))
          .attr("height", 50)
          .attr("x", -Math.max(120, d.name.length * 8) / 2)
          .attr("y", -25)
          .attr("fill", categoryConfig[d.category].color)
          .attr("class", "kpi-node")
          .style("cursor", "pointer")
          .on("mouseover", () => setShowInfoIcon(d.id))
          .on("mouseout", () => setShowInfoIcon(null))
      }
    }

    // Draw nodes
    const node = g
      .selectAll("g.node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        if (!d.isLevel) {
          highlightConnectedNodes(d.id)
        }
      })
      .call(drag)

    // Create shapes based on node type
    node.each(function (d) {
      createShape(d3.select(this), d)
    })

    // Add info icon to KPI nodes
    node.filter(d => !d.isLevel)
      .append("g")
      .attr("class", "info-icon")
      .attr("transform", d => `translate(${Math.max(120, d.name.length * 8) / 2 - 15}, -10)`)
      .style("cursor", "pointer")
      .style("opacity", d => showInfoIcon === d.id ? 1 : 0.7)
      .on("click", (event, d) => {
        event.stopPropagation();
        setSelectedKPI(d);
      })
      .on("mouseover", (event, d) => {
        setShowInfoIcon(d.id);
      })
      .on("mouseout", () => {
        setShowInfoIcon(null);
      })
      .html(d => `
        <circle r="10" fill="white" />
        <text text-anchor="middle" alignment-baseline="middle" dy="0.1em" font-size="12px" font-weight="bold" fill="${categoryConfig[d.category].color}">i</text>
      `);

    // Add text to nodes
    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("fill", "#fff")
      .style("font-size", d => d.isLevel ? "16px" : "12px")
      .style("font-weight", d => d.isLevel ? "bold" : "normal")
      .text(d => d.isLevel ? d.name : d.name)

    // Add count to level nodes
    node
      .filter(d => d.isLevel)
      .append("text")
      .attr("text-anchor", "middle")
      .attr("y", d => d.category === "strategic" ? 35 : 30)
      .attr("fill", "#fff")
      .style("font-size", "12px")
      .text(d => `${d.count} KPIs`)

    // Update positions on tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y)

      node.attr("transform", d => `translate(${d.x},${d.y})`)
    })

    // Position level nodes initially
    nodes.forEach((d, i) => {
      if (d.isLevel) {
        d.x = 200 + (i * 400)
        d.y = 400
      }
    })

  }, [])

  useEffect(() => {
    d3.selectAll(".info-icon")
      .style("opacity", d => showInfoIcon === d.id ? 1 : 0.7);
  }, [showInfoIcon]);

  // Function to highlight connected nodes
  const highlightConnectedNodes = (nodeId) => {
    setIsFilteredView(true)

    // Find all connected nodes
    const connectedNodes = new Set([nodeId])
    const node = kpiData.find(n => n.id === nodeId)

    // Add nodes connected to this node
    if (node && node.connectedTo) {
      node.connectedTo.forEach(id => connectedNodes.add(id))
    }

    // Add nodes that connect to this node
    kpiData.forEach(n => {
      if (n.connectedTo && n.connectedTo.includes(nodeId)) {
        connectedNodes.add(n.id)
      }
    })

    setHighlightedNodes(connectedNodes)

    // Update the visualization
    d3.selectAll(".node")
      .transition()
      .duration(500)
      .style("opacity", d => connectedNodes.has(d.id) || d.isLevel ? 1 : 0.2)

    d3.selectAll(".link")
      .transition()
      .duration(500)
      .style("opacity", d => {
        const sourceId = typeof d.source === 'object' ? d.source.id : d.source
        const targetId = typeof d.target === 'object' ? d.target.id : d.target
        return connectedNodes.has(sourceId) && connectedNodes.has(targetId) ? 0.8 : 0.1
      })
  }

  // Function to reset the view
  const resetView = () => {
    setIsFilteredView(false)
    setHighlightedNodes(new Set())

    d3.selectAll(".node")
      .transition()
      .duration(500)
      .style("opacity", 1)

    d3.selectAll(".link")
      .transition()
      .duration(500)
      .style("opacity", d => d.isLevelConnection ? 0.4 : 0.6)
  }

  return (
    <div className="p-4 space-y-4 bg-slate-50 min-h-screen">
      <div className="bg-white rounded-lg p-6 shadow-md border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-600" />
            KPI Hierarchy Mindmap
          </h2>
          {isFilteredView && (
            <Button onClick={resetView} variant="outline" size="sm" className="flex items-center gap-2">
              <X className="w-4 h-4" />
              Reset View
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-600 transform rotate-45"></div>
            <span>Strategic Level</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}></div>
            <span>Managerial Level</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-600 rounded-full"></div>
            <span>Operational Level</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Click the "i" icon for details</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-500 mb-2">
          <p>
            Click on any KPI to see its connections. Level nodes control their connected KPIs.
          </p>
          <p>
            Hover over KPIs to see the info icon, then click it to view details without affecting connections.
          </p>
        </div>

        {isFilteredView && (
          <div className="bg-blue-50 p-3 rounded-md border border-blue-200 flex items-start gap-3">
            <LinkIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-700">
              Showing connections for <span className="font-semibold">{kpiData.find(k => k.id === Array.from(highlightedNodes)[0])?.name}</span>.
              Click "Reset View" to see all KPIs.
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg p-4 shadow-md border">
        <svg ref={svgRef} width={1200} height={800} className="w-full"></svg>
      </div>

      {/* KPI Detail Dialog */}
      <Dialog open={!!selectedKPI} onOpenChange={() => setSelectedKPI(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedKPI?.name}
              <Badge
                variant="secondary"
                className={
                  selectedKPI?.category === "strategic" ? "bg-emerald-100 text-emerald-800" :
                    selectedKPI?.category === "managerial" ? "bg-blue-100 text-blue-800" :
                      "bg-amber-100 text-amber-800"
                }
              >
                {selectedKPI?.category}
              </Badge>
            </DialogTitle>
            <DialogDescription>{selectedKPI?.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-slate-700">Current Value</p>
                <p className="text-xl font-semibold text-green-600 mt-1">{selectedKPI?.value}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-slate-700">Target</p>
                <p className="text-xl font-semibold text-blue-600 mt-1">{selectedKPI?.target}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-slate-700">Trend</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${selectedKPI?.trend === 'up' ? 'bg-green-100 text-green-800' :
                selectedKPI?.trend === 'down' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                {selectedKPI?.trend === 'up' ? '↗️ Improving' :
                  selectedKPI?.trend === 'down' ? '↘️ Declining' : '→ Stable'}
              </span>
            </div>

            {selectedKPI?.connectedTo && selectedKPI.connectedTo.length > 0 && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-slate-700 mb-2">Connected To</p>
                <div className="flex flex-wrap gap-2">
                  {selectedKPI.connectedTo.map(id => {
                    const connectedKPI = kpiData.find(k => k.id === id)
                    return connectedKPI ? (
                      <Badge
                        key={id}
                        variant="outline"
                        className="cursor-pointer hover:bg-slate-200"
                        onClick={() => {
                          setSelectedKPI(connectedKPI)
                          highlightConnectedNodes(connectedKPI.id)
                        }}
                      >
                        {connectedKPI.name}
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </Badge>
                    ) : null
                  })}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}