"use client";

import { PortalLayout } from "@/components/layout/PortalLayout";
import { Card, CardContent } from "@/components/ui/Card";
import { DollarSign, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function DriverEarnings() {
  const earnings = {
    balance: "R$ 450,00",
    today: "R$ 85,00",
    week: "R$ 1.240,00",
    history: [
      { id: 1, date: "13 Abr, 2026", amount: "R$ 85,00", deliveries: 12, status: "completed" },
      { id: 2, date: "12 Abr, 2026", amount: "R$ 145,00", deliveries: 18, status: "completed" },
      { id: 3, date: "11 Abr, 2026", amount: "R$ 92,00", deliveries: 10, status: "completed" },
      { id: 4, date: "10 Abr, 2026", amount: "R$ 110,00", deliveries: 14, status: "completed" },
    ]
  };

  return (
    <PortalLayout title="Meus Ganhos" role="entregador">
      <div className="space-y-10">
        {/* Main Balance Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-4 border-ze-black bg-ze-yellow rounded-[3rem] shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <Wallet size={120} className="text-ze-black" />
            </div>
            <CardContent className="p-10 relative z-10">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-ze-black/60 mb-2 italic">Saldo Disponível</p>
              <h2 className="text-7xl font-black text-ze-black tracking-tighter mb-8 italic">{earnings.balance}</h2>
              <div className="flex flex-wrap gap-4">
                <Button className="h-14 px-8 bg-ze-black text-white hover:bg-ze-black/90 rounded-2xl font-black uppercase italic tracking-widest text-xs border-0 shadow-lg">
                  Solicitar Saque
                </Button>
                <Button variant="outline" className="h-14 px-8 border-2 border-ze-black text-ze-black hover:bg-white/50 rounded-2xl font-black uppercase italic tracking-widest text-xs shadow-lg">
                  Ver Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-4 border-ze-black bg-white rounded-[2.5rem] p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-ze-yellow flex items-center justify-center border-2 border-ze-black shadow-sm">
                  <TrendingUp className="w-6 h-6 text-ze-black" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-ze-black/40 tracking-widest leading-none">Ganhos Hoje</p>
                  <p className="text-2xl font-black text-ze-black italic">{earnings.today}</p>
                </div>
              </div>
            </Card>

            <Card className="border-4 border-ze-black bg-white rounded-[2.5rem] p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-ze-black flex items-center justify-center border-2 border-ze-black shadow-sm">
                  <Calendar className="w-6 h-6 text-ze-yellow" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-ze-black/40 tracking-widest leading-none">Esta Semana</p>
                  <p className="text-2xl font-black text-ze-black italic">{earnings.week}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* History Table */}
        <div className="space-y-6">
          <h3 className="text-2xl font-black text-ze-black uppercase italic tracking-tighter">Histórico de Repasses</h3>
          
          <div className="bg-white border-4 border-ze-black rounded-[2.5rem] overflow-hidden shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-ze-gray/50 border-b-4 border-ze-black">
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-ze-black/40">Data</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-ze-black/40">Entregas</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-ze-black/40">Valor</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-ze-black/40">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-ze-black/5">
                {earnings.history.map((item) => (
                  <tr key={item.id} className="hover:bg-ze-gray/20 transition-colors group">
                    <td className="px-8 py-6 font-bold text-ze-black">{item.date}</td>
                    <td className="px-8 py-6 font-bold text-ze-black">{item.deliveries} corridas</td>
                    <td className="px-8 py-6 font-black text-ze-black italic text-lg">{item.amount}</td>
                    <td className="px-8 py-6 text-right">
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest border border-green-200">
                        Pago
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
