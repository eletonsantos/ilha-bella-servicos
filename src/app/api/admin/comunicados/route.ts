import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const INSTALL_URL = 'https://ilhabellaservicos.com.br/instalar'
const LOGIN_URL   = 'https://ilhabellaservicos.com.br/tecnico/login'

function buildHtml(name: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#1A7DC1 0%,#0f5fa3 100%);padding:36px 32px 28px;text-align:center;">
    <div style="width:64px;height:64px;background:#ffffff;border-radius:16px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
      <img src="https://ilhabellaservicos.com.br/logo.png" alt="Ilha Bella" width="48" height="48" style="display:block;object-fit:contain;" />
    </div>
    <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px;">Portal do Prestador</h1>
    <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Ilha Bella Serviços — Agora no seu celular!</p>
  </div>

  <!-- Body -->
  <div style="padding:32px;">
    <p style="font-size:16px;color:#1e293b;margin:0 0 8px;">Olá, <strong>${name}</strong>! 👋</p>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 24px;">
      Temos uma novidade para você! O <strong>Portal do Prestador Ilha Bella</strong> agora pode ser instalado
      direto na tela inicial do seu celular — funciona como um aplicativo, sem precisar ficar abrindo o navegador.
    </p>

    <!-- Destaque -->
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
      <p style="color:#1e40af;font-weight:700;font-size:15px;margin:0 0 4px;">O que você pode fazer pelo portal:</p>
      <ul style="color:#3b82f6;margin:8px 0 0;padding-left:20px;font-size:14px;line-height:2;">
        <li>Ver e acompanhar seus fechamentos</li>
        <li>Enviar nota fiscal diretamente</li>
        <li>Solicitar antecipação de pagamento</li>
        <li>Registrar reembolsos de despesas</li>
        <li>Consultar seu histórico de pagamentos</li>
      </ul>
    </div>

    <!-- Como instalar -->
    <p style="font-size:15px;font-weight:700;color:#1e293b;margin:0 0 16px;">📲 Como instalar no celular:</p>

    <!-- Android -->
    <div style="background:#f8fafc;border-radius:10px;padding:16px 20px;margin-bottom:12px;">
      <p style="font-size:14px;font-weight:700;color:#334155;margin:0 0 10px;">🤖 Android (Chrome)</p>
      <ol style="margin:0;padding-left:18px;color:#475569;font-size:13px;line-height:2.2;">
        <li>Abra o link abaixo no Chrome</li>
        <li>Toque nos <strong>3 pontinhos (⋮)</strong> no canto superior direito</li>
        <li>Toque em <strong>"Adicionar à tela inicial"</strong></li>
        <li>Confirme tocando em <strong>"Adicionar"</strong></li>
      </ol>
    </div>

    <!-- iOS -->
    <div style="background:#f8fafc;border-radius:10px;padding:16px 20px;margin-bottom:28px;">
      <p style="font-size:14px;font-weight:700;color:#334155;margin:0 0 10px;">🍎 iPhone / iPad (Safari)</p>
      <ol style="margin:0;padding-left:18px;color:#475569;font-size:13px;line-height:2.2;">
        <li>Abra o link abaixo no Safari (não no Chrome)</li>
        <li>Toque no ícone de <strong>compartilhar (□↑)</strong> na barra inferior</li>
        <li>Toque em <strong>"Adicionar à Tela de Início"</strong></li>
        <li>Toque em <strong>"Adicionar"</strong> no canto superior direito</li>
      </ol>
    </div>

    <!-- CTA Instalar -->
    <div style="text-align:center;margin-bottom:16px;">
      <a href="${INSTALL_URL}"
         style="display:inline-block;background:linear-gradient(135deg,#1A7DC1,#0f5fa3);color:#ffffff;
                font-size:16px;font-weight:800;padding:16px 40px;border-radius:12px;text-decoration:none;
                letter-spacing:-0.2px;box-shadow:0 4px 14px rgba(26,125,193,0.4);">
        📲 Ver instruções de instalação
      </a>
    </div>
    <p style="text-align:center;font-size:12px;color:#94a3b8;margin:0 0 28px;">
      ${INSTALL_URL}
    </p>

    <!-- Divisor -->
    <div style="border-top:1px solid #e2e8f0;margin:0 0 24px;"></div>

    <!-- Login -->
    <p style="font-size:14px;color:#475569;margin:0 0 16px;text-align:center;">
      Ou acesse direto pelo navegador:
    </p>
    <div style="text-align:center;margin-bottom:8px;">
      <a href="${LOGIN_URL}"
         style="display:inline-block;background:#f1f5f9;color:#1A7DC1;font-size:14px;font-weight:700;
                padding:12px 32px;border-radius:10px;text-decoration:none;border:1px solid #cbd5e1;">
        Entrar no portal →
      </a>
    </div>
    <p style="text-align:center;font-size:12px;color:#94a3b8;margin:8px 0 0;">
      Login: CPF (apenas números) • Senha: a que você cadastrou
    </p>
  </div>

  <!-- Footer -->
  <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;">
    <p style="font-size:12px;color:#94a3b8;margin:0 0 4px;">
      Ilha Bella Serviços &amp; Assistência 24h Ltda
    </p>
    <p style="font-size:11px;color:#cbd5e1;margin:0;">
      Este e-mail foi enviado para todos os prestadores cadastrados. Não responda este e-mail.
    </p>
  </div>

</div>
</body>
</html>
  `.trim()
}

export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  // Busca todos os técnicos com email
  const technicians = await prisma.technicianProfile.findMany({
    select: { fullName: true, email: true },
  })

  if (technicians.length === 0) {
    return NextResponse.json({ error: 'Nenhum técnico cadastrado.' }, { status: 400 })
  }

  // Envia em lotes de 50 (limite do Resend batch)
  const BATCH = 50
  let sent = 0
  let failed = 0
  const errors: string[] = []

  for (let i = 0; i < technicians.length; i += BATCH) {
    const chunk = technicians.slice(i, i + BATCH)
    const batch = chunk.map(t => ({
      from:    `Ilha Bella Serviços <${process.env.RESEND_FROM_EMAIL}>`,
      to:      [t.email],
      subject: '📲 Novo! Instale o Portal do Prestador Ilha Bella no seu celular',
      html:    buildHtml(t.fullName.split(' ')[0]),
    }))

    try {
      const result = await resend.batch.send(batch)
      // Count successes
      if (Array.isArray(result.data)) {
        sent += result.data.length
      } else {
        sent += chunk.length
      }
    } catch (err) {
      failed += chunk.length
      errors.push(err instanceof Error ? err.message : 'Erro desconhecido')
      console.error('[comunicado] batch error:', err)
    }
  }

  return NextResponse.json({
    success: true,
    total:   technicians.length,
    sent,
    failed,
    errors:  errors.length > 0 ? errors : undefined,
  })
}

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const technicians = await prisma.technicianProfile.findMany({
    select: { fullName: true, email: true },
    orderBy: { fullName: 'asc' },
  })

  return NextResponse.json({ technicians, total: technicians.length })
}
