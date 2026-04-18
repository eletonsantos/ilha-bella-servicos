'use client'
import { Printer } from 'lucide-react'
export default function PrintButton() {
  return (
    <button onClick={() => window.print()}
      className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors print:hidden">
      <Printer size={15} /> Imprimir / Salvar PDF
    </button>
  )
}
