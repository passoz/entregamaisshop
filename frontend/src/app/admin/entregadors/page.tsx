"use client";

import { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Card, CardContent } from "@/components/ui/Card";
import { Truck, Search, Calendar } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

interface DriverData {
  id: string;
  vehicle_type: string;
  status: string;
  created_at: string;
  edges?: {
    user?: {
      name: string;
      email: string;
    };
  };
}

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState<DriverData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchDrivers() {
      try {
        const data = await apiFetch<DriverData[]>("/api/v1/admin/drivers");
        setDrivers(data);
      } catch (error) {
        console.error("Erro ao carregar entregadores:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDrivers();
  }, []);

  const filteredDrivers = drivers.filter(d => 
    d.edges?.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.edges?.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PortalLayout title="Frota de Entregadores" role="admin">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Gestão de Entregadores</h2>
            <p className="text-slate-500 text-sm">Monitore e gerencie os heróis da rodada.</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Buscar por nome ou e-mail..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 rounded-2xl border-slate-200 focus:border-ze-yellow"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-slate-100 rounded-3xl" />
            ))}
          </div>
        ) : filteredDrivers.length === 0 ? (
          <Card className="border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50">
            <CardContent className="p-12 text-center">
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Nenhum entregador encontrado.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDrivers.map((driver) => (
              <Card key={driver.id} className="border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden rounded-3xl group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-brand-teal/10 rounded-2xl flex items-center justify-center text-brand-teal">
                        <Truck className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight truncate max-w-[150px]">{driver.edges?.user?.name || "Entregador"}</h3>
                        <p className="text-xs font-bold text-slate-400 truncate max-w-[150px]">{driver.edges?.user?.email}</p>
                      </div>
                    </div>
                    <Badge className={`${
                      driver.status === 'online' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400'
                    } font-black uppercase text-[9px] tracking-widest px-2.5 py-0.5 rounded-full`}>
                      {driver.status === 'online' ? 'Disponível' : 'Offline'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Veículo</span>
                      <span className="text-sm font-bold text-slate-600 uppercase italic">{driver.vehicle_type || "N/A"}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Parceiro desde</span>
                      <span className="flex items-center gap-1.5 text-sm font-bold text-slate-500">
                         {new Date(driver.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
