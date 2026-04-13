"use client";

import * as React from "react"
import Link from "next/link"
import { ShoppingCart, Menu, User, LogOut } from "lucide-react"

import { Button } from "../ui/Button"
import { Badge } from "../ui/Badge"
import { Logo } from "./Logo"
import { useCart } from "@/lib/CartContext"
import { useSession, signOut } from "@/lib/auth/client"

import { normalizeRoles, getHomePathForRole } from "@/lib/auth/roles"

export function Navbar() {
  const { totalItems } = useCart()
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated"
  
  // Role Detection
  const userRoles = normalizeRoles(session?.user?.roles || [])
  const primaryRole = userRoles.includes("admin") ? "admin" : 
                     userRoles.includes("seller") ? "seller" :
                     userRoles.includes("driver") ? "driver" : "customer"
  
  const roleLabels = {
    admin: "Administrador",
    seller: "Vendedor",
    driver: "Entregador",
    customer: "Cliente"
  }

  const roleStyles = {
    admin: "bg-ze-black text-ze-yellow shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
    seller: "bg-ze-yellow text-ze-black",
    driver: "bg-ze-yellow text-ze-black",
    customer: "bg-ze-gray text-ze-black"
  }

  const dashboardPath = getHomePathForRole(primaryRole)

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
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative text-ze-black hover:bg-ze-black/5 h-10 w-10">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-ze-red text-white border-2 border-ze-yellow">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </Link>
          
          <div className="hidden lg:flex items-center gap-3">
            {status === "loading" ? (
              <div className="w-32 h-10 bg-ze-black/5 animate-pulse rounded-xl" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link href={dashboardPath}>
                  <Button variant="ghost" className="flex items-center gap-3 text-ze-black font-bold hover:bg-ze-black/5 rounded-xl px-4 h-11 border-2 border-transparent hover:border-ze-black/10 transition-all">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all shadow-sm ${roleStyles[primaryRole]}`}>
                      {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="flex flex-col items-start leading-none gap-1">
                      <span className="text-sm font-black">{session?.user?.name?.split(' ')[0] || "Usuário"}</span>
                      <span className="text-[10px] uppercase tracking-widest opacity-60 font-black italic">{roleLabels[primaryRole]}</span>
                    </div>
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={() => signOut()}
                  className="flex items-center gap-2 text-ze-red hover:bg-ze-red/10 rounded-xl px-3 h-11 font-black uppercase text-[10px] tracking-widest transition-all border-2 border-transparent hover:border-ze-red/20 shadow-sm"
                  title="Sair da conta"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </div>
            ) : (
              <>
                <Link href="/auth/login/customer">
                  <Button variant="outline" className="border-ze-black/20 text-ze-black hover:bg-ze-black/5 rounded-xl font-bold">
                    Entrar
                  </Button>
                </Link>
                <Link href="/auth/signup/vendedor">
                  <Button className="bg-ze-black text-ze-yellow hover:bg-ze-black/90 rounded-xl font-bold px-6 border-none">
                    Seja Parceiro
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Logout (if authenticated) */}
          {isAuthenticated && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => signOut()}
              className="lg:hidden text-ze-red hover:bg-ze-red/10 h-10 w-10"
            >
              <LogOut className="h-6 w-6" />
            </Button>
          )}

          <Button variant="ghost" size="icon" className="md:hidden text-ze-black h-10 w-10">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </nav>
  )
}
