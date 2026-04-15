/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║  GERADOR DE LANDING PAGES SEO — VERSÃO TEMPLATE (sem API)        ║
 * ║  Gera 84 páginas únicas instantaneamente, sem cota de API.       ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 * Uso: node scripts/generate-seo-template.mjs
 */

import { writeFileSync, existsSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = join(__dirname, '..')
const DATA_FILE = join(ROOT, 'src', 'data', 'seo-pages.json')

// ── Configuração de serviços ──────────────────────────────────────────────────
const SERVICES = [
  {
    id: 'encanador',
    label: 'Encanador',
    gender: 'o',
    subservices: [
      { title: 'Reparo de Vazamentos',         description: 'Localização e correção de vazamentos em tubulações internas e externas, evitando desperdício e danos à estrutura.' },
      { title: 'Instalação de Torneiras e Pias', description: 'Instalação e substituição de torneiras, misturadores, pias e lavatórios com acabamento perfeito.' },
      { title: 'Desentupimento de Canos',       description: 'Destupição de canos entupidos com equipamento profissional, sem quebrar paredes desnecessariamente.' },
      { title: 'Caixa d\'Água e Reservatórios', description: 'Limpeza, instalação e manutenção de caixas d\'água e reservatórios de acordo com as normas sanitárias.' },
      { title: 'Chuveiros e Aquecedores',       description: 'Instalação e manutenção de chuveiros elétricos, a gás e aquecedores solares.' },
    ],
    faqs: [
      { question: 'Quanto custa chamar um encanador?',         answer: 'O valor varia conforme o tipo de serviço e complexidade. Oferecemos orçamento gratuito e sem compromisso. Entre em contato para receber uma estimativa rápida.' },
      { question: 'O encanador atende emergências à noite?',   answer: 'Sim! Nosso serviço de encanador funciona 24 horas por dia, 7 dias por semana, incluindo fins de semana e feriados. Estamos prontos para atender emergências a qualquer momento.' },
      { question: 'Como identificar um vazamento escondido?',  answer: 'Aumento repentino na conta de água, manchas de umidade nas paredes e sons de água correndo quando tudo está fechado são sinais clássicos. Nossos técnicos usam equipamentos de detecção sem precisar quebrar paredes.' },
      { question: 'Vocês dão garantia nos serviços?',          answer: 'Sim, todos os nossos serviços de encanamento têm garantia. Trabalhamos com materiais de qualidade e técnicos experientes para garantir que o problema não volte.' },
      { question: 'Quanto tempo leva um reparo de vazamento?', answer: 'Reparos simples costumam ser resolvidos em 1 a 2 horas. Casos mais complexos podem levar mais tempo, mas sempre informamos o prazo antes de iniciar o serviço.' },
    ],
    introTemplates: [
      (city) => `Problemas hidráulicos não esperam hora marcada — e é por isso que a Ilha Bella Serviços oferece encanador em ${city} com atendimento 24 horas. Nossa equipe especializada resolve desde pequenos vazamentos até instalações completas com agilidade e preço justo.`,
      (city) => `Encontrar um encanador de confiança em ${city} pode ser difícil, mas a Ilha Bella Serviços simplifica isso: técnicos qualificados, resposta rápida e orçamento gratuito. Atendemos emergências e serviços programados em toda a cidade.`,
      (city) => `A Ilha Bella Serviços é referência em serviços de encanamento em ${city}. Com anos de experiência e técnicos certificados, resolvemos qualquer problema hidráulico com eficiência, transparência e garantia no serviço.`,
    ],
    heroSubtitleTemplates: [
      (city) => `Vazamento, entupimento ou instalação em ${city}? Nossa equipe chega rápido e resolve com garantia. Atendimento 24 horas, todos os dias.`,
      (city) => `Serviço de encanador em ${city} com técnicos qualificados, preço justo e resposta imediata. Funcionamos 24h por dia, incluindo fins de semana.`,
    ],
  },
  {
    id: 'eletricista',
    label: 'Eletricista',
    gender: 'o',
    subservices: [
      { title: 'Instalações Elétricas',          description: 'Instalação elétrica residencial e comercial seguindo as normas técnicas ABNT NBR 5410, com segurança total.' },
      { title: 'Quadros de Distribuição',        description: 'Montagem, revisão e adequação de quadros de disjuntores e de distribuição elétrica.' },
      { title: 'Tomadas e Interruptores',        description: 'Instalação e substituição de tomadas, interruptores, dimmers e comandos elétricos.' },
      { title: 'Curto-Circuito e Emergências',   description: 'Diagnóstico e reparo de curtos-circuitos, quedas de energia e falhas no sistema elétrico com urgência.' },
      { title: 'Iluminação e Automação',         description: 'Projetos e instalação de sistemas de iluminação, incluindo LED, spots embutidos e automação residencial.' },
    ],
    faqs: [
      { question: 'O eletricista atende emergências 24h?',        answer: 'Sim! Nosso serviço de eletricista está disponível 24 horas por dia, 7 dias por semana. Curto-circuito, queda de energia ou qualquer emergência elétrica — estamos prontos.' },
      { question: 'É perigoso fazer serviço elétrico sem profissional?', answer: 'Extremamente. Instalações elétricas incorretas podem causar incêndios, choques elétricos e danos irreversíveis. Sempre chame um eletricista qualificado para garantir segurança.' },
      { question: 'Como saber se a instalação elétrica da minha casa é segura?', answer: 'Disjuntores que caem com frequência, cheiro de queimado, tomadas aquecidas ou fios expostos são sinais de alerta. Oferecemos visita técnica de avaliação para identificar riscos.' },
      { question: 'Vocês trabalham com instalações comerciais?',   answer: 'Sim, atendemos residências, comércios, escritórios e indústrias. Temos experiência com instalações trifásicas, SPDA (para-raios), projetos luminotécnicos e muito mais.' },
      { question: 'Quanto custa uma revisão elétrica completa?',   answer: 'O valor depende do tamanho do imóvel e da complexidade da instalação. Realizamos orçamento gratuito após avaliação inicial. Entre em contato para agendar.' },
    ],
    introTemplates: [
      (city) => `Instalações elétricas com segurança e qualidade em ${city} — essa é a especialidade da Ilha Bella Serviços. Nossos eletricistas certificados atendem residências e empresas com rapidez, respeitando todas as normas técnicas.`,
      (city) => `Precisou de um eletricista em ${city}? A Ilha Bella Serviços oferece atendimento 24 horas com técnicos experientes para instalações, reparos e emergências elétricas. Orçamento gratuito e trabalho com garantia.`,
      (city) => `A segurança elétrica do seu imóvel em ${city} é nossa prioridade. A Ilha Bella Serviços conta com eletricistas qualificados para resolver qualquer problema elétrico com agilidade, transparência e garantia de serviço.`,
    ],
    heroSubtitleTemplates: [
      (city) => `Precisa de eletricista em ${city}? Nossos técnicos certificados chegam rápido e resolvem com segurança. Atendimento 24h, todos os dias da semana.`,
      (city) => `Instalações elétricas, reparos e emergências em ${city} com a Ilha Bella Serviços. Técnicos qualificados, orçamento grátis e atendimento imediato.`,
    ],
  },
  {
    id: 'chaveiro',
    label: 'Chaveiro',
    gender: 'o',
    subservices: [
      { title: 'Abertura de Portas e Fechaduras', description: 'Abertura de portas residenciais, comerciais e veiculares sem danos, realizada por técnicos especializados.' },
      { title: 'Cópia de Chaves',                description: 'Reprodução de chaves comuns, codificadas e de segurança com precisão e rapidez.' },
      { title: 'Troca de Fechaduras',            description: 'Instalação e substituição de fechaduras convencionais, de segurança, eletromagnéticas e digitais.' },
      { title: 'Fechaduras Digitais e Eletrônicas', description: 'Instalação e configuração de fechaduras digitais com senha, biometria e acesso por aplicativo.' },
      { title: 'Cofres e Segredos',              description: 'Abertura, troca de segredo e manutenção de cofres e fechaduras de alta segurança.' },
    ],
    faqs: [
      { question: 'Chaveiro atende 24 horas em emergências?',    answer: 'Sim! Nosso serviço de chaveiro funciona 24 horas por dia, 7 dias por semana. Se você ficou trancado para fora de casa, carro ou empresa, estamos disponíveis para atender imediatamente.' },
      { question: 'A abertura de porta danifica a fechadura?',   answer: 'Na maioria dos casos, não. Nossos técnicos usam ferramentas profissionais que permitem abrir a porta sem danos à fechadura ou à porta. Em casos extremos, se necessário, informamos antes de qualquer procedimento.' },
      { question: 'Quanto tempo leva para chegar após o chamado?', answer: 'Nosso tempo médio de chegada na cidade é de 20 a 45 minutos, dependendo da localização. Priorizamos atendimentos de emergência e avisamos o tempo estimado ao agendar.' },
      { question: 'Vocês instalam fechaduras digitais?',         answer: 'Sim! Instalamos e configuramos fechaduras digitais de diversas marcas e modelos, com acesso por senha, biometria digital, cartão RFID ou aplicativo no celular.' },
      { question: 'Como funciona a troca de segredo da fechadura?', answer: 'A troca de segredo é feita quando você quer inutilizar chaves antigas (ex: após mudança ou perda de chave). O segredo interno da fechadura é substituído e novas chaves são feitas, sem precisar trocar toda a fechadura.' },
    ],
    introTemplates: [
      (city) => `Ficou trancado fora de casa ou precisa de uma nova fechadura em ${city}? A Ilha Bella Serviços oferece serviço de chaveiro 24 horas com atendimento rápido, profissional e transparente. Resolvemos qualquer situação com segurança.`,
      (city) => `O chaveiro da Ilha Bella Serviços em ${city} está disponível a qualquer hora para aberturas de emergência, cópias de chaves, instalação de fechaduras digitais e muito mais. Técnicos experientes com atendimento imediato.`,
      (city) => `Serviço de chaveiro profissional em ${city} com a Ilha Bella Serviços: abertura de portas, troca de fechaduras, cópia de chaves e instalação de fechaduras digitais. Atendimento 24h e orçamento sem compromisso.`,
    ],
    heroSubtitleTemplates: [
      (city) => `Trancou do lado de fora em ${city}? Nossa equipe de chaveiros chega em minutos. Serviço 24h, seguro e sem danos à porta ou fechadura.`,
      (city) => `Chaveiro em ${city} com atendimento imediato, dia e noite. Abrimos portas, fazemos cópias de chaves e instalamos fechaduras digitais com garantia.`,
    ],
  },
  {
    id: 'desentupimento',
    label: 'Desentupimento',
    gender: 'o',
    subservices: [
      { title: 'Desentupimento de Pia e Ralo',    description: 'Destupição de pias de cozinha e banheiro e ralos entupidos com equipamento de alta pressão.' },
      { title: 'Vaso Sanitário Entupido',         description: 'Desentupimento de vasos sanitários com técnica profissional, sem risco de danos ao banheiro.' },
      { title: 'Caixa de Gordura',               description: 'Limpeza e desentupimento de caixas de gordura residenciais e comerciais, eliminando odores.' },
      { title: 'Rede de Esgoto e Galeria',        description: 'Desobstrução de tubulações de esgoto com equipamento motorizado e câmera de inspeção.' },
      { title: 'Limpeza de Fossa Séptica',       description: 'Limpeza e esgotamento de fossas sépticas com caminhão limpa-fossa, adequando ao volume.' },
    ],
    faqs: [
      { question: 'Qual o tempo de atendimento para desentupimento?', answer: 'Em casos de emergência, nossos técnicos chegam em até 60 minutos na maioria das regiões que atendemos. Entre em contato agora e informe sua localização para estimarmos o tempo de chegada.' },
      { question: 'O desentupimento usa produtos químicos?',      answer: 'Utilizamos equipamentos mecânicos (espirais, cabos e hidrojateamento) que são mais eficientes e seguros. Produtos químicos só são usados quando estritamente necessário e sempre de forma segura.' },
      { question: 'Quanto custa o desentupimento de pia?',        answer: 'O valor depende do tipo de entupimento e da localização do problema. Fazemos orçamento sem compromisso após avaliação inicial. Na maioria dos casos, o problema é resolvido na hora.' },
      { question: 'Com que frequência devo limpar a caixa de gordura?', answer: 'O ideal é limpar a caixa de gordura residencial a cada 3 a 6 meses, e caixas comerciais com mais frequência. Isso previne entupimentos, maus odores e problemas na rede de esgoto.' },
      { question: 'O desentupimento pode ser feito à noite?',     answer: 'Sim! Nosso serviço de desentupimento funciona 24 horas por dia. Entupimentos não têm hora para acontecer, e nossa equipe está disponível para resolver sua emergência a qualquer momento.' },
    ],
    introTemplates: [
      (city) => `Entupimento de pia, ralo, vaso sanitário ou rede de esgoto em ${city}? A Ilha Bella Serviços resolve com rapidez e equipamento profissional. Atendimento 24 horas e orçamento gratuito para qualquer tipo de desentupimento.`,
      (city) => `Quando o entupimento aparece, a solução precisa ser imediata. A Ilha Bella Serviços oferece desentupimento em ${city} com técnicos especializados, equipamentos modernos e atendimento 24h todos os dias.`,
      (city) => `Serviço de desentupimento profissional em ${city} pela Ilha Bella Serviços: pias, ralos, vasos sanitários, caixas de gordura e redes de esgoto. Atendimento emergencial disponível 24 horas, 7 dias por semana.`,
    ],
    heroSubtitleTemplates: [
      (city) => `Pia, ralo ou vaso entupido em ${city}? Nossa equipe resolve na hora com equipamento profissional. Atendimento 24h sem taxa de emergência.`,
      (city) => `Desentupimento em ${city} com rapidez e garantia. Pias, vasos, ralos e redes de esgoto — resolvemos qualquer entupimento, dia e noite.`,
    ],
  },
]

// ── Bairros por cidade ────────────────────────────────────────────────────────
const NEIGHBORHOODS = {
  'florianopolis':            ['Centro', 'Trindade', 'Lagoa da Conceição', 'Ingleses', 'Canasvieiras', 'Campeche', 'Jurerê Internacional', 'Costeira do Pirajubaé', 'Coqueiros', 'Pantanal'],
  'sao-jose':                 ['Kobrasol', 'Barreiros', 'Campinas', 'Ipiranga', 'Real Parque', 'Bela Vista', 'Forquilhinha', 'Jardim Santiago', 'Areias', 'Centro'],
  'palhoca':                  ['Passa Vinte', 'Ponte do Imaruim', 'Brejaru', 'Centro', 'Pacheco', 'Pedra Branca', 'Aririu', 'Enseada de Brito', 'Guarda do Embaú', 'São Sebastião'],
  'biguacu':                  ['Centro', 'Fundos', 'Roçado', 'Jardim Coqueiros', 'São Miguel', 'Nova Descoberta', 'Bela Vista', 'Alto Biguaçu', 'Itajuba', 'Sorocaba de Dentro'],
  'santo-amaro-da-imperatriz': ['Centro', 'Caldas da Imperatriz', 'Alto do Capitão', 'Usina', 'São Felipe', 'Bom Retiro', 'Itacorubi', 'Recanto', 'Areias de Baixo', 'Vargem Grande'],
  'governador-celso-ramos':   ['Centro', 'Armação', 'Caieira da Barra do Sul', 'Ganchos do Meio', 'Ganchos de Fora', 'Palmas', 'Santa Paula', 'Lagoa', 'Praia de Palmas', 'Ilhota'],
  'garopaba':                 ['Centro', 'Ferrugem', 'Silveira', 'Ouvidor', 'Siriú', 'Campo Duna', 'Lagoa', 'Garopaba do Sul', 'Pedras Altas', 'Rosa'],
  'paulo-lopes':              ['Centro', 'Cachoeira', 'Massiambu', 'Alto Capivari', 'Macacu', 'Joaquina', 'Três Barras', 'Campo Duna', 'Areias', 'Serraria'],
  'tijucas':                  ['Centro', 'Nova Tijucas', 'Bela Vista', 'Alto Tijucas', 'Canelinha', 'Rolador', 'Caldas', 'Gesteira', 'Areias', 'São Sebastião'],
  'itajai':                   ['Centro', 'Fazenda', 'Cordeiros', 'Praia Brava', 'Itaipava', 'Murta', 'São João', 'Ressacada', 'Dom Bosco', 'Espinheiros'],
  'balneario-camboriu':       ['Centro', 'Barra Sul', 'Barra Norte', 'Pioneiros', 'Nações', 'Taquarinhas', 'São Judas Tadeu', 'Ariribá', 'Nações', 'Ponta das Canas'],
  'porto-alegre':             ['Centro Histórico', 'Moinhos de Vento', 'Petrópolis', 'Bom Fim', 'Floresta', 'Cidade Baixa', 'Auxiliadora', 'Boa Vista', 'Menino Deus', 'Partenon'],
  'canoas':                   ['Centro', 'Rio Branco', 'Niterói', 'Harmonia', 'Fátima', 'Guajuviras', 'Mato Grande', 'Nossa Senhora das Graças', 'São Luís', 'Presidente Vargas'],
  'sao-leopoldo':             ['Centro', 'Vicentina', 'Santos Dumont', 'Rio dos Sinos', 'Colonial', 'Industrial', 'José Bonifácio', 'Arroio da Manteiga', 'São Miguel', 'Fião'],
  'novo-hamburgo':            ['Centro', 'Rincão', 'América', 'Lomba Grande', 'Canudos', 'Industrial', 'Boa Saúde', 'Santo Afonso', 'Hamburgo Velho', 'Ideal'],
  'gravatai':                 ['Centro', 'Santa Fé', 'Ipiranga', 'Bom Jesus', 'Itacolomi', 'Moradas do Bosque', 'São Geraldo', 'Morada das Flores', 'Nova Tramandaí', 'Parque da Matriz'],
  'viamao':                   ['Centro', 'Viamão', 'Passo do Vigário', 'Bolaxa', 'Capão da Porteira', 'Itapuã', 'Belém Novo', 'Jardim das Acácias', 'Parque Anchieta', 'Passo Dorneles'],
  'cachoeirinha':             ['Centro', 'Boa Vista', 'Jardim das Acácias', 'Industrial', 'Parque Oásis', 'São Jorge', 'Bairro dos Industriários', 'Parque Eldorado', 'Piquete Jaguari', 'Vila Rosa'],
  'alvorada':                 ['Centro', 'Navegantes', 'Industrial', 'Ipiranga', 'São Jorge', 'Jardim Planalto', 'Copacabana', 'Santo André', 'Bom Pastore', 'Liberdade'],
  'sapucaia-do-sul':          ['Centro', 'Integração', 'Vicentina', 'São Luís', 'Industrial', 'Jardim das Flores', 'Bela Vista', 'Canudos', 'Nova Sapucaia', 'Jardim América'],
  'esteio':                   ['Centro', 'Nova Hartz', 'Industrial', 'Jardim América', 'Santo André', 'Rio Branco', 'São Miguel', 'Parque dos Trabalhadores', 'Santa Terezinha', 'Cristo Rei'],
}

// ── Diferenciais (iguais para todos) ──────────────────────────────────────────
const WHY_US = [
  { title: 'Atendimento 24 Horas', description: 'Disponíveis a qualquer hora do dia ou da noite, todos os dias da semana, incluindo feriados.' },
  { title: 'Técnicos Certificados', description: 'Nossa equipe é treinada, identificada e comprometida com segurança, qualidade e respeito ao cliente.' },
  { title: 'Preço Justo e Transparente', description: 'Orçamento gratuito antes de qualquer serviço. Sem cobranças surpresa: você aprova o valor antes de começar.' },
  { title: 'Resposta Imediata', description: 'Priorizamos agilidade: após o contato, nosso técnico mais próximo é acionado para chegar o quanto antes.' },
]

const URGENCY_BADGES = ['Disponível 24h', 'Resposta Rápida', 'Orçamento Grátis', 'Técnicos Certificados']

// ── Cidades ───────────────────────────────────────────────────────────────────
const CITIES = [
  { name: 'Florianópolis',              state: 'SC', slug: 'florianopolis' },
  { name: 'São José',                   state: 'SC', slug: 'sao-jose' },
  { name: 'Palhoça',                    state: 'SC', slug: 'palhoca' },
  { name: 'Biguaçu',                    state: 'SC', slug: 'biguacu' },
  { name: 'Santo Amaro da Imperatriz',  state: 'SC', slug: 'santo-amaro-da-imperatriz' },
  { name: 'Governador Celso Ramos',     state: 'SC', slug: 'governador-celso-ramos' },
  { name: 'Garopaba',                   state: 'SC', slug: 'garopaba' },
  { name: 'Paulo Lopes',                state: 'SC', slug: 'paulo-lopes' },
  { name: 'Tijucas',                    state: 'SC', slug: 'tijucas' },
  { name: 'Itajaí',                     state: 'SC', slug: 'itajai' },
  { name: 'Balneário Camboriú',         state: 'SC', slug: 'balneario-camboriu' },
  { name: 'Porto Alegre',               state: 'RS', slug: 'porto-alegre' },
  { name: 'Canoas',                     state: 'RS', slug: 'canoas' },
  { name: 'São Leopoldo',               state: 'RS', slug: 'sao-leopoldo' },
  { name: 'Novo Hamburgo',              state: 'RS', slug: 'novo-hamburgo' },
  { name: 'Gravataí',                   state: 'RS', slug: 'gravatai' },
  { name: 'Viamão',                     state: 'RS', slug: 'viamao' },
  { name: 'Cachoeirinha',               state: 'RS', slug: 'cachoeirinha' },
  { name: 'Alvorada',                   state: 'RS', slug: 'alvorada' },
  { name: 'Sapucaia do Sul',            state: 'RS', slug: 'sapucaia-do-sul' },
  { name: 'Esteio',                     state: 'RS', slug: 'esteio' },
]

// ── Geração de uma página ─────────────────────────────────────────────────────
function generatePage(service, city) {
  // Índice determinístico baseado na combinação, para variar templates
  const idx = (service.id.length + city.slug.length) % 3
  const heroIdx = (service.id.charCodeAt(0) + city.slug.charCodeAt(0)) % 2

  const intro       = service.introTemplates[idx](city.name)
  const heroSubtitle = service.heroSubtitleTemplates[heroIdx](city.name)
  const neighborhoods = NEIGHBORHOODS[city.slug] ?? ['Centro', 'Bairro Alto', 'Vila Nova', 'Jardim das Flores', 'São João', 'Santa Cruz', 'Boa Vista', 'Parque Industrial', 'Vila Rica', 'Nova Esperança']

  return {
    servico:    service.label,
    cidade:     city.name,
    estado:     city.state,
    slug:       `${service.id}-em-${city.slug}`,
    geradoEm:   new Date().toISOString(),
    meta: {
      title:       `${service.label} em ${city.name} | Atendimento 24h | Ilha Bella Serviços`,
      description: `Precisa de ${service.label.toLowerCase()} em ${city.name}? Atendimento 24h, técnicos certificados e preço justo. Orçamento grátis — ligue agora para a Ilha Bella Serviços!`,
    },
    h1:            `${service.label} em ${city.name} – Atendimento 24 Horas`,
    heroSubtitle,
    urgencyBadges: URGENCY_BADGES,
    intro,
    services:      service.subservices,
    whyUs:         WHY_US,
    neighborhoods,
    faqs:          service.faqs,
    ctaText:       `Chamar ${service.label} no WhatsApp`,
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
function main() {
  const args      = process.argv.slice(2)
  const forceAll  = args.includes('--force-all')
  const forceSlug = args.includes('--force') ? args[args.indexOf('--force') + 1] : null

  let data = {}
  if (existsSync(DATA_FILE)) {
    try { data = JSON.parse(readFileSync(DATA_FILE, 'utf-8')) } catch {}
  }

  const total   = SERVICES.length * CITIES.length
  let generated = 0
  let skipped   = 0
  let current   = 0

  console.log('\n╔═══════════════════════════════════════════════╗')
  console.log('║  GERADOR SEO TEMPLATE — Ilha Bella Serviços   ║')
  console.log('╠═══════════════════════════════════════════════╣')
  console.log(`║  Serviços: ${SERVICES.length}  ×  Cidades: ${CITIES.length}  =  ${total} páginas  ║`)
  console.log('╚═══════════════════════════════════════════════╝\n')

  for (const service of SERVICES) {
    for (const city of CITIES) {
      current++
      const key      = `${service.id}-em-${city.slug}`
      const progress = `[${current.toString().padStart(2)}/${total}]`

      if (data[key] && !forceAll && forceSlug !== key) {
        console.log(`${progress} ⏭  Pulando  ${key}`)
        skipped++
        continue
      }

      data[key] = generatePage(service, city)
      console.log(`${progress} ✅ Gerado   ${key}`)
      generated++
    }
  }

  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')

  console.log('\n╔═══════════════════════════════════════════════╗')
  console.log('║  CONCLUÍDO!                                    ║')
  console.log('╠═══════════════════════════════════════════════╣')
  console.log(`║  ✅ Geradas:  ${generated.toString().padEnd(33)}║`)
  console.log(`║  ⏭  Puladas:  ${skipped.toString().padEnd(33)}║`)
  console.log('╠═══════════════════════════════════════════════╣')
  console.log('║  PRÓXIMOS PASSOS:                              ║')
  console.log('║  git add src/data/seo-pages.json               ║')
  console.log('║  git commit -m "feat: 84 seo pages geradas"    ║')
  console.log('║  git push                                      ║')
  console.log('╚═══════════════════════════════════════════════╝\n')
}

main()
