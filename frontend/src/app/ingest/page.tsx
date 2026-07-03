'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Compass, Sparkles, FolderOpen, ArrowRight, CheckCircle2 } from 'lucide-react'
import { ingestRepository } from '../../lib/api'

export default function IngestPage() {
  const router = useRouter()
  
  const [name, setName] = useState('')
  const [path, setPath] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !path) {
      setError('Please provide both application name and project directory path')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)
    setProgress(10)
    setStatusText('Locating file path systems...')

    // Simulate analysis stages
    const steps = [
      { p: 25, text: 'Scanning file directories and folder tree structures...' },
      { p: 50, text: 'Running AST parsing and syntax grammar classifications...' },
      { p: 75, text: 'Extracting semantic genes & generating architecture relations...' },
      { p: 90, text: 'Finishing genome database records compiling...' }
    ]

    let currentStepIdx = 0
    const interval = setInterval(() => {
      if (currentStepIdx < steps.length) {
        setProgress(steps[currentStepIdx].p)
        setStatusText(steps[currentStepIdx].text)
        currentStepIdx++
      }
    }, 800)

    try {
      const appRecord = await ingestRepository(path, name)
      clearInterval(interval)
      setProgress(100)
      setStatusText('Analysis completed successfully!')
      setResult(appRecord)
    } catch (err: any) {
      clearInterval(interval)
      setError(err.message || 'Failed to scan repository. Ensure path is correct and backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5" /> Ingestion Port
        </span>
        <h2 className="text-3xl font-black text-white mt-1">Decode Codebase DNA</h2>
        <p className="text-slate-400 text-xs mt-2">
          Point UAG to a local project directory or select a template repository to discover modules, code blocks, libraries, and features.
        </p>
      </div>

      {/* Ingest Form */}
      <div className="glass p-8 rounded-2xl border border-white/5 bg-slate-950/30">
        <form onSubmit={handleIngest} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 font-mono">Application Name</label>
              <input
                type="text"
                placeholder="e.g. Ridesharing Gateway"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 font-mono">Repository / Directory Path</label>
              <input
                type="text"
                placeholder="e.g. d:/projects/rideshare-app (or any path for mock)"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-950/30 border border-red-900/30 text-red-400 text-xs rounded-xl font-mono">
              ⚠️ {error}
            </div>
          )}

          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={() => {
                setName('Food Delivery Platform')
                setPath('mock://food-delivery')
              }}
              disabled={loading}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono transition"
            >
              Use Template: Food Delivery
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black px-6 py-3 rounded-xl text-sm transition-all hover:scale-[1.02] flex items-center gap-2 shadow-lg shadow-cyan-500/10"
            >
              {loading ? 'Decoding...' : 'DECODE GENOME'} <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Progress Telemetry */}
      {loading && (
        <div className="glass p-6 rounded-2xl border border-white/5 bg-slate-950/20 space-y-4">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400 animate-pulse">{statusText}</span>
            <span className="text-cyan-400">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Result Presentation */}
      {result && progress === 100 && (
        <div className="glass p-8 rounded-2xl border border-cyan-500/20 bg-cyan-950/5 space-y-6 glow-cyan">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Genome Decoded Successfully!</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="bg-slate-950/45 p-4 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Identified Language</span>
              <span className="text-base font-extrabold text-slate-200 mt-1 block">{result.language}</span>
            </div>
            
            <div className="bg-slate-950/45 p-4 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Framework</span>
              <span className="text-base font-extrabold text-slate-200 mt-1 block">{result.framework}</span>
            </div>
            
            <div className="bg-slate-950/45 p-4 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Extracted Chromosomes</span>
              <span className="text-base font-extrabold text-cyan-400 mt-1 block">🧬 {result.genome_score.toFixed(1)} score</span>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
            <button
              onClick={() => router.push(`/genome-graph?app_id=${result.id}`)}
              className="bg-slate-900 border border-white/10 hover:border-cyan-500/40 text-cyan-400 font-bold px-5 py-2.5 rounded-xl text-xs font-mono transition flex items-center gap-1.5"
            >
              EXPLORE GENOME GRAPH <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
