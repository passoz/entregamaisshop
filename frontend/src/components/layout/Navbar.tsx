import * as React from "react"
import Link from "next/link"
import { ShoppingCart, Menu } from "lucide-react"

import { Button } from "../ui/Button"
import { Badge } from "../ui/Badge"
import { Logo } from "./Logo"

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-ze-black/10 bg-ze-yellow shadow-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo />
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-black text-ze-black/80 hover:text-ze-black transition-colors uppercase tracking-wider">
            Explorar Depósitos
          </Link>
          <Link href="/auth/login/vendedor" className="text-sm font-black text-ze-black/80 hover:text-ze-black transition-colors uppercase tracking-wider">
            Sou Lojista
          </Link>
          <Link href="/auth/login/entregador" className="text-sm font-black text-ze-black/80 hover:text-ze-black transition-colors uppercase tracking-wider">
            Sou Entregador
          </Link>
          <Link href="/auth/login/admin" className="text-[10px] font-black uppercase text-ze-black/40 hover:text-ze-black transition-colors tracking-widest border border-ze-black/10 px-2 py-0.5 rounded">
            Admin
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative text-ze-black hover:bg-ze-black/5">
              <ShoppingCart className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-ze-red text-white border-2 border-ze-yellow">
                3
              </Badge>
            </Button>
          </Link>
          <div className="hidden sm:block">
            <Link href="/auth/login/vendedor">
              <Button variant="outline" className="mr-2 border-ze-black/20 text-ze-black hover:bg-ze-black/5 rounded-xl font-bold">
                Entrar
              </Button>
            </Link>
            <Link href="/auth/signup/vendedor">
              <Button className="bg-ze-black text-ze-yellow hover:bg-ze-black/90 rounded-xl font-bold px-6 border-none">
                Seja Parceiro
              </Button>
            </Link>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden text-ze-black">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  )
}
