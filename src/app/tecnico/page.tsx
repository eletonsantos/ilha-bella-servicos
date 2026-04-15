import Link from 'next/link'
import { Wrench, LogIn, UserPlus } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Área do Técnico | Ilha Bella Serviços',
  description: 'Portal exclusivo para técnicos parceiros da Ilha Bella Serviços.',
  robots: 'noindex',
}

export default function TecnicoLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-blue-dark to-slate-900 flex flex-col">
      <header className="container-site py-6">
        <Link href="/" className="text-white font-bold text-sm hover:text-brand-gold transition-colors">
          ← Ilha Bella Serviços
        </Link>
      </header>

      <main className="flex-1 flex items-center">
        <div className="container-site py-16">
          <div className="max-w-xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-brand-gold/20 text-brand-gold text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              <Wrench size={14} />
              Portal do Técnico
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 text-balance leading-tight">
              Área do Técnico
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              Acesse sua área ou cadastre-se para fazer parte da equipe Ilha Bella.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Já sou técnico */}
            <Link
              href="/tecnico/login"
              className="group bg-white/5 border border-white/10 hover:border-brand-gold/50 hover:bg-white/10 rounded-2xl p-8 text-center transition-all duration-200"
            >
              <div className="w-14 h-14 rounded-xl bg-brand-blue/40 flex items-center justify-center mx-auto mb-5 group-hover:bg-brand-blue/60 transition-colors">
                <LogIn size={26} className="text-white" />
              </div>
              <h2 className="text-xl font-extrabold text-white mb-2">Já sou técnico parceiro</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Acesse seus fechamentos, envie sua nota fiscal e acompanhe pagamentos.
              </p>
              <span className="inline-block mt-5 text-brand-gold font-semibold text-sm group-hover:underline">
                Entrar →
              </span>
            </Link>

            {/* Quero ser técnico */}
            <Link
              href="/tecnico-parceiro"
              className="group bg-white/5 border border-white/10 hover:border-brand-gold/50 hover:bg-white/10 rounded-2xl p-8 text-center transition-all duration-200"
            >
              <div className="w-14 h-14 rounded-xl bg-brand-gold/20 flex items-center justify-center mx-auto mb-5 group-hover:bg-brand-gold/30 transition-colors">
                <UserPlus size={26} className="text-brand-gold" />
              </div>
              <h2 className="text-xl font-extrabold text-white mb-2">Quero ser técnico parceiro</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Faça parte da nossa rede de técnicos. Preencha o cadastro e aguarde nossa análise.
              </p>
              <span className="inline-block mt-5 text-brand-gold font-semibold text-sm group-hover:underline">
                Cadastrar →
              </span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="container-site py-6 text-center text-slate-500 text-xs border-t border-white/10">
        Ilha Bella Serviços — Área restrita para técnicos parceiros
      </footer>
    </div>
  )
}
