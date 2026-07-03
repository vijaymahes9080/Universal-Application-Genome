'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Network, FileCode, HelpCircle, ShieldAlert, Zap, Cpu } from 'lucide-react'
import Editor from '@monaco-editor/react'

import { fetchApplications, fetchApplicationDetails, fetchApplicationGraph, fetchAIExplanation } from '../../lib/api'
import GenomeGraphView from '../../components/GenomeGraphView'

function GenomeGraphContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const appIdParam = searchParams.get('app_id')

  const [apps, setApps] = useState<any[]>([])
  const [selectedAppId, setSelectedAppId] = useState<string>('')
  const [appDetails, setAppDetails] = useState<any>(null)
  const [graphElements, setGraphElements] = useState<any[]>([])
  const [aiExplanation, setAiExplanation] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [explaining, setExplaining] = useState(false)

  // Monaco Editor state
  const [selectedNode, setSelectedNode] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'details' | 'code' | 'ai'>('details')

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
    setSelectedNode(null)
    setActiveTab('details')

    Promise.all([
      fetchApplicationDetails(selectedAppId),
      fetchApplicationGraph(selectedAppId, 'cytoscape')
    ])
      .then(([details, graph]) => {
        setAppDetails(details)
        setGraphElements(graph)
        setLoading(false)
        
        // Fetch AI Explanation
        setExplaining(true)
        fetchAIExplanation(selectedAppId)
          .then(explanationData => {
            setAiExplanation(explanationData.explanation)
            setExplaining(false)
          })
          .catch(() => setExplaining(false))
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [selectedAppId])

  const handleNodeSelect = (nodeData: any) => {
    setSelectedNode(nodeData)
    // Automatically switch tabs depending on type
    if (nodeData.code) {
      setActiveTab('code')
    } else {
      setActiveTab('details')
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5" /> Phase 3
          </span>
          <h2 className="text-3xl font-black text-white mt-1">Software Genome Graph</h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400 font-mono">Select Target:</span>
          <select
            value={selectedAppId}
            onChange={(e) => {
              setSelectedAppId(e.target.value)
              router.push(`/genome-graph?app_id=${e.target.value}`)
            }}
            className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50 min-w-[200px]"
          >
            {apps.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-32 text-center text-xs font-mono text-slate-500">
          Loading codebase graph and building clusters...
        </div>
      ) : !appDetails ? (
        <div className="glass p-12 text-center text-xs font-mono text-slate-500">
          No genomes decoded yet. Please head to the Ingestion portal to begin.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Cytoscape Graph Area */}
          <div className="lg:col-span-2 glass border border-white/5 bg-slate-950/45 rounded-2xl p-4 min-h-[550px] relative overflow-hidden flex flex-col justify-between">
            <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-2 px-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                Visualizing Chromosome Hierarchy
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase bg-slate-900 border border-slate-800 text-slate-400">
                {appDetails.species}
              </span>
            </div>
            
            <div className="flex-1 w-full h-full relative">
              <GenomeGraphView elements={graphElements} onNodeSelect={handleNodeSelect} />
            </div>
          </div>

          {/* Details / Editor Inspector Side Drawer */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Upper Tab controllers */}
            <div className="glass border border-white/5 bg-slate-950/30 rounded-2xl overflow-hidden flex flex-col min-h-[350px]">
              <div className="flex border-b border-white/5 bg-slate-900/35">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`flex-1 text-center py-3 text-xs font-bold tracking-wider uppercase border-b-2 transition-all ${
                    activeTab === 'details' ? 'border-cyan-400 text-cyan-400 bg-slate-950/20' : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Inspect
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={`flex-1 text-center py-3 text-xs font-bold tracking-wider uppercase border-b-2 transition-all ${
                    activeTab === 'code' ? 'border-pink-400 text-pink-400 bg-slate-950/20' : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Gene Code
                </button>
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                {activeTab === 'details' && (
                  <div className="space-y-4">
                    {selectedNode ? (
                      <div className="space-y-4">
                        <div>
                          <span className="text-[9px] uppercase tracking-widest font-mono text-cyan-400 font-bold bg-cyan-950/45 px-2 py-0.5 rounded border border-cyan-800/40">
                            {selectedNode.type}
                          </span>
                          <h4 className="text-base font-extrabold text-white mt-2">{selectedNode.label}</h4>
                        </div>
                        
                        {selectedNode.file && (
                          <div className="text-[10px] font-mono text-slate-500">
                            File: {selectedNode.file}
                          </div>
                        )}

                        <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/40 p-4 rounded-xl border border-white/5">
                          {selectedNode.description || 'Contains structural framework mechanisms and callbacks.'}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-12 space-y-3">
                        <HelpCircle className="w-10 h-10 text-slate-700 mx-auto" />
                        <p className="text-xs text-slate-500 font-mono">
                          Click any node in the genome graph to inspect its code segment, structure, or relations.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'code' && (
                  <div className="h-64 rounded-xl overflow-hidden border border-white/5">
                    {selectedNode && selectedNode.code ? (
                      <Editor
                        height="100%"
                        theme="vs-dark"
                        defaultLanguage="typescript"
                        value={selectedNode.code}
                        options={{
                          readOnly: true,
                          minimap: { enabled: false },
                          fontSize: 11,
                          lineNumbers: 'on',
                          scrollbar: { vertical: 'visible' }
                        }}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs font-mono text-slate-500 bg-slate-900/40 p-6 text-center">
                        Selected node does not contain direct code files. Click on a circular Gene node.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* AI Architect Panel */}
            <div className="glass border border-white/5 bg-slate-950/45 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-extrabold text-white font-mono tracking-wider">AI ARCHITECT Blueprints</h4>
              </div>

              {explaining ? (
                <div className="text-[11px] font-mono text-slate-500 py-4 animate-pulse">
                  Querying Ollama/Local semantic generator...
                </div>
              ) : (
                <div className="text-xs text-slate-400 leading-relaxed max-h-56 overflow-y-auto pr-2 space-y-3 font-mono whitespace-pre-wrap">
                  {aiExplanation}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

export default function GenomeGraphPage() {
  return (
    <Suspense fallback={<div className="py-32 text-center text-xs font-mono text-slate-500">Loading genome graph parameters...</div>}>
      <GenomeGraphContent />
    </Suspense>
  )
}
