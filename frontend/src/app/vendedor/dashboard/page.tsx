import { PortalLayout } from "@/components/layout/PortalLayout"
import { Package, ShoppingBag, TrendingUp, AlertCircle, Clock, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"

export default function SellerDashboard() {
  const stats = [
    { label: "Vendas (Mês)", value: "R$ 12.450", icon: <TrendingUp className="w-5 h-5 text-emerald-500" />, trend: "+8.2%" },
    { label: "Pedidos Hoje", value: "24", icon: <ShoppingBag className="w-5 h-5 text-brand-sky" />, trend: "+12%" },
    { label: "Produtos Ativos", value: "156", icon: <Package className="w-5 h-5 text-brand-amber" />, trend: "0%" },
  ]

  return (
    <PortalLayout title="Painel do Lojista" role="vendedor">
      <div className="space-y-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-brand-teal to-brand-sky rounded-[2rem] p-8 text-white shadow-xl shadow-brand-teal/20 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-2 tracking-tight">Boas-vindas, Sabor de Minas!</h2>
            <p className="text-white/80 max-w-sm">Você tem 4 novos pedidos aguardando preparação. Vamos agilizar?</p>
            <div className="mt-6 flex gap-3">
              <Button className="bg-white text-brand-teal hover:bg-slate-50 font-bold px-6 py-6 rounded-2xl shadow-lg border-0">
                Ver Pedidos
              </Button>
            </div>
          </div>
          {/* Abstract circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-amber/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <Card key={i} className="border-0 shadow-sm bg-white rounded-[2rem] p-4 group hover:scale-[1.02] transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-400 mb-1">{stat.label}</div>
                  <div className="text-2xl font-black text-slate-800">{stat.value}</div>
                  <div className="mt-1 text-xs font-bold text-emerald-500 flex items-center gap-1">
                    {stat.trend} <TrendingUp className="w-3 h-3" />
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-brand-teal/10 group-hover:text-brand-teal transition-colors">
                  {stat.icon}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Orders Table Mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800">Últimos Pedidos</h3>
              <Button variant="ghost" className="text-brand-teal hover:text-brand-teal/80 text-sm font-bold">
                Ver Todo o Histórico <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="divide-y divide-slate-50">
                {[
                  { id: "#12345", customer: "João Silva", total: "R$ 89,90", status: "checking", time: "5 min" },
                  { id: "#12344", customer: "Maria Souza", total: "R$ 45,00", status: "preparing", time: "12 min" },
                  { id: "#12343", customer: "Carlos Edu", total: "R$ 120,50", status: "ready", time: "25 min" },
                ].map((order, i) => (
                  <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-teal/10 group-hover:text-brand-teal transition-colors">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-slate-800">{order.id}</div>
                        <div className="text-xs font-medium text-slate-400">{order.customer}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <div className="font-bold text-slate-700">{order.total}</div>
                        <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                          <Clock className="w-3 h-3" /> {order.time}
                        </div>
                      </div>
                      <Badge className={
                        order.status === 'ready' ? 'bg-emerald-100 text-emerald-600' : 
                        order.status === 'preparing' ? 'bg-brand-amber/10 text-brand-amber' : 
                        'bg-brand-sky/10 text-brand-sky'
                      }>
                        {order.status === 'ready' ? 'Pronto' : order.status === 'preparing' ? 'Preparando' : 'Confirmando'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 mb-6">Destaques</h3>
            <div className="space-y-4">
              <div className="p-6 rounded-[2rem] bg-brand-amber/5 border border-brand-amber/10 relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="p-3 rounded-2xl bg-brand-amber/10 w-fit mb-4">
                    <AlertCircle className="w-6 h-6 text-brand-amber" />
                  </div>
                  <h4 className="font-black text-slate-800 mb-2">Estoque Baixo</h4>
                  <p className="text-sm text-slate-500 mb-4">3 produtos estão com estoque crítico.</p>
                  <Button variant="outline" className="w-full border-brand-amber/20 text-brand-amber hover:bg-brand-amber/5 rounded-xl font-bold">
                    Repor Agora
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  )
}
