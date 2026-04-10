import * as React from "react"
import Link from "next/link"

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-3 hover:opacity-90 transition-opacity ${className}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ze-yellow shadow-[4px_4px_0px_0px_rgba(34,34,34,1)]">
        <span className="text-ze-black font-black text-xl italic leading-none">E</span>
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
