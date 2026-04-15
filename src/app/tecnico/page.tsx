import Link from 'next/link'
import { Wrench, LogIn, UserPlus, Smartphone, MapPin, FileText, DollarSign, Zap, CheckCircle, ChevronDown } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Portal do Técnico Parceiro | Ilha Bella Serviços',
  description: 'Trabalhe com a Ilha Bella Serviços. Receba chamados pelo app, atenda na sua região e ganhe por serviço com fechamento mensal.',
  robots: 'noindex',
}

const steps = [
  {
    icon: UserPlus,
    title: 'Cadastre-se',
    desc: 'Preencha o formulário com seus dados e especialidade. Nossa equipe analisa e aprova o seu perfil.',
  },
  {
    icon: Smartphone,
    title: 'Receba chamados pelo app',
    desc: 'Após aprovação, você começa a receber chamados por demanda conforme sua localização e especialidade.',
  },
  {
    icon: MapPin,
    title: 'Atenda na sua região',
    desc: 'Aceite os serviços que quiser, na hora que puder. Você tem autonomia total sobre sua agenda.',
  },
  {
    icon: DollarSign,
    title: 'Receba mensalmente',
    desc: 'Todo mês fechamos os serviços realizados. Você emite sua NF e recebe o valor acordado.',
  },
]

const benefits = [
  { title: 'Serviços por demanda', desc: 'Chamados chegam pelo app conforme sua localização. Sem burocracia para começar a atender.' },
  { title: 'Autonomia total', desc: 'Você escolhe quando e quanto trabalhar. Sem exclusividade, sem horário fixo.' },
  { title: 'Fechamento organizado', desc: 'Painel digital com todos os seus atendimentos, valores e status de pagamento em um só lugar.' },
  { title: 'Emissão de NF simples', desc: 'Envie sua nota fiscal direto pelo portal. Aceitamos MEI, autônomo com RPA ou empresa.' },
  { title: 'Antecipação disponível', desc: 'Precisa do dinheiro antes? Solicite a antecipação do seu fechamento com taxa de apenas 10%.' },
  { title: 'Suporte da equipe', desc: 'Time disponível para tirar dúvidas, resolver problemas e garantir que você receba certinho.' },
]

const faqs = [
  {
    q: 'Como funcionam os chamados?',
    a: 'Os chamados chegam pelo aplicativo conforme sua localização e especialidade cadastrada. Você vê o serviço, endereço e valor estimado antes de aceitar.',
  },
  {
    q: 'Como é feito o pagamento?',
    a: 'Todo mês fazemos o fechamento com todos os serviços realizados no período. Após você enviar sua nota fiscal pelo portal, liberamos o pagamento via Pix.',
  },
  {
    q: 'Preciso ter CNPJ?',
    a: 'Não obrigatoriamente. Aceitamos MEI, autônomo com RPA (Recibo de Pagamento a Autônomo) ou empresa com CNPJ. O importante é emitir nota fiscal ou recibo.',
  },
  {
    q: 'Posso trabalhar para outras empresas ao mesmo tempo?',
    a: 'Sim. Não exigimos exclusividade. Você pode continuar atendendo por conta própria ou por outras empresas.',
  },
  {
    q: 'O que é a antecipação de pagamento?',
    a: 'Quando seu pagamento está liberado, você pode solicitar receber antes da data prevista. Cobramos uma taxa de 10% sobre o valor total e o dinheiro cai na sua conta em até 48h.',
  },
  {
    q: 'Quais especialidades vocês precisam?',
    a: 'Encanadores, eletricistas, marmoristas, serralheiros, pintores, pedreiros, técnicos de ar-condicionado, vidraceiros e outras especialidades de manutenção residencial e comercial.',
  },
  {
    q: 'Como funciona a aprovação do cadastro?',
    a: 'Após preencher o formulário, nossa equipe analisa seu perfil em até 2 dias úteis. Se aprovado, você recebe acesso ao painel e começa a receber chamados.',
  },
  {
    q: 'Há algum custo para se cadastrar?',
    a: 'Não. O cadastro é gratuito. Você só tem custo se optar pela antecipação de pagamento (10% de taxa).',
  },
]

export default function TecnicoPortal() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-blue-dark to-slate-900 flex flex-col">

      {/* Header */}
      <header className="container-site py-6 flex items-center justify-between">
        <Link href="/" className="text-white font-bold text-sm hover:text-brand-gold transition-colors">
          ← Ilha Bella Serviços
        </Link>
        <Link
          href="/tecnico/login"
          className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <LogIn size={14} /> Entrar
        </Link>
      </header>

      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="container-site py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-gold/20 text-brand-gold text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            <Wrench size={14} /> Portal do Técnico
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 text-balance leading-tight max-w-2xl mx-auto">
            Receba chamados, atenda e{' '}
            <span className="text-brand-gold">ganhe por serviço</span>
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-xl mx-auto mb-10">
            Trabalhe com autonomia, receba pela sua região e acompanhe tudo pelo painel digital.
            Fechamento mensal, nota fiscal simples e pagamento via Pix.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/tecnico-parceiro"
              className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-white font-bold px-8 py-4 rounded-xl text-base transition-all shadow-lg hover:shadow-xl w-full sm:w-auto justify-center"
            >
              <UserPlus size={18} /> Quero ser técnico parceiro
            </Link>
            <Link
              href="/tecnico/login"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all w-full sm:w-auto justify-center"
            >
              <LogIn size={18} /> Já sou parceiro — entrar
            </Link>
          </div>
        </section>

        {/* ── Como funciona ── */}
        <section className="container-site py-14">
          <div className="text-center mb-10">
            <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-2">Como funciona</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Do cadastro ao pagamento</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {steps.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center mx-auto mb-1">
                  <span className="text-brand-gold font-extrabold text-sm">{i + 1}</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-brand-blue/30 flex items-center justify-center mx-auto mb-4 mt-2">
                  <Icon size={22} className="text-brand-gold" />
                </div>
                <h3 className="text-white font-bold text-sm mb-2">{title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Benefícios ── */}
        <section className="container-site py-14">
          <div className="text-center mb-10">
            <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-2">Vantagens</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Por que trabalhar com a Ilha Bella?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {benefits.map(({ title, desc }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-brand-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-white font-bold text-sm mb-1">{title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Destaques financeiros ── */}
        <section className="container-site py-10">
          <div className="max-w-3xl mx-auto grid sm:grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <FileText size={28} className="text-brand-gold mx-auto mb-3" />
              <p className="text-white font-bold text-sm">Fechamento mensal</p>
              <p className="text-slate-400 text-xs mt-1">Todos os serviços do mês organizados em um único fechamento</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <DollarSign size={28} className="text-brand-gold mx-auto mb-3" />
              <p className="text-white font-bold text-sm">Pagamento via Pix</p>
              <p className="text-slate-400 text-xs mt-1">Receba na chave Pix cadastrada assim que a NF for aprovada</p>
            </div>
            <div className="bg-white/5 border border-emerald-500/30 rounded-2xl p-6 text-center">
              <Zap size={28} className="text-emerald-400 mx-auto mb-3" />
              <p className="text-white font-bold text-sm">Antecipação disponível</p>
              <p className="text-slate-400 text-xs mt-1">Receba antes com taxa de 10%. Dinheiro em até 48h após aprovação</p>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="container-site py-14">
          <div className="text-center mb-10">
            <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-2">Dúvidas frequentes</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Perguntas e respostas</h2>
          </div>
          <div className="max-w-2xl mx-auto space-y-3">
            {faqs.map(({ q, a }) => (
              <details key={q} className="bg-white/5 border border-white/10 rounded-2xl group">
                <summary className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer list-none">
                  <span className="text-white font-semibold text-sm">{q}</span>
                  <ChevronDown size={16} className="text-slate-400 flex-shrink-0 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-5">
                  <p className="text-slate-400 text-sm leading-relaxed">{a}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* ── CTA final ── */}
        <section className="container-site py-14 text-center">
          <div className="max-w-xl mx-auto bg-white/5 border border-brand-gold/20 rounded-2xl p-10">
            <Wrench size={32} className="text-brand-gold mx-auto mb-4" />
            <h2 className="text-2xl font-extrabold text-white mb-3">Pronto para começar?</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Preencha o cadastro agora. Nossa equipe analisa em até 2 dias úteis e entra em contato.
            </p>
            <Link
              href="/tecnico-parceiro"
              className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg"
            >
              <UserPlus size={18} /> Fazer cadastro agora
            </Link>
          </div>
        </section>

      </main>

      <footer className="container-site py-6 text-center text-slate-500 text-xs border-t border-white/10">
        Ilha Bella Serviços — Portal do Técnico Parceiro
      </footer>
    </div>
  )
}
