import { HelpCircle, ChevronDown } from 'lucide-react'

const sections = [
  {
    title: 'Fechamentos',
    faqs: [
      {
        q: 'O que é um fechamento?',
        a: 'É o resumo mensal de todos os serviços que você realizou no período. O admin cria o fechamento com o valor total, quantidade de serviços e o período de competência.',
      },
      {
        q: 'O valor do fechamento está errado. O que faço?',
        a: 'Acesse o fechamento no menu Fechamentos e use a opção "Discordei do valor" para registrar uma contestação. Informe o valor correto e o motivo. Nossa equipe analisará e responderá.',
      },
      {
        q: 'Quando vou receber após enviar a nota fiscal?',
        a: 'A data de pagamento é informada diretamente no fechamento pelo admin, no campo "Pagamento programado". Acesse o detalhe do fechamento para ver a data prevista.',
      },
      {
        q: 'Posso ver o histórico de fechamentos anteriores?',
        a: 'Sim. No menu Fechamentos você visualiza todos os fechamentos, com status, valores e competência de cada um.',
      },
    ],
  },
  {
    title: 'Nota fiscal',
    faqs: [
      {
        q: 'Como envio minha nota fiscal?',
        a: 'Acesse o fechamento correspondente no menu Fechamentos. Quando o status for "Aguardando NF", aparece o botão para fazer o upload do arquivo PDF da sua nota fiscal.',
      },
      {
        q: 'Qual formato de arquivo é aceito?',
        a: 'Apenas PDF. O arquivo deve ter no máximo 4 MB.',
      },
      {
        q: 'Posso substituir uma nota fiscal já enviada?',
        a: 'Não é possível substituir diretamente pelo portal. Entre em contato com a equipe pelo WhatsApp para solicitar a correção.',
      },
      {
        q: 'Preciso emitir NF pelo meu CNPJ ou CPF?',
        a: 'Aceitamos nota fiscal de MEI, RPA (Recibo de Pagamento a Autônomo) para autônomos, ou nota de empresa. O importante é que o documento identifique você como prestador e o valor corresponda ao fechamento.',
      },
    ],
  },
  {
    title: 'Antecipação de pagamento',
    faqs: [
      {
        q: 'O que é a antecipação?',
        a: 'É uma opção para receber o valor do seu fechamento antes da data programada. Está disponível quando o status do fechamento é "Pagamento liberado".',
      },
      {
        q: 'Qual a taxa cobrada?',
        a: 'A taxa é de 10% sobre o valor total do fechamento. Por exemplo: em um fechamento de R$ 1.000,00, você recebe R$ 900,00 antecipados.',
      },
      {
        q: 'Em quanto tempo o dinheiro cai na conta?',
        a: 'Em até 48 horas após a aprovação da solicitação pela equipe Ilha Bella, direto na sua chave Pix cadastrada.',
      },
      {
        q: 'Como solicito a antecipação?',
        a: 'Acesse o menu Antecipação ou o próprio fechamento quando estiver com status "Pagamento liberado". Leia o contrato, preencha seu nome completo e CNPJ, marque que leu e aceite os termos, e envie a solicitação.',
      },
      {
        q: 'Posso solicitar antecipação mais de uma vez?',
        a: 'Cada fechamento permite uma solicitação de antecipação. Fechamentos diferentes podem ter solicitações independentes.',
      },
    ],
  },
  {
    title: 'Contestação de valor',
    faqs: [
      {
        q: 'Quando posso contestar?',
        a: 'A contestação está disponível quando o fechamento está com status "Fechamento disponível" ou "Aguardando NF". Após esses status não é mais possível contestar.',
      },
      {
        q: 'O que acontece após eu contestar?',
        a: 'A equipe admin recebe sua contestação, analisa e pode aprovar (ajustando o valor) ou recusar. Você acompanha o status da contestação diretamente no fechamento.',
      },
    ],
  },
  {
    title: 'Dados cadastrais',
    faqs: [
      {
        q: 'Como atualizo meu dados ou chave Pix?',
        a: 'No momento, a atualização de dados é feita pela equipe admin. Entre em contato pelo WhatsApp informando o dado que precisa alterar.',
      },
      {
        q: 'Meu nome ou CNPJ está errado no sistema. O que faço?',
        a: 'Entre em contato com a equipe Ilha Bella pelo WhatsApp para solicitar a correção no cadastro.',
      },
    ],
  },
]

export default function AjudaPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
          <HelpCircle size={20} className="text-brand-blue" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-dark">Central de ajuda</h1>
          <p className="text-slate-500 text-sm mt-0.5">Dúvidas sobre fechamentos, notas fiscais e pagamentos.</p>
        </div>
      </div>

      {/* Sections */}
      {sections.map(({ title, faqs }) => (
        <div key={title} className="card p-6">
          <h2 className="font-bold text-dark mb-4 pb-3 border-b border-slate-100">{title}</h2>
          <div className="space-y-2">
            {faqs.map(({ q, a }) => (
              <details key={q} className="group">
                <summary className="flex items-center justify-between gap-4 py-3 cursor-pointer list-none">
                  <span className="text-sm font-semibold text-dark">{q}</span>
                  <ChevronDown
                    size={15}
                    className="text-slate-400 flex-shrink-0 group-open:rotate-180 transition-transform"
                  />
                </summary>
                <div className="pb-3 pt-1">
                  <p className="text-sm text-slate-600 leading-relaxed">{a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      ))}

      {/* Contato */}
      <div className="card p-6 border-l-4 border-brand-blue">
        <p className="font-bold text-dark text-sm mb-1">Não encontrou o que precisava?</p>
        <p className="text-slate-500 text-sm">
          Entre em contato com a equipe Ilha Bella pelo WhatsApp e responderemos o mais rápido possível.
        </p>
      </div>

    </div>
  )
}
