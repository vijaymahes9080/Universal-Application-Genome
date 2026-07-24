'use client'

import React, { useEffect, useState } from 'react'
import { Award, Compass, Cpu, HelpCircle, Leaf, ShieldCheck, GitBranch, Zap } from 'lucide-react'
import { fetchApplications, fetchApplicationDetails } from '../../lib/api'
import TimelineView from '../../components/TimelineView'


export default function ResearchPage() {
  const [apps, setApps] = useState<any[]>([])
  const [selectedAppId, setSelectedAppId] = useState('')
  const [appDetails, setAppDetails] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  
  // Evolved history list
  const [timelineItems, setTimelineItems] = useState<any[]>([])

  useEffect(() => {
    fetchApplications().then(data => {
      setApps(data)
      if (data.length > 0) {
        setSelectedAppId(data[0].id)
      }
    })
  }, [])

  useEffect(() => {
    if (!selectedAppId) return
    setLoading(true)
    fetchApplicationDetails(selectedAppId)
      .then(data => {
        setAppDetails(data)
        setLoading(false)
        
        // Build mock history timeline
        const createdTime = new Date(data.application.created_at).toLocaleString()
        const items = [
          {
            id: '1',
            title: `Species Discovered: ${data.species}`,
            description: `Aggregated structural analysis completed. catalogued framework: ${data.application.framework} and base language ${data.application.language}.`,
            timestamp: createdTime,
            type: 'ingest',
            meta: `Dependencies catalogued: ${data.genes.length} elements`
          }
        ]
        
        // If app is evolved, add recombination details
        if (data.application.path_or_url.startsWith('evolved://')) {
          items.unshift({
            id: '2',
            title: `Genome Recombination Crossover`,
            description: `Evolved from parent nodes. Merged database query handlers and resolved API endpoint specifications.`,
            timestamp: createdTime,
            type: 'recombine',
            meta: `Mutation strategy: Injected offline hooks & biometric standards`
          })
          items.unshift({
            id: '3',
            title: `Gene Mutation Sequence Applied`,
            description: `Mutated UX styling components to utilize dynamic layout routing and consolidated JWT access levels.`,
            timestamp: createdTime,
            type: 'mutate',
            meta: `Vulnerability threshold reduced by 15%`
          })
        }
        
        setTimelineItems(items)
      })
      .catch(() => setLoading(false))
  }, [selectedAppId])

  // Patent analysis details
  const getPatentSimilarity = (score: number) => {
    if (score > 8) return { pct: 18, risk: "Low Risk", color: "text-emerald-400" }
    if (score > 5) return { pct: 45, risk: "Moderate Risk", color: "text-amber-400" }
    return { pct: 78, risk: "High Risk (Overlap with typical boilerplate)", color: "text-rose-400" }
  }
  const patent = getPatentSimilarity(appDetails?.application.genome_score || 0)

  // Sustainability score
  const getSustainabilityMetric = (framework: string) => {
    const fw = framework.toLowerCase()
    if (fw.includes("fastapi") || fw.includes("go")) return { score: 92, label: "A - Excellent energy efficiency", color: "text-emerald-400" }
    if (fw.includes("next")) return { score: 75, label: "B - Moderate energy efficiency", color: "text-cyan-400" }
    return { score: 55, label: "C - Standard footprint", color: "text-amber-400" }
  }
  const sustainability = getSustainabilityMetric(appDetails?.application.framework || "")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" /> Bonus Phase
          </span>
          <h2 className="text-3xl font-black text-white mt-1">Software Species Research Lab</h2>
        </div>

        <select
          value={selectedAppId}
          onChange={(e) => setSelectedAppId(e.target.value)}
          className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50 min-w-[200px]"
        >
          {apps.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="py-24 text-center text-xs font-mono text-slate-500">
          Compiling species classifications...
        </div>
      ) : !appDetails ? (
        <div className="glass p-12 text-center text-xs font-mono text-slate-500 flex flex-col items-center justify-center min-h-[300px] gap-3">
          <HelpCircle className="w-12 h-12 text-slate-700" />
          <p>Please ingest or evolve a codebase to begin taxonomy research.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Species Stats & Patent checkers */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Classification */}
            <div className="glass p-6 border border-white/5 bg-slate-950/45 rounded-2xl space-y-4">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block">Software Species Taxonomy</span>
              <div className="flex items-center gap-3">
                <Cpu className="w-6 h-6 text-cyan-400" />
                <div>
                  <h4 className="text-base font-extrabold text-white">{appDetails.species}</h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Primary language: {appDetails.application.language}</p>
                </div>
              </div>
            </div>

            {/* Patent Similarity */}
            <div className="glass p-6 border border-white/5 bg-slate-950/45 rounded-2xl space-y-4">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block">Patent Similarity Checker</span>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300">Base Boilerplate Overlap</span>
                  <span className={patent.color}>{patent.pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-current ${patent.color}`}
                    style={{ width: `${patent.pct}%` }}
                  />
                </div>
                <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  Status: {patent.risk}
                </div>
              </div>
            </div>

            {/* Sustainability Rating */}
            <div className="glass p-6 border border-white/5 bg-slate-950/45 rounded-2xl space-y-4">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block">Sustainability Score (Green Computing)</span>
              <div className="flex items-center gap-4">
                <Leaf className="w-8 h-8 text-emerald-400" />
                <div>
                  <div className="text-lg font-mono font-black text-slate-200">{sustainability.score} / 100</div>
                  <div className="text-[10px] text-slate-500 font-mono">{sustainability.label}</div>
                </div>
              </div>
            </div>

            {/* Ancestry tree */}
            {appDetails.application.path_or_url.startsWith('evolved://') && (
              <div className="glass p-6 border border-white/5 bg-slate-950/45 rounded-2xl space-y-4">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block">Application Family Tree</span>
                <div className="space-y-4 border-l border-cyan-500/20 pl-4 ml-2">
                  <div className="relative text-xs">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-900 border border-cyan-400" />
                    <span className="font-bold text-slate-300">Parent app: Ingested Template</span>
                  </div>
                  <div className="relative text-xs">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <span className="font-extrabold text-cyan-400">Offspring app: {appDetails.application.name}</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Timeline Evolution logger */}
          <div className="lg:col-span-2 glass p-6 border border-white/5 bg-slate-950/20 rounded-2xl space-y-6">
            <h3 className="text-lg font-bold text-white font-mono tracking-wider flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-cyan-400" /> SOFTWARE EVOLUTION HISTORY LOG
            </h3>
            
            <TimelineView items={timelineItems} />
          </div>

        </div>
      )}
    </div>
  )
}

