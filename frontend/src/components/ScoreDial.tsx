import React from 'react'

interface ScoreDialProps {
  score: number // 0 to 10
  label: string
  colorClass?: string
}

export default function ScoreDial({ score, label, colorClass = "text-cyan-400" }: ScoreDialProps) {
  const percentage = Math.min(Math.max(score * 10, 0), 100)
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center justify-center p-4 glass rounded-xl border border-white/5 bg-slate-950/45 w-full">
      <div className="relative flex items-center justify-center">
        <svg className="w-24 h-24 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            className="stroke-slate-800"
            strokeWidth="6"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            className={`transition-all duration-1000 ease-out ${colorClass}`}
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        {/* Center label */}
        <div className="absolute text-xl font-mono font-black">
          {score.toFixed(1)}
        </div>
      </div>
      <span className="text-[11px] uppercase tracking-widest text-slate-400 font-mono mt-3">{label}</span>
    </div>
  )
}
