import * as React from "react"
import Link from "next/link"
import Image from "next/image"

export function Logo({ className, variant = "default" }: { className?: string, variant?: "default" | "footer" }) {
  const isFooter = variant === "footer"
  
  return (
    <Link href="/" className={`flex items-center gap-3 hover:opacity-90 transition-opacity group ${className}`}>
      {/* Icon Box with black outline */}
      <div className="relative">
        <div className="w-10 h-10 bg-ze-yellow rounded-xl flex items-center justify-center border-2 border-ze-black transform group-hover:rotate-12 transition-transform duration-500 shadow-sm">
          <span className="text-ze-black font-black text-xl italic leading-none">E</span>
        </div>
      </div>

      <div className="flex flex-col leading-[0.9]">
        <span className={`text-[1.5rem] md:text-[1.8rem] font-black uppercase italic tracking-tighter ${isFooter ? 'text-white' : 'text-ze-black'}`}>
          Entrega<span className={isFooter ? 'text-ze-yellow' : 'text-ze-red'}>Mais</span>
        </span>
        <span className={`hidden sm:block text-[9px] font-black tracking-[0.2em] uppercase italic ${isFooter ? 'text-white/40' : 'text-ze-black/40'}`}>
          Bebidas Geladas em Minutos
        </span>
      </div>
    </Link>
  )
}
