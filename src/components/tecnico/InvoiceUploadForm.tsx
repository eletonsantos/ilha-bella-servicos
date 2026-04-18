'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import ContratoModal from '@/components/tecnico/ContratoModal'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const schema = z.object({
  invoiceNumber: z.string().min(1, 'Número obrigatório'),
  competence: z.string().min(1, 'Competência obrigatória'),
  value: z.string().refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Valor inválido'),
  observations: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  closingId: string
  competence: string
  totalValue: number
  periodStart: Date
  periodEnd: Date
  techName: string
  techCnpj?: string | null
  techCpf: string
  techPixKey: string
  techPixKeyType: string
}

export default function InvoiceUploadForm({
  closingId, competence, totalValue, periodStart, periodEnd,
  techName, techCnpj, techCpf, techPixKey, techPixKeyType
}: Props) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showContrato, setShowContrato] = useState(false)
  const [pendingData, setPendingData] = useState<FormData | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { competence, value: totalValue.toFixed(2) },
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 10 * 1024 * 1024) { setError('Arquivo muito grande. Máximo 10MB.'); return }
    const allowed = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowed.includes(f.type)) { setError('Formato inválido. Use PDF, JPG ou PNG.'); return }
    setError('')
    setFile(f)
  }

  // Primeiro passo: valida form e abre o contrato
  function onSubmitStep1(data: FormData) {
    if (!file) { setError('Selecione o arquivo da nota fiscal.'); return }
    setPendingData(data)
    setShowContrato(true)
  }

  // Segundo passo: após assinar o contrato, envia
  async function onContractConfirm(signedName: string, signedDocument: string) {
    if (!pendingData || !file) return
    setShowContrato(false)
    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('invoiceNumber', pendingData.invoiceNumber)
      formData.append('competence', pendingData.competence)
      formData.append('value', pendingData.value)
      if (pendingData.observations) formData.append('observations', pendingData.observations)
      formData.append('contractSignedName', signedName)
      formData.append('contractSignedDocument', signedDocument)

      const res = await fetch(`/api/tecnico/fechamentos/${closingId}/invoice`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro ao enviar NF')
      }
      setSuccess(true)
      setTimeout(() => router.refresh(), 1500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5"
  const errorClass = "text-red-500 text-xs mt-1"

  if (success) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
        <h3 className="font-bold text-dark text-lg mb-1">Nota fiscal enviada!</h3>
        <p className="text-slate-500 text-sm">O administrador será notificado. Atualizando...</p>
      </div>
    )
  }

  return (
    <>
      {showContrato && pendingData && (
        <ContratoModal
          techName={techName}
          techCnpj={techCnpj}
          techCpf={techCpf}
          techPixKey={techPixKey}
          techPixKeyType={techPixKeyType}
          tipo="nf"
          competence={competence}
          periodStart={format(periodStart, 'dd/MM/yyyy', { locale: ptBR })}
          periodEnd={format(periodEnd, 'dd/MM/yyyy', { locale: ptBR })}
          totalValue={parseFloat(pendingData.value)}
          onConfirm={onContractConfirm}
          onCancel={() => setShowContrato(false)}
        />
      )}

      <div className="card p-6">
        <h2 className="font-bold text-dark mb-5 flex items-center gap-2">
          <FileText size={18} className="text-brand-blue" />
          Enviar nota fiscal
        </h2>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmitStep1)} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Número da nota fiscal *</label>
              <input {...register('invoiceNumber')} className={inputClass} placeholder="Ex: 000123" />
              {errors.invoiceNumber && <p className={errorClass}>{errors.invoiceNumber.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Competência *</label>
              <input {...register('competence')} className={inputClass} />
              {errors.competence && <p className={errorClass}>{errors.competence.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Valor da nota (R$) *</label>
              <input {...register('value')} type="number" step="0.01" className={inputClass} />
              {errors.value && <p className={errorClass}>{errors.value.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Observação</label>
              <input {...register('observations')} className={inputClass} placeholder="Opcional" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Arquivo da NF *</label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-6 cursor-pointer hover:border-brand-blue hover:bg-blue-50/50 transition-all">
              <Upload size={24} className={file ? 'text-brand-blue' : 'text-slate-300'} />
              <p className="text-sm font-medium text-slate-600 mt-2">
                {file ? file.name : 'Clique para selecionar'}
              </p>
              <p className="text-xs text-slate-400 mt-1">PDF, JPG ou PNG — máx. 10MB</p>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
            Ao clicar em &ldquo;Continuar&rdquo;, você será solicitado a assinar um <strong>Termo de Prestação de Serviços</strong> com validade jurídica antes do envio.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Enviando...' : (<><Upload size={16} /> Continuar para assinar e enviar</>)}
          </button>
        </form>
      </div>
    </>
  )
}
