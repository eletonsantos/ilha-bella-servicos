import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { COMPANY } from '@/lib/constants'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const WHATSAPP_NUMBER = COMPANY.whatsapp

const SYSTEM_PROMPT = `Você é "Bella", assistente de pré-atendimento da Ilha Bella Serviços & Assistência 24h.

Sua missão: coletar informações do cliente de forma rápida e simpática para preparar o atendimento pelo WhatsApp.

Serviços oferecidos: Encanador, Eletricista, Chaveiro, Desentupimento, Manutenção Geral, Emergências 24h.

REGRAS:
- Seja simpática e objetiva
- Máximo 1 ou 2 perguntas por vez
- Mensagens curtas (o cliente está com pressa)
- Use emojis com moderação
- Responda SEMPRE em português do Brasil

INFORMAÇÕES A COLETAR (nesta ordem):
1. Tipo de serviço
2. Descrição do problema
3. Cidade e bairro
4. Urgência (emergência agora ou quer agendar)
5. Nome do cliente

Quando tiver TODAS as informações, responda SOMENTE com este JSON exato (sem texto, sem markdown):
{"done":true,"nome":"...","servico":"...","problema":"...","local":"...","urgencia":"emergência agora"}
ou
{"done":true,"nome":"...","servico":"...","problema":"...","local":"...","urgencia":"quer agendar"}`

function buildWhatsAppMessage(data: {
  nome: string
  servico: string
  problema: string
  local: string
  urgencia: string
}): string {
  return `Olá! Me chamo *${data.nome}* e preciso de um serviço de *${data.servico}*.

📍 *Local:* ${data.local}

🔧 *Problema:* ${data.problema}

⏰ *Urgência:* ${data.urgencia === 'emergência agora' ? 'Emergência — preciso agora!' : 'Quero agendar um horário'}

Aguardo retorno, obrigado(a)! 🙏`
}

type ChatMessage = { role: string; parts: Array<{ text: string }> }

function toOpenAIMessages(messages: ChatMessage[]): OpenAI.Chat.ChatCompletionMessageParam[] {
  return messages.map(m => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: m.parts[0].text,
  }))
}

// POST — processa mensagem do cliente
export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...toOpenAIMessages(messages),
      ],
      max_tokens: 300,
      temperature: 0.7,
    })

    const text = response.choices[0].message.content?.trim() ?? ''

    // Detecta JSON de conclusão
    const jsonMatch = text.match(/\{[\s\S]*?"done"\s*:\s*true[\s\S]*?\}/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        if (parsed.nome && parsed.servico && parsed.problema && parsed.local) {
          const whatsappMessage = buildWhatsAppMessage(parsed)
          const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`
          return NextResponse.json({
            done: true,
            text: `Perfeito, ${parsed.nome}! 🎉 Já tenho tudo. Clique abaixo para continuar no WhatsApp — nossa equipe vai receber tudo organizado!`,
            whatsappUrl,
            summary: whatsappMessage,
          })
        }
      } catch {
        // JSON inválido, segue normalmente
      }
    }

    return NextResponse.json({ done: false, text })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[chat POST]', msg)
    return NextResponse.json(
      { done: false, text: 'Desculpe, tive um problema de comunicação. Por favor, tente novamente em instantes! 😅' },
      { status: 500 }
    )
  }
}

// GET — saudação inicial
export async function GET() {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: 'Olá' },
      ],
      max_tokens: 150,
      temperature: 0.7,
    })

    const text = response.choices[0].message.content?.trim() ?? ''
    return NextResponse.json({ text })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[chat GET]', msg)
    return NextResponse.json({
      text: 'Olá! 👋 Sou a Bella da Ilha Bella Serviços. Qual serviço você precisa? (Encanador, Eletricista, Chaveiro, Desentupimento, Manutenção...)',
    })
  }
}
