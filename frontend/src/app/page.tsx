'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Dna, Plus, Network, PlayCircle, Library, Cpu, FileText } from 'lucide-react'
import { fetchApplications } from '../lib/api'

interface ApplicationItem {
  id: string
  name: string
  tagline: string
  language: string
  framework: string
  genome_score: number
  path_or_url: string
}

export default function DashboardPage() {
  const [apps, setApps] = useState<ApplicationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchApplications()
      .then(data => {
        setApps(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError('Ensure the FastAPI backend server is running on http://127.0.0.1:8000')
        setLoading(false)
      })
  }, [])

  return (
    <div className="space-y-12">
      {/* Banner / Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 border border-white/5 px-8 py-12 md:p-16 glow-cyan">
        {/* Background gradient bulb */}
        <div className="absolute right-0 top-0 -mt-20 -mr-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-20 w-80 h-80 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-6">
          <span className="text-xs uppercase font-mono tracking-widest text-cyan-400 font-bold bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-800/40">
            Open-Source Software Genetics
          </span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-white">
            Decode software.<br />
            Learn its DNA.<br />
            Create entirely new software.
          </h2>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Universal Application Genome is an AI-powered code analysis and recombination platform. 
            It crawls directories, parses symbols into code genes, constructs application genome graphs, and simulations before evolving hybrid software.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/ingest"
              className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-950 font-extrabold px-6 py-3 rounded-xl text-sm transition-all duration-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> INGEST CODEBASE
            </Link>
            <Link
              href="/evolution"
              className="bg-slate-950 hover:bg-slate-900 border border-white/10 text-white font-bold px-6 py-3 rounded-xl text-sm transition flex items-center gap-2"
            >
              <Dna className="w-4 h-4" /> RECOMBINATION SANDBOX
            </Link>
          </div>
        </div>
      </section>

      {/* Main Grid: Statistics & Active List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Metric widgets */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass p-6 rounded-2xl border border-white/5 bg-slate-950/45 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Active Genomes</span>
              <p className="text-3xl font-black font-mono text-cyan-400 mt-1">{apps.length}</p>
            </div>
            <Library className="w-8 h-8 text-slate-600" />
          </div>
          
          <div className="glass p-6 rounded-2xl border border-white/5 bg-slate-950/45 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Genes Catalogued</span>
              <p className="text-3xl font-black font-mono text-violet-400 mt-1">{apps.length * 4}</p>
            </div>
            <Cpu className="w-8 h-8 text-slate-600" />
          </div>
          
          <div className="glass p-6 rounded-2xl border border-white/5 bg-slate-950/45 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Evolved Species</span>
              <p className="text-3xl font-black font-mono text-pink-400 mt-1">
                {apps.filter(a => a.path_or_url.startsWith('evolved://')).length}
              </p>
            </div>
            <Dna className="w-8 h-8 text-slate-600" />
          </div>
        </div>

        {/* Applications List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold tracking-wide text-white">DECODED GENOMES DIRECTORY</h3>
            <span className="text-xs text-slate-500 font-mono">{apps.length} items loaded</span>
          </div>

          {error && (
            <div className="p-4 bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 rounded-xl text-xs font-mono">
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div className="py-20 text-center font-mono text-xs text-slate-500">
              Retrieving software genome inventory...
            </div>
          ) : apps.length === 0 ? (
            <div className="glass border border-white/5 rounded-2xl p-12 text-center space-y-4 bg-slate-950/20">
              <p className="text-slate-500 text-xs font-mono">Genome registry is empty. Ingest repositories to build chromosomes.</p>
              <Link
                href="/ingest"
                className="inline-block bg-slate-900 border border-white/10 hover:border-cyan-500/40 text-cyan-400 text-xs px-4 py-2 rounded-lg transition font-mono"
              >
                + Ingest First Codebase
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {apps.map(app => (
                <div
                  key={app.id}
                  className="glass border border-white/5 hover:border-cyan-500/30 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 group hover:shadow-lg hover:shadow-cyan-950/20 bg-slate-950/30"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase bg-slate-900 border border-slate-800 text-slate-400">
                        {app.language}
                      </span>
                      <span className="text-xs font-bold font-mono text-cyan-400">
                        🧬 {app.genome_score.toFixed(1)}
                      </span>
                    </div>
                    
                    <h4 className="text-base font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                      {app.name}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {app.tagline || 'Standard project DNA'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                    <span className="text-[10px] text-slate-600 font-mono truncate max-w-[130px]">
                      {app.framework}
                    </span>
                    
                    <div className="flex gap-2">
                      <Link
                        href={`/genome-graph?app_id=${app.id}`}
                        className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/5 p-2 rounded-lg transition"
                        title="Explore Genome Graph"
                      >
                        <Network className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={`/simulation?app_id=${app.id}`}
                        className="bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-white/5 p-2 rounded-lg transition"
                        title="Run AI Simulations"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
