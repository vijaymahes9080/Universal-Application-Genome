import './globals.css'
import Link from 'next/link'
import { Dna, Network, Compass, Activity, ShieldAlert, Award } from 'lucide-react'

export const metadata = {
  title: 'Universal Application Genome | Decode Software DNA',
  description: 'AI platform that discovers the DNA of software and recombines them into entirely new applications.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground flex flex-col font-sans">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 glass border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-cyan-400 to-violet-600 p-2 rounded-lg text-slate-950 group-hover:scale-105 transition-transform duration-300">
              <Dna className="w-6 h-6 animate-pulse-slow" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                UNIVERSAL APPLICATION GENOME
              </h1>
              <p className="text-[10px] text-cyan-400 font-mono tracking-widest leading-none">SOFTWARE SPECIES RESEARCH LAB</p>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <Link href="/ingest" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
              <Compass className="w-4 h-4" /> Ingest
            </Link>
            <Link href="/genome-graph" className="hover:text-violet-400 transition-colors flex items-center gap-1.5">
              <Network className="w-4 h-4" /> Genome Graph
            </Link>
            <Link href="/evolution" className="hover:text-pink-400 transition-colors flex items-center gap-1.5">
              <Dna className="w-4 h-4" /> Recombination
            </Link>
            <Link href="/simulation" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
              <Activity className="w-4 h-4" /> Simulations
            </Link>
            <Link href="/research" className="hover:text-yellow-400 transition-colors flex items-center gap-1.5">
              <Award className="w-4 h-4" /> Species Research
            </Link>
          </nav>
        </header>

        {/* Content Portal */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 py-6 px-6 text-center text-xs text-slate-600 font-mono">
          © {new Date().getFullYear()} Universal Application Genome. Open Source Software Species Lab (No Docker / Local Deploy).
        </footer>
      </body>
    </html>
  )
}
