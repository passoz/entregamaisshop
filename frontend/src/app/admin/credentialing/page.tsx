"use client";

import { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle, XCircle, Store, Calendar, FileText } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/providers/ToastProvider";

interface Seller {
  id: string;
  name: string;
  document: string;
  status: string;
  created_at: string;
}

export default function AdminCredentialing() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const fetchSellers = async () => {
    setIsLoading(true);
    try {
      // In a real app we might have a specific endpoint or filter
      const data = await apiFetch<Seller[]>("/api/v1/admin/sellers");
      // Filter for pending ones locally for the demo if the backend returns all
      setSellers(data.filter(s => s.status === "pending"));
    } catch (error) {
      showToast("Erro ao carregar solicitações", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await apiFetch(`/api/v1/admin/sellers/${id}/approve`, { method: "POST" });
      showToast("Lojista aprovado com sucesso!", "success");
      setSellers(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      showToast("Erro ao aprovar lojista", "error");
    }
  };

  return (
    <PortalLayout title="Credenciamento de Lojistas" role="admin">
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Solicitações Pendentes</h2>
          <p className="text-slate-500 text-sm">Analise e aprove novos parceiros para a plataforma.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-100 rounded-3xl" />
            ))}
          </div>
        ) : sellers.length === 0 ? (
          <Card className="border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Store className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                Nenhuma solicitação pendente no momento.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sellers.map((seller) => (
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
                        onClick={() => handleApprove(seller.id)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-200 px-6 font-bold"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" /> Aprovar
                      </Button>
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
