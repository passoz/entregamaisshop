"use client";

import { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Card, CardContent } from "@/components/ui/Card";
import { Store, MapPin, Star, Search } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

interface SellerData {
  id: string;
  name: string;
  city: string;
  state: string;
  status: string;
  rating?: number;
}

export default function AdminSellers() {
  const [sellers, setSellers] = useState<SellerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchSellers() {
      try {
        const data = await apiFetch<SellerData[]>("/api/v1/admin/sellers");
        setSellers(data);
      } catch (error) {
        console.error("Erro ao carregar lojistas:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSellers();
  }, []);

  const filteredSellers = sellers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PortalLayout title="Depósitos Parceiros" role="admin">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Gestão de Depósitos</h2>
            <p className="text-slate-500 text-sm">Monitore e gerencie os pontos de venda da plataforma.</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Buscar por nome do depósito..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 rounded-2xl border-slate-200 focus:border-ze-yellow"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-slate-100 rounded-3xl" />
            ))}
          </div>
        ) : filteredSellers.length === 0 ? (
          <Card className="border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50">
            <CardContent className="p-12 text-center">
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Nenhum depósito encontrado.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSellers.map((seller) => (
              <Card key={seller.id} className="border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden rounded-[2rem] bg-white group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-brand-amber/10 rounded-2xl flex items-center justify-center text-brand-amber">
                      <Store className="w-6 h-6" />
                    </div>
                    <Badge className={`${
                      seller.status === 'active' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-amber-50 text-amber-500 border-amber-100'
                    } font-black uppercase text-[9px] tracking-widest px-2.5 py-0.5 rounded-full border`}>
                      {seller.status === 'active' ? 'Ativo' : 'Pendente'}
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight group-hover:text-brand-teal transition-colors truncate">{seller.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5" /> {seller.city}, {seller.state}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center text-amber-400 bg-amber-50 px-2 py-0.5 rounded-lg text-xs font-black">
                      <Star className="w-3.5 h-3.5 mr-1 fill-current" /> {(seller.rating || 5.0).toFixed(1)}
                    </div>
                    <button className="text-[10px] font-black uppercase tracking-widest text-brand-teal hover:underline">
                      Ver Detalhes
                    </button>
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
