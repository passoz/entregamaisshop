import * as React from "react"
import Link from "next/link"
import Image from "next/image"

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-3.5 hover:opacity-90 transition-opacity ${className}`}>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center">
        <Image src="/favicon.ico" alt="Garrafinha EntregaMais" width={38} height={38} className="h-[38px] w-[38px]" />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-[1.35rem] md:text-[1.7rem] font-black text-ze-black uppercase italic tracking-tighter">
          Entrega<span className="text-ze-red">Mais</span>
        </span>
        <span className="hidden sm:block text-[9px] font-black text-ze-black/40 tracking-[0.3em] uppercase italic">
          Bebidas Geladas em Minutos
        </span>
      </div>
    </Link>
  )
}
