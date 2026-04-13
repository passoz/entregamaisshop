"use client";

import { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout"
import { Truck, MapPin, DollarSign, Clock, Star, Phone, Navigation, ShoppingBag, PackageCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/providers/ToastProvider";

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

  const handleAccept = async (id: string) => {
    try {
      await apiFetch(`/api/v1/entregador/orders/${id}/accept`, { method: "POST" });
      showToast("Entrega aceita!", "success");
      fetchOrders();
    } catch (error) {
      showToast("Erro ao aceitar entrega", "error");
    }
  };

  const handleDeliver = async (id: string) => {
    try {
      await apiFetch(`/api/v1/entregador/orders/${id}/deliver`, { method: "POST" });
      showToast("Entrega concluída com sucesso!", "success");
      fetchOrders();
    } catch (error) {
      showToast("Erro ao concluir entrega", "error");
    }
  };

  const parseAddress = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      return parsed.raw || "Endereço não disponível";
    } catch (e) {
      return "Endereço padrão";
    }
  };

  return (
    <PortalLayout title="Portal do Entregador" role="entregador">
      <div className="space-y-8">
        {/* Status Section */}
        <div className="flex flex-col md:flex-row gap-6">
          <Card className="flex-1 border-0 shadow-lg bg-white rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-8 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-3xl bg-brand-teal/10 flex items-center justify-center">
                  <Truck className="w-10 h-10 text-brand-teal" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-800 leading-none mb-1">Ficar Offline</h2>
                  <p className="text-sm font-medium text-emerald-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Você está online e operando
                  </p>
                </div>
              </div>
              <Button className="rounded-3xl h-16 px-12 bg-slate-900 text-white hover:bg-slate-800 font-bold border-0 text-lg">
                Pausar
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4 w-full md:w-[400px]">
            <Card className="border-0 shadow-sm bg-white rounded-[2rem] p-4">
              <div className="p-4">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ganhos Hoje</div>
                <div className="text-2xl font-black text-slate-800">R$ 145,20</div>
                <div className="text-[10px] font-bold text-emerald-500 mt-1">+15% que ontem</div>
              </div>
            </Card>
            <Card className="border-0 shadow-sm bg-white rounded-[2rem] p-4">
              <div className="p-4">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avaliação</div>
                <div className="text-2xl font-black text-slate-800 flex items-baseline gap-1">
                  4.9 <Star className="w-4 h-4 text-amber-400 fill-amber-400 inline" />
                </div>
                <div className="text-[10px] font-bold text-slate-400 mt-1">Ótimo status</div>
              </div>
            </Card>
          </div>
        </div>

        {/* Current Delivery / Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-black text-2xl text-slate-800">Entregas Disponíveis</h3>
              <Badge className="bg-brand-coral/10 text-brand-coral border-0 py-1.5 px-4 rounded-full font-bold">Ao Vivo</Badge>
            </div>
            
            <div className="space-y-4">
              {isLoading ? (
                 <div className="h-40 bg-slate-100 animate-pulse rounded-[3rem]" />
              ) : orders.length === 0 ? (
                <Card className="border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50 p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                   Nenhuma entrega disponível no momento
                </Card>
              ) : orders.map(order => (
                <Card key={order.id} className="border-0 shadow-xl bg-white rounded-[3rem] p-2 hover:translate-y-[-4px] transition-all">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-brand-sky/10 flex items-center justify-center text-brand-sky">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-400 uppercase tracking-tight">Retirada em:</div>
                          <div className="text-xl font-black text-slate-800">Depósito Parceiro</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-brand-teal">R$ 5,00</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Taxa</div>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="flex gap-4 items-center">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-brand-sky" />
                          <div className="w-0.5 h-10 bg-slate-100" />
                          <div className="w-3 h-3 rounded-full bg-brand-coral" />
                        </div>
                        <div className="flex flex-col gap-6">
                          <div className="text-sm font-medium text-slate-500 pr-4 truncate max-w-[300px]">
                            Retirada na Loja
                          </div>
                          <div className="text-sm font-bold text-slate-800 pr-4 truncate max-w-[300px]">
                            {parseAddress(order.delivery_address_json)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {order.status === 'ready' ? (
                        <Button 
                          onClick={() => handleAccept(order.id)}
                          className="h-16 rounded-[1.5rem] bg-brand-teal text-white font-black uppercase tracking-widest hover:bg-brand-teal/90 shadow-lg shadow-brand-teal/20"
                        >
                          Aceitar Entrega
                        </Button>
                      ) : order.status === 'accepted' ? (
                        <Button 
                          onClick={() => handleDeliver(order.id)}
                          className="h-16 rounded-[1.5rem] bg-emerald-500 text-white font-black uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-200 flex gap-2 justify-center items-center"
                        >
                          <PackageCheck className="w-6 h-6" /> Marcar como Entregue
                        </Button>
                      ) : (
                        <Badge className="h-16 rounded-[1.5rem] bg-slate-100 text-slate-400 font-black uppercase tracking-widest flex items-center justify-center border-0">
                           {order.status}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-black text-2xl text-slate-800 px-2">Suas métricas</h3>
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: "Tempo médio de entrega", value: "24 min", icon: <Clock className="w-5 h-5" />, color: "sky" },
                { label: "Distância percorrida", value: "482 km", icon: <MapPin className="w-5 h-5" />, color: "amber" },
                { label: "Entregas concluídas", value: "1,248", icon: <Truck className="w-5 h-5" />, color: "teal" },
              ].map((m, i) => (
                <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm flex items-center justify-between border border-slate-50 group hover:border-brand-sky/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-brand-${m.color}/10 text-brand-${m.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      {m.icon}
                    </div>
                    <span className="font-bold text-slate-600">{m.label}</span>
                  </div>
                  <span className="text-xl font-black text-slate-800">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  )
}
