import { PortalLayout } from "@/components/layout/PortalLayout"
import { Users, Truck, Store, DollarSign, ArrowUpRight, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"

export default function AdminDashboard() {
  const stats = [
    { label: "Total de Vendas", value: "R$ 42.500,00", icon: <DollarSign className="w-6 h-6 text-emerald-500" />, trend: "+12.5%", color: "emerald" },
    { label: "Novos Usuários", value: "128", icon: <Users className="w-6 h-6 text-brand-sky" />, trend: "+25%", color: "sky" },
    { label: "Lojistas Ativos", value: "45", icon: <Store className="w-6 h-6 text-brand-amber" />, trend: "+5%", color: "amber" },
    { label: "Entregadores", value: "86", icon: <Truck className="w-6 h-6 text-brand-teal" />, trend: "+18%", color: "teal" },
  ]

  return (
    <PortalLayout title="Dashboard Geral" role="admin">
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <Card key={i} className="border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
              <div className={`h-1 w-full bg-brand-${stat.color || 'teal'}`} />
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl bg-opacity-10 bg-brand-${stat.color || 'teal'}`}>
                    {stat.icon}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                    <TrendingUp className="w-3 h-3" />
                    {stat.trend}
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-800 mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-slate-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity Mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-slate-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800">Crescimento da Plataforma</h3>
                <button className="text-sm text-brand-teal font-medium hover:underline flex items-center gap-1">
                  Ver Relatório <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
              <div className="h-[300px] w-full bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm font-medium">
                Gráfico de Vendas e Usuários
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-bold text-slate-800 mb-6">Alertas do Sistema</h3>
              <div className="space-y-4">
                {[
                  { text: "5 novos lojistas aguardando aprovação", type: "warning" },
                  { text: "Servidor Keycloak operando em 85% de carga", type: "info" },
                  { text: "Erro detectado no serviço de entregas", type: "error" },
                ].map((alert, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className={`w-2 h-2 rounded-full ${
                      alert.type === 'warning' ? 'bg-amber-400' : alert.type === 'error' ? 'bg-red-400' : 'bg-brand-sky'
                    }`} />
                    <span className="text-sm font-medium text-slate-600">{alert.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalLayout>
  )
}
