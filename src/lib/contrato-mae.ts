/**
 * Contrato-Mãe de Prestação de Serviços — Ilha Bella Serviços
 *
 * Versões disponíveis:
 *   contrato_mae_v1 — Versão inicial (2026)
 *
 * Para criar nova versão, adicione entrada em CONTRACT_VERSIONS e
 * incremente CURRENT_CONTRACT_VERSION.
 */

export const CURRENT_CONTRACT_VERSION = 'contrato_mae_v1'

export const CONTRACT_VERSION_LABELS: Record<string, string> = {
  contrato_mae_v1: 'Versão 1 — 2026',
}

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

export interface ContratoMaeParams {
  // Contratado (prestador)
  razaoSocialContratado:    string
  nomeFantasiaContratado:   string
  cnpjContratado:           string
  situacaoCadastral:        string
  cnaePrincipal:            string
  enderecoContratado:       string
  representanteLegalNome:   string
  representanteLegalCpf:    string
  // Técnico responsável
  tecnicoNome:              string
  tecnicoCpf:               string
  tecnicoTelefone:          string
  tecnicoEmail:             string
  tecnicoEspecialidade:     string
  // Assinatura
  signedAt:                 string
  ip:                       string
  documentId:               string
  documentHash:             string
  contractVersion:          string
}

export interface ContratoMaeResult {
  version:   string
  documentId: string
  signedAt:  string
  contratante: {
    razaoSocial:       string
    nomeFantasia:      string
    cnpj:              string
    endereco:          string
    representanteLegal: string
    atividade:         string
  }
  contratado: ContratoMaeParams
  clausulas:  string[]
  audit: {
    ip:          string
    hash:        string
    timestamp:   string
    dataLegivel: string
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Dados fixos da Contratante
// ─────────────────────────────────────────────────────────────────────────────

export const CONTRATANTE = {
  razaoSocial:       'ILHA BELLA SERVICOS & ASSISTENCIA 24 HORAS LTDA',
  nomeFantasia:      'Ilha Bella Serviços',
  cnpj:              '28.864.149/0001-38',
  endereco:          'Praça Nereu Ramos, nº 90, Sala do Empreendedor, Centro, Biguaçu/SC — CEP 88160-116',
  representanteLegal: 'Eleton Cristofe dos Santos',
  atividade:         'Prestação de serviços de assistência residencial e empresarial 24 horas',
  foro:              'Comarca de Biguaçu/SC',
}

// ─────────────────────────────────────────────────────────────────────────────
// Texto completo do Contrato-Mãe v1
// ─────────────────────────────────────────────────────────────────────────────

export function getClausulasContratoMaeV1(p: ContratoMaeParams): string[] {
  return [
    // ─── CLÁUSULA 1 ────────────────────────────────────────────────────────
    `CLÁUSULA 1ª — QUALIFICAÇÃO DAS PARTES\n\n` +
    `CONTRATANTE: ${CONTRATANTE.razaoSocial}, inscrita no CNPJ sob o nº ${CONTRATANTE.cnpj}, ` +
    `com sede em ${CONTRATANTE.endereco}, neste ato representada por seu sócio/administrador ` +
    `${CONTRATANTE.representanteLegal}, doravante denominada simplesmente CONTRATANTE ou ILHA BELLA.\n\n` +
    `CONTRATADA: ${p.razaoSocialContratado}, inscrita no CNPJ sob o nº ${p.cnpjContratado}, ` +
    `situação cadastral ${p.situacaoCadastral}, CNAE principal: ${p.cnaePrincipal}, ` +
    `com endereço em ${p.enderecoContratado}, ` +
    `neste ato representada por ${p.representanteLegalNome}, CPF ${p.representanteLegalCpf}, ` +
    `doravante denominada simplesmente CONTRATADA.\n\n` +
    `TÉCNICO RESPONSÁVEL INDICADO: ${p.tecnicoNome}, CPF ${p.tecnicoCpf}, ` +
    `telefone ${p.tecnicoTelefone}, e-mail ${p.tecnicoEmail}, especialidade: ${p.tecnicoEspecialidade}.`,

    // ─── CLÁUSULA 2 ────────────────────────────────────────────────────────
    `CLÁUSULA 2ª — OBJETO\n\n` +
    `O presente Contrato tem por objeto a prestação de serviços técnicos especializados de assistência ` +
    `residencial e empresarial, incluindo, sem limitação: instalações e reparos elétricos, hidráulicos, ` +
    `desentupimento, serviços de chaveiro, limpeza de calhas, caixa d'água, caixa de gordura e serviços ` +
    `correlatos, conforme demanda operacional da CONTRATANTE, repassada por meio de plataforma digital ` +
    `(sistema web, aplicativo móvel ou outro canal eletrônico), doravante designada PLATAFORMA.\n\n` +
    `Parágrafo único: A CONTRATADA executará os serviços por meio de seus próprios colaboradores, ` +
    `sócios, prepostos, representantes ou técnicos vinculados à empresa, sendo integralmente responsável ` +
    `pela qualidade, prazo, documentação e demais obrigações decorrentes da execução.`,

    // ─── CLÁUSULA 3 ────────────────────────────────────────────────────────
    `CLÁUSULA 3ª — NATUREZA EMPRESARIAL E AUSÊNCIA DE VÍNCULO EMPREGATÍCIO\n\n` +
    `O presente instrumento regula relação comercial de natureza estritamente empresarial entre pessoas ` +
    `jurídicas, não gerando qualquer vínculo empregatício, societário, previdenciário ou de subordinação ` +
    `entre as partes, seus sócios, representantes, empregados, prepostos ou técnicos.\n\n` +
    `§1º A CONTRATADA é empresa autônoma e independente, que assume integralmente os riscos da sua ` +
    `atividade econômica, não cabendo à CONTRATANTE qualquer responsabilidade trabalhista, previdenciária, ` +
    `tributária ou civil decorrente da atuação dos colaboradores da CONTRATADA.\n\n` +
    `§2º A relação entre as partes NÃO configura os elementos caracterizadores do vínculo empregatício ` +
    `previstos no art. 3º da CLT, quais sejam: subordinação jurídica, pessoalidade, não-eventualidade e ` +
    `onerosidade direta ao trabalhador individual.\n\n` +
    `§3º A CONTRATADA declara expressamente que possui estrutura empresarial autônoma, com CNPJ ativo, ` +
    `pessoal próprio e capacidade técnica e organizacional para execução dos serviços objeto deste contrato.`,

    // ─── CLÁUSULA 4 ────────────────────────────────────────────────────────
    `CLÁUSULA 4ª — AUSÊNCIA DE PESSOALIDADE, EXCLUSIVIDADE E CONTROLE DE JORNADA\n\n` +
    `§1º PESSOALIDADE: A CONTRATADA pode executar os serviços por meio de qualquer colaborador, sócio, ` +
    `preposto, representante ou técnico vinculado à sua empresa, desde que habilitado. Não há exigência de ` +
    `que seja sempre o mesmo profissional, nem obrigação de indicar o técnico com antecedência determinada.\n\n` +
    `§2º EXCLUSIVIDADE: A CONTRATADA pode prestar serviços a outros tomadores, plataformas, seguradoras, ` +
    `empresas ou clientes particulares, simultaneamente à execução deste contrato, sem necessidade de ` +
    `comunicação prévia à CONTRATANTE, salvo disposição específica de sigilo ou conflito de interesse.\n\n` +
    `§3º JORNADA: A CONTRATANTE NÃO controla, determina, fiscaliza ou impõe horário de trabalho à ` +
    `CONTRATADA ou a seus colaboradores. Os horários acordados (ex.: atendimento 24h) são condição ` +
    `operacional e contratual do serviço, não controle de jornada nos termos da CLT.`,

    // ─── CLÁUSULA 5 ────────────────────────────────────────────────────────
    `CLÁUSULA 5ª — AUTONOMIA TÉCNICA E OPERACIONAL\n\n` +
    `A CONTRATADA executa os serviços com plena autonomia técnica, organizacional e administrativa, ` +
    `utilizando seus próprios meios, ferramentas, veículos e equipamentos, sem interferência da ` +
    `CONTRATANTE na forma de execução.\n\n` +
    `§1º A CONTRATADA pode recusar ordens de serviço que julgar tecnicamente inadequadas, fora de sua ` +
    `especialidade ou incompatíveis com sua capacidade operacional no momento, sem que isso caracterize ` +
    `descumprimento contratual, salvo reiterada recusa injustificada que comprometa a operação.\n\n` +
    `§2º A CONTRATANTE poderá estabelecer padrões mínimos de qualidade, prazo, documentação, fotografias, ` +
    `checklists, assinatura digital, rastreabilidade, cordialidade no atendimento e prestação de contas às ` +
    `seguradoras e plataformas parceiras. Tais exigências têm finalidade estritamente operacional, ` +
    `documental e de auditoria, NÃO caracterizando subordinação trabalhista, controle de jornada ou ` +
    `vínculo empregatício, nos termos da jurisprudência consolidada do C. TST sobre trabalho por plataforma.`,

    // ─── CLÁUSULA 6 ────────────────────────────────────────────────────────
    `CLÁUSULA 6ª — RESPONSABILIDADE FISCAL, TRIBUTÁRIA E PREVIDENCIÁRIA\n\n` +
    `A CONTRATADA é exclusivamente responsável pelo cumprimento de todas as obrigações fiscais, ` +
    `tributárias, previdenciárias e trabalhistas decorrentes de sua atividade e de seus colaboradores, incluindo:\n\n` +
    `(a) Manutenção do CNPJ ativo e regular junto à Receita Federal;\n` +
    `(b) Recolhimento de ISS, PIS, COFINS, IRPJ, CSLL e demais tributos incidentes;\n` +
    `(c) Emissão de Nota Fiscal válida para cada competência, com tributação adequada ao CNAE;\n` +
    `(d) Recolhimento do INSS (contribuição empresarial e de segurados), FGTS e encargos trabalhistas ` +
    `dos colaboradores que forem empregados;\n` +
    `(e) Manutenção de CNAE compatível com os serviços prestados;\n` +
    `(f) Cumprimento de obrigações acessórias (declarações, certidões, regularidade fiscal).\n\n` +
    `Parágrafo único: Em caso de autuação fiscal, trabalhista ou previdenciária direcionada à ` +
    `CONTRATANTE em decorrência de irregularidade da CONTRATADA, esta responderá regressivamente ` +
    `por todos os valores, multas e honorários incorridos.`,

    // ─── CLÁUSULA 7 ────────────────────────────────────────────────────────
    `CLÁUSULA 7ª — OBRIGAÇÕES OPERACIONAIS E USO DA PLATAFORMA\n\n` +
    `A CONTRATADA se compromete a:\n\n` +
    `(a) Utilizar a PLATAFORMA (sistema web, aplicativo, chat) conforme orientações da CONTRATANTE;\n` +
    `(b) Registrar no sistema os dados de atendimento (fotos, checklist, assinatura digital do cliente, ` +
    `geolocalização) quando exigido pela operação, seguradora ou plataforma parceira;\n` +
    `(c) Manter atualizado o cadastro empresarial, CNPJ, dados bancários e informações do técnico responsável;\n` +
    `(d) Emitir e enviar a Nota Fiscal no prazo estabelecido em cada competência;\n` +
    `(e) Comunicar imediatamente a CONTRATANTE sobre irregularidade fiscal, suspensão do CNPJ, ` +
    `incidente operacional ou impedimento para execução de serviços;\n` +
    `(f) Responder a comunicados, solicitações de auditoria e pedidos de esclarecimento em prazo razoável.`,

    // ─── CLÁUSULA 8 ────────────────────────────────────────────────────────
    `CLÁUSULA 8ª — TÉCNICO EXECUTOR — RESPONSABILIDADE DA CONTRATADA\n\n` +
    `Quando o serviço for executado por sócio, empregado, representante, ajudante, preposto, parceiro ` +
    `ou técnico indicado pela CONTRATADA, este atuará por inteira conta e responsabilidade da empresa ` +
    `CONTRATADA. A ILHA BELLA não mantém, não assume e não reconhece qualquer vínculo direto ` +
    `(empregatício, comercial, contratual ou de outra natureza) com o técnico executor indicado pela CONTRATADA.\n\n` +
    `§1º A CONTRATADA responde integralmente por acidentes de trabalho, danos a terceiros, ` +
    `reclamações trabalhistas, previdenciárias, fiscais ou cíveis que envolvam qualquer de seus colaboradores.\n\n` +
    `§2º A utilização de terceiros não vinculados à empresa CONTRATADA (como "freelancers" ou " ` +
    `parceiros informais") para execução dos serviços objeto deste contrato requer autorização prévia e ` +
    `expressa da CONTRATANTE, sob pena de rescisão imediata e responsabilização por eventuais danos.`,

    // ─── CLÁUSULA 9 ────────────────────────────────────────────────────────
    `CLÁUSULA 9ª — SERVIÇOS PARTICULARES CONTRATADOS DIRETAMENTE PELO CLIENTE\n\n` +
    `Serviços particulares contratados diretamente pelo cliente ou segurado, fora do escopo da ` +
    `assistência, garantia ou cobertura securitária repassada pela ILHA BELLA, são de responsabilidade ` +
    `exclusiva do cliente e do prestador contratado.\n\n` +
    `§1º A ILHA BELLA poderá, a pedido do cliente, apenas indicar profissional habilitado ou informar ` +
    `a ausência de cobertura, sem assumir qualquer responsabilidade por orçamento, execução, ` +
    `cobrança, garantia, qualidade ou dano do serviço particular.\n\n` +
    `§2º A CONTRATADA NÃO pode utilizar o relacionamento com a ILHA BELLA, a confiança do cliente ` +
    `ou o acesso às dependências do imóvel como oportunidade para prospectar, vender ou executar ` +
    `serviços particulares sem transparência e sem comunicação prévia à CONTRATANTE.`,

    // ─── CLÁUSULA 10 ───────────────────────────────────────────────────────
    `CLÁUSULA 10ª — RESPONSABILIDADE POR DANOS, RETRABALHO E GARANTIA\n\n` +
    `A CONTRATADA responde civil e contratualmente por:\n\n` +
    `(a) Danos materiais, pessoais ou morais causados ao cliente, a terceiros ou ao imóvel durante ` +
    `a execução dos serviços ou em decorrência deles;\n` +
    `(b) Vícios de execução, falhas técnicas, não conformidades ou retrabalho necessário;\n` +
    `(c) Reclamações de clientes, seguradoras ou plataformas relacionadas à qualidade do serviço;\n` +
    `(d) Furto, extravio ou dano a bens do cliente durante o atendimento.\n\n` +
    `§1º A CONTRATANTE poderá reter ou bloquear o pagamento correspondente ao serviço enquanto ` +
    `houver reclamação pendente, dano não reparado ou irregularidade comprovada, sem que isso ` +
    `caracterize inadimplemento contratual.\n\n` +
    `§2º A CONTRATADA autoriza expressamente a retenção de valores para cobrir prejuízos ` +
    `devidamente comprovados, após notificação e prazo razoável para manifestação.`,

    // ─── CLÁUSULA 11 ───────────────────────────────────────────────────────
    `CLÁUSULA 11ª — CONDIÇÕES DE PAGAMENTO\n\n` +
    `Os serviços executados e aceitos pela CONTRATANTE serão remunerados conforme tabela de valores ` +
    `acordada, paga mensalmente mediante apresentação de Nota Fiscal válida, ` +
    `dentro do prazo estipulado em cada fechamento mensal.\n\n` +
    `§1º O pagamento será realizado exclusivamente via PIX para a chave cadastrada no perfil da ` +
    `CONTRATADA, vinculada ao CNPJ ou ao representante legal autorizado.\n\n` +
    `§2º O pagamento fica condicionado: (a) à regularidade fiscal do CNPJ; ` +
    `(b) à apresentação de NF válida dentro do prazo; (c) à ausência de pendências ou reclamações ` +
    `não resolvidas; (d) à assinatura eletrônica do Termo Mensal de Fechamento.\n\n` +
    `§3º Antecipações de pagamento poderão ser solicitadas pela CONTRATADA e estão sujeitas ` +
    `à aprovação da CONTRATANTE, com desconto de taxa administrativa acordada.`,

    // ─── CLÁUSULA 12 ───────────────────────────────────────────────────────
    `CLÁUSULA 12ª — CONFIDENCIALIDADE E PROTEÇÃO DE DADOS\n\n` +
    `As partes se comprometem a manter sigilo sobre informações confidenciais obtidas em razão ` +
    `deste contrato, incluindo dados de clientes, seguradoras, parceiros, tabelas de valores, ` +
    `condições contratuais e estratégias operacionais.\n\n` +
    `§1º Os dados pessoais de clientes acessados pela CONTRATADA durante a execução dos serviços ` +
    `são de titularidade do cliente e somente devem ser utilizados para fins de execução do serviço ` +
    `contratado, nos termos da Lei nº 13.709/2018 (LGPD).\n\n` +
    `§2º É vedado à CONTRATADA, seus sócios, colaboradores e prepostos utilizar dados de clientes ` +
    `para fins de prospecção comercial própria, compartilhamento com terceiros ou qualquer ` +
    `finalidade diversa da execução do serviço.`,

    // ─── CLÁUSULA 13 ───────────────────────────────────────────────────────
    `CLÁUSULA 13ª — NÃO-ALICIAMENTO\n\n` +
    `Durante a vigência deste contrato e pelo prazo de 24 (vinte e quatro) meses após o seu ` +
    `encerramento, a CONTRATADA se compromete a NÃO:\n\n` +
    `(a) Contatar diretamente clientes atendidos por indicação da ILHA BELLA para oferta de serviços ` +
    `concorrentes ou particulares, sem intermediação da CONTRATANTE;\n` +
    `(b) Induzir clientes, seguradoras ou parceiros da ILHA BELLA a contratar serviços de forma ` +
    `direta, suprimindo a CONTRATANTE da relação comercial;\n` +
    `(c) Aliciar colaboradores, técnicos ou parceiros da CONTRATANTE a descontinuar suas atividades ` +
    `com a ILHA BELLA.\n\n` +
    `Parágrafo único: O descumprimento desta cláusula sujeita a CONTRATADA ao pagamento de multa ` +
    `compensatória equivalente a 20% (vinte por cento) do faturamento total obtido pela relação ` +
    `aliciada, sem prejuízo de perdas e danos apurados.`,

    // ─── CLÁUSULA 14 ───────────────────────────────────────────────────────
    `CLÁUSULA 14ª — AUDITORIA E TRANSPARÊNCIA\n\n` +
    `A CONTRATANTE reserva-se o direito de auditar, a qualquer tempo, a regularidade fiscal da ` +
    `CONTRATADA, a autenticidade das Notas Fiscais, a conformidade das ordens de serviço executadas ` +
    `e o cumprimento das obrigações contratuais.\n\n` +
    `§1º A CONTRATADA se compromete a fornecer, no prazo de até 5 (cinco) dias úteis a partir da ` +
    `solicitação: certidões de regularidade fiscal, cópia de contratos trabalhistas de colaboradores ` +
    `envolvidos na operação, documentos de habilitação técnica e quaisquer outras informações ` +
    `necessárias à auditoria.\n\n` +
    `§2º Todos os dados de execução registrados na PLATAFORMA (fotos, checklists, geolocalização, ` +
    `assinaturas digitais, logs de acesso) constituem evidências auditáveis e são propriedade da ` +
    `CONTRATANTE para fins de gestão operacional, defesa em disputas e prestação de contas a parceiros.`,

    // ─── CLÁUSULA 15 ───────────────────────────────────────────────────────
    `CLÁUSULA 15ª — VIGÊNCIA E RESCISÃO\n\n` +
    `Este contrato tem vigência indeterminada a partir da data de assinatura eletrônica, podendo ` +
    `ser rescindido por qualquer das partes mediante notificação prévia de 30 (trinta) dias.\n\n` +
    `§1º A rescisão imediata (sem aviso prévio) é cabível nas seguintes hipóteses:\n` +
    `(a) Descumprimento grave de qualquer cláusula deste instrumento;\n` +
    `(b) Fraude, adulteração de documentos ou desvio de clientes;\n` +
    `(c) Irregularidade fiscal, cassação ou baixa do CNPJ da CONTRATADA;\n` +
    `(d) Dano doloso a cliente, parceiro ou à reputação da CONTRATANTE;\n` +
    `(e) Recusa reiterada e injustificada de execução de serviços;\n` +
    `(f) Utilização de técnicos não autorizados sem prévia comunicação.\n\n` +
    `§2º A rescisão não exime qualquer das partes de obrigações financeiras pendentes, ` +
    `responsabilidades por danos já ocorridos ou cumprimento de cláusulas de sigilo e não-aliciamento.`,

    // ─── CLÁUSULA 16 ───────────────────────────────────────────────────────
    `CLÁUSULA 16ª — MULTAS E PENALIDADES\n\n` +
    `Pelo descumprimento das obrigações contratuais, ficam estabelecidas as seguintes penalidades:\n\n` +
    `(a) Atraso na entrega da Nota Fiscal: bloqueio do pagamento até regularização;\n` +
    `(b) CNPJ irregular ou baixado durante a execução: suspensão imediata e bloqueio de pagamentos ` +
    `até regularização comprovada;\n` +
    `(c) Falha grave de execução com dano comprovado: retenção proporcional ao dano, após notificação;\n` +
    `(d) Aliciamento de clientes ou parceiros: multa equivalente a 20% do faturamento aliciado;\n` +
    `(e) Rescisão antecipada sem aviso prévio pela CONTRATADA: multa equivalente a 1 (um) mês de ` +
    `faturamento médio dos últimos 3 (três) meses;\n` +
    `(f) Utilização indevida de dados de clientes (LGPD): responsabilidade civil integral.`,

    // ─── CLÁUSULA 17 ───────────────────────────────────────────────────────
    `CLÁUSULA 17ª — ASSINATURA ELETRÔNICA E VALIDADE JURÍDICA\n\n` +
    `A confirmação eletrônica deste instrumento, mediante identificação da CONTRATADA por ` +
    `razão social, CNPJ, nome e CPF do representante legal, e-mail, telefone, ` +
    `endereço IP e timestamp registrados no sistema, possui plena validade jurídica e probatória ` +
    `nos termos da Lei nº 14.063/2020 (Assinatura Eletrônica) e Medida Provisória nº 2.200-2/2001 ` +
    `(ICP-Brasil), equiparando-se à assinatura manuscrita para todos os fins legais e contratuais.\n\n` +
    `Identificação da assinatura:\n` +
    `• Versão do contrato: ${p.contractVersion}\n` +
    `• ID do documento: ${p.documentId}\n` +
    `• Data/hora: ${p.signedAt}\n` +
    `• IP de assinatura: ${p.ip}\n` +
    `• Hash SHA-256: ${p.documentHash}`,

    // ─── CLÁUSULA 18 ───────────────────────────────────────────────────────
    `CLÁUSULA 18ª — VERSIONAMENTO CONTRATUAL\n\n` +
    `Este contrato poderá ser atualizado pela CONTRATANTE mediante emissão de nova versão, ` +
    `com comunicação prévia de 15 (quinze) dias à CONTRATADA.\n\n` +
    `A nova versão exigirá nova assinatura eletrônica da CONTRATADA antes do próximo acesso ` +
    `operacional à PLATAFORMA. A recusa de assinar nova versão equivale à rescisão voluntária ` +
    `do contrato pela CONTRATADA, aplicando-se as regras de rescisão sem justa causa.`,

    // ─── CLÁUSULA 19 ───────────────────────────────────────────────────────
    `CLÁUSULA 19ª — FORO\n\n` +
    `Fica eleito o Foro da ${CONTRATANTE.foro} para dirimir quaisquer dúvidas, divergências ou ` +
    `litígios decorrentes do presente instrumento, com expressa renúncia das partes a qualquer ` +
    `outro foro, por mais privilegiado que seja.\n\n` +
    `As partes concordam ainda em tentar resolver eventuais divergências preferencialmente por meio ` +
    `de comunicação direta ou mediação antes de recorrer ao Poder Judiciário.`,
  ]
}

// ─────────────────────────────────────────────────────────────────────────────
// Função geradora do snapshot completo
// ─────────────────────────────────────────────────────────────────────────────

export function generateContratoMae(p: ContratoMaeParams): ContratoMaeResult {
  return {
    version:    p.contractVersion,
    documentId: p.documentId,
    signedAt:   p.signedAt,
    contratante: CONTRATANTE,
    contratado:  p,
    clausulas:   getClausulasContratoMaeV1(p),
    audit: {
      ip:          p.ip,
      hash:        p.documentHash,
      timestamp:   p.signedAt,
      dataLegivel: new Date(p.signedAt).toLocaleString('pt-BR'),
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Texto de aceite (exibido no botão/checkbox)
// ─────────────────────────────────────────────────────────────────────────────

export const TEXTO_ACEITE_CONTRATO_MAE =
  `Declaro que li, compreendi e aceito integralmente o Contrato-Mãe de Prestação de Serviços ` +
  `entre Pessoas Jurídicas, confirmando que os dados informados são verdadeiros e que a empresa ` +
  `atua de forma autônoma, empresarial, sem vínculo empregatício, sem exclusividade, sem controle ` +
  `de jornada e por conta e risco da empresa contratada.`

export const TEXTO_ACEITE_TECNICO_RESPONSAVEL =
  `Declaro que o técnico responsável informado está autorizado a executar serviços em nome da ` +
  `empresa contratada, sendo a empresa integralmente responsável pela conduta, execução técnica, ` +
  `documentação, atendimento, danos, garantias e obrigações relacionadas aos serviços prestados.`

// ─────────────────────────────────────────────────────────────────────────────
// Termo de Compromisso — Prestador Autônomo (sem CNPJ)
// ─────────────────────────────────────────────────────────────────────────────

export const CURRENT_TERMO_AUTONOMO_VERSION = 'termo_autonomo_v1'

export interface TermoAutonomoParams {
  nomeCompleto:    string
  cpf:             string
  telefone:        string
  email:           string
  cidade:          string
  especialidade:   string
  signedAt:        string
  ip:              string
  documentId:      string
  documentHash:    string
  contractVersion: string
}

export interface TermoAutonomoResult {
  version:    string
  documentId: string
  signedAt:   string
  contratante: typeof CONTRATANTE
  autonomo:    TermoAutonomoParams
  clausulas:   string[]
  audit: {
    ip:          string
    hash:        string
    timestamp:   string
    dataLegivel: string
  }
}

export function getClausulasTermoAutonomoV1(p: TermoAutonomoParams): string[] {
  return [
    `CLÁUSULA 1ª — QUALIFICAÇÃO DAS PARTES\n\n` +
    `CONTRATANTE: ${CONTRATANTE.razaoSocial}, inscrita no CNPJ sob o nº ${CONTRATANTE.cnpj}, ` +
    `com sede em ${CONTRATANTE.endereco}, neste ato representada por ${CONTRATANTE.representanteLegal}, ` +
    `doravante denominada ILHA BELLA.\n\n` +
    `PRESTADOR AUTÔNOMO: ${p.nomeCompleto}, CPF nº ${p.cpf}, ` +
    `telefone ${p.telefone}, e-mail ${p.email}, município de ${p.cidade}, ` +
    `especialidade: ${p.especialidade}, doravante denominado simplesmente PRESTADOR.`,

    `CLÁUSULA 2ª — OBJETO\n\n` +
    `O presente Termo tem por objeto a prestação de serviços técnicos autônomos de assistência ` +
    `residencial e empresarial, incluindo, sem limitação: instalações e reparos elétricos, ` +
    `hidráulicos, desentupimento, chaveiro, limpeza de calhas e serviços correlatos, conforme ` +
    `demanda operacional da ILHA BELLA, repassada por meio de plataforma digital (PLATAFORMA).\n\n` +
    `Parágrafo único: O PRESTADOR executará os serviços de forma autônoma, com seus próprios ` +
    `equipamentos e ferramentas, sendo integralmente responsável pela qualidade e prazo de cada atendimento.`,

    `CLÁUSULA 3ª — NATUREZA JURÍDICA DA RELAÇÃO\n\n` +
    `A relação entre as partes é de prestação autônoma de serviços, não constituindo vínculo ` +
    `empregatício, societário ou de qualquer outra natureza além da contratual.\n\n` +
    `O PRESTADOR atua por conta própria, sem exclusividade, sem controle de jornada, sem subordinação ` +
    `contínua e com plena liberdade de aceitar ou recusar ordens de serviço, assumindo os riscos ` +
    `inerentes à atividade autônoma, incluindo recolhimento de tributos e contribuições pertinentes.`,

    `CLÁUSULA 4ª — OBRIGAÇÕES DO PRESTADOR\n\n` +
    `O PRESTADOR se compromete a:\n\n` +
    `(a) Executar os serviços com qualidade técnica e dentro dos prazos acordados;\n` +
    `(b) Apresentar-se ao cliente de forma profissional, identificado e com equipamentos adequados;\n` +
    `(c) Comunicar à ILHA BELLA qualquer impedimento, intercorrência ou dificuldade técnica;\n` +
    `(d) Não cobrar valores adicionais do cliente sem autorização prévia da ILHA BELLA;\n` +
    `(e) Manter sigilo sobre informações dos clientes, endereços e dados da PLATAFORMA;\n` +
    `(f) Responder por danos causados ao cliente ou ao imóvel durante os atendimentos;\n` +
    `(g) Guardar os comprovantes e registros fotográficos de cada serviço por no mínimo 90 dias.`,

    `CLÁUSULA 5ª — CONDIÇÕES DE PAGAMENTO\n\n` +
    `Os serviços aceitos serão remunerados conforme tabela de valores acordada, pagos mensalmente ` +
    `mediante assinatura eletrônica do Termo Mensal de Fechamento gerado pela PLATAFORMA.\n\n` +
    `§1º O pagamento será realizado exclusivamente via PIX para a chave cadastrada no perfil do PRESTADOR.\n\n` +
    `§2º Fica condicionado o pagamento: (a) à ausência de pendências ou reclamações não resolvidas; ` +
    `(b) à assinatura do Termo Mensal de Fechamento; (c) à regularidade cadastral do PRESTADOR na PLATAFORMA.\n\n` +
    `§3º Antecipações poderão ser solicitadas e estão sujeitas à aprovação da ILHA BELLA, ` +
    `com desconto de taxa administrativa acordada.`,

    `CLÁUSULA 6ª — RESPONSABILIDADE POR DANOS E GARANTIA\n\n` +
    `O PRESTADOR responde civil e contratualmente por danos materiais, pessoais ou morais causados ` +
    `ao cliente, a terceiros ou ao imóvel durante ou em decorrência dos serviços prestados.\n\n` +
    `§1º A ILHA BELLA poderá reter ou bloquear o pagamento correspondente enquanto houver ` +
    `reclamação pendente ou irregularidade comprovada.\n\n` +
    `§2º O PRESTADOR autoriza a retenção de valores para cobrir prejuízos devidamente comprovados, ` +
    `após notificação e prazo razoável para manifestação.`,

    `CLÁUSULA 7ª — RESCISÃO\n\n` +
    `Este Termo poderá ser rescindido a qualquer momento, por qualquer das partes, ` +
    `mediante comunicação prévia de 15 (quinze) dias.\n\n` +
    `A rescisão imediata poderá ocorrer em caso de: (a) descumprimento de obrigações contratuais; ` +
    `(b) danos não reparados; (c) conduta inadequada com clientes; (d) uso indevido dos dados ` +
    `da PLATAFORMA ou dos clientes.`,

    `CLÁUSULA 8ª — DISPOSIÇÕES GERAIS E FORO\n\n` +
    `Este Termo poderá ser atualizado pela ILHA BELLA mediante nova versão, com comunicação prévia ` +
    `de 15 dias. A nova versão exigirá nova assinatura eletrônica do PRESTADOR antes do próximo acesso.\n\n` +
    `Fica eleito o Foro da ${CONTRATANTE.foro} para dirimir quaisquer litígios decorrentes ` +
    `deste instrumento, com renúncia a qualquer outro foro.\n\n` +
    `Assinado eletronicamente em ${new Date(p.signedAt).toLocaleString('pt-BR')}, ` +
    `IP: ${p.ip}, Hash SHA-256: ${p.documentHash}.`,
  ]
}

export function generateTermoAutonomo(p: TermoAutonomoParams): TermoAutonomoResult {
  return {
    version:    p.contractVersion,
    documentId: p.documentId,
    signedAt:   p.signedAt,
    contratante: CONTRATANTE,
    autonomo:    p,
    clausulas:   getClausulasTermoAutonomoV1(p),
    audit: {
      ip:          p.ip,
      hash:        p.documentHash,
      timestamp:   p.signedAt,
      dataLegivel: new Date(p.signedAt).toLocaleString('pt-BR'),
    },
  }
}

export const TEXTO_ACEITE_TERMO_AUTONOMO =
  `Declaro que li, compreendi e aceito integralmente este Termo de Compromisso de Prestação de ` +
  `Serviços Autônomos, confirmando que atuo de forma autônoma, sem vínculo empregatício, ` +
  `sem exclusividade, por conta e risco próprio, e que os dados informados são verdadeiros.`
