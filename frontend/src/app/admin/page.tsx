"use client";

import { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout"
import { Users, Truck, Store, DollarSign, ArrowUpRight, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"
import Link from "next/link"
import { apiFetch } from "@/lib/api";

interface DashboardData {
  total_sales: number;
  new_users: number;
  active_sellers: number;
  total_drivers: number;
  pending_sellers_count: number;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const stats = await apiFetch<DashboardData>("/api/v1/admin/dashboard");
        setData(stats);
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  const stats = [
    { 
      label: "Total de Vendas", 
      value: `R$ ${(data?.total_sales || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 
      icon: <DollarSign className="w-6 h-6 text-emerald-500" />, 
      trend: "+0%", 
      color: "emerald" 
    },
    { 
      label: "Novos Usuários", 
      value: data?.new_users.toString() || "0", 
      icon: <Users className="w-6 h-6 text-brand-sky" />, 
      trend: "+0%", 
      color: "sky" 
    },
    { 
      label: "Lojistas Ativos", 
      value: data?.active_sellers.toString() || "0", 
      icon: <Store className="w-6 h-6 text-brand-amber" />, 
      trend: "+0%", 
      color: "amber" 
    },
    { 
      label: "Entregadores", 
      value: data?.total_drivers.toString() || "0", 
      icon: <Truck className="w-6 h-6 text-brand-teal" />, 
      trend: "+0%", 
      color: "teal" 
    },
  ]

  const sellersCount = data?.pending_sellers_count || 0

  if (isLoading) {
    return (
      <PortalLayout title="Dashboard Geral" role="admin">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ze-yellow"></div>
        </div>
      </PortalLayout>
    );
  }

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
                  { text: `${sellersCount} novos lojistas aguardando aprovação`, type: "warning", link: "/admin/credentialing" },
                  { text: "Servidor Keycloak operando em 85% de carga", type: "info" },
                  { text: "Erro detectado no serviço de entregas", type: "error" },
                ].map((alert, i) => (
                  <Link href={alert.link || "#"} key={i} className="block group/alert">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 group-hover/alert:border-brand-teal transition-all">
                      <div className={`w-2 h-2 rounded-full ${
                        alert.type === 'warning' ? 'bg-amber-400' : alert.type === 'error' ? 'bg-red-400' : 'bg-brand-sky'
                      }`} />
                      <span className="text-sm font-medium text-slate-600 group-hover/alert:text-brand-teal transition-colors">{alert.text}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalLayout>
  )
}
