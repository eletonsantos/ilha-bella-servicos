import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Instalar app | Ilha Bella Serviços',
}

export default function InstalarPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-xl mb-4">
            <img src="/logo.png" alt="Ilha Bella" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Ilha Bella Serviços</h1>
          <p className="text-blue-200 text-sm mt-1">Instale o app na sua tela inicial</p>
        </div>

        {/* Android instructions */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🤖</span>
            <h2 className="text-white font-bold">Android (Chrome)</h2>
          </div>
          <ol className="space-y-3">
            {[
              'Abra este link no Chrome',
              'Toque nos 3 pontinhos (⋮) no canto superior direito',
              'Selecione "Adicionar à tela inicial"',
              'Confirme tocando em "Adicionar"',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-blue text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="text-blue-100 text-sm">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* iOS instructions */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🍎</span>
            <h2 className="text-white font-bold">iPhone / iPad (Safari)</h2>
          </div>
          <ol className="space-y-3">
            {[
              'Abra este link no Safari (não no Chrome)',
              'Toque no ícone de compartilhar (□↑) na barra inferior',
              'Role para baixo e toque "Adicionar à Tela de Início"',
              'Toque em "Adicionar" no canto superior direito',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="text-blue-100 text-sm">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Login button */}
        <Link
          href="/tecnico/login"
          className="block w-full bg-brand-blue hover:bg-blue-600 text-white font-bold text-center py-4 rounded-2xl transition-all text-base shadow-lg"
        >
          Ir para o login →
        </Link>

        <p className="text-center text-blue-300 text-xs">
          Depois de instalar, o app abre direto sem precisar do navegador
        </p>
      </div>
    </div>
  )
}
