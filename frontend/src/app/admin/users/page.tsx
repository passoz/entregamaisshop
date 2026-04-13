"use client";

import { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Card, CardContent } from "@/components/ui/Card";
import { User, Mail, Phone, Calendar, Search } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Input } from "@/components/ui/Input";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  created_at: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await apiFetch<UserData[]>("/api/v1/admin/users");
        setUsers(data);
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PortalLayout title="Gestão de Usuários" role="admin">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Base de Usuários</h2>
            <p className="text-slate-500 text-sm">Visualize e gerencie todos os clientes da plataforma.</p>
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
          <div className="grid grid-cols-1 gap-4 animate-pulse">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-24 bg-slate-100 rounded-3xl" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <Card className="border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50">
            <CardContent className="p-12 text-center">
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Nenhum usuário encontrado.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden rounded-3xl group">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-brand-sky/10 rounded-2xl flex items-center justify-center text-brand-sky">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{user.name}</h3>
                        <div className="flex flex-wrap gap-4 mt-1">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                            <Mail className="w-3.5 h-3.5" /> {user.email}
                          </span>
                          {user.phone && (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                              <Phone className="w-3.5 h-3.5" /> {user.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Cadastro</span>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                          <Calendar className="w-3.5 h-3.5" /> {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        user.status === 'active' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'
                      }`}>
                        {user.status === 'active' ? 'Ativo' : 'Inativo'}
                      </div>
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
