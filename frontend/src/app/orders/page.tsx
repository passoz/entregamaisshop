"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  ShoppingBag,
  HelpCircle,
  RotateCcw,
  Truck
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  created: { label: "Pedido Autorizado", color: "bg-ze-gray text-ze-black border-ze-black/10", icon: Clock },
  confirmed: { label: "No Preparo", color: "bg-ze-yellow text-ze-black border-ze-black", icon: Package },
  preparing: { label: "No Preparo", color: "bg-ze-yellow text-ze-black border-ze-black", icon: Package },
  ready: { label: "Aguardando Coleta", color: "bg-ze-yellow text-ze-black border-ze-black", icon: ShoppingBag },
  picked_up: { label: "Em Rota de Entrega", color: "bg-ze-black text-white border-ze-black", icon: Truck },
  delivered: { label: "Entregue", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
};

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchOrders = async () => {
    try {
      const data = await apiFetch<any[]>("/api/v1/orders/me");
      setOrders(data);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-ze-yellow border-t-ze-black rounded-full animate-spin" />
        <p className="font-black text-xl uppercase italic tracking-tighter text-ze-black">Buscando sua rodada...</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 pb-32 max-w-4xl">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl md:text-5xl font-black text-ze-black flex items-center uppercase italic tracking-tighter drop-shadow-sm">
          <ShoppingBag className="mr-4 h-10 w-10 md:h-12 md:w-12 text-ze-black fill-ze-yellow" />
          Meus Pedidos
        </h1>
      </div>

      <div className="space-y-8">
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border-4 border-dashed border-ze-black/10 shadow-xl p-10">
            <div className="text-7xl mb-6 grayscale opacity-20">🍻</div>
            <h3 className="text-2xl font-black text-ze-black uppercase italic tracking-tighter">Sua estante está vazia</h3>
            <p className="text-ze-black/40 mt-3 font-bold uppercase tracking-widest text-xs max-w-xs mx-auto">
              Ainda não temos registros de pedidos. Que tal garantir a gelada agora?
            </p>
            <Button onClick={() => router.push('/')} variant="ze-dark" className="mt-10 rounded-2xl h-14 px-10 font-black tracking-widest uppercase shadow-xl transform hover:-rotate-1 transition-transform">
              Abastecer Agora
            </Button>
          </div>
        ) : (
          orders.map((order) => {
            const config = statusConfig[order.status] || statusConfig.created;
            const StatusIcon = config.icon;

            return (
              <Card key={order.id} className="overflow-hidden border-4 border-ze-black rounded-[2.5rem] group shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] bg-white hover:shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] transition-all">
                <CardHeader className="bg-ze-gray border-b-4 border-ze-black/5 p-6 md:p-8">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-2xl font-black text-ze-black uppercase italic tracking-tighter truncate max-w-[300px]">
                          {order.edges?.seller?.name || "Depósito"}
                        </CardTitle>
                        <Badge variant="outline" className="text-[10px] font-black border-ze-black/20 text-ze-black/40">
                          #{order.id.split('-')[0]}
                        </Badge>
                      </div>
                      <div className="text-[10px] font-black text-ze-black/40 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(order.created_at).toLocaleString('pt-BR')}
                      </div>
                    </div>
                    
                    <div className={`flex items-center md:justify-center px-6 py-3 rounded-2xl border-2 transition-all shadow-sm ${config.color}`}>
                       <StatusIcon className="h-5 w-5 mr-3 shrink-0" />
                       <span className="font-black uppercase italic text-sm tracking-tighter">{config.label}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="flex-1 space-y-4">
                       <div className="space-y-2">
                          {(order.edges?.items || []).map((it:any, idx:number) => {
                            const product = it.product || it.edges?.product;
                            return (
                            <div key={idx} className="flex items-center text-sm font-bold text-ze-black/60 gap-2 uppercase tracking-tight">
                              <span className="w-5 h-5 bg-ze-yellow flex items-center justify-center rounded-md font-black text-[10px] border border-ze-black/10 shrink-0">
                                {it.quantity}
                              </span>
                              <span>{product?.name || "Produto"}</span>
                            </div>
                          )})}
                       </div>
                       
                       <div className="flex items-center gap-2 text-[10px] font-bold text-ze-black/30 uppercase tracking-widest pt-2">
                          <MapPin className="h-3 w-3 text-ze-red" />
                          <span className="truncate max-w-[250px] md:max-w-md">Endereço de Entrega Selecionado</span>
                       </div>
                    </div>

                    <div className="w-full md:w-auto flex flex-col items-center justify-center bg-ze-gray p-6 rounded-[2rem] border-2 border-ze-black/5 shadow-inner">
                      <div className="text-[10px] font-black text-ze-black/40 uppercase tracking-[0.3em] mb-1">Total Geral</div>
                      <div className="font-black text-3xl text-ze-black tracking-tighter">R$ {order.total_amount?.toFixed(2).replace('.', ',')}</div>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3 border-t-2 border-ze-black/5 pt-8">
                    <Button variant="outline" className="flex-1 md:flex-none border-4 border-ze-black font-black uppercase tracking-widest text-[10px] h-12 rounded-2xl hover:bg-ze-black hover:text-white transition-all">
                      <HelpCircle className="w-4 h-4 mr-2" /> Ajuda
                    </Button>
                    
                    {order.status === "delivered" ? (
                      <Button onClick={() => router.push('/')} className="flex-1 md:flex-none bg-ze-black text-white hover:bg-ze-yellow hover:text-ze-black border-4 border-ze-black font-black uppercase tracking-widest text-[10px] h-12 rounded-2xl transition-all">
                        <RotateCcw className="w-4 h-4 mr-2" /> Repetir Pedido
                      </Button>
                    ) : (
                      <Button className="flex-1 md:flex-none bg-ze-yellow text-ze-black hover:bg-ze-black hover:text-white border-4 border-ze-black font-black uppercase tracking-widest text-[10px] h-12 rounded-2xl shadow-lg transition-all">
                        Acompanhar Rota <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </main>
  );
}
