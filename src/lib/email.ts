import nodemailer from 'nodemailer'

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
    await transporter.sendMail({
      from: `"Ilha Bella Serviços" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `Nova NF recebida — ${data.technicianName} | ${data.closingPeriod}`,
      html,
    })
  } catch (err) {
    // Email sending failed — log but don't throw to not block the NF upload
    console.error('[email] Failed to send invoice notification:', err)
  }
}
