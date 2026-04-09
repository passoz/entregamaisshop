import * as React from "react"
import { 
  BarChart3, 
  Package, 
  Users, 
  Truck, 
  Settings, 
  LayoutDashboard,
  LogOut,
  Bell
} from "lucide-react"
import { Logo } from "./Logo"
import Link from "next/link"
import { Button } from "../ui/Button"

interface SidebarItem {
  icon: React.ReactNode
  label: string
  href: string
  active?: boolean
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
  const menuItems: Record<string, SidebarItem[]> = {
    admin: [
      { icon: <LayoutDashboard className="w-5 h-5" />, label: "Geral", href: "/admin", active: true },
      { icon: <Users className="w-5 h-5" />, label: "Usuários", href: "/admin/users" },
      { icon: <Package className="w-5 h-5" />, label: "Depósitos", href: "/admin/vendedors" },
      { icon: <Truck className="w-5 h-5" />, label: "Entregadores", href: "/admin/entregadors" },
      { icon: <Settings className="w-5 h-5" />, label: "Configurações", href: "/admin/settings" },
    ],
    vendedor: [
      { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", href: "/vendedor", active: true },
      { icon: <Package className="w-5 h-5" />, label: "Produtos/Estoque", href: "/vendedor/products" },
      { icon: <BarChart3 className="w-5 h-5" />, label: "Pedidos", href: "/vendedor/orders" },
      { icon: <Settings className="w-5 h-5" />, label: "Meu Depósito", href: "/vendedor/settings" },
    ],
    entregador: [
      { icon: <LayoutDashboard className="w-5 h-5" />, label: "Fila de Entregas", href: "/entregador", active: true },
      { icon: <BarChart3 className="w-5 h-5" />, label: "Ganhos", href: "/entregador/earnings" },
      { icon: <Settings className="w-5 h-5" />, label: "Perfil", href: "/entregador/profile" },
    ]
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-ze-gray overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 bg-ze-white border-r border-ze-black/5 flex-col shrink-0">
        <div className="p-6 border-b border-ze-black/5 bg-ze-yellow shadow-sm flex items-center justify-center">
          <div className="text-[10px] font-black text-ze-black/40 uppercase tracking-[0.2em] text-center">
            Portal do {role === 'admin' ? 'Admins' : role === 'vendedor' ? 'Lojista' : 'Entregador'}
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems[role].map((item) => (
            <Link 
              key={item.label} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black uppercase tracking-tight transition-all ${
                item.active 
                  ? "bg-ze-yellow text-ze-black shadow-md shadow-ze-yellow/20" 
                  : "text-ze-black/50 hover:bg-ze-gray hover:text-ze-black"
              }`}
            >
              <span className={item.active ? "text-ze-black" : "text-ze-black/30 group-hover:text-ze-black"}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <Button variant="ghost" className="w-full flex items-center justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl px-4 py-3">
            <LogOut className="w-5 h-5" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative pb-16 md:pb-0">
        <header className="h-20 bg-white border-b border-ze-black/5 px-4 md:px-8 flex items-center justify-between shrink-0">
          <h1 className="text-xl md:text-2xl font-black text-ze-black uppercase tracking-tighter italic truncate pr-2">{title}</h1>
          
          <div className="flex items-center gap-4 shrink-0">
            <Button variant="ghost" size="icon" className="relative text-ze-black/40 hover:text-ze-black hover:bg-ze-yellow/10 rounded-2xl">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-ze-red rounded-full border-[1.5px] border-white"></span>
            </Button>
            <div className="flex items-center gap-3 pl-4 border-l border-ze-black/5">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-black text-ze-black uppercase tracking-tighter italic">Demo User</div>
                <div className="text-[10px] text-ze-black/40 font-black uppercase tracking-widest leading-none">{role}</div>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-ze-yellow flex items-center justify-center text-lg md:text-xl shadow-inner border-2 border-ze-black/5 italic font-black text-ze-black shrink-0">
                {role.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
        
        {/* Bottom Nav - Mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-ze-black/5 flex justify-around items-center h-16 px-2 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          {menuItems[role].slice(0, 4).map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                item.active ? "text-ze-black" : "text-ze-black/30"
              }`}
            >
              <div className={`p-1.5 rounded-xl ${item.active ? "bg-ze-yellow" : ""}`}>
                {item.icon}
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest truncate max-w-[64px] text-center">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      </main>
    </div>
  )
}
