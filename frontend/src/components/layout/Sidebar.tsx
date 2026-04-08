import Link from "next/link";
import { LayoutDashboard, Package, ShoppingBag, Bike, LogOut, Settings } from "lucide-react";
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
    { href: "/vendedor/settings", icon: Settings, label: "Configurações" },
  ];

  const entregadorLinks = [
    { href: "/entregador/dashboard", icon: LayoutDashboard, label: "Painel" },
    { href: "/entregador/queue", icon: Bike, label: "Fila de Entregas" },
    { href: "/entregador/history", icon: ShoppingBag, label: "Histórico" },
    { href: "/entregador/settings", icon: Settings, label: "Conta" },
  ];

  const links = role === "vendedor" ? vendedorLinks : entregadorLinks;
  
  const brandColor = role === "vendedor" ? "brand-amber" : "brand-sky";

  return (
    <aside className={cn("hidden lg:flex w-64 flex-col bg-slate-900 border-r border-slate-800 text-slate-300 min-h-[calc(100vh-64px)]", className)}>
      <div className="flex-1 py-6 px-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = false; // Add actual router logic later
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium",
                isActive 
                  ? "bg-slate-800 text-white shadow-sm"
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && `text-${brandColor}`)} />
              {link.label}
            </Link>
          );
        })}
      </div>
      <div className="p-4 border-t border-slate-800">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </Link>
      </div>
    </aside>
  );
}
