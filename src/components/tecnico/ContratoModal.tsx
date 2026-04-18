'use client'

import { useState, useEffect } from 'react'
import { X, Shield, AlertTriangle, CheckCircle, Loader2, Building2 } from 'lucide-react'

interface CnpjData {
  razao_social: string
  nome_fantasia: string
  cnpj: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  municipio: string
  uf: string
  cep: string
  ddd_telefone_1?: string
  cnae_fiscal_descricao?: string
  descricao_situacao_cadastral?: string
  qsa?: Array<{ nome_socio: string; qualificacao_socio: string }>
}

interface ContratoModalProps {
  techName: string
  techCnpj?: string | null
  techCpf: string
  techPixKey: string
  techPixKeyType: string
  tipo: 'nf' | 'reembolso'
  competence?: string
  periodStart?: string
  periodEnd?: string
  totalValue: number
  reimbursementDescription?: string
  onConfirm: (signedName: string, signedDocument: string, contractData: object) => void
  onCancel: () => void
}

const PIX_LABELS: Record<string, string> = {
  CPF: 'CPF', CNPJ: 'CNPJ', EMAIL: 'E-mail', PHONE: 'Telefone', RANDOM: 'Chave aleatória'
}

function formatCnpj(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 14)
  return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}
function formatCpf(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export default function ContratoModal({
  techName, techCnpj, techCpf, techPixKey, techPixKeyType,
  tipo, competence, periodStart, periodEnd, totalValue, reimbursementDescription,
  onConfirm, onCancel,
}: ContratoModalProps) {
  const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  const agora = new Date().toLocaleString('pt-BR')
  const fmt   = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  const usaCnpj = !!techCnpj

  const [signedName, setSignedName] = useState('')
  const [signedDoc,  setSignedDoc]  = useState(
    usaCnpj
      ? formatCnpj(techCnpj ?? '')
      : formatCpf(techCpf)
  )
  const [agreed,     setAgreed]     = useState(false)
  const [error,      setError]      = useState('')

  // Dados do CNPJ buscados na Receita
  const [cnpjData,    setCnpjData]    = useState<CnpjData | null>(null)
  const [cnpjLoading, setCnpjLoading] = useState(false)
  const [cnpjError,   setCnpjError]   = useState('')

  // Busca CNPJ automaticamente quando campo tem 14 dígitos
  useEffect(() => {
    if (!usaCnpj) return
    const digits = signedDoc.replace(/\D/g, '')
    if (digits.length !== 14) { setCnpjData(null); return }

    setCnpjLoading(true)
    setCnpjError('')
    fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`)
      .then(r => r.ok ? r.json() : Promise.reject('CNPJ não encontrado'))
      .then((data: CnpjData) => { setCnpjData(data); setCnpjError('') })
      .catch(() => { setCnpjData(null); setCnpjError('CNPJ não encontrado na Receita Federal') })
      .finally(() => setCnpjLoading(false))
  }, [signedDoc, usaCnpj])

  function handleConfirm() {
    if (!signedName.trim()) { setError('Informe seu nome completo.'); return }
    if (!signedDoc.trim())  { setError(`Informe seu ${usaCnpj ? 'CNPJ' : 'CPF'}.`); return }
    if (usaCnpj && signedDoc.replace(/\D/g,'').length !== 14) { setError('CNPJ inválido.'); return }
    if (!agreed) { setError('Você precisa concordar com os termos para continuar.'); return }

    // Monta snapshot completo do contrato
    const contractData = {
      tipo,
      assinatura: {
        nome: signedName.trim(),
        documento: signedDoc.trim(),
        timestamp: new Date().toISOString(),
        dataLegivel: agora,
      },
      contratante: {
        razaoSocial: 'ILHA BELLA SERVICOS & ASSISTENCIA 24 HORAS LTDA',
        nomeFantasia: 'Ilha Bella Serviços',
        cnpj: '28.864.149/0001-38',
        endereco: 'Praça Nereu Ramos, nº 90, Sala do Empreendedor, Centro, Biguaçu/SC — CEP 88160-116',
        representanteLegal: 'Eleton Cristofe dos Santos',
        atividade: 'Instalação, manutenção elétrica e serviços correlatos',
      },
      contratado: usaCnpj ? {
        tipo: 'PJ',
        nomeRepresentante: signedName.trim(),
        // Fallback: se BrasilAPI falhou, usa CNPJ do cadastro do perfil
        cnpj: signedDoc.trim() || techCnpj || '',
        razaoSocial: cnpjData?.razao_social ?? techName,
        nomeFantasia: cnpjData?.nome_fantasia ?? '',
        endereco: cnpjData
          ? `${cnpjData.logradouro}, ${cnpjData.numero}${cnpjData.complemento ? ', ' + cnpjData.complemento : ''}, ${cnpjData.bairro}, ${cnpjData.municipio}/${cnpjData.uf} — CEP ${cnpjData.cep}`
          : '',
        atividade: cnpjData?.cnae_fiscal_descricao ?? '',
        situacaoReceita: cnpjData?.descricao_situacao_cadastral ?? '',
        sociosPrincipais: cnpjData?.qsa?.map(s => s.nome_socio).join(', ') ?? '',
        dadosReceita: cnpjData ?? null,
        // Indica se os dados vieram da BrasilAPI ou do cadastro (fallback)
        brasilApiConsultado: !cnpjError && !!cnpjData,
        brasilApiFallback: !!cnpjError,
      } : {
        tipo: 'PF',
        nomeCompleto: techName,
        cpf: signedDoc.trim(),
        representante: signedName.trim(),
      },
      objeto: tipo === 'nf' ? {
        descricao: 'Prestação de serviços técnicos especializados',
        competencia: competence,
        periodoInicio: periodStart,
        periodoFim: periodEnd,
        valorTotal: totalValue,
        pagamentoPix: { tipo: PIX_LABELS[techPixKeyType] ?? techPixKeyType, chave: techPixKey },
      } : {
        descricao: 'Reembolso de despesas operacionais',
        motivo: reimbursementDescription,
        valorTotal: totalValue,
        pagamentoPix: { tipo: PIX_LABELS[techPixKeyType] ?? techPixKeyType, chave: techPixKey },
      },
      clausulas: usaCnpj ? 'PJ' : 'PF',
      fundamento: 'Lei nº 14.063/2020 e Medida Provisória nº 2.200-2/2001',
      foro: 'Comarca de Biguaçu/SC',
    }

    onConfirm(signedName.trim(), signedDoc.trim(), contractData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-brand-blue" />
            <h2 className="font-extrabold text-dark text-base">
              {usaCnpj ? 'Termo de Prestação de Serviços (CNPJ)' : 'Recibo de Prestação de Serviços (CPF)'}
            </h2>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Contrato — scrollável */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-sm text-slate-700 leading-relaxed">

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-2">
            <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-amber-800 text-xs">
              Leia atentamente este documento antes de enviar. Ao concordar, você confirma as informações abaixo e assume responsabilidade legal sobre este instrumento.
            </p>
          </div>

          {/* Cabeçalho */}
          <div className="bg-slate-50 rounded-xl p-4 text-xs">
            <p className="font-extrabold text-dark text-sm text-center uppercase tracking-wide mb-3">
              {usaCnpj ? 'Contrato de Prestação de Serviços entre Pessoas Jurídicas' : 'Recibo de Prestação de Serviços Autônomos'}
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <p><span className="font-semibold">Data:</span> {hoje}</p>
              <p><span className="font-semibold">Tipo:</span> {tipo === 'nf' ? 'Nota Fiscal' : 'Reembolso de Despesas'}</p>
            </div>
          </div>

          {/* CONTRATANTE */}
          <div>
            <p className="font-bold text-dark text-xs uppercase tracking-wide mb-2 text-brand-blue">CONTRATANTE</p>
            <div className="bg-slate-50 rounded-xl p-4 text-xs space-y-1">
              <p><span className="font-semibold">Razão Social:</span> ILHA BELLA SERVICOS &amp; ASSISTENCIA 24 HORAS LTDA</p>
              <p><span className="font-semibold">Nome Fantasia:</span> Ilha Bella Serviços</p>
              <p><span className="font-semibold">CNPJ:</span> 28.864.149/0001-38</p>
              <p><span className="font-semibold">Endereço:</span> Praça Nereu Ramos, nº 90, Sala do Empreendedor, Centro, Biguaçu/SC — CEP 88160-116</p>
              <p><span className="font-semibold">Representante Legal:</span> Eleton Cristofe dos Santos</p>
              <p><span className="font-semibold">Atividade:</span> Instalação, manutenção elétrica e serviços correlatos</p>
            </div>
          </div>

          {/* CONTRATADO */}
          <div>
            <p className="font-bold text-dark text-xs uppercase tracking-wide mb-2 text-brand-blue">CONTRATADO</p>
            <div className="bg-slate-50 rounded-xl p-4 text-xs space-y-1">
              <p><span className="font-semibold">Nome:</span> {techName}</p>
              {usaCnpj
                ? <p><span className="font-semibold">CNPJ:</span> {techCnpj}</p>
                : <p><span className="font-semibold">CPF:</span> {formatCpf(techCpf)}</p>
              }
              {usaCnpj && cnpjLoading && (
                <div className="flex items-center gap-2 text-slate-500 pt-1">
                  <Loader2 size={12} className="animate-spin" />
                  <span>Consultando Receita Federal...</span>
                </div>
              )}
              {usaCnpj && cnpjData && (
                <div className="mt-2 pt-2 border-t border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-green-700 font-semibold mb-1">
                    <Building2 size={12} />
                    <span>Dados confirmados pela Receita Federal</span>
                  </div>
                  <p><span className="font-semibold">Razão Social:</span> {cnpjData.razao_social}</p>
                  {cnpjData.nome_fantasia && <p><span className="font-semibold">Nome Fantasia:</span> {cnpjData.nome_fantasia}</p>}
                  <p><span className="font-semibold">Endereço:</span> {cnpjData.logradouro}, {cnpjData.numero}{cnpjData.complemento ? ', ' + cnpjData.complemento : ''}, {cnpjData.bairro}, {cnpjData.municipio}/{cnpjData.uf} — CEP {cnpjData.cep}</p>
                  {cnpjData.cnae_fiscal_descricao && <p><span className="font-semibold">Atividade:</span> {cnpjData.cnae_fiscal_descricao}</p>}
                  {cnpjData.descricao_situacao_cadastral && <p><span className="font-semibold">Situação:</span> {cnpjData.descricao_situacao_cadastral}</p>}
                  {cnpjData.qsa && cnpjData.qsa.length > 0 && (
                    <p><span className="font-semibold">Sócios:</span> {cnpjData.qsa.map(s => s.nome_socio).join(', ')}</p>
                  )}
                </div>
              )}
              {usaCnpj && cnpjError && (
                <p className="text-amber-600 text-xs pt-1">⚠ {cnpjError} — os dados inseridos manualmente serão registrados.</p>
              )}
            </div>
          </div>

          {/* OBJETO */}
          <div>
            <p className="font-bold text-dark text-xs uppercase tracking-wide mb-2 text-brand-blue">OBJETO DO CONTRATO</p>
            <div className="bg-slate-50 rounded-xl p-4 text-xs space-y-1">
              {tipo === 'nf' ? (
                <>
                  <p><span className="font-semibold">Referente a:</span> Prestação de serviços técnicos especializados</p>
                  <p><span className="font-semibold">Competência:</span> {competence}</p>
                  <p><span className="font-semibold">Período:</span> {periodStart} a {periodEnd}</p>
                  <p><span className="font-semibold">Valor total:</span> <span className="font-extrabold text-dark">{fmt(totalValue)}</span></p>
                </>
              ) : (
                <>
                  <p><span className="font-semibold">Referente a:</span> Reembolso de despesas operacionais</p>
                  <p><span className="font-semibold">Descrição:</span> {reimbursementDescription}</p>
                  <p><span className="font-semibold">Valor total a reembolsar:</span> <span className="font-extrabold text-dark">{fmt(totalValue)}</span></p>
                </>
              )}
              <p className="pt-1"><span className="font-semibold">Pagamento via PIX:</span> {PIX_LABELS[techPixKeyType] ?? techPixKeyType} — {techPixKey}</p>
            </div>
          </div>

          {/* CLÁUSULAS */}
          <div>
            <p className="font-bold text-dark text-xs uppercase tracking-wide mb-2 text-brand-blue">CLÁUSULAS E CONDIÇÕES</p>
            <div className="space-y-3 text-xs">
              {usaCnpj ? (
                <>
                  <p><span className="font-semibold">1. Natureza jurídica:</span> O presente instrumento regula a prestação de serviços de natureza estritamente civil entre pessoas jurídicas, não gerando qualquer vínculo empregatício, societário ou de subordinação entre as partes.</p>
                  <p><span className="font-semibold">2. Responsabilidade tributária:</span> O Contratado, pessoa jurídica, declara que a Nota Fiscal emitida está em conformidade com a legislação tributária vigente, sendo de sua exclusiva responsabilidade o recolhimento de todos os tributos incidentes sobre a operação, incluindo ISS, PIS, COFINS e demais encargos aplicáveis.</p>
                  <p><span className="font-semibold">3. Representação legal:</span> O signatário declara expressamente que é o representante legal do CNPJ informado, possuindo poderes para firmar o presente instrumento em nome da pessoa jurídica Contratada.</p>
                  <p><span className="font-semibold">4. Ausência de vínculo trabalhista:</span> As partes declaram, sob as penas da lei, que não existe qualquer relação de emprego entre si, sendo os serviços prestados com plena autonomia, independência técnica e organizacional, sem subordinação, exclusividade ou pessoalidade.</p>
                  <p><span className="font-semibold">5. Autenticidade da nota fiscal:</span> O Contratado declara que a Nota Fiscal apresentada é autêntica, emitida dentro da sua atividade econômica registrada e corresponde fielmente aos serviços efetivamente prestados.</p>
                  <p><span className="font-semibold">6. Independência operacional:</span> O Contratado executa os serviços com seus próprios meios e ferramentas, assumindo todos os riscos da atividade, sem direito a férias, 13º salário, FGTS ou qualquer outro benefício de natureza trabalhista.</p>
                </>
              ) : (
                <>
                  <p><span className="font-semibold">1. Natureza jurídica:</span> O presente instrumento formaliza a prestação de serviços autônomos de natureza civil por pessoa física, não constituindo relação de emprego nem gerando quaisquer direitos ou obrigações trabalhistas entre as partes.</p>
                  <p><span className="font-semibold">2. Responsabilidade tributária:</span> O Contratado, pessoa física autônoma, declara que é responsável pelo recolhimento do INSS (contribuinte individual) e demais encargos tributários aplicáveis, não cabendo à Contratante qualquer obrigação fiscal sobre esta prestação.</p>
                  <p><span className="font-semibold">3. Recibo de serviços:</span> O presente documento tem valor de Recibo de Prestação de Serviços Autônomos, substituindo a Nota Fiscal nos casos em que o prestador não seja obrigado à sua emissão, conforme legislação vigente.</p>
                  <p><span className="font-semibold">4. Ausência de vínculo trabalhista:</span> As partes declaram que não existe relação de emprego entre si. O prestador atua com autonomia, liberdade de horário, sem exclusividade e por conta própria, não se caracterizando os requisitos do artigo 3º da CLT.</p>
                  <p><span className="font-semibold">5. Veracidade das informações:</span> O prestador declara que os serviços descritos foram efetivamente realizados nas datas e nos valores informados, assumindo responsabilidade civil e penal por eventuais falsidades.</p>
                  <p><span className="font-semibold">6. Independência operacional:</span> O prestador autônomo executa os serviços com plena liberdade técnica, sem subordinação hierárquica, podendo recusar serviços e prestar serviços a outros tomadores simultaneamente.</p>
                </>
              )}
              <p><span className="font-semibold">7. Foro:</span> Fica eleito o foro da Comarca de Biguaçu/SC para dirimir quaisquer dúvidas ou litígios decorrentes do presente instrumento, com renúncia expressa a qualquer outro.</p>
              <p><span className="font-semibold">8. Validade digital:</span> A confirmação eletrônica deste instrumento, mediante identificação por nome completo e {usaCnpj ? 'CNPJ' : 'CPF'}, possui plena validade jurídica nos termos da Lei nº 14.063/2020 e Medida Provisória nº 2.200-2/2001, equiparando-se à assinatura manuscrita para todos os fins legais.</p>
            </div>
          </div>

          {/* Assinatura */}
          <div className="border-t border-slate-200 pt-4">
            <p className="font-bold text-dark text-xs uppercase tracking-wide mb-3 text-brand-blue">IDENTIFICAÇÃO DO SIGNATÁRIO</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nome completo do signatário *
                  {usaCnpj && <span className="font-normal text-slate-500 ml-1">(representante legal do CNPJ)</span>}
                </label>
                <input
                  type="text"
                  value={signedName}
                  onChange={e => setSignedName(e.target.value)}
                  placeholder="Digite seu nome completo"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {usaCnpj ? 'CNPJ da empresa *' : 'CPF do prestador *'}
                  {usaCnpj && cnpjLoading && <Loader2 size={11} className="inline animate-spin ml-2" />}
                </label>
                <input
                  type="text"
                  value={signedDoc}
                  onChange={e => setSignedDoc(usaCnpj ? formatCnpj(e.target.value) : formatCpf(e.target.value))}
                  placeholder={usaCnpj ? '00.000.000/0001-00' : '000.000.000-00'}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
                {usaCnpj && cnpjData && (
                  <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                    <CheckCircle size={11} /> {cnpjData.razao_social}
                  </p>
                )}
                {usaCnpj && cnpjError && (
                  <p className="text-amber-600 text-xs mt-1">{cnpjError}</p>
                )}
              </div>
            </div>
          </div>

          {/* Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer bg-blue-50 rounded-xl p-4 border border-blue-100">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-brand-blue flex-shrink-0"
            />
            <span className="text-xs text-slate-700 leading-relaxed">
              Declaro que li e compreendi todas as cláusulas acima, que as informações fornecidas são verdadeiras, e que concordo com os termos deste instrumento. Estou ciente de que esta confirmação eletrônica tem validade jurídica equivalente à assinatura manuscrita, nos termos da Lei nº 14.063/2020.
            </span>
          </label>

          {error && <p className="text-red-600 text-xs font-medium">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 flex-shrink-0">
          <button onClick={onCancel}
            className="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button onClick={handleConfirm}
            className="flex-1 bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
            <CheckCircle size={16} />
            Confirmar e assinar
          </button>
        </div>
      </div>
    </div>
  )
}
