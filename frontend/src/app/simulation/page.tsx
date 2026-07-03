'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Activity, ShieldAlert, Cpu, HeartCrack, Sparkles, HelpCircle } from 'lucide-react'

import { fetchApplications, runSimulations, fetchSimulations } from '../../lib/api'

function SimulationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const appIdParam = searchParams.get('app_id')

  const [apps, setApps] = useState<any[]>([])
  const [selectedAppId, setSelectedAppId] = useState('')
  const [sims, setSims] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [running, setRunning] = useState(false)
  const [activeSimIndex, setActiveSimIndex] = useState(0)

  useEffect(() => {
    fetchApplications().then(data => {
      setApps(data)
      if (appIdParam) {
        setSelectedAppId(appIdParam)
      } else if (data.length > 0) {
        setSelectedAppId(data[0].id)
      }
    })
  }, [appIdParam])

  useEffect(() => {
    if (!selectedAppId) return
    setLoading(true)
    fetchSimulations(selectedAppId)
      .then(data => {
        setSims(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [selectedAppId])

  const handleRunSimulations = async () => {
    if (!selectedAppId) return
    setRunning(true)
    try {
      const data = await runSimulations(selectedAppId)
      setSims(data)
      setActiveSimIndex(0)
    } catch (err) {
      console.error(err)
    } finally {
      setRunning(false)
    }
  }

  const activeSim = sims[activeSimIndex]

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" /> Simulation Lab
          </span>
          <h2 className="text-3xl font-black text-white mt-1">Application Sandbox Simulator</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedAppId}
            onChange={(e) => {
              setSelectedAppId(e.target.value)
              router.push(`/simulation?app_id=${e.target.value}`)
            }}
            className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
          >
            {apps.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>

          <button
            onClick={handleRunSimulations}
            disabled={running || !selectedAppId}
            className="bg-gradient-to-r from-cyan-400 to-indigo-600 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs font-mono transition-all hover:scale-[1.02] flex items-center gap-1.5 shadow-lg shadow-cyan-500/10"
          >
            {running ? 'Running Monte Carlo...' : 'RUN SIMULATIONS'} <Sparkles className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-xs font-mono text-slate-500">
          Gathering past telemetry profiles...
        </div>
      ) : sims.length === 0 ? (
        <div className="glass p-12 text-center text-xs font-mono text-slate-500 flex flex-col items-center justify-center min-h-[300px] gap-3">
          <HelpCircle className="w-12 h-12 text-slate-700" />
          <p className="max-w-xs">No simulations run yet for this application genome. Click the run button above to trigger simulation checks.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar tabs */}
          <div className="lg:col-span-1 flex flex-col gap-3">
            {sims.map((sim, idx) => (
              <button
                key={sim.id}
                onClick={() => setActiveSimIndex(idx)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  activeSimIndex === idx
                    ? 'bg-cyan-950/20 border-cyan-500/40 text-white'
                    : 'bg-slate-900/40 border-white/5 text-slate-400 hover:border-white/10'
                }`}
              >
                <div className="text-[10px] uppercase font-mono tracking-widest text-slate-500">
                  {sim.simulation_type} Check
                </div>
                <div className="text-xs font-bold mt-1 truncate">{sim.name}</div>
              </button>
            ))}
          </div>

          {/* Active Sim details */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Top Telemetry Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="glass bg-slate-950/45 p-5 rounded-2xl border border-white/5">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Failure Rate</span>
                <span className="text-xl font-mono font-black text-rose-400 mt-1 block">{activeSim?.failure_rate}%</span>
              </div>
              
              <div className="glass bg-slate-950/45 p-5 rounded-2xl border border-white/5">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Predicted Bugs</span>
                <span className="text-xl font-mono font-black text-amber-400 mt-1 block">{activeSim?.predicted_bugs}</span>
              </div>
              
              <div className="glass bg-slate-950/45 p-5 rounded-2xl border border-white/5">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Frustration Index</span>
                <span className="text-xl font-mono font-black text-violet-400 mt-1 block">{activeSim?.frustration_index} / 10</span>
              </div>

              <div className="glass bg-slate-950/45 p-5 rounded-2xl border border-white/5">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Peak Latency</span>
                <span className="text-xl font-mono font-black text-cyan-400 mt-1 block">{activeSim?.latency_ms} ms</span>
              </div>
            </div>

            {/* Run steps list */}
            <div className="glass p-6 border border-white/5 bg-slate-950/30 rounded-2xl space-y-4">
              <h4 className="text-sm font-extrabold text-white font-mono tracking-wider">
                SIMULATION EVENT LOGS (1000 TRIALS)
              </h4>
              
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {activeSim?.logs.map((log: any, idx: number) => (
                  <div key={idx} className="bg-slate-900/50 border border-white/5 p-4 rounded-xl flex items-center justify-between text-xs">
                    {/* Render different styles per log structure */}
                    <div className="space-y-1">
                      {log.step && <div className="font-extrabold text-slate-200">{log.step}</div>}
                      {log.concurrency && <div className="font-extrabold text-slate-200">Load Concurrency: {log.concurrency} users</div>}
                      {log.attack_vector && <div className="font-extrabold text-slate-200">Vector: {log.attack_vector}</div>}
                      
                      {log.active_users !== undefined && (
                        <div className="text-[10px] text-slate-500 font-mono">Active Sessions: {log.active_users} (Dropped: {log.dropped_users})</div>
                      )}
                      {log.cpu_load_pct !== undefined && (
                        <div className="text-[10px] text-slate-500 font-mono">CPU Load: {log.cpu_load_pct}% | Memory: {log.memory_usage_mb}MB</div>
                      )}
                      {log.payload_signature && (
                        <div className="text-[10px] text-slate-500 font-mono">Payload Sample: {log.payload_signature}</div>
                      )}
                    </div>

                    <div className="text-right space-y-1">
                      {log.latency_ms !== undefined && (
                        <div className="text-[10px] font-mono text-cyan-400">{log.latency_ms} ms response</div>
                      )}
                      <span className={`text-[10px] uppercase font-mono px-2.5 py-0.5 rounded border ${
                        log.status === 'Success' || log.status === 'Healthy' || log.status?.startsWith('Blocked')
                          ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-400'
                          : 'bg-rose-950/20 border-rose-800/40 text-rose-400'
                      }`}>
                        {log.status || log.severity || 'Executed'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

export default function SimulationPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-xs font-mono text-slate-500">Loading simulation dashboard...</div>}>
      <SimulationContent />
    </Suspense>
  )
}
