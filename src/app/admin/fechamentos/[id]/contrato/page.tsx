import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'
import PrintButton from './PrintButton'

interface Props { params: { id: string } }

const PIX_LABELS: Record<string, string> = {
  CPF: 'CPF', CNPJ: 'CNPJ', EMAIL: 'E-mail', PHONE: 'Telefone', RANDOM: 'Chave aleatória'
}

export default async function AdminContratoFechamentoPage({ params }: Props) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/tecnico/login')

  const closing = await prisma.closing.findUnique({
    where: { id: params.id },
    include: { technician: true, invoice: true },
  })
  if (!closing || !closing.invoice) notFound()

  const invoice = closing.invoice
  const cd = invoice.contractData ? JSON.parse(invoice.contractData) as Record<string, unknown> : null

  const fmtDate = (d: Date | string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const fmt = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`

  const contratado = cd?.contratado as Record<string, unknown> | undefined
  const contratante = cd?.contratante as Record<string, unknown> | undefined
  const objeto = cd?.objeto as Record<string, unknown> | undefined
  const assinatura = cd?.assinatura as Record<string, unknown> | undefined
  const usaCnpj = !!(closing.technician.cnpj || contratado?.tipo === 'PJ')

  const signedAt = invoice.contractSignedAt
    ? new Date(invoice.contractSignedAt).toLocaleString('pt-BR')
    : null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <Link href={`/admin/fechamentos/${closing.id}`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-blue transition-colors">
          <ArrowLeft size={16} /> Voltar
        </Link>
        <PrintButton />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-8 print:shadow-none print:border-0">

        {/* Cabeçalho */}
        <div className="text-center border-b border-slate-200 pb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Shield size={24} className="text-brand-blue" />
            <h1 className="text-xl font-extrabold text-dark uppercase tracking-wide">
              {usaCnpj ? 'Contrato de Prestação de Serviços entre Pessoas Jurídicas' : 'Recibo de Prestação de Serviços Autônomos'}
            </h1>
          </div>
          <p className="text-slate-500 text-sm">Fechamento {closing.competence}</p>
          {signedAt && (
            <div className="mt-3 inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
              ✓ Assinado eletronicamente em {signedAt}
            </div>
          )}
        </div>

        {/* CONTRATANTE */}
        <section>
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-brand-blue mb-3">CONTRATANTE</h2>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <p><span className="font-semibold text-slate-500">Razão Social:</span> {String(contratante?.razaoSocial ?? 'ILHA BELLA SERVICOS & ASSISTENCIA 24 HORAS LTDA')}</p>
            <p><span className="font-semibold text-slate-500">Nome Fantasia:</span> {String(contratante?.nomeFantasia ?? 'Ilha Bella Serviços')}</p>
            <p><span className="font-semibold text-slate-500">CNPJ:</span> {String(contratante?.cnpj ?? '28.864.149/0001-38')}</p>
            <p><span className="font-semibold text-slate-500">Representante Legal:</span> {String(contratante?.representanteLegal ?? 'Eleton Cristofe dos Santos')}</p>
            <p className="sm:col-span-2"><span className="font-semibold text-slate-500">Endereço:</span> {String(contratante?.endereco ?? 'Praça Nereu Ramos, nº 90, Sala do Empreendedor, Centro, Biguaçu/SC — CEP 88160-116')}</p>
            <p><span className="font-semibold text-slate-500">Atividade:</span> {String(contratante?.atividade ?? 'Instalação, manutenção elétrica e serviços correlatos')}</p>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* CONTRATADO */}
        <section>
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-brand-blue mb-3">
            CONTRATADO {usaCnpj ? '(Pessoa Jurídica)' : '(Pessoa Física Autônoma)'}
          </h2>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            {usaCnpj ? (
              <>
                <p><span className="font-semibold text-slate-500">Razão Social:</span> {String(contratado?.razaoSocial ?? closing.technician.fullName)}</p>
                {contratado?.nomeFantasia && (
                  <p><span className="font-semibold text-slate-500">Nome Fantasia:</span> {String(contratado.nomeFantasia)}</p>
                )}
                <p><span className="font-semibold text-slate-500">CNPJ:</span> {String(contratado?.cnpj ?? closing.technician.cnpj)}</p>
                <p><span className="font-semibold text-slate-500">Representante Legal:</span> {invoice.contractSignedName ?? ''}</p>
                {contratado?.endereco && (
                  <p className="sm:col-span-2"><span className="font-semibold text-slate-500">Endereço:</span> {String(contratado.endereco)}</p>
                )}
                {contratado?.atividade && (
                  <p><span className="font-semibold text-slate-500">Atividade:</span> {String(contratado.atividade)}</p>
                )}
                {contratado?.situacaoReceita && (
                  <p><span className="font-semibold text-slate-500">Situação Receita:</span> {String(contratado.situacaoReceita)}</p>
                )}
              </>
            ) : (
              <>
                <p><span className="font-semibold text-slate-500">Nome Completo:</span> {String(contratado?.nomeCompleto ?? closing.technician.fullName)}</p>
                <p><span className="font-semibold text-slate-500">CPF:</span> {String(contratado?.cpf ?? closing.technician.cpf)}</p>
              </>
            )}
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* OBJETO */}
        <section>
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-brand-blue mb-3">OBJETO DO CONTRATO</h2>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <p><span className="font-semibold text-slate-500">Referente a:</span> Prestação de serviços técnicos especializados</p>
            <p><span className="font-semibold text-slate-500">Competência:</span> {String(objeto?.competencia ?? closing.competence)}</p>
            <p><span className="font-semibold text-slate-500">Período:</span> {fmtDate(closing.periodStart)} a {fmtDate(closing.periodEnd)}</p>
            <p><span className="font-semibold text-slate-500">Valor total:</span> <span className="font-extrabold">{fmt(invoice.value)}</span></p>
            <p><span className="font-semibold text-slate-500">PIX:</span> {PIX_LABELS[closing.technician.pixKeyType] ?? closing.technician.pixKeyType} — {closing.technician.pixKey}</p>
            <p><span className="font-semibold text-slate-500">Nº Nota Fiscal:</span> {invoice.invoiceNumber}</p>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* CLÁUSULAS */}
        <section>
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-brand-blue mb-3">CLÁUSULAS E CONDIÇÕES</h2>
          <div className="space-y-3 text-sm text-slate-700">
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
        </section>

        <hr className="border-slate-100" />

        {/* ASSINATURA */}
        <section>
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-brand-blue mb-4">ASSINATURA ELETRÔNICA</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="border border-slate-200 rounded-xl p-5 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">CONTRATANTE</p>
              <p className="font-bold text-dark">Ilha Bella Serviços</p>
              <p className="text-sm text-slate-600">CNPJ: 28.864.149/0001-38</p>
              <p className="text-sm text-slate-600">Rep.: Eleton Cristofe dos Santos</p>
            </div>
            <div className="border border-green-200 bg-green-50/50 rounded-xl p-5 space-y-2">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-3">CONTRATADO — ASSINADO ELETRONICAMENTE</p>
              <p className="font-bold text-dark">{invoice.contractSignedName ?? closing.technician.fullName}</p>
              <p className="text-sm text-slate-600">{usaCnpj ? 'CNPJ' : 'CPF'}: {invoice.contractSignedDocument ?? (usaCnpj ? closing.technician.cnpj : closing.technician.cpf)}</p>
              {signedAt && <p className="text-xs text-green-700 font-semibold">✓ Assinado em {signedAt}</p>}
              {!!assinatura?.timestamp && (
                <p className="text-xs text-slate-500 font-mono break-all">ID: {String(assinatura?.timestamp)}</p>
              )}
            </div>
          </div>
        </section>

        {/* Rodapé legal */}
        <div className="text-center text-xs text-slate-400 border-t border-slate-100 pt-4">
          <p>Este documento foi gerado e assinado eletronicamente pela plataforma Ilha Bella Serviços.</p>
          <p>Validade jurídica nos termos da Lei nº 14.063/2020 e MP nº 2.200-2/2001.</p>
        </div>
      </div>
    </div>
  )
}
