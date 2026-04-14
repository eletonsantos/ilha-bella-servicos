import Link from 'next/link'
import { Home, MessageCircle } from 'lucide-react'
import { getWhatsAppUrl } from '@/lib/whatsapp'

export default function NotFound() {
  return (
    <div className="min-h-screen gradient-dark flex items-center justify-center px-4 pt-24">
      <div className="text-center max-w-lg">
        <p className="text-brand-gold font-bold text-sm uppercase tracking-widest mb-4">
          Erro 404
        </p>
        <h1 className="text-6xl sm:text-8xl font-extrabold text-white mb-4 leading-none">
          404
        </h1>
        <h2 className="text-2xl font-bold text-white mb-4">
          Página não encontrada
        </h2>
        <p className="text-slate-400 text-base leading-relaxed mb-10">
          A página que você está procurando não existe ou foi movida.
          Volte ao início ou fale diretamente com nossa equipe.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-brand-blue
                       hover:bg-brand-blue-dark text-white font-semibold
                       px-6 py-3.5 rounded-xl transition-all duration-200"
          >
            <Home size={18} />
            Voltar ao início
          </Link>
          <Link
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#25D366]
                       hover:bg-[#20BA5A] text-white font-semibold
                       px-6 py-3.5 rounded-xl transition-all duration-200"
          >
            <MessageCircle size={18} />
            Falar no WhatsApp
          </Link>
        </div>
      </div>
    </div>
  )
}
