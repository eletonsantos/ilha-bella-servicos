/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  GERADOR DE LANDING PAGES SEO LOCAL — Ilha Bella Serviços       ║
 * ║  Usa Google Gemini para criar conteúdo otimizado por cidade.    ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  COMO USAR:                                                      ║
 * ║  1. Adicione GEMINI_API_KEY no seu .env.local                    ║
 * ║  2. Execute: node scripts/generate-seo-pages.mjs                 ║
 * ║  3. Para regenerar uma página: --force encanador-em-florianopolis ║
 * ║  4. Para regenerar tudo:       --force-all                       ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

// Carrega variáveis de ambiente do .env.local
const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
config({ path: join(ROOT, '.env.local') })

// ── Arquivo de dados ──────────────────────────────────────────────────────────
const DATA_FILE = join(ROOT, 'src', 'data', 'seo-pages.json')

// ── Serviços ─────────────────────────────────────────────────────────────────
const SERVICES = [
  {
    id: 'encanador',
    label: 'Encanador',
    descricao: 'serviços hidráulicos: vazamentos, instalações, reparos em tubulações, torneiras, caixas d\'água',
  },
  {
    id: 'eletricista',
    label: 'Eletricista',
    descricao: 'serviços elétricos: instalações, reparos, quadros de distribuição, tomadas, fiações, curtos-circuitos',
  },
  {
    id: 'chaveiro',
    label: 'Chaveiro',
    descricao: 'serviços de chaveiro: abertura de portas e fechaduras, cópia de chaves, troca de segredo, fechaduras digitais',
  },
  {
    id: 'desentupimento',
    label: 'Desentupimento',
    descricao: 'desentupimento de pias, ralos, vasos sanitários, caixas de gordura, redes de esgoto e galerias',
  },
]

// ── Cidades ───────────────────────────────────────────────────────────────────
const CITIES = [
  // Grande Florianópolis — SC
  { name: 'Florianópolis', state: 'SC', slug: 'florianopolis' },
  { name: 'São José',       state: 'SC', slug: 'sao-jose' },
  { name: 'Palhoça',        state: 'SC', slug: 'palhoca' },
  { name: 'Biguaçu',        state: 'SC', slug: 'biguacu' },
  { name: 'Santo Amaro da Imperatriz', state: 'SC', slug: 'santo-amaro-da-imperatriz' },
  { name: 'Governador Celso Ramos',    state: 'SC', slug: 'governador-celso-ramos' },
  { name: 'Garopaba',       state: 'SC', slug: 'garopaba' },
  { name: 'Paulo Lopes',    state: 'SC', slug: 'paulo-lopes' },
  { name: 'Tijucas',        state: 'SC', slug: 'tijucas' },
  { name: 'Itajaí',         state: 'SC', slug: 'itajai' },
  { name: 'Balneário Camboriú', state: 'SC', slug: 'balneario-camboriu' },
  // Grande Porto Alegre — RS
  { name: 'Porto Alegre',   state: 'RS', slug: 'porto-alegre' },
  { name: 'Canoas',         state: 'RS', slug: 'canoas' },
  { name: 'São Leopoldo',   state: 'RS', slug: 'sao-leopoldo' },
  { name: 'Novo Hamburgo',  state: 'RS', slug: 'novo-hamburgo' },
  { name: 'Gravataí',       state: 'RS', slug: 'gravatai' },
  { name: 'Viamão',         state: 'RS', slug: 'viamao' },
  { name: 'Cachoeirinha',   state: 'RS', slug: 'cachoeirinha' },
  { name: 'Alvorada',       state: 'RS', slug: 'alvorada' },
  { name: 'Sapucaia do Sul',state: 'RS', slug: 'sapucaia-do-sul' },
  { name: 'Esteio',         state: 'RS', slug: 'esteio' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function pageKey(service, city) {
  return `${service.id}-em-${city.slug}`
}

function loadData() {
  if (!existsSync(DATA_FILE)) return {}
  try {
    return JSON.parse(readFileSync(DATA_FILE, 'utf-8'))
  } catch {
    return {}
  }
}

function saveData(data) {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function extractJson(text) {
  // Remove blocos markdown ```json ... ```
  let cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  // Tenta encontrar o JSON dentro do texto se houver texto antes/depois
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.slice(start, end + 1)
  }

  return JSON.parse(cleaned)
}

// ── Prompt para o Gemini ──────────────────────────────────────────────────────
function buildPrompt(service, city) {
  return `Você é especialista em SEO local para serviços residenciais no Brasil.

Crie conteúdo otimizado em português brasileiro para uma landing page de "${service.label} em ${city.name}".

EMPRESA: Ilha Bella Serviços
SERVIÇO: ${service.label} (${service.descricao})
CIDADE: ${city.name}, ${city.state}, Brasil
DIFERENCIAIS DA EMPRESA: Atendimento 24h todos os dias, técnicos experientes e certificados, resposta rápida, orçamento gratuito, preço justo e transparente

REGRAS IMPORTANTES:
- Escreva em português brasileiro natural e profissional
- Use a palavra-chave "${service.label} em ${city.name}" de forma orgânica no texto
- Tom confiável e urgente (sem exageros ou promessas impossíveis)
- Liste bairros REAIS e conhecidos de ${city.name}
- Crie 5 sub-serviços específicos e realistas para a categoria ${service.label}
- Crie 4 motivos para escolher a empresa
- Crie 5 perguntas reais que clientes fazem sobre ${service.label}

Retorne APENAS um objeto JSON válido. Sem markdown. Sem texto antes ou depois. Apenas o JSON:

{
  "meta": {
    "title": "${service.label} em ${city.name} | Atendimento 24h | Ilha Bella Serviços",
    "description": "Precisa de ${service.label.toLowerCase()} em ${city.name}? Atendimento 24h, técnicos certificados e preço justo. Ligue agora para a Ilha Bella Serviços!"
  },
  "h1": "${service.label} em ${city.name} – Atendimento 24 Horas",
  "heroSubtitle": "duas frases sobre o serviço na cidade com urgência e confiança",
  "urgencyBadges": [
    "Disponível 24h",
    "Resposta Rápida",
    "Orçamento Grátis",
    "Técnicos Certificados"
  ],
  "intro": "2 a 3 frases naturais sobre o serviço em ${city.name}, mencionando a cidade e o serviço de forma orgânica",
  "services": [
    { "title": "Nome do sub-serviço 1", "description": "Descrição em uma frase" },
    { "title": "Nome do sub-serviço 2", "description": "Descrição em uma frase" },
    { "title": "Nome do sub-serviço 3", "description": "Descrição em uma frase" },
    { "title": "Nome do sub-serviço 4", "description": "Descrição em uma frase" },
    { "title": "Nome do sub-serviço 5", "description": "Descrição em uma frase" }
  ],
  "whyUs": [
    { "title": "Atendimento 24 Horas", "description": "Descrição do diferencial em uma frase" },
    { "title": "Técnicos Certificados", "description": "Descrição do diferencial em uma frase" },
    { "title": "Preço Justo e Transparente", "description": "Descrição do diferencial em uma frase" },
    { "title": "Resposta Imediata", "description": "Descrição do diferencial em uma frase" }
  ],
  "neighborhoods": [
    "Bairro Real 1", "Bairro Real 2", "Bairro Real 3", "Bairro Real 4", "Bairro Real 5",
    "Bairro Real 6", "Bairro Real 7", "Bairro Real 8", "Bairro Real 9", "Bairro Real 10"
  ],
  "faqs": [
    { "question": "Pergunta realista 1?", "answer": "Resposta em 2 a 3 frases" },
    { "question": "Pergunta realista 2?", "answer": "Resposta em 2 a 3 frases" },
    { "question": "Pergunta realista 3?", "answer": "Resposta em 2 a 3 frases" },
    { "question": "Pergunta realista 4?", "answer": "Resposta em 2 a 3 frases" },
    { "question": "Pergunta realista 5?", "answer": "Resposta em 2 a 3 frases" }
  ],
  "ctaText": "Chamar ${service.label} no WhatsApp"
}`
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('\n❌ GEMINI_API_KEY não encontrada!')
    console.error('   Adicione ao .env.local: GEMINI_API_KEY=sua_chave_aqui')
    console.error('   Obtenha gratuitamente em: https://aistudio.google.com/app/apikey\n')
    process.exit(1)
  }

  // Flags de linha de comando
  const args = process.argv.slice(2)
  const forceAll = args.includes('--force-all')
  const forceSlug = args.includes('--force') ? args[args.indexOf('--force') + 1] : null

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  })

  let data = loadData()

  const total = SERVICES.length * CITIES.length
  let current = 0
  let generated = 0
  let skipped = 0
  let errors = 0

  console.log('\n╔════════════════════════════════════════════╗')
  console.log('║  GERADOR SEO LOCAL — Ilha Bella Serviços   ║')
  console.log('╠════════════════════════════════════════════╣')
  console.log(`║  Serviços: ${SERVICES.length.toString().padEnd(4)} Cidades: ${CITIES.length.toString().padEnd(4)} Total: ${total.toString().padEnd(4)}║`)
  console.log('╚════════════════════════════════════════════╝\n')

  for (const service of SERVICES) {
    for (const city of CITIES) {
      current++
      const key = pageKey(service, city)
      const progress = `[${current.toString().padStart(2)}/${total}]`

      // Verifica se deve pular
      const shouldSkip =
        data[key] &&
        !forceAll &&
        forceSlug !== key

      if (shouldSkip) {
        console.log(`${progress} ⏭  Pulando  ${key}`)
        skipped++
        continue
      }

      console.log(`${progress} 🤖 Gerando  ${key}...`)

      let tentativas = 0
      let sucesso = false

      while (tentativas < 3 && !sucesso) {
        tentativas++
        try {
          const prompt = buildPrompt(service, city)
          const result = await model.generateContent(prompt)
          const text = result.response.text()

          const parsed = extractJson(text)

          // Valida campos obrigatórios
          if (!parsed.meta?.title || !parsed.h1 || !parsed.faqs?.length) {
            throw new Error('JSON retornado está incompleto')
          }

          data[key] = {
            servico: service.label,
            cidade: city.name,
            estado: city.state,
            slug: key,
            geradoEm: new Date().toISOString(),
            ...parsed,
          }

          saveData(data)
          console.log(`${progress} ✅ Sucesso  ${key}`)
          generated++
          sucesso = true

          // Respeita rate limit: 5s entre requisições (12 RPM, limite é 15 RPM)
          if (current < total) await sleep(5000)

        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          if (tentativas < 3) {
            console.warn(`${progress} ⚠️  Tentativa ${tentativas}/3 falhou: ${msg}. Aguardando 15s...`)
            await sleep(15000)
          } else {
            console.error(`${progress} ❌ Erro em ${key}: ${msg}`)
            errors++
          }
        }
      }
    }
  }

  console.log('\n╔════════════════════════════════════════════╗')
  console.log('║  GERAÇÃO CONCLUÍDA                          ║')
  console.log('╠════════════════════════════════════════════╣')
  console.log(`║  ✅ Geradas:  ${generated.toString().padEnd(30)}║`)
  console.log(`║  ⏭  Puladas:  ${skipped.toString().padEnd(30)}║`)
  console.log(`║  ❌ Erros:    ${errors.toString().padEnd(30)}║`)
  console.log('╠════════════════════════════════════════════╣')
  console.log('║  PRÓXIMOS PASSOS:                           ║')
  console.log('║  1. git add src/data/seo-pages.json         ║')
  console.log('║  2. git commit -m "feat: seo pages"         ║')
  console.log('║  3. git push  (Vercel faz deploy automático)║')
  console.log('╚════════════════════════════════════════════╝\n')
}

main().catch((err) => {
  console.error('\n❌ Erro fatal:', err)
  process.exit(1)
})
