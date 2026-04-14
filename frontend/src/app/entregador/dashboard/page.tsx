"use client";

import { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout"
import { Truck, MapPin, DollarSign, Clock, Star, Phone, Navigation, ShoppingBag, PackageCheck, Zap, ArrowRight, Wallet } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/providers/ToastProvider";
import Link from "next/link";

export default function DriverDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const fetchOrders = async () => {
    try {
      const data = await apiFetch<any[]>("/api/v1/entregador/orders");
      setOrders(data);
    } catch (error) {
      console.error("Erro ao carregar entregas", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const parseAddress = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      return parsed.raw || "Endereço não disponível";
    } catch (e) {
      return "Endereço padrão";
    }
  };

  const metrics = [
    { label: "Ganhos Hoje", value: "R$ 145,20", icon: <DollarSign size={20} />, color: "bg-green-500", trend: "+12%" },
    { label: "Entregas", value: "18", icon: <ShoppingBag size={20} />, color: "bg-ze-yellow", trend: "+2" },
    { label: "Avaliação", value: "4.9", icon: <Star size={20} />, color: "bg-ze-red", trend: "Top" },
  ];

  const activeDeliveries = orders.filter(o => o.status === 'accepted' || o.status === 'dispatched' || o.status === 'picked_up');
  const availableDeliveries = orders.filter(o => o.status === 'ready' && !o.driver_id);

  return (
    <PortalLayout title="Painel do Entregador" role="entregador">
      <div className="space-y-10">
        
        {/* Top Section: Status & Rapid Ganhos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-4 border-ze-black bg-white rounded-[3rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-3xl bg-ze-yellow border-4 border-ze-black flex items-center justify-center shadow-lg transform rotate-3">
                  <Truck className="w-10 h-10 text-ze-black" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-ze-black uppercase italic tracking-tighter leading-none mb-2">Você está Online</h2>
                  <div className="flex items-center gap-2">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <p className="text-xs font-black uppercase tracking-widest text-ze-black/40">Pronto para novas entregas</p>
                  </div>
                </div>
              </div>
              <Button className="w-full md:w-auto rounded-2xl h-16 px-10 bg-ze-red text-white hover:bg-ze-black font-black uppercase italic tracking-widest border-4 border-ze-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                Ficar Offline
              </Button>
            </CardContent>
          </Card>

          <Card className="border-4 border-ze-black bg-ze-black text-white rounded-[3rem] shadow-[12px_12px_0px_0px_rgba(247,224,27,0.3)] p-8 relative overflow-hidden group">
            <Zap className="absolute -right-4 -bottom-4 w-32 h-32 text-ze-yellow opacity-10 group-hover:scale-110 transition-transform" />
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ze-yellow mb-2">Saldo Atual</p>
              <h3 className="text-4xl font-black tracking-tighter italic mb-6">R$ 1.240,00</h3>
              <Link href="/entregador/earnings">
                <Button className="w-full h-12 bg-ze-yellow text-ze-black hover:bg-white rounded-xl font-black uppercase italic tracking-widest text-[10px] border-0">
                  Ver Ganhos
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.map((m, i) => (
            <div key={i} className="bg-white border-4 border-ze-black p-6 rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] flex items-center justify-between group hover:translate-y-[-2px] transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${m.color} border-2 border-ze-black flex items-center justify-center shadow-md group-hover:rotate-6 transition-transform text-white`}>
                  {m.icon}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-ze-black/40 tracking-widest leading-none">{m.label}</p>
                  <p className="text-2xl font-black text-ze-black italic">{m.value}</p>
                </div>
              </div>
              <Badge className="bg-ze-gray text-ze-black font-black border-2 border-ze-black/5 rounded-lg">{m.trend}</Badge>
            </div>
          ))}
        </div>

        {/* Deliveries Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Active Routes */}
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-ze-black uppercase italic tracking-tighter flex items-center gap-3">
              <Navigation size={24} className="text-ze-red" /> Rota em Andamento
            </h3>
            
            {activeDeliveries.length > 0 ? (
              activeDeliveries.map(order => (
                <Card key={order.id} className="border-4 border-ze-black bg-ze-yellow rounded-[3rem] p-2 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
                  <CardContent className="p-8">
                    <div className="bg-white rounded-[2rem] border-2 border-ze-black p-6 mb-6">
                       <div className="flex items-center justify-between mb-4">
                         <span className="font-black text-ze-black uppercase italic tracking-widest text-xs">Corrida Ativa</span>
                         <Badge className="bg-ze-black text-white rounded-lg">#{order.id.split('-')[0]}</Badge>
                       </div>
                       <p className="font-bold text-ze-black text-sm uppercase tracking-tight truncate">
                         {parseAddress(order.delivery_address_json)}
                       </p>
                    </div>
                    <Link href="/entregador/queue">
                      <Button className="w-full h-16 bg-ze-black text-white hover:bg-ze-dark rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-2">
                        Continuar Entrega <ArrowRight size={20} />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="bg-ze-gray/30 border-4 border-dashed border-ze-black/10 rounded-[3rem] p-12 text-center">
                <p className="font-black text-ze-black/20 uppercase tracking-widest italic text-sm">Nenhuma corrida ativa</p>
              </div>
            )}
          </div>

          {/* Quick Queue Access */}
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-ze-black uppercase italic tracking-tighter flex items-center gap-3">
              <Zap size={24} className="text-ze-yellow fill-ze-yellow" /> Fila de Espera
            </h3>
            
            <div className="bg-white border-4 border-ze-black rounded-[3rem] p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)] text-center space-y-6">
              <div className="w-20 h-20 bg-ze-gray rounded-full flex items-center justify-center mx-auto border-2 border-ze-black shadow-inner">
                <Navigation size={32} className="text-ze-black/20" />
              </div>
              <div>
                <p className="text-xl font-black text-ze-black uppercase italic tracking-tighter">Buscar Novas Corridas</p>
                <p className="text-xs font-bold text-ze-black/40 uppercase tracking-widest mt-1">Existem {availableDeliveries.length} entregas próximas a você</p>
              </div>
              <Link href="/entregador/queue">
                <Button className="w-full h-14 bg-ze-yellow text-ze-black hover:bg-ze-black hover:text-white rounded-2xl font-black uppercase italic tracking-widest shadow-lg transition-all border-2 border-ze-black">
                  Abrir Fila de Entregas
                </Button>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </PortalLayout>
  )
}
