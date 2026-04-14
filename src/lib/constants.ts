export const COMPANY = {
  name: 'Ilha Bella Serviços',
  shortName: 'Ilha Bella',
  email: 'adm@ilhabellaservicos.com.br',
  phones: ['(48) 3375-4123', '(48) 2132-1685'],
  // Substitua pelo número WhatsApp real (somente dígitos, com DDI 55)
  whatsapp: '5548999999999',
  whatsappMessage: 'Olá! Preciso de um orçamento. Pode me ajudar?',
  domain: 'www.ilhabellaservicos.com.br',
  siteUrl: 'https://www.ilhabellaservicos.com.br',
  regions: ['Grande Florianópolis', 'Grande Porto Alegre'],
  description:
    'Serviços residenciais e empresariais com atendimento 24h. Encanador, eletricista, chaveiro, desentupimento e muito mais na Grande Florianópolis e Grande Porto Alegre.',
} as const

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Quem Somos', href: '/quem-somos' },
  { label: 'Serviços', href: '/servicos' },
  { label: 'Áreas Atendidas', href: '/areas-atendidas' },
  { label: 'Seja Parceiro', href: '/seja-parceiro' },
  { label: 'Contato', href: '/contato' },
] as const

export const SERVICES = [
  {
    id: 'encanador',
    icon: 'Droplets',
    title: 'Encanador',
    description:
      'Vazamentos, reparos hidráulicos, instalações e manutenção de sistemas de água com eficiência e rapidez.',
    highlights: ['Reparos de vazamentos', 'Instalação de torneiras e pias', 'Desentupimento de canos'],
  },
  {
    id: 'eletricista',
    icon: 'Zap',
    title: 'Eletricista',
    description:
      'Instalações elétricas, reparos, quadros de distribuição e adequação às normas técnicas com segurança total.',
    highlights: ['Instalações elétricas', 'Reparos e substituições', 'Quadros elétricos'],
  },
  {
    id: 'chaveiro',
    icon: 'KeyRound',
    title: 'Chaveiro',
    description:
      'Abertura de fechaduras, cópias de chaves, instalação de fechaduras de segurança e atendimento emergencial.',
    highlights: ['Abertura de portas', 'Cópia de chaves', 'Troca de fechaduras'],
  },
  {
    id: 'desentupimento',
    icon: 'Filter',
    title: 'Desentupimento',
    description:
      'Desentupimento de pias, ralos, vasos sanitários, caixas de gordura e redes de esgoto com equipamento profissional.',
    highlights: ['Pias e ralos', 'Vasos sanitários', 'Redes de esgoto'],
  },
  {
    id: 'manutencao',
    icon: 'Wrench',
    title: 'Manutenção Residencial',
    description:
      'Serviços gerais de conservação e manutenção do lar: reparos, instalações e melhorias com qualidade garantida.',
    highlights: ['Reparos gerais', 'Montagem de móveis', 'Pequenas reformas'],
  },
  {
    id: 'emergencial',
    icon: 'Clock',
    title: 'Assistência Emergencial',
    description:
      'Atendimento 24 horas para situações urgentes. Equipe disponível a qualquer hora, todos os dias da semana.',
    highlights: ['Disponível 24h/7 dias', 'Resposta rápida', 'Plantão nos feriados'],
  },
  {
    id: 'empresas',
    icon: 'Building2',
    title: 'Empresas e Parceiros',
    description:
      'Soluções sob medida para empresas, condomínios e imobiliárias com contratos de manutenção preventiva e corretiva.',
    highlights: ['Contratos corporativos', 'Atendimento a condomínios', 'Parceria com imobiliárias'],
  },
] as const

export const DIFFERENTIALS = [
  {
    icon: 'Clock',
    title: 'Atendimento 24 Horas',
    description: 'Disponíveis a qualquer hora do dia ou da noite, incluindo finais de semana e feriados.',
  },
  {
    icon: 'Zap',
    title: 'Agilidade Operacional',
    description: 'Resposta rápida e equipe preparada para agir com eficiência desde o primeiro contato.',
  },
  {
    icon: 'MessageSquare',
    title: 'Comunicação Clara',
    description: 'Você sabe exatamente o que será feito, quanto custa e quando estará pronto. Sem surpresas.',
  },
  {
    icon: 'Shield',
    title: 'Postura Profissional',
    description: 'Técnicos identificados, uniformizados e comprometidos com respeito e seriedade.',
  },
  {
    icon: 'MapPin',
    title: 'Cobertura Regional',
    description: 'Atendemos toda a Grande Florianópolis e Grande Porto Alegre com equipe local.',
  },
  {
    icon: 'Star',
    title: 'Compromisso com Qualidade',
    description: 'Serviços executados com materiais de qualidade e garantia de resolução.',
  },
] as const
