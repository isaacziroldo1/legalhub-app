"use client";

import { useState, type FormEvent, type InputHTMLAttributes } from "react";
import { Lock, Mail, Eye } from "lucide-react";
import { useAuth } from "@/auth/useAuth";
import type { ReactNode } from "react";

type Props = { onBackToLanding: () => void };

export function LoginView({ onBackToLanding }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState("teste@legalhub.com");
  const [password, setPassword] = useState("LegalHub@123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login({ email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao autenticar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-zinc-100">
      <div className="hidden w-[500px] flex-col justify-between bg-zinc-950 p-16 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 font-bold text-white">L</div>
          <span className="text-xl font-bold">LegalHub</span>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="text-3xl font-extrabold leading-tight">A plataforma inteligente para escritórios que escalam.</h2>
          <p className="text-sm leading-relaxed text-zinc-400">Centralize seus clientes, automatize a redação de contratos e nunca mais perca um prazo fatal.</p>
        </div>
        <span className="text-xs text-zinc-500">© 2024 LegalHub Software de Gestão S.A.</span>
      </div>

      <div className="flex flex-1 items-center justify-center bg-zinc-50 p-8">
        <div className="flex w-full max-w-md flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-10 shadow-xl">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-bold text-zinc-950">Acesse sua conta</h3>
            <p className="text-xs text-zinc-500">Insira suas credenciais para acessar o painel</p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={submit}>
            <Field label="Endereço de E-mail" icon={<Mail size={14} />} value={email} onChange={setEmail} placeholder="teste@legalhub.com" type="email" />
            <Field label="Sua Senha" icon={<Lock size={14} />} value={password} onChange={setPassword} placeholder="LegalHub@123" type="password" suffix={<Eye size={14} className="text-zinc-400" />} />

            {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</div>}

            <button type="submit" disabled={loading} className="mt-2 w-full rounded-lg bg-orange-500 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/10 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70">
              {loading ? "Entrando..." : "Entrar na Plataforma"}
            </button>
          </form>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-600">
            <div className="font-bold text-zinc-900">Usuário de teste</div>
            <div>Email: <span className="font-mono">teste@legalhub.com</span></div>
            <div>Senha: <span className="font-mono">LegalHub@123</span></div>
          </div>

          <div className="flex justify-center gap-1.5 text-center text-xs text-zinc-500">
            <span>Ainda não tem conta?</span>
            <button onClick={onBackToLanding} className="font-bold text-orange-500 hover:underline">Crie uma agora</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon, suffix, onChange, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & { label: string; icon: ReactNode; suffix?: ReactNode; onChange: (value: string) => void }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-bold text-zinc-700">{label}</span>
      <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2">
        <div className="flex w-full items-center gap-2">
          <span className="text-zinc-400">{icon}</span>
          <input {...props} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent text-sm text-zinc-800 outline-none" />
        </div>
        {suffix}
      </div>
    </label>
  );
}
