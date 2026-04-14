import Link from 'next/link'
import { Wrench, Shield, FileText, CheckCircle } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Área do Técnico | Ilha Bella Serviços',
  description: 'Portal exclusivo para técnicos parceiros da Ilha Bella Serviços.',
  robots: 'noindex',
}

const features = [
  { icon: Shield, title: 'Acesso seguro', desc: 'Login com Google ou e-mail e senha.' },
  { icon: FileText, title: 'Seus fechamentos', desc: 'Visualize competências, valores e status.' },
  { icon: Wrench, title: 'Envie sua NF', desc: 'Upload simples e rastreável da nota fiscal.' },
  { icon: CheckCircle, title: 'Acompanhe o pagamento', desc: 'Status atualizado em tempo real.' },
]

export default function TecnicoLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-blue-dark to-slate-900 flex flex-col">
      <header className="container-site py-6 flex items-center justify-between">
        <Link href="/" className="text-white font-bold text-lg">
          ← Ilha Bella Serviços
        </Link>
      </header>

      <main className="flex-1 flex items-center">
        <div className="container-site py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-brand-gold/20 text-brand-gold text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              <Wrench size={14} />
              Portal do Técnico
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 text-balance leading-tight">
              Sua área de trabalho na{' '}
              <span className="text-brand-gold">Ilha Bella</span>
            </h1>
            <p className="text-slate-300 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Acesse seus fechamentos, acompanhe pagamentos e envie sua nota fiscal de forma simples e segura.
            </p>
            <Link
              href="/tecnico/login"
              className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold/90
                         text-white font-bold px-8 py-4 rounded-xl text-lg
                         transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Entrar na área do técnico
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-20 max-w-4xl mx-auto">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-brand-blue/30 flex items-center justify-center mx-auto mb-4">
                  <Icon size={22} className="text-brand-gold" />
                </div>
                <h3 className="text-white font-bold text-sm mb-2">{title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="container-site py-6 text-center text-slate-500 text-xs border-t border-white/10">
        Ilha Bella Serviços — Área restrita para técnicos parceiros
      </footer>
    </div>
  )
}
