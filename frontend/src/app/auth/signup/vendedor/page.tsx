"use client"

import { AuthLayout } from "@/components/layout/AuthLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Store, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SellerSignUp() {
  const router = useRouter()
  const [storeName, setStoreName] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: storeName,
          storeName,
          cnpj,
          email,
          phone,
          password,
          role: "vendedor",
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.message || "Nao foi possivel concluir seu credenciamento.")
        return
      }

      router.push("/auth/login/vendedor")
    } catch {
      setError("A central de parceiros nao respondeu. Tente novamente em instantes.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout 
      role="vendedor" 
      title="Seja um Parceiro" 
      subtitle="Cadastre sua loja e comece a vender em minutos."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-bold border border-red-100">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="store-name">Nome da Loja</Label>
            <Input
              id="store-name"
              name="storeName"
              placeholder="Sua Loja S.A"
              className="h-11 rounded-xl"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              name="cnpj"
              placeholder="00.000.000/0001-00"
              className="h-11 rounded-xl"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail Comercial</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="contato@loja.com"
            className="h-11 rounded-xl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">WhatsApp de Vendas</Label>
          <Input
            id="phone"
            name="phone"
            placeholder="(11) 99999-9999"
            className="h-11 rounded-xl"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Criar Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Use a senha atual se este e-mail ja tiver conta"
            className="h-11 rounded-xl"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="py-2 space-y-3">
          {[
            "Visibilidade para milhares de clientes",
            "Gestão simplificada de estoque e pedidos",
            "Relatórios de vendas em tempo real"
          ].map((text, i) => (
            <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              {text}
            </div>
          ))}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-brand-teal text-white font-black rounded-2xl shadow-lg shadow-brand-teal/20 hover:bg-brand-teal/90 transition-all text-lg group"
        >
          {loading ? "Liberando acesso..." : "Solicitar Credenciamento"}
          <Store className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
        </Button>

        <div className="text-center pt-2">
          <p className="text-sm font-medium text-slate-500">
            Já é um parceiro? <Link href="/auth/login/vendedor" className="text-brand-teal font-black hover:underline">Entrar no Painel</Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}
