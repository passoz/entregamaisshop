"use client"

import { AuthLayout } from "@/components/layout/AuthLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { CheckCircle, Smartphone } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function DriverSignUp() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [vehicleType, setVehicleType] = useState("Moto")
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
          name,
          email,
          phone,
          vehicleType,
          password,
          role: "entregador",
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.message || "Nao foi possivel concluir seu cadastro.")
        return
      }

      router.push("/auth/login/entregador")
    } catch {
      setError("A central de rotas nao respondeu. Tente novamente em instantes.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout 
      role="entregador" 
      title="Ganhe com a Gente" 
      subtitle="Faça seu cadastro e comece a entregar na sua região."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-bold border border-red-100">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="fullname">Nome Completo</Label>
          <Input
            id="fullname"
            name="name"
            placeholder="Seu Nome"
            className="h-11 rounded-xl"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nome@exemplo.com"
              className="h-11 rounded-xl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Celular (WhatsApp)</Label>
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehicle">Veículo</Label>
          <select
            id="vehicle"
            name="vehicleType"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm font-medium focus:ring-2 focus:ring-brand-coral/10 bg-white outline-none"
          >
            <option>Moto</option>
            <option>Carro</option>
            <option>Bicicleta</option>
            <option>Caminhão (Leve)</option>
          </select>
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

        <div className="py-4 bg-brand-amber/5 rounded-[1.5rem] p-4 border border-brand-amber/10 space-y-3">
          {[
            "Flexibilidade de horários total",
            "Receba seus ganhos semanalmente",
            "Suporte exclusivo 24/7"
          ].map((text, i) => (
            <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-600">
              <CheckCircle className="w-4 h-4 text-brand-amber fill-brand-amber/10" />
              {text}
            </div>
          ))}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-brand-coral text-white font-black rounded-2xl shadow-lg shadow-brand-coral/20 hover:bg-brand-coral/90 transition-all text-lg group"
        >
          {loading ? "Liberando acesso..." : "Cadastrar para Entregar"}
          <Smartphone className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
        </Button>

        <div className="text-center pt-2">
          <p className="text-sm font-medium text-slate-500">
            Já é um parceiro? <Link href="/auth/login/entregador" className="text-brand-coral font-black hover:underline">Entrar Agora</Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}
