import React from 'react'

interface ChromosomeNode {
  name: string
  status: string
  color: string
}

interface Visualizer3DProps {
  chromosomes?: ChromosomeNode[]
}

const DEFAULT_CHROMOSOMES = [
  { name: "Authentication / Access Gene", status: "Active", color: "from-cyan-400 to-blue-500" },
  { name: "Transactional Ledger Gene", status: "Active", color: "from-emerald-400 to-teal-500" },
  { name: "Database Schema Gene", status: "Evolved", color: "from-purple-400 to-indigo-500" },
  { name: "Client Navigation Gene", status: "Mutated", color: "from-pink-400 to-rose-500" },
  { name: "Websocket Streams Gene", status: "Inactive", color: "from-amber-400 to-orange-500" }
]

export default function Visualizer3D({ chromosomes = DEFAULT_CHROMOSOMES }: Visualizer3DProps) {
  return (
    <div className="relative glass border border-white/5 bg-slate-950/60 rounded-2xl p-6 glow-cyan flex flex-col md:flex-row gap-8 items-center justify-between overflow-hidden min-h-[350px]">
      
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* SVG Double Helix */}
      <div className="relative w-full md:w-1/2 h-64 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 500 200">
          <defs>
            <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          
          {/* Render the overlapping strands */}
          {Array.from({ length: 15 }).map((_, idx) => {
            const x = 40 + idx * 30
            const phase = idx * 0.4
            
            return (
              <g key={idx}>
                {/* Connecting rungs */}
                <line
                  x1={x}
                  y1={100 + Math.sin(phase) * 50}
                  x2={x}
                  y2={100 - Math.sin(phase) * 50}
                  className="stroke-slate-700/60"
                  strokeWidth="2.5"
                  strokeDasharray="2,2"
                />
                
                {/* Strand Node A */}
                <circle
                  cx={x}
                  cy={100 + Math.sin(phase) * 50}
                  r="6.5"
                  fill="url(#cyanGrad)"
                  className="animate-pulse"
                  style={{ animationDelay: `${idx * 150}ms` }}
                />
                
                {/* Strand Node B */}
                <circle
                  cx={x}
                  cy={100 - Math.sin(phase) * 50}
                  r="6.5"
                  fill="url(#purpleGrad)"
                  className="animate-pulse"
                  style={{ animationDelay: `${idx * 150 + 200}ms` }}
                />
              </g>
            )
          })}
        </svg>
      </div>

      {/* Chromosome Information Details */}
      <div className="w-full md:w-1/2 flex flex-col gap-4 relative z-10">
        <div>
          <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">Chromosome Explorer</span>
          <h3 className="text-xl font-extrabold text-white mt-1">Evolved Software Gene Map</h3>
        </div>
        
        <div className="space-y-3 max-h-56 overflow-y-auto pr-2">
          {chromosomes.map((chr, i) => (
            <div key={i} className="flex items-center justify-between bg-slate-900/65 border border-white/5 p-3 rounded-lg hover:border-cyan-500/30 transition-all duration-300">
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${chr.color}`} />
                <span className="text-xs font-semibold text-slate-200">{chr.name}</span>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                {chr.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
