"use client";

import * as React from "react"
import { 
  BarChart3, 
  Package, 
  Users, 
  Truck, 
  Settings, 
  LayoutDashboard,
  LogOut,
  Bell,
  User,
  Bike,
  DollarSign,
  ShoppingBag
} from "lucide-react"
import { Logo } from "./Logo"
import Link from "next/link"
import { Button } from "../ui/Button"
import { usePathname } from "next/navigation"

import { useSession, signOut } from "@/lib/auth/client"
import { normalizeRoles } from "@/lib/auth/roles"
import { apiFetch } from "@/lib/api"

interface SidebarItem {
  icon: React.ReactElement<{ className?: string }>
  label: string
  href: string
}

export function PortalLayout({ 
  children, 
  title, 
  role 
}: { 
  children: React.ReactNode, 
  title: string,
  role: 'admin' | 'vendedor' | 'entregador'
}) {
  const pathname = usePathname();
  const { data: session } = useSession()
  const lastDriverPingRef = React.useRef<string>("")

  const userRoles = normalizeRoles(session?.user?.roles || [])
  const primaryRole = userRoles.includes("admin") ? "admin" : 
                     userRoles.includes("seller") ? "seller" :
                     userRoles.includes("driver") ? "driver" : "customer"

  const roleLabels = {
    admin: "Administrador",
    vendedor: "Vendedor",
    entregador: "Entregador"
  }

  const menuItems: Record<string, SidebarItem[]> = {
    admin: [
      { icon: <LayoutDashboard className="w-5 h-5" />, label: "Geral", href: "/admin" },
      { icon: <Users className="w-5 h-5" />, label: "Usuários", href: "/admin/users" },
      { icon: <Package className="w-5 h-5" />, label: "Depósitos", href: "/admin/vendedors" },
      { icon: <Truck className="w-5 h-5" />, label: "Entregadores", href: "/admin/entregadors" },
      { icon: <User className="w-5 h-5" />, label: "Meu Perfil", href: "/admin/profile" },
      { icon: <Settings className="w-5 h-5" />, label: "Configurações", href: "/admin/settings" },
    ],
    vendedor: [
      { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", href: "/vendedor/dashboard" },
      { icon: <Package className="w-5 h-5" />, label: "Produtos", href: "/vendedor/products" },
      { icon: <ShoppingBag className="w-5 h-5" />, label: "Pedidos", href: "/vendedor/orders" },
      { icon: <User className="w-5 h-5" />, label: "Meu Perfil", href: "/vendedor/profile" },
      { icon: <Settings className="w-5 h-5" />, label: "Configurações", href: "/vendedor/settings" },
    ],
    entregador: [
      { icon: <LayoutDashboard className="w-5 h-5" />, label: "Painel", href: "/entregador/dashboard" },
      { icon: <Bike className="w-5 h-5" />, label: "Fila de Entregas", href: "/entregador/queue" },
      { icon: <DollarSign className="w-5 h-5" />, label: "Ganhos", href: "/entregador/earnings" },
      { icon: <ShoppingBag className="w-5 h-5" />, label: "Histórico", href: "/entregador/history" },
      { icon: <User className="w-5 h-5" />, label: "Meu Perfil", href: "/entregador/profile" },
    ]
  }

  React.useEffect(() => {
    if (role !== "entregador" || typeof window === "undefined" || !("geolocation" in navigator)) {
      return;
    }

    apiFetch("/api/v1/entregador/status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ online: true }),
    }).catch(() => undefined)

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const rounded = `${latitude.toFixed(5)}:${longitude.toFixed(5)}`
        if (lastDriverPingRef.current === rounded) {
          return
        }

        lastDriverPingRef.current = rounded

        apiFetch("/api/v1/entregador/location", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            latitude,
            longitude,
            online: true,
          }),
        }).catch((error) => {
          console.error("Falha ao enviar localizacao do entregador", error)
        })
      },
      (error) => {
        console.error("Falha ao capturar geolocalizacao do entregador", error)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      },
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [role])

  return (
    <div className="flex flex-col md:flex-row h-screen bg-ze-gray overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 bg-ze-black border-r-4 border-ze-black flex-col shrink-0 text-white">
        <div className="p-8 border-b-4 border-white/5 bg-ze-yellow flex flex-col items-center justify-center gap-2 shadow-sm">
          <Logo />
          <div className="text-[9px] font-black text-ze-black/40 uppercase tracking-[0.25em] text-center mt-2 italic">
            Portal do {role === 'admin' ? 'Administrador' : role === 'vendedor' ? 'Lojista' : 'Entregador'}
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {menuItems[role].map((item) => {
            const active = pathname === item.href;
            return (
              <Link 
                key={item.label} 
                href={item.href}
                className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-black uppercase italic tracking-widest transition-all border-2 border-transparent ${
                  active 
                    ? "bg-ze-yellow text-ze-black border-ze-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)]" 
                    : "text-white/60 hover:bg-white/10 hover:text-white hover:translate-x-1"
                }`}
              >
                <span className={active ? "text-ze-black" : "text-ze-yellow"}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-6 border-t-4 border-white/5 bg-ze-black">
          <Button 
            variant="ghost" 
            onClick={() => signOut()}
            className="w-full flex items-center justify-start gap-3 text-ze-red hover:bg-ze-red/10 rounded-2xl px-5 py-4 font-black uppercase italic tracking-widest text-xs border-2 border-transparent"
          >
            <LogOut className="w-5 h-5" />
            Encerrar Sessão
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative pb-16 md:pb-0">
        <header className="h-24 bg-white border-b-4 border-ze-black/5 px-4 md:px-10 flex items-center justify-between shrink-0">
          <div className="flex flex-col">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ze-red mb-1 italic">Sistema EntregaMais</p>
            <h1 className="text-2xl md:text-3xl font-black text-ze-black uppercase tracking-tighter italic truncate pr-2">{title}</h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-6 shrink-0">
            {/* Mobile Logout Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => signOut()}
              className="md:hidden text-ze-red hover:bg-ze-red/10 h-12 w-12 shrink-0 border-2 border-ze-red/10 rounded-xl"
              title="Sair"
            >
              <LogOut className="w-6 h-6" />
            </Button>

            <Button variant="ghost" size="icon" className="relative text-ze-black hover:bg-ze-yellow rounded-2xl h-12 w-12 border-2 border-ze-black/5">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-ze-red rounded-full border-2 border-white animate-bounce"></span>
            </Button>
            
            <div className="flex items-center gap-4 pl-4 md:pl-8 border-l-4 border-ze-black/5 h-12">
              <div className="text-right hidden lg:block leading-tight">
                <div className="text-sm font-black text-ze-black uppercase tracking-tighter italic">
                  {session?.user?.name || "Usuário"}
                </div>
                <div className="text-[9px] text-ze-black/40 font-black uppercase tracking-widest leading-none">
                  Status: <span className="text-green-500">Online</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-ze-yellow border-2 border-ze-black flex items-center justify-center text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] italic font-black text-ze-black shrink-0">
                {session?.user?.name?.charAt(0).toUpperCase() || role.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-12 scrollbar-hide bg-ze-gray/30">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
        
        {/* Bottom Nav - Mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-ze-black border-t-4 border-ze-black flex justify-around items-center h-20 px-2 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.2)]">
          {menuItems[role].slice(0, 4).map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${
                  active ? "text-ze-yellow scale-110" : "text-white/40"
                }`}
              >
                <div className={`p-2 rounded-xl transition-colors ${active ? "bg-white/10" : ""}`}>
                  {React.cloneElement(item.icon, { className: "w-6 h-6" })}
                </div>
                <span className="text-[7px] font-black uppercase tracking-[0.15em] truncate max-w-[64px] text-center italic">
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
      </main>
    </div>
  )
}
