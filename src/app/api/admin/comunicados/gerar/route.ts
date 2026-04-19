import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `Você é um assistente especializado em criar e-mails profissionais para a empresa Ilha Bella Serviços & Assistência 24h.

A empresa conecta prestadores de serviço (técnicos) com clientes que precisam de serviços residenciais e empresariais.

Você deve gerar APENAS um JSON válido com dois campos:
- "subject": assunto do e-mail (conciso, com emoji relevante no início)
- "html": corpo completo do e-mail em HTML

REGRAS PARA O HTML:
- Use inline CSS (sem <style> externo)
- Estrutura: wrapper div max-width 600px, header azul (#1A7DC1), corpo cinza claro (#f8fafc), footer
- Header: fundo gradiente azul, título branco, subtítulo "Ilha Bella Serviços — Portal do Técnico"
- Corpo: fundo #f8fafc, padding 28px, border 1px solid #e2e8f0, border-radius 0 0 10px 10px
- Fonte: Arial, sans-serif
- Tom: profissional mas próximo, como comunicação de empresa com seus parceiros técnicos
- Sempre começar com "Olá, {{nome}}!" (use exatamente {{nome}} como variável)
- Terminar com botão azul (#1A7DC1) linkando para https://ilhabellaservicos.com.br/tecnico/login com texto "Acessar o Portal"
- Footer: fundo #f8fafc, borda superior, texto "Ilha Bella Serviços & Assistência 24h Ltda" e "Este e-mail foi gerado automaticamente."
- NÃO use DOCTYPE, html, head, body — apenas o conteúdo do email (div wrapper)
- NÃO inclua markdown, apenas HTML puro

Retorne SOMENTE o JSON, sem explicações, sem markdown, sem \`\`\`.`

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { prompt } = await req.json()
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 5) {
    return NextResponse.json({ error: 'Informe o assunto do comunicado.' }, { status: 400 })
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Crie um e-mail para os técnicos sobre o seguinte:\n\n${prompt.trim()}` },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    })

    const raw = response.choices[0].message.content?.trim() ?? ''

    // Limpa possível markdown wrapper
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    let parsed: { subject: string; html: string }
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('Resposta inválida da IA')
      parsed = JSON.parse(match[0])
    }

    if (!parsed.subject || !parsed.html) {
      throw new Error('Campos subject ou html ausentes na resposta')
    }

    return NextResponse.json({ subject: parsed.subject, html: parsed.html })
  } catch (err) {
    console.error('[gerar-comunicado]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro ao gerar comunicado' },
      { status: 500 }
    )
  }
}
