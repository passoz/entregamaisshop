"use client";

import { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle, XCircle, Store, Calendar, FileText, Truck } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/providers/ToastProvider";

interface Seller {
  id: string;
  name: string;
  document: string;
  status: string;
  created_at: string;
}

interface Driver {
  id: string;
  status: string;
  vehicle_type: string;
  created_at: string;
  edges?: {
    user?: {
      name: string;
      email: string;
    }
  }
}

export default function AdminCredentialing() {
  const [activeTab, setActiveTab] = useState<"sellers" | "drivers">("sellers");
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const fetchSellers = async () => {
    try {
      const data = await apiFetch<Seller[]>("/api/v1/admin/sellers");
      setSellers(data.filter(s => s.status === "pending"));
    } catch (error) {
      showToast("Erro ao carregar lojistas", "error");
    }
  };

  const fetchDrivers = async () => {
    try {
      const data = await apiFetch<Driver[]>("/api/v1/admin/drivers");
      setDrivers(data.filter(d => d.status === "pending"));
    } catch (error) {
      showToast("Erro ao carregar entregadores", "error");
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([fetchSellers(), fetchDrivers()]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveSeller = async (id: string) => {
    try {
      await apiFetch(`/api/v1/admin/sellers/${id}/approve`, { method: "POST" });
      showToast("Lojista aprovado com sucesso!", "success");
      setSellers(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      showToast("Erro ao aprovar lojista", "error");
    }
  };

  const handleApproveDriver = async (id: string) => {
    try {
      await apiFetch(`/api/v1/admin/drivers/${id}/approve`, { method: "POST" });
      showToast("Entregador aprovado com sucesso!", "success");
      setDrivers(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      showToast("Erro ao aprovar entregador", "error");
    }
  };

  return (
    <PortalLayout title="Central de Credenciamento" role="admin">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Solicitações Pendentes</h2>
            <p className="text-slate-500 text-sm">Analise e aprove novos parceiros para a plataforma.</p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button 
              onClick={() => setActiveTab("sellers")}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === "sellers" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Lojistas ({sellers.length})
            </button>
            <button 
              onClick={() => setActiveTab("drivers")}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === "drivers" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Entregadores ({drivers.length})
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 animate-pulse">
            {[1, 2].map(i => (
              <div key={i} className="h-32 bg-slate-100 rounded-3xl" />
            ))}
          </div>
        ) : (activeTab === "sellers" ? sellers : drivers).length === 0 ? (
          <Card className="border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                {activeTab === "sellers" ? <Store className="w-8 h-8 text-slate-300" /> : <Truck className="w-8 h-8 text-slate-300" />}
              </div>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                Nenhuma solicitação de {activeTab === "sellers" ? "lojista" : "entregador"} pendente.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {activeTab === "sellers" ? (
              sellers.map((seller) => (
                <Card key={seller.id} className="border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden rounded-3xl group">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-brand-amber/10 rounded-2xl flex items-center justify-center text-brand-amber shadow-inner">
                          <Store className="w-7 h-7" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{seller.name}</h3>
                          <div className="flex flex-wrap gap-4 mt-1">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                              <FileText className="w-3.5 h-3.5" /> CNPJ: {seller.document}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                              <Calendar className="w-3.5 h-3.5" /> {new Date(seller.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button 
                          variant="ghost" 
                          className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                        >
                          <XCircle className="w-5 h-5 mr-2" /> Recusar
                        </Button>
                        <Button 
                          onClick={() => handleApproveSeller(seller.id)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-200 px-6 font-bold"
                        >
                          <CheckCircle className="w-5 h-5 mr-2" /> Aprovar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              drivers.map((driver) => (
                <Card key={driver.id} className="border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden rounded-3xl group">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-brand-teal/10 rounded-2xl flex items-center justify-center text-brand-teal shadow-inner">
                          <Truck className="w-7 h-7" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{driver.edges?.user?.name || "Entregador"}</h3>
                          <div className="flex flex-wrap gap-4 mt-1">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                              <FileText className="w-3.5 h-3.5" /> Veículo: {driver.vehicle_type || "N/A"}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                              <Calendar className="w-3.5 h-3.5" /> {new Date(driver.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button 
                          variant="ghost" 
                          className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                        >
                          <XCircle className="w-5 h-5 mr-2" /> Recusar
                        </Button>
                        <Button 
                          onClick={() => handleApproveDriver(driver.id)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-200 px-6 font-bold"
                        >
                          <CheckCircle className="w-5 h-5 mr-2" /> Aprovar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
