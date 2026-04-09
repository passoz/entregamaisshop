import * as React from "react"
import Link from "next/link"

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-3 hover:opacity-90 transition-opacity ${className}`}>
      <div className="relative flex h-10 w-12 items-center justify-center">
        {/* Modern Scooter Icon based on branding assets */}
        <svg viewBox="0 0 100 60" fill="currentColor" className="h-full w-full text-ze-black">
          {/* Speed Lines */}
          <path d="M5 15h15M2 25h12M8 35h10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          
          {/* Scooter Body */}
          <path d="M45 45h35l10-20H55z" />
          {/* Wheels */}
          <circle cx="50" cy="45" r="7" />
          <circle cx="85" cy="45" r="7" />
          
          {/* Rider Silhouette */}
          <path d="M55 25c0-5 3-8 8-8s8 3 8 8v10h-16v-10z" />
          <circle cx="70" cy="15" r="4" /> {/* Helmet */}
          <path d="M72 17l8 8" stroke="currentColor" strokeWidth="2" /> {/* Arms to handlebar */}
          
          {/* Crate */}
          <rect x="35" y="20" width="18" height="15" rx="2" className="fill-ze-yellow" />
          <path d="M40 25h8M40 30h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" className="text-ze-black" />
          
          {/* Bolt Detail on Crate */}
          <path d="M44 23l-2 4h4l-2 4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" className="text-ze-black" />
        </svg>
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-xl md:text-2xl font-black text-ze-black uppercase italic tracking-tighter">
          Entrega<span className="text-ze-red">Mais</span>
        </span>
        <span className="hidden sm:block text-[9px] font-black text-ze-black/40 tracking-[0.3em] uppercase italic">
          Bebidas Geladas em Minutos
        </span>
      </div>
    </Link>
  )
}
