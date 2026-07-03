'use client'

import React, { useEffect, useState } from 'react'
import { Dna, HelpCircle, Download, Sparkles, AlertTriangle, Layers } from 'lucide-react'

import { fetchApplications, evolveGenome, getExportZipUrl } from '../../lib/api'
import ScoreDial from '../../components/ScoreDial'

export default function EvolutionPage() {
  const [apps, setApps] = useState<any[]>([])
  const [selectedParentIds, setSelectedParentIds] = useState<string[]>([])
  const [targetName, setTargetName] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchApplications().then(data => {
      setApps(data)
    })
  }, [])

  const handleParentToggle = (appId: string) => {
    if (selectedParentIds.includes(appId)) {
      setSelectedParentIds(selectedParentIds.filter(id => id !== appId))
    } else {
      setSelectedParentIds([...selectedParentIds, appId])
    }
  }

  const handleEvolve = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedParentIds.length === 0) {
      setError('Select at least one parent application genome to merge')
      return
    }
    if (!targetName) {
      setError('Please provide a name for your evolved hybrid platform')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)
    setProgress(15)
    setStatusText('Aligning parent chromosome maps...')

    const steps = [
      { p: 40, text: 'Identifying overlapping UX navigation pathways...' },
      { p: 70, text: 'Resolving database schema dependencies and table crossovers...' },
      { p: 90, text: 'Injecting mutations for offline support and key security standards...' }
    ]

    let stepIdx = 0
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        setProgress(steps[stepIdx].p)
        setStatusText(steps[stepIdx].text)
        stepIdx++
      }
    }, 900)

    try {
      const recombRecord = await evolveGenome(selectedParentIds, targetName)
      clearInterval(interval)
      setProgress(100)
      setStatusText('Recombination and evolution successful!')
      setResult(recombRecord)
    } catch (err: any) {
      clearInterval(interval)
      setError(err.message || 'Failed to recombine genomes. Make sure parents are selected.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase flex items-center gap-1.5">
          <Dna className="w-3.5 h-3.5" /> Recombination Sandbox
        </span>
        <h2 className="text-3xl font-black text-white mt-1">Cross-Over Software Genomes</h2>
        <p className="text-slate-400 text-xs mt-2">
          Select multiple application genomes, specify target details, and trigger the evolution engine. 
          The AI will automatically cross over workflows, design systems, and APIs to synthesize an entirely new application.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Selection panel */}
        <div className="lg:col-span-1 glass p-6 rounded-2xl border border-white/5 bg-slate-950/30 flex flex-col justify-between">
          <form onSubmit={handleEvolve} className="space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-300 font-mono">1. Select Parent Genomes</span>
              {apps.length === 0 ? (
                <p className="text-xs font-mono text-slate-500 py-4">No applications registered. Ingest first.</p>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-2">
                  {apps.map(app => (
                    <label
                      key={app.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedParentIds.includes(app.id)
                          ? 'bg-cyan-950/20 border-cyan-500/50 text-white'
                          : 'bg-slate-900/40 border-white/5 text-slate-400 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedParentIds.includes(app.id)}
                          onChange={() => handleParentToggle(app.id)}
                          className="accent-cyan-500 hidden"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">{app.name}</span>
                          <span className="text-[9px] font-mono text-slate-500">{app.framework}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400">🧬</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 font-mono block">2. Evolved App Title</label>
              <input
                type="text"
                placeholder="e.g. Social Commerce Gateway"
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-950/30 border border-red-900/30 text-red-400 text-xs rounded-xl font-mono">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || selectedParentIds.length === 0}
              className="w-full bg-gradient-to-r from-cyan-400 to-violet-600 text-slate-950 font-black py-3.5 rounded-xl text-xs font-mono tracking-wider transition-all hover:scale-[1.01] flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10"
            >
              {loading ? 'Synthesizing...' : 'EVOLVE HYBRID SPECIES'} <Sparkles className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Progress and Results panel */}
        <div className="lg:col-span-2 space-y-6">
          {loading && (
            <div className="glass p-8 rounded-2xl border border-white/5 bg-slate-950/20 text-center space-y-6">
              <div className="w-12 h-12 rounded-full border-4 border-t-cyan-500 border-r-transparent border-slate-800 animate-spin mx-auto" />
              <div className="space-y-2">
                <p className="text-sm font-mono text-cyan-400 animate-pulse">{statusText}</p>
                <div className="max-w-xs h-1.5 bg-slate-900 rounded-full overflow-hidden mx-auto">
                  <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          )}

          {!loading && !result && (
            <div className="glass p-12 border border-white/5 rounded-2xl text-center space-y-4 bg-slate-950/20 min-h-[350px] flex flex-col items-center justify-center">
              <HelpCircle className="w-12 h-12 text-slate-700" />
              <p className="text-slate-500 text-xs font-mono max-w-sm leading-relaxed">
                Configure your parents on the left and trigger evolution. The evolved features and download packages will appear here.
              </p>
            </div>
          )}

          {!loading && result && (
            <div className="space-y-6">
              {/* Overall Info */}
              <div className="glass p-6 border border-cyan-500/20 bg-cyan-950/5 rounded-2xl space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">Evolved Application DNA</span>
                    <h3 className="text-xl font-extrabold text-white mt-1">{result.name}</h3>
                  </div>
                  <a
                    href={getExportZipUrl(result.id)}
                    download
                    className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs font-mono transition flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
                  >
                    <Download className="w-4 h-4" /> EXPORT PROJECT ZIP
                  </a>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  {result.description}
                </p>
              </div>

              {/* Dials Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ScoreDial score={result.score_innovation} label="Innovation" colorClass="stroke-cyan-400" />
                <ScoreDial score={result.score_security} label="Security" colorClass="stroke-rose-400" />
                <ScoreDial score={result.score_scalability} label="Scalability" colorClass="stroke-violet-400" />
                <ScoreDial score={result.score_maintainability} label="Cohesive" colorClass="stroke-emerald-400" />
              </div>

              {/* Mutated Genes List */}
              <div className="glass p-6 border border-white/5 bg-slate-950/45 rounded-2xl space-y-4">
                <h4 className="text-sm font-extrabold text-white font-mono tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-violet-400" /> ACTIVE CHROMOSOMES INJECTED
                </h4>
                <div className="space-y-3">
                  {result.mutations.map((m: any, idx: number) => (
                    <div key={idx} className="bg-slate-900/50 border border-white/5 p-4 rounded-xl space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs font-extrabold text-slate-200">{m.name}</span>
                        <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {m.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {m.description}
                      </p>
                      <div className="text-[9px] text-cyan-400 font-mono">
                        Mutation Strategy: {m.mutation_applied}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  )
}
