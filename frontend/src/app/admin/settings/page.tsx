"use client";

import { PortalLayout } from "@/components/layout/PortalLayout";
import { Card, CardContent } from "@/components/ui/Card";
import { Settings, Shield, Bell, Database, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminSettings() {
  const sections = [
    { title: "Segurança", icon: <Shield className="w-5 h-5" />, description: "Políticas de senha, 2FA e logs de acesso." },
    { title: "Notificações", icon: <Bell className="w-5 h-5" />, description: "Configuração de alertas do sistema e e-mails." },
    { title: "Dados e Backup", icon: <Database className="w-5 h-5" />, description: "Manutenção do banco de dados e exportação." },
    { title: "Regionalização", icon: <Globe className="w-5 h-5" />, description: "Cidades ativas e moedas suportadas." },
  ];

  return (
    <PortalLayout title="Configurações do Sistema" role="admin">
      <div className="max-w-4xl space-y-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Painel de Controle</h2>
          <p className="text-slate-500 text-sm">Ajuste os parâmetros fundamentais da plataforma EntregaMais.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section, i) => (
            <Card key={i} className="border-slate-100 shadow-sm hover:shadow-md transition-all rounded-3xl group cursor-pointer bg-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-ze-yellow group-hover:text-ze-black transition-all">
                    {section.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{section.title}</h3>
                    <p className="text-xs font-bold text-slate-400 mt-1 leading-relaxed">{section.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-slate-100 shadow-sm rounded-3xl bg-white overflow-hidden">
          <div className="h-1 w-full bg-ze-yellow" />
          <CardContent className="p-8">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-6 flex items-center gap-2">
              <Settings className="w-6 h-6" /> Parâmetros Gerais
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-sm font-black text-slate-700 uppercase tracking-tight">Manutenção Programada</p>
                  <p className="text-xs font-bold text-slate-400">Ativa o modo de manutenção para todos os usuários.</p>
                </div>
                <div className="w-12 h-6 bg-slate-200 rounded-full relative">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-sm font-black text-slate-700 uppercase tracking-tight">Taxa de Serviço Padrão</p>
                  <p className="text-xs font-bold text-slate-400">Porcentagem cobrada sobre cada pedido concluído.</p>
                </div>
                <div className="text-lg font-black text-brand-teal">12%</div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button className="bg-ze-black text-ze-yellow hover:bg-ze-black/90 rounded-2xl px-8 h-12 font-black uppercase tracking-widest text-xs">
                Salvar Alterações
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
