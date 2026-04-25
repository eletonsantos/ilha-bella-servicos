'use client'

import { useEffect, useState } from 'react'
import { Building2, Users, Loader2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'

interface Socio {
  nome_socio: string
  qualificacao_socio: string
  faixa_etaria?: string
}

interface CnpjData {
  cnpj: string
  razao_social: string
  nome_fantasia: string
  situacao_cadastral: string
  municipio: string
  uf: string
  descricao_situacao_cadastral?: string
  qsa?: Socio[]
}

interface Props {
  cpfCnpj: string
}

export default function CnpjInfoCard({ cpfCnpj }: Props) {
  const digits = cpfCnpj.replace(/\D/g, '')
  const isCnpj = digits.length === 14

  const [data, setData]     = useState<CnpjData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  useEffect(() => {
    if (!isCnpj) return
    setLoading(true)
    fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`)
      .then(r => r.ok ? r.json() : Promise.reject('CNPJ não encontrado na Receita Federal.'))
      .then(setData)
      .catch(e => setError(typeof e === 'string' ? e : 'Erro ao consultar CNPJ.'))
      .finally(() => setLoading(false))
  }, [digits, isCnpj])

  if (!isCnpj) return null

  // situacao_cadastral pode vir como string ("ATIVA") ou número (2) dependendo do CNPJ —
  // convertemos para string antes para evitar "toUpperCase is not a function"
  const ativa = String(data?.situacao_cadastral ?? '').toUpperCase() === 'ATIVA'

  return (
    <div className="card p-6 border-l-4 border-brand-blue">
      <div className="flex items-center gap-2 mb-4">
        <Building2 size={16} className="text-brand-blue" />
        <h2 className="font-bold text-dark text-sm">Dados da Empresa (Receita Federal)</h2>
        {loading && <Loader2 size={14} className="animate-spin text-slate-400 ml-auto" />}
      </div>

      {loading && (
        <p className="text-sm text-slate-400">Consultando CNPJ {cpfCnpj}...</p>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {data && !loading && (
        <div className="space-y-4">
          {/* Dados principais */}
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="sm:col-span-2">
              <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide mb-0.5">Razão Social</p>
              <p className="font-bold text-dark">{data.razao_social}</p>
            </div>

            {data.nome_fantasia && (
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide mb-0.5">Nome Fantasia</p>
                <p className="text-dark">{data.nome_fantasia}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide mb-0.5">Município</p>
              <p className="text-dark">{data.municipio} — {data.uf}</p>
            </div>

            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide mb-0.5">Situação Cadastral</p>
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                ativa ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {ativa ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                {data.situacao_cadastral}
              </span>
            </div>
          </div>

          {/* Quadro societário */}
          {data.qsa && data.qsa.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users size={14} className="text-slate-400" />
                <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide">
                  Quadro Societário ({data.qsa.length})
                </p>
              </div>
              <div className="space-y-2">
                {data.qsa.map((s, i) => (
                  <div key={i} className="flex items-start justify-between bg-slate-50 rounded-xl px-3 py-2.5 text-sm">
                    <div>
                      <p className="font-semibold text-dark">{s.nome_socio}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{s.qualificacao_socio}</p>
                    </div>
                    {s.faixa_etaria && (
                      <span className="text-xs text-slate-400 mt-0.5 flex-shrink-0 ml-4">{s.faixa_etaria}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-slate-400 pt-1">
            ℹ️ Dados consultados automaticamente na Receita Federal via BrasilAPI.
          </p>
        </div>
      )}
    </div>
  )
}
