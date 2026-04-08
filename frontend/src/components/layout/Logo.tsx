import * as React from "react"
import Link from "next/link"

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 hover:opacity-90 transition-opacity ${className}`}>
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-ze-yellow shadow-sm overflow-hidden border-2 border-ze-black/5">
        {/* Modern Beverage/Bottle Icon */}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-ze-black">
          <path d="M17 22H7a2 2 0 0 1-2-2V7l2-3V2h6v2l2 3v13a2 2 0 0 1-2 2Z" />
          <path d="M9 2h6" />
          <path d="M5 7h14" />
          <circle cx="12" cy="14" r="2" />
        </svg>
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-xl font-black text-ze-black uppercase tracking-tighter">
          Entrega<span className="text-ze-red">Mais</span>
        </span>
        <span className="text-[10px] font-black text-ze-black/60 tracking-[0.2em] uppercase">
          Bebidas Geladas
        </span>
      </div>
    </Link>
  )
}
