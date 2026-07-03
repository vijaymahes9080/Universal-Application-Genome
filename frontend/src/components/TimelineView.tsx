import React from 'react'
import { GitBranch, Merge, Zap, PlusCircle } from 'lucide-react'

interface TimelineItem {
  id: string
  title: string
  description: string
  timestamp: string
  type: 'ingest' | 'recombine' | 'mutate'
  meta?: string
}

interface TimelineViewProps {
  items: TimelineItem[]
}

export default function TimelineView({ items }: TimelineViewProps) {
  const getIcon = (type: 'ingest' | 'recombine' | 'mutate') => {
    switch (type) {
      case 'ingest':
        return <PlusCircle className="w-4 h-4 text-cyan-400" />
      case 'recombine':
        return <Merge className="w-4 h-4 text-pink-400" />
      case 'mutate':
        return <Zap className="w-4 h-4 text-yellow-400" />
    }
  }

  const getBorderColor = (type: 'ingest' | 'recombine' | 'mutate') => {
    switch (type) {
      case 'ingest': return 'border-cyan-500/30'
      case 'recombine': return 'border-pink-500/30'
      case 'mutate': return 'border-yellow-500/30'
    }
  }

  return (
    <div className="relative border-l-2 border-slate-800 ml-4 pl-8 space-y-8">
      {items.length === 0 ? (
        <p className="text-slate-500 text-sm font-mono">No evolutionary actions registered yet.</p>
      ) : (
        items.map((item, idx) => (
          <div key={item.id} className="relative group">
            {/* Timeline Marker Icon */}
            <div className={`absolute -left-[45px] top-1 w-8 h-8 rounded-full bg-slate-900 border flex items-center justify-center ${getBorderColor(item.type)} transition-transform group-hover:scale-110`}>
              {getIcon(item.type)}
            </div>

            {/* Content Card */}
            <div className="glass bg-slate-950/40 p-5 rounded-xl border border-white/5 hover:border-white/10 transition-all">
              <span className="text-[10px] text-slate-500 font-mono block mb-1">
                {item.timestamp}
              </span>
              <h4 className="text-sm font-bold text-white tracking-wide">
                {item.title}
              </h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {item.description}
              </p>
              
              {item.meta && (
                <div className="mt-3 bg-slate-900/80 rounded border border-white/5 px-3 py-2 text-[10px] text-cyan-400 font-mono">
                  {item.meta}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
