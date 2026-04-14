import Link from "next/link";
import { LayoutDashboard, Package, ShoppingBag, Bike, LogOut, Settings, DollarSign, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role: "vendedor" | "entregador";
  currentRoute?: string;
  className?: string;
}

export function Sidebar({ role, currentRoute = "/dashboard", className }: SidebarProps) {
  const vendedorLinks = [
    { href: "/vendedor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/vendedor/orders", icon: ShoppingBag, label: "Pedidos" },
    { href: "/vendedor/products", icon: Package, label: "Produtos e Estoque" },
    { href: "/vendedor/profile", icon: User, label: "Meu Perfil" },
    { href: "/vendedor/settings", icon: Settings, label: "Configurações" },
  ];

  const entregadorLinks = [
    { href: "/entregador/dashboard", icon: LayoutDashboard, label: "Painel Principal" },
    { href: "/entregador/queue", icon: Bike, label: "Fila de Entregas" },
    { href: "/entregador/earnings", icon: DollarSign, label: "Meus Ganhos" },
    { href: "/entregador/history", icon: ShoppingBag, label: "Histórico" },
    { href: "/entregador/profile", icon: User, label: "Meu Perfil" },
  ];

  const links = role === "vendedor" ? vendedorLinks : entregadorLinks;
  
  return (
    <aside className={cn("hidden lg:flex w-72 flex-col bg-ze-black border-r-4 border-ze-black text-white min-h-[calc(100vh-80px)]", className)}>
      <div className="flex-1 py-8 px-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = currentRoute === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-black uppercase italic text-xs tracking-widest border-2 border-transparent",
                isActive 
                  ? "bg-ze-yellow text-ze-black border-ze-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
                  : "hover:bg-white/10 hover:translate-x-1"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive ? "text-ze-black" : "text-ze-yellow")} />
              {link.label}
            </Link>
          );
        })}
      </div>
      
      <div className="p-6 border-t-4 border-white/5">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-black uppercase italic text-xs tracking-widest text-ze-red hover:bg-ze-red/10 border-2 border-transparent"
        >
          <LogOut className="h-5 w-5" />
          Voltar para Home
        </Link>
      </div>
    </aside>
  );
}
