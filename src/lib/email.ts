import nodemailer from 'nodemailer'

export type ClosingEmailTemplate =
  | 'closing_created'
  | 'awaiting_invoice'
  | 'under_review'
  | 'payment_released'
  | 'paid'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export interface InvoiceNotificationData {
  technicianName: string
  technicianCpf: string
  closingPeriod: string
  invoiceValue: number
  invoiceNumber: string
  observations?: string
  fileName: string
  closingId: string
}

export async function sendInvoiceNotification(data: InvoiceNotificationData) {
  const adminEmail = process.env.ADMIN_EMAIL!
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1A7DC1; padding: 24px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">Nova Nota Fiscal Recebida</h1>
        <p style="color: #bfdbfe; margin: 8px 0 0;">Ilha Bella Serviços — Área do Técnico</p>
      </div>
      <div style="background: #f8fafc; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Técnico</td><td style="padding: 8px 0; font-weight: 600;">${data.technicianName}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">CPF</td><td style="padding: 8px 0;">${data.technicianCpf}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Período</td><td style="padding: 8px 0;">${data.closingPeriod}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Número da NF</td><td style="padding: 8px 0;">${data.invoiceNumber}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Valor</td><td style="padding: 8px 0; font-weight: 600; color: #16a34a;">R$ ${data.invoiceValue.toFixed(2).replace('.', ',')}</td></tr>
          ${data.observations ? `<tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Observação</td><td style="padding: 8px 0;">${data.observations}</td></tr>` : ''}
        </table>
        <div style="margin-top: 24px;">
          <a href="${siteUrl}/admin/fechamentos/${data.closingId}" style="background: #1A7DC1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Ver no Painel Admin
          </a>
        </div>
        <p style="margin-top: 16px; font-size: 12px; color: #94a3b8;">Arquivo: ${data.fileName}</p>
      </div>
    </div>
  `

  // Prepared for future use — configure SMTP credentials in .env.local
  try {
    // Envia para o e-mail admin (Gmail) e também para o e-mail da empresa
    const recipients = [adminEmail, process.env.SMTP_USER].filter(Boolean).join(', ')
    await transporter.sendMail({
      from: `"Ilha Bella Serviços" <${process.env.SMTP_USER}>`,
      to: recipients,
      subject: `📄 Nova NF recebida — ${data.technicianName} | ${data.closingPeriod}`,
      html,
    })
    console.log('[email] Invoice notification sent to:', recipients)
  } catch (err) {
    console.error('[email] Failed to send invoice notification:', err)
  }
}

// ─── E-mails para o prestador ────────────────────────────────────────────────

export interface ClosingEmailData {
  technicianName:       string
  competence:           string
  periodStart:          string | null
  periodEnd:            string | null
  totalValue:           string
  statusLabel:          string
  observations:         string | null
  scheduledPaymentDate: string | null
  invoiceNumber:        string | null
  invoiceValue:         string | null
  closingId:            string
}

export async function sendClosingEmail({
  template,
  to,
  data,
}: {
  template: ClosingEmailTemplate
  to: string
  data: ClosingEmailData
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ilhabellaservicos.com.br'
  const portalUrl = `${siteUrl}/tecnico/fechamentos/${data.closingId}`

  const html = buildClosingEmailHtml({ template, data, portalUrl })
  const subject = subjectByTemplate(template, data.competence)

  await transporter.sendMail({
    from: `"Ilha Bella Serviços" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  })
  console.log(`[email] "${template}" sent to ${to} for closing ${data.closingId}`)
}

function subjectByTemplate(template: ClosingEmailTemplate, competence: string): string {
  const map: Record<ClosingEmailTemplate, string> = {
    closing_created:  `📋 Fechamento disponível — ${competence}`,
    awaiting_invoice: `📄 Aguardando sua Nota Fiscal — ${competence}`,
    under_review:     `🔍 Sua NF está em análise — ${competence}`,
    payment_released: `💰 Pagamento liberado — ${competence}`,
    paid:             `✅ Pagamento realizado — ${competence}`,
  }
  return map[template]
}

function buildClosingEmailHtml({
  template,
  data,
  portalUrl,
}: {
  template: ClosingEmailTemplate
  data: ClosingEmailData
  portalUrl: string
}): string {
  const configs: Record<ClosingEmailTemplate, { color: string; icon: string; title: string; intro: string; cta: string }> = {
    closing_created: {
      color: '#1A7DC1',
      icon:  '📋',
      title: 'Seu fechamento está disponível',
      intro: 'Um novo fechamento foi disponibilizado para você. Acesse o portal e envie sua Nota Fiscal para darmos continuidade ao pagamento.',
      cta:   'Enviar Nota Fiscal',
    },
    awaiting_invoice: {
      color: '#d97706',
      icon:  '📄',
      title: 'Aguardando sua Nota Fiscal',
      intro: 'Estamos aguardando o envio da sua Nota Fiscal. Acesse o portal e faça o envio para avançarmos no processo.',
      cta:   'Enviar Nota Fiscal',
    },
    under_review: {
      color: '#ea580c',
      icon:  '🔍',
      title: 'Sua NF está em análise',
      intro: 'Recebemos sua Nota Fiscal e ela está em conferência pela nossa equipe. Em breve você receberá uma atualização.',
      cta:   'Acompanhar no portal',
    },
    payment_released: {
      color: '#059669',
      icon:  '💰',
      title: 'Pagamento liberado!',
      intro: 'Ótima notícia! Seu pagamento foi aprovado e está sendo processado. Fique atento ao prazo informado abaixo.',
      cta:   'Ver detalhes no portal',
    },
    paid: {
      color: '#16a34a',
      icon:  '✅',
      title: 'Pagamento realizado!',
      intro: 'Seu pagamento foi realizado. Obrigado pela parceria! Confira os detalhes no portal.',
      cta:   'Ver comprovante no portal',
    },
  }

  const c = configs[template]

  const rows = [
    data.competence           && row('Competência',            data.competence),
    data.periodStart          && data.periodEnd && row('Período', `${data.periodStart} a ${data.periodEnd}`),
    data.totalValue           && row('Valor',                  `<strong style="color:#16a34a">${data.totalValue}</strong>`),
    data.invoiceNumber        && row('Nº da NF',               data.invoiceNumber),
    data.invoiceValue         && row('Valor da NF',            data.invoiceValue),
    data.observations         && row('Observações',            data.observations),
    data.scheduledPaymentDate && row('Pagamento previsto para', `<strong>${data.scheduledPaymentDate}</strong>`),
  ].filter(Boolean).join('')

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
      <div style="background:${c.color};padding:28px 24px;border-radius:10px 10px 0 0;">
        <p style="color:#ffffff;font-size:28px;margin:0 0 6px;">${c.icon}</p>
        <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;">${c.title}</h1>
        <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">Ilha Bella Serviços — Portal do Técnico</p>
      </div>

      <div style="background:#f8fafc;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 10px 10px;">
        <p style="margin:0 0 20px;font-size:15px;color:#334155;">Olá, <strong>${data.technicianName}</strong>!</p>
        <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.6;">${c.intro}</p>

        ${rows ? `<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">${rows}</table>` : ''}

        <div style="text-align:center;margin:24px 0;">
          <a href="${portalUrl}"
             style="background:${c.color};color:#ffffff;padding:13px 28px;border-radius:8px;
                    text-decoration:none;font-weight:700;font-size:14px;display:inline-block;">
            ${c.cta}
          </a>
        </div>

        <p style="font-size:12px;color:#94a3b8;margin:16px 0 0;text-align:center;">
          Acesse também: <a href="${portalUrl}" style="color:${c.color};">${portalUrl}</a>
        </p>
      </div>

      <div style="text-align:center;padding:16px;font-size:11px;color:#94a3b8;">
        Ilha Bella Serviços &amp; Assistência 24h Ltda — Biguaçu/SC<br/>
        Este e-mail foi gerado automaticamente, não responda.
      </div>
    </div>
  `
}

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:7px 0;color:#64748b;font-size:13px;width:45%;vertical-align:top;">${label}</td>
      <td style="padding:7px 0;font-size:13px;color:#1e293b;">${value}</td>
    </tr>
  `
}
