"use client";

import { PortalLayout } from "@/components/layout/PortalLayout";
import { Card, CardContent } from "@/components/ui/Card";
import { ShoppingBag, Search, Filter, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

export default function DriverHistory() {
  const history = [
    { id: "ORD-7821", date: "13 Abr, 2026 - 14:20", from: "Depósito Centro", to: "Rua das Flores, 123", amount: "R$ 5,00", status: "delivered" },
    { id: "ORD-7815", date: "13 Abr, 2026 - 11:05", from: "Bebidas & Cia", to: "Av. Brasil, 500", amount: "R$ 7,50", status: "delivered" },
    { id: "ORD-7798", date: "12 Abr, 2026 - 20:45", from: "Super Depósito", to: "Rua XV de Novembro, 88", amount: "R$ 5,00", status: "cancelled" },
    { id: "ORD-7782", date: "12 Abr, 2026 - 18:30", from: "Depósito Centro", to: "Rua Curitiba, 10", amount: "R$ 6,00", status: "delivered" },
  ];

  return (
    <PortalLayout title="Histórico de Entregas" role="entregador">
      <div className="space-y-8">
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ze-black/20 group-focus-within:text-ze-yellow transition-colors" size={20} />
            <Input 
              placeholder="Buscar por ID ou endereço..." 
              className="h-14 pl-12 rounded-2xl border-4 border-ze-black bg-white font-bold"
            />
          </div>
          <button className="h-14 px-8 bg-ze-black text-white rounded-2xl font-black uppercase italic tracking-widest flex items-center gap-3">
            <Filter size={20} /> Filtrar
          </button>
        </div>

        {/* History List */}
        <div className="space-y-6">
          {history.map((item) => (
            <Card key={item.id} className="border-4 border-ze-black bg-white rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-4px] transition-all overflow-hidden group">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Status Bar */}
                  <div className={`w-full md:w-4 ${item.status === 'delivered' ? 'bg-green-500' : 'bg-ze-red'}`} />
                  
                  <div className="flex-1 p-8">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-xl italic tracking-tighter text-ze-black">#{item.id}</span>
                        <Badge className={`uppercase text-[10px] font-black rounded-lg border-2 border-ze-black ${item.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-ze-red'}`}>
                          {item.status === 'delivered' ? 'Concluída' : 'Cancelada'}
                        </Badge>
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-ze-black/40">{item.date}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-lg bg-ze-gray flex items-center justify-center shrink-0">
                            <ArrowRight size={14} className="text-ze-black rotate-[-45deg]" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-ze-black/30 leading-none mb-1">De (Coleta)</p>
                            <p className="font-bold text-ze-black uppercase text-sm">{item.from}</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-lg bg-ze-gray flex items-center justify-center shrink-0">
                            <ArrowRight size={14} className="text-ze-red" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-ze-black/30 leading-none mb-1">Para (Entrega)</p>
                            <p className="font-bold text-ze-black uppercase text-sm">{item.to}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-10">
                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest text-ze-black/30 leading-none mb-1">Taxa Recebida</p>
                          <p className="text-3xl font-black text-ze-black italic">{item.amount}</p>
                        </div>
                        <button className="w-12 h-12 rounded-xl bg-ze-gray hover:bg-ze-yellow flex items-center justify-center border-2 border-ze-black shadow-sm transition-colors">
                          <ArrowRight size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PortalLayout>
  );
}
