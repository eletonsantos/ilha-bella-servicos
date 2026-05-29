import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'

interface Params { params: { id: string } }

const PROMPT = `Você é um assistente especializado em análise de relatórios de ordens de serviço de assistência técnica residencial e empresarial.

Analise este documento PDF e extraia TODAS as ordens de serviço / atendimentos listados.

Para cada atendimento, extraia:
- description: descrição do serviço ou tipo de atendimento (ex: "Serviço elétrico", "Desentupimento", "Chaveiro")
- serviceDate: data do atendimento no formato YYYY-MM-DD (se não houver, use a data mais próxima que encontrar no documento)
- value: valor do serviço em número decimal (ex: 150.00) — se não encontrar, coloque 0

Retorne um JSON com:
{
  "services": [...array de atendimentos...],
  "totalValue": número total somado,
  "competence": "mês/ano de referência como string, ex: Janeiro/2026",
  "technicianName": "nome do técnico se aparecer no documento",
  "observations": "qualquer observação relevante do documento"
}

Se não conseguir extrair com certeza algum campo, use null. Seja preciso com valores monetários.`

const RESPONSE_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    services: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          description:  { type: SchemaType.STRING },
          serviceDate:  { type: SchemaType.STRING },
          value:        { type: SchemaType.NUMBER },
        },
        required: ['description', 'serviceDate', 'value'],
      },
    },
    totalValue:      { type: SchemaType.NUMBER },
    competence:      { type: SchemaType.STRING },
    technicianName:  { type: SchemaType.STRING },
    observations:    { type: SchemaType.STRING },
  },
  required: ['services', 'totalValue'],
}

export async function POST(_req: Request, { params }: Params) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const closing = await prisma.closing.findUnique({
    where: { id: params.id },
    select: { id: true, reportFilePath: true, reportFileName: true, totalValue: true, competence: true },
  })
  if (!closing) return NextResponse.json({ error: 'Fechamento não encontrado' }, { status: 404 })
  if (!closing.reportFilePath) return NextResponse.json({ error: 'Este fechamento não possui PDF de relatório' }, { status: 400 })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY não configurada' }, { status: 500 })

  // Baixa o PDF do Vercel Blob (ou path local)
  let pdfBytes: Uint8Array
  try {
    const isUrl = closing.reportFilePath.startsWith('http')
    if (isUrl) {
      const response = await fetch(closing.reportFilePath, { signal: AbortSignal.timeout(15000) })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      pdfBytes = new Uint8Array(await response.arrayBuffer())
    } else {
      // Desenvolvimento local — lê do sistema de arquivos
      const { readFile } = await import('fs/promises')
      const buf = await readFile(closing.reportFilePath)
      pdfBytes = new Uint8Array(buf)
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erro desconhecido'
    return NextResponse.json({ error: `Erro ao baixar PDF: ${msg}` }, { status: 500 })
  }

  // Chama Gemini 1.5 Flash com o PDF inline
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA as Parameters<typeof model.generateContent>[0] extends { generationConfig?: { responseSchema?: infer S } } ? S : never,
      },
    })

    const result = await model.generateContent([
      PROMPT,
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: Buffer.from(pdfBytes).toString('base64'),
        },
      },
    ])

    const text = result.response.text()
    let extracted: {
      services: Array<{ description: string; serviceDate: string; value: number }>
      totalValue: number
      competence?: string | null
      technicianName?: string | null
      observations?: string | null
    }

    try {
      extracted = JSON.parse(text)
    } catch {
      return NextResponse.json({ error: 'Resposta do Gemini não é JSON válido', raw: text }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      closingId:  closing.id,
      competence: extracted.competence ?? closing.competence,
      services:   extracted.services ?? [],
      totalValue: extracted.totalValue ?? closing.totalValue,
      technicianName: extracted.technicianName ?? null,
      observations:   extracted.observations ?? null,
      serviceCount:   extracted.services?.length ?? 0,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erro desconhecido'
    return NextResponse.json({ error: `Erro Gemini: ${msg}` }, { status: 500 })
  }
}
