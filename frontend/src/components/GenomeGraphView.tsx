'use client'

import React, { useEffect, useRef } from 'react'
import cytoscape from 'cytoscape'

interface GenomeGraphViewProps {
  elements: any[]
  onNodeSelect: (nodeData: any) => void
}

export default function GenomeGraphView({ elements, onNodeSelect }: GenomeGraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<cytoscape.Core | null>(null)

  useEffect(() => {
    if (!containerRef.current || elements.length === 0) return

    // Clean up previous instance
    if (cyRef.current) {
      cyRef.current.destroy()
    }

    try {
      cyRef.current = cytoscape({
        container: containerRef.current,
        elements: elements,
        style: [
          {
            selector: 'node',
            style: {
              'background-color': '#1e293b',
              'label': 'data(label)',
              'color': '#cbd5e1',
              'font-size': '10px',
              'font-family': 'monospace',
              'text-valign': 'center',
              'text-halign': 'center',
              'width': '65px',
              'height': '65px',
              'border-width': '2px',
              'border-color': '#475569',
              'text-wrap': 'wrap',
              'text-max-width': '60px'
            }
          },
          {
            selector: 'node[type="Application"]',
            style: {
              'background-color': '#06b6d4',
              'color': '#030712',
              'font-weight': 'bold',
              'width': '95px',
              'height': '95px',
              'border-color': '#22d3ee',
              'shape': 'round-rectangle'
            }
          },
          {
            selector: 'node[type="Module"]',
            style: {
              'background-color': 'rgba(15, 23, 42, 0.45)',
              'border-color': '#8b5cf6',
              'border-style': 'dashed',
              'shape': 'rectangle',
              'text-valign': 'top',
              'text-halign': 'center',
              'text-margin-y': -8,
              'width': 'auto',
              'height': 'auto'
            }
          },
          {
            selector: 'node[type="Gene"]',
            style: {
              'background-color': '#020617',
              'border-color': '#ec4899',
              'border-width': '3px',
              'shape': 'ellipse'
            }
          },
          {
            selector: 'node[type="DatabaseTable"]',
            style: {
              'background-color': '#0f172a',
              'border-color': '#10b981',
              'shape': 'barrel',
              'width': '60px',
              'height': '60px'
            }
          },
          {
            selector: 'node[type="APIEndpoint"]',
            style: {
              'background-color': '#0f172a',
              'border-color': '#f59e0b',
              'shape': 'hexagon',
              'width': '60px',
              'height': '60px'
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 2,
              'line-color': '#334155',
              'target-arrow-color': '#475569',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'label': 'data(label)',
              'color': '#64748b',
              'font-size': '8px',
              'text-background-opacity': 0.8,
              'text-background-color': '#030712',
              'text-background-padding': '2px',
              'text-rotation': 'autorotate'
            }
          },
          {
            selector: 'edge[relation_type="DEPENDS_ON"]',
            style: {
              'line-color': '#8b5cf6',
              'line-style': 'dotted'
            }
          }
        ],
        layout: {
          name: 'cose', // Force-directed layout
          animate: true,
          padding: 30,
          nodeOverlap: 20,
          componentSpacing: 40,
          nodeRepulsion: () => 4500
        }
      })

      // Bind node click listener
      cyRef.current.on('tap', 'node', (evt) => {
        const node = evt.target
        onNodeSelect(node.data())
      })

    } catch (err) {
      console.error("Cytoscape initialization error", err)
    }

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy()
        cyRef.current = null
      }
    }
  }, [elements])

  const triggerResetLayout = () => {
    if (cyRef.current) {
      cyRef.current.layout({ name: 'cose', padding: 30 }).run()
    }
  }

  const triggerZoomIn = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 1.2)
    }
  }

  const triggerZoomOut = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 0.8)
    }
  }

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Graph Control Panel Overlay */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={triggerZoomIn}
          className="bg-slate-900/80 hover:bg-slate-800 border border-white/5 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition"
        >
          ZOOM +
        </button>
        <button
          onClick={triggerZoomOut}
          className="bg-slate-900/80 hover:bg-slate-800 border border-white/5 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition"
        >
          ZOOM -
        </button>
        <button
          onClick={triggerResetLayout}
          className="bg-slate-900/80 hover:bg-slate-800 border border-white/5 text-cyan-400 px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition"
        >
          RESET LAYOUT
        </button>
      </div>

      <div ref={containerRef} className="w-full h-full min-h-[500px] bg-slate-950/20 rounded-xl" />
    </div>
  )
}
