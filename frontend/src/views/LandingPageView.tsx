"use client";

import { useState } from "react";
import { CheckCircle2, FileText, ShieldCheck, Users, CalendarDays } from "lucide-react";

type Props = { onLogin: () => void };

export function LandingPageView({ onLogin }: Props) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col bg-white text-zinc-900">
      <nav className="flex items-center justify-between border-b border-zinc-200 px-10 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-lg font-bold text-white">L</div>
          <span className="text-xl font-bold text-zinc-950">LegalHub</span>
        </div>
        <div className="hidden items-center gap-8 text-sm font-medium text-zinc-700 md:flex">
          <a href="#solucoes" className="hover:text-orange-500">Soluções</a>
          <a href="#prova-social" className="hover:text-orange-500">Depoimentos</a>
          <a href="#faq" className="hover:text-orange-500">Dúvidas Frequentes</a>
        </div>
        <button onClick={onLogin} className="rounded-lg bg-orange-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-orange-600">Acessar Painel</button>
      </nav>

      <header className="flex flex-col items-center gap-12 bg-gradient-to-b from-white to-zinc-50 px-10 py-16 lg:flex-row lg:px-24 lg:py-24">
        <div className="flex flex-1 flex-col gap-6 text-left">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-zinc-950 lg:text-5xl">Gerencie sua advocacia com eficiência incomparável</h1>
          <p className="max-w-xl text-lg leading-relaxed text-zinc-600">Controle de clientes, prazos fatais e documentos inteligentes em um único lugar. Simplifique sua rotina jurídica e escale sua banca.</p>
          <div className="mt-4 flex flex-wrap gap-4">
            <button onClick={onLogin} className="flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600">
              <span>🚀</span> Começar Teste Gratuito de 14 dias
            </button>
            <button onClick={onLogin} className="flex items-center gap-2 rounded-xl border border-zinc-300 px-8 py-4 text-base font-bold text-zinc-800 transition hover:bg-zinc-100">
              <span>▶️</span> Ver Demo
            </button>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="relative max-w-md rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl">
            <div className="flex h-64 w-full flex-col items-center justify-center rounded-xl bg-zinc-950 p-6 text-zinc-400">
              <span className="mb-4 text-7xl">💻</span>
              <span className="text-lg font-bold text-white">LegalHub Workspace</span>
              <span className="mt-1 text-xs text-zinc-500">Kanban & CRM Ativo</span>
            </div>
          </div>
        </div>
      </header>

      <section id="solucoes" className="border-t border-zinc-200 bg-white px-10 py-20 lg:px-24">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-zinc-950">Três Pilares de Sucesso</h2>
          <p className="mt-3 text-zinc-600">A melhor estrutura tecnológica para impulsionar seus resultados operacionais.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { icon: <Users size={28} />, title: "Gestão Ativa de Clientes", desc: "Prontuários centralizados com histórico completo, dados cadastrais indexados e acompanhamento dinâmico do CRM." },
            { icon: <CalendarDays size={28} />, title: "Sem Perda de Prazos Fatais", desc: "Quadro Kanban visual integrado com alertas semânticos de urgência para manter o cumprimento dos prazos em 100%." },
            { icon: <FileText size={28} />, title: "Automação de Documentos", desc: "Biblioteca inteligente de modelos e petições iniciais com substituição instantânea de variáveis dinâmicas." },
          ].map((item) => (
            <div key={item.title} className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-8">
              <div className="text-zinc-900">{item.icon}</div>
              <h3 className="text-xl font-bold text-zinc-950">{item.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="prova-social" className="border-t border-zinc-200 bg-zinc-50 px-10 py-20 lg:px-24">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-zinc-950">Confiança de Advogados Parceiros</h2>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          {[
            { name: "Dr. João Silva", firm: "Silva & Cia Advogados", text: "LegalHub revolucionou nossa gestão de prazos no escritório. Escalamos em 3 meses o que levaria 2 anos." },
            { name: "Dra. Maria Costa", firm: "Costa Consultoria Jurídica", text: "A automação de documentos com variáveis dinâmicas nos poupou mais de 20 horas semanais de redação manual." },
          ].map((item) => (
            <div key={item.name} className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-8">
              <div className="text-lg text-amber-500">★★★★★</div>
              <p className="italic text-zinc-700">“{item.text}”</p>
              <div>
                <h4 className="text-sm font-bold text-zinc-900">{item.name}</h4>
                <span className="text-xs text-zinc-500">{item.firm}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="border-t border-zinc-200 bg-white px-10 py-20 lg:px-24">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-zinc-950">Perguntas Frequentes</h2>
        </div>
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {[
            { q: "Como começo meu teste gratuito?", a: "Clique em 'Começar Teste' e crie suas credenciais. O acesso é liberado imediatamente por 14 dias, sem cartão de crédito." },
            { q: "Posso importar meus clientes existentes?", a: "Sim. A plataforma oferece importação via planilha CSV para acelerar o onboarding." },
            { q: "Qual é o preço após o teste?", a: "Temos planos a partir de R$ 99/mês com escalonamento conforme usuários ativos." },
            { q: "Existe suporte e treinamento?", a: "Sim. Temos suporte via chat/e-mail, além de documentação e onboarding guiado." },
          ].map((faq, index) => (
            <div key={faq.q} className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
              <button onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)} className="flex w-full items-center justify-between bg-white p-5 text-left text-sm font-bold text-zinc-900 transition hover:bg-zinc-50">
                <span>{faq.q}</span>
                <span className="text-lg">{openFaqIndex === index ? "−" : "+"}</span>
              </button>
              {openFaqIndex === index && <div className="border-t border-zinc-100 bg-zinc-50 p-5 text-xs leading-relaxed text-zinc-600">{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-zinc-900 bg-zinc-950 px-10 py-12 text-zinc-400 lg:px-24">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex flex-col gap-2">
            <span className="text-lg font-bold text-white">© 2024 LegalHub</span>
            <span className="text-xs text-zinc-500">Gestão e Automação Jurídica Inteligente</span>
          </div>
          <div className="flex gap-6 text-xs">
            <a href="#" className="hover:text-white">Política de Privacidade</a>
            <a href="#" className="hover:text-white">Termos de Serviço</a>
            <a href="#" className="hover:text-white">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
