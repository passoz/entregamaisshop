"use client";

import { useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout"
import { Package, ShoppingBag, TrendingUp, AlertCircle, Clock, ChevronRight, Zap, ArrowRight, Store } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import Link from "next/link"
import { useToast } from "@/components/providers/ToastProvider"
import { apiFetch } from "@/lib/api"

export default function SellerDashboard() {
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const { showToast } = useToast();

  const stats = [
    { label: "Vendas (Mês)", value: "R$ 12.450", icon: <TrendingUp className="w-6 h-6" />, color: "bg-green-500", trend: "+8.2%" },
    { label: "Pedidos Hoje", value: "24", icon: <ShoppingBag className="w-6 h-6" />, color: "bg-ze-yellow", trend: "+12%" },
    { label: "Produtos Ativos", value: "156", icon: <Package className="w-6 h-6" />, color: "bg-ze-red", trend: "0%" },
  ]

  const toggleStoreStatus = async () => {
    setIsUpdatingStatus(true);
    try {
      // Endpoint ideal: PUT /api/v1/vendedor/profile com { status: 'active' | 'inactive' }
      // Para este protótipo, simulamos a persistência
      await apiFetch("/api/v1/vendedor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_open: !isStoreOpen })
      });
      
      setIsStoreOpen(!isStoreOpen);
      showToast(`Loja ${!isStoreOpen ? 'aberta' : 'fechada'} com sucesso!`, "success");
    } catch (e) {
      showToast("Erro ao alterar status da loja", "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <PortalLayout title="Painel do Lojista" role="vendedor">
      <div className="space-y-10">
        
        {/* Welcome Card */}
        <div className="bg-ze-black border-4 border-ze-black rounded-[3rem] p-10 text-white shadow-[12px_12px_0px_0px_rgba(247,224,27,0.3)] relative overflow-hidden group">
          <Zap className="absolute -right-8 -bottom-8 w-48 h-48 text-ze-yellow opacity-10 group-hover:scale-110 transition-transform rotate-12" />
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-ze-yellow mb-2 italic">Dashboard de Gestão</p>
            <h2 className="text-5xl font-black mb-4 tracking-tighter italic">BOAS-VINDAS, <br/>SABOR DE MINAS!</h2>
            <p className="text-white/60 max-w-sm font-bold text-sm uppercase tracking-wide">Você tem 4 novos pedidos aguardando preparação. Vamos agilizar?</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/vendedor/orders">
                <Button className="bg-ze-yellow text-ze-black hover:bg-white font-black uppercase italic tracking-widest px-8 h-14 rounded-2xl border-0 shadow-lg">
                  Gerenciar Pedidos
                </Button>
              </Link>
              <Link href="/vendedor/products">
                <Button variant="outline" className="border-2 border-white/20 text-white hover:bg-white/10 font-black uppercase italic tracking-widest px-8 h-14 rounded-2xl">
                  Ver Estoque
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <Card key={i} className="border-4 border-ze-black bg-white rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] group hover:translate-y-[-4px] transition-all">
              <CardContent className="p-8 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black text-ze-black/40 uppercase tracking-widest mb-1">{stat.label}</div>
                  <div className="text-3xl font-black text-ze-black italic">{stat.value}</div>
                  <div className="mt-2">
                    <Badge className="bg-ze-gray text-ze-black font-black border-2 border-ze-black/5 rounded-lg">{stat.trend}</Badge>
                  </div>
                </div>
                <div className={`p-4 rounded-2xl ${stat.color} text-white border-2 border-ze-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-6 transition-transform`}>
                  {stat.icon}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Orders Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-2xl font-black text-ze-black uppercase italic tracking-tighter">Últimos Pedidos</h3>
              <Link href="/vendedor/orders">
                <Button variant="ghost" className="text-ze-red hover:bg-ze-red/5 font-black uppercase italic tracking-widest text-[10px]">
                  Ver Histórico Completo <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            
            <div className="bg-white border-4 border-ze-black rounded-[2.5rem] overflow-hidden shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)]">
              <div className="divide-y-2 divide-ze-black/5">
                {[
                  { id: "#12345", customer: "João Silva", total: "R$ 89,90", status: "checking", time: "5 min" },
                  { id: "#12344", customer: "Maria Souza", total: "R$ 45,00", status: "preparing", time: "12 min" },
                  { id: "#12343", customer: "Carlos Edu", total: "R$ 120,50", status: "ready", time: "25 min" },
                ].map((order, i) => (
                  <div key={i} className="p-8 flex items-center justify-between hover:bg-ze-gray/20 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-ze-gray border-2 border-ze-black/5 flex items-center justify-center text-ze-black/20 group-hover:bg-ze-yellow group-hover:text-ze-black group-hover:border-ze-black transition-all">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-black text-xl text-ze-black italic tracking-tight">{order.id}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-ze-black/40">{order.customer}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-10">
                      <div className="text-right">
                        <div className="font-black text-xl text-ze-black italic">{order.total}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-ze-black/30 flex items-center justify-end gap-1">
                          <Clock className="w-3 h-3" /> {order.time}
                        </div>
                      </div>
                      <Badge className={`h-10 px-6 uppercase text-[10px] font-black rounded-xl border-2 border-ze-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                        order.status === 'ready' ? 'bg-green-100 text-green-700' : 
                        order.status === 'preparing' ? 'bg-ze-yellow text-ze-black' : 
                        'bg-ze-gray text-ze-black'
                      }`}>
                        {order.status === 'ready' ? 'Pronto' : order.status === 'preparing' ? 'Fazendo' : 'Novo'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-2xl font-black text-ze-black uppercase italic tracking-tighter px-2">Gerenciamento</h3>
            <div className="space-y-6">
              
              {/* Store Status Control */}
              <Card className={`p-8 rounded-[2.5rem] border-4 border-ze-black shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)] transition-colors ${isStoreOpen ? 'bg-ze-yellow' : 'bg-ze-gray'}`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 border-ze-black shadow-sm ${isStoreOpen ? 'bg-ze-black text-ze-yellow' : 'bg-white text-ze-black'}`}>
                    <Store size={24} />
                  </div>
                  <h4 className="font-black text-lg text-ze-black uppercase italic tracking-tighter">Status da Loja</h4>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-ze-black text-white p-5 rounded-2xl flex items-center justify-between border-2 border-ze-black shadow-inner">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isStoreOpen ? 'text-green-400' : 'text-ze-red'}`}>
                      {isStoreOpen ? 'Aberta e Vendendo' : 'Fechada Temporariamente'}
                    </span>
                    <div className={`w-3 h-3 rounded-full ${isStoreOpen ? 'bg-green-400 animate-pulse' : 'bg-ze-red'}`} />
                  </div>
                  
                  <Button 
                    onClick={toggleStoreStatus}
                    disabled={isUpdatingStatus}
                    className={`w-full h-14 rounded-xl font-black uppercase italic tracking-widest text-[10px] border-2 border-ze-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-[2px] active:shadow-none ${
                      isStoreOpen ? 'bg-white text-ze-black hover:bg-ze-red hover:text-white' : 'bg-ze-black text-white hover:bg-green-500'
                    }`}
                  >
                    {isUpdatingStatus ? 'Processando...' : isStoreOpen ? 'Fechar Loja Agora' : 'Abrir Loja Agora'}
                  </Button>
                </div>
              </Card>

              <div className="p-8 rounded-[2.5rem] bg-white border-4 border-ze-black shadow-[10px_10px_0px_0px_rgba(227,27,35,0.1)] relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-red-100 border-2 border-ze-red flex items-center justify-center mb-6 shadow-md group-hover:rotate-12 transition-transform">
                    <AlertCircle className="w-8 h-8 text-ze-red" />
                  </div>
                  <h4 className="font-black text-xl text-ze-black uppercase italic tracking-tighter mb-2">Estoque Baixo</h4>
                  <p className="text-xs font-bold text-ze-black/50 uppercase tracking-wide mb-6">3 produtos estão com nível crítico no depósito.</p>
                  <Link href="/vendedor/products">
                    <Button className="w-full h-12 bg-ze-red text-white hover:bg-ze-black rounded-xl font-black uppercase italic tracking-widest text-[10px] border-0 shadow-lg">
                      Repor Estoque
                    </Button>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  )
}
