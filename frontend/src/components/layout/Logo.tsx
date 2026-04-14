import * as React from "react"
import Link from "next/link"
import Image from "next/image"

export function Logo({ className, variant = "default" }: { className?: string, variant?: "default" | "footer" }) {
  const isFooter = variant === "footer"
  
  return (
    <Link href="/" className={`flex items-center gap-3 hover:opacity-90 transition-all group ${className}`}>
      {/* Icon Box with black outline */}
      <div className="flex items-center justify-center">
        <div className="w-11 h-11 bg-ze-yellow rounded-xl flex items-center justify-center border-2 border-ze-black transform group-hover:rotate-6 transition-transform duration-300 shadow-sm relative top-[1px]">
          <span className="text-ze-black font-black text-2xl italic leading-none select-none">E</span>
        </div>
      </div>

      <div className="flex flex-col justify-center leading-[0.85]">
        <span className={`text-[1.6rem] md:text-[1.9rem] font-black uppercase italic tracking-tighter ${isFooter ? 'text-white' : 'text-ze-black'}`}>
          Entrega<span className={isFooter ? 'text-ze-yellow' : 'text-ze-red'}>Mais</span>
        </span>
        <span className={`hidden sm:block text-[10px] font-black tracking-[0.2em] uppercase italic ${isFooter ? 'text-white/40' : 'text-ze-black/40'}`}>
          Bebidas Geladas em Minutos
        </span>
      </div>
    </Link>
  )
}
