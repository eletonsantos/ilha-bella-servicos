/**
 * Conteúdo padrão dos templates de contratos (seed inicial).
 * Usa tags {{VARIAVEL}} substituídas na geração de cada contrato.
 *
 * Variáveis disponíveis — Contrato-Mãe:
 *   {{CONTRATADO_RAZAO_SOCIAL}}   {{CONTRATADO_CNPJ}}
 *   {{CONTRATADO_SITUACAO}}       {{CONTRATADO_CNAE}}
 *   {{CONTRATADO_ENDERECO}}       {{CONTRATADO_REP_NOME}}
 *   {{CONTRATADO_REP_CPF}}        {{TECNICO_NOME}}
 *   {{TECNICO_CPF}}               {{TECNICO_TELEFONE}}
 *   {{TECNICO_EMAIL}}             {{TECNICO_ESPECIALIDADE}}
 *   {{DATA_ASSINATURA}}           {{IP_ASSINATURA}}
 *   {{HASH_SHA256}}               {{VERSAO_CONTRATO}}
 *   {{ID_DOCUMENTO}}
 *
 * Variáveis disponíveis — Termo de Fechamento:
 *   {{TECH_NOME}}                 {{TECH_CNPJ_CPF}}
 *   {{COMPETENCIA}}               {{PERIODO_INICIO}}
 *   {{PERIODO_FIM}}               {{VALOR_TOTAL}}
 *   {{PIX_TIPO}}                  {{PIX_CHAVE}}
 *   {{DATA_ASSINATURA}}           {{IP_ASSINATURA}}
 */

// ─── Contrato-Mãe padrão ─────────────────────────────────────────────────────

export const DEFAULT_CONTRATO_MAE = `CONTRATO-MÃE DE PRESTAÇÃO DE SERVIÇOS TÉCNICOS
ENTRE PESSOAS JURÍDICAS

CLÁUSULA 1ª — QUALIFICAÇÃO DAS PARTES

CONTRATANTE: ILHA BELLA SERVICOS & ASSISTENCIA 24 HORAS LTDA, inscrita no CNPJ sob o nº 28.864.149/0001-38, com sede em Praça Nereu Ramos, nº 90, Sala do Empreendedor, Centro, Biguaçu/SC — CEP 88160-116, neste ato representada por seu sócio/administrador Eleton Cristofe dos Santos, doravante denominada simplesmente CONTRATANTE ou ILHA BELLA.

CONTRATADA: {{CONTRATADO_RAZAO_SOCIAL}}, inscrita no CNPJ sob o nº {{CONTRATADO_CNPJ}}, situação cadastral {{CONTRATADO_SITUACAO}}, CNAE principal: {{CONTRATADO_CNAE}}, com endereço em {{CONTRATADO_ENDERECO}}, neste ato representada por {{CONTRATADO_REP_NOME}}, CPF {{CONTRATADO_REP_CPF}}, doravante denominada simplesmente CONTRATADA.

TÉCNICO RESPONSÁVEL INDICADO: {{TECNICO_NOME}}, CPF {{TECNICO_CPF}}, telefone {{TECNICO_TELEFONE}}, e-mail {{TECNICO_EMAIL}}, especialidade: {{TECNICO_ESPECIALIDADE}}.

---

CLÁUSULA 2ª — OBJETO

O presente Contrato tem por objeto a prestação de serviços técnicos especializados de assistência residencial e empresarial, incluindo, sem limitação: instalações e reparos elétricos, hidráulicos, desentupimento, serviços de chaveiro, limpeza de calhas, caixa d'água, caixa de gordura e serviços correlatos, conforme demanda operacional da CONTRATANTE, repassada por meio de plataforma digital (sistema web, aplicativo móvel ou outro canal eletrônico), doravante designada PLATAFORMA.

Parágrafo único: A CONTRATADA executará os serviços por meio de seus próprios colaboradores, sócios, prepostos, representantes ou técnicos vinculados à empresa, sendo integralmente responsável pela qualidade, prazo, documentação e demais obrigações decorrentes da execução.

---

CLÁUSULA 3ª — NATUREZA EMPRESARIAL E AUSÊNCIA DE VÍNCULO EMPREGATÍCIO

O presente instrumento regula relação comercial de natureza estritamente empresarial entre pessoas jurídicas, não gerando qualquer vínculo empregatício, societário, previdenciário ou de subordinação entre as partes, seus sócios, representantes, empregados, prepostos ou técnicos.

§1º A CONTRATADA é empresa autônoma e independente, que assume integralmente os riscos da sua atividade econômica, não cabendo à CONTRATANTE qualquer responsabilidade trabalhista, previdenciária, tributária ou civil decorrente da atuação dos colaboradores da CONTRATADA.

§2º A relação entre as partes NÃO configura os elementos caracterizadores do vínculo empregatício previstos no art. 3º da CLT, quais sejam: subordinação jurídica, pessoalidade, não-eventualidade e onerosidade direta ao trabalhador individual.

§3º A CONTRATADA declara expressamente que possui estrutura empresarial autônoma, com CNPJ ativo, pessoal próprio e capacidade técnica e organizacional para execução dos serviços objeto deste contrato.

---

CLÁUSULA 4ª — AUSÊNCIA DE PESSOALIDADE, EXCLUSIVIDADE E CONTROLE DE JORNADA

§1º PESSOALIDADE: A CONTRATADA pode executar os serviços por meio de qualquer colaborador, sócio, preposto, representante ou técnico vinculado à sua empresa, desde que habilitado.

§2º EXCLUSIVIDADE: A CONTRATADA pode prestar serviços a outros tomadores, plataformas, seguradoras, empresas ou clientes particulares, simultaneamente à execução deste contrato.

§3º JORNADA: A CONTRATANTE NÃO controla, determina, fiscaliza ou impõe horário de trabalho à CONTRATADA ou a seus colaboradores.

---

CLÁUSULA 5ª — AUTONOMIA TÉCNICA E OPERACIONAL

A CONTRATADA executa os serviços com plena autonomia técnica, organizacional e administrativa, utilizando seus próprios meios, ferramentas, veículos e equipamentos, sem interferência da CONTRATANTE na forma de execução.

§1º A CONTRATADA pode recusar ordens de serviço que julgar tecnicamente inadequadas, fora de sua especialidade ou incompatíveis com sua capacidade operacional no momento.

§2º A CONTRATANTE poderá estabelecer padrões mínimos de qualidade, prazo, documentação, fotografias, checklists e assinatura digital com finalidade estritamente operacional, documental e de auditoria, NÃO caracterizando subordinação trabalhista.

---

CLÁUSULA 6ª — RESPONSABILIDADE FISCAL, TRIBUTÁRIA E PREVIDENCIÁRIA

A CONTRATADA é exclusivamente responsável pelo cumprimento de todas as obrigações fiscais, tributárias, previdenciárias e trabalhistas decorrentes de sua atividade e de seus colaboradores, incluindo:

(a) Manutenção do CNPJ ativo e regular junto à Receita Federal;
(b) Recolhimento de ISS, PIS, COFINS, IRPJ, CSLL e demais tributos incidentes;
(c) Emissão de Nota Fiscal válida para cada competência, com tributação adequada ao CNAE;
(d) Recolhimento do INSS (contribuição empresarial e de segurados), FGTS e encargos trabalhistas dos colaboradores que forem empregados.

---

CLÁUSULA 7ª — OBRIGAÇÕES OPERACIONAIS E USO DA PLATAFORMA

A CONTRATADA se compromete a: (a) Manter acesso ativo à PLATAFORMA; (b) Aceitar ou recusar ordens de serviço em tempo hábil; (c) Realizar atendimentos com qualidade e cordialidade; (d) Enviar documentação fotográfica e relatórios por OS; (e) Emitir Nota Fiscal até o prazo estipulado; (f) Manter os dados cadastrais atualizados.

---

CLÁUSULA 8ª — TÉCNICO EXECUTOR

A CONTRATADA indica o TÉCNICO RESPONSÁVEL listado na Cláusula 1ª para execução dos serviços. A CONTRATANTE poderá solicitar a indicação de outros técnicos da CONTRATADA em caso de impedimento do principal. A empresa CONTRATADA é integralmente responsável pela conduta, competência técnica, documentação e resultados de todos os seus técnicos e colaboradores.

---

CLÁUSULA 9ª — SERVIÇOS PARTICULARES E PROSPECÇÃO DIRETA

É vedado à CONTRATADA oferecer, intermediar ou executar serviços particulares diretamente para clientes atendidos por intermédio da ILHA BELLA, sem anuência prévia e expressa da CONTRATANTE, durante a vigência deste Contrato e por 24 (vinte e quatro) meses após seu encerramento.

---

CLÁUSULA 10ª — RESPONSABILIDADE POR DANOS

A CONTRATADA é integralmente responsável por danos materiais, morais, físicos ou pessoais causados ao cliente final ou a terceiros durante a execução dos serviços, seja por culpa ou dolo próprio ou de seus colaboradores. A CONTRATANTE poderá ser demandada solidariamente, mas possui direito de regresso integral contra a CONTRATADA.

---

CLÁUSULA 11ª — CONDIÇÕES DE PAGAMENTO

O pagamento será realizado mensalmente, conforme fechamento de competência disponibilizado na PLATAFORMA, mediante apresentação de Nota Fiscal válida pela CONTRATADA, por transferência via PIX. O prazo de pagamento após aprovação da NF é de até 10 (dez) dias úteis, salvo indisponibilidade bancária ou disputa de valores.

---

CLÁUSULA 12ª — CONFIDENCIALIDADE E LGPD

As partes se comprometem a manter sigilo absoluto sobre informações confidenciais trocadas em razão deste contrato, incluindo dados de clientes, tecnologia, metodologias e dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018).

---

CLÁUSULA 13ª — NÃO-ALICIAMENTO

Durante a vigência deste Contrato e por 24 (vinte e quatro) meses após seu encerramento, a CONTRATADA se compromete a não aliciar, contratar ou manter relação comercial direta com clientes finais da ILHA BELLA para serviços de assistência técnica domiciliar/empresarial, salvo autorização expressa.

---

CLÁUSULA 14ª — AUDITORIA

A CONTRATANTE reserva-se o direito de auditar, a qualquer tempo, os documentos, relatórios, notas fiscais, CNPJ e capacidade técnica da CONTRATADA, mediante comunicação prévia de 48 horas. A CONTRATADA se compromete a fornecer todas as informações solicitadas.

---

CLÁUSULA 15ª — VIGÊNCIA E RESCISÃO

Este Contrato tem vigência por prazo indeterminado, a partir da data de assinatura. Qualquer das partes poderá rescindir mediante notificação escrita com antecedência mínima de 30 (trinta) dias. A rescisão por justa causa (fraude, dano doloso, violação grave) é imediata e sem aviso prévio.

---

CLÁUSULA 16ª — MULTAS E PENALIDADES

O descumprimento das obrigações deste Contrato sujeitará a parte infratora ao pagamento de multa de 20% (vinte por cento) sobre o valor do último fechamento mensal, além de perdas e danos. A multa não exclui a responsabilidade por indenização complementar.

---

CLÁUSULA 17ª — ASSINATURA ELETRÔNICA

Esta assinatura digital foi realizada eletronicamente e possui plena validade jurídica nos termos da Medida Provisória 2.200-2/2001 e Lei 14.063/2020 (ICP-Brasil).

Identificação da assinatura:
• Versão do contrato: {{VERSAO_CONTRATO}}
• ID do documento: {{ID_DOCUMENTO}}
• Data/hora: {{DATA_ASSINATURA}}
• IP de assinatura: {{IP_ASSINATURA}}
• Hash SHA-256: {{HASH_SHA256}}

---

CLÁUSULA 18ª — VERSIONAMENTO CONTRATUAL

Este contrato poderá ser atualizado pela CONTRATANTE mediante emissão de nova versão, com comunicação prévia de 15 (quinze) dias à CONTRATADA. A nova versão exigirá nova assinatura eletrônica da CONTRATADA antes do próximo acesso operacional à PLATAFORMA.

---

CLÁUSULA 19ª — FORO

Fica eleito o Foro da Comarca de Biguaçu/SC para dirimir quaisquer dúvidas, divergências ou litígios decorrentes do presente instrumento, com expressa renúncia das partes a qualquer outro foro, por mais privilegiado que seja.`

// ─── Variáveis do Contrato-Mãe ───────────────────────────────────────────────

export const VARS_CONTRATO_MAE = [
  { tag: '{{CONTRATADO_RAZAO_SOCIAL}}', desc: 'Razão social da empresa contratada' },
  { tag: '{{CONTRATADO_CNPJ}}',         desc: 'CNPJ da empresa contratada' },
  { tag: '{{CONTRATADO_SITUACAO}}',     desc: 'Situação cadastral do CNPJ (ex: ATIVA)' },
  { tag: '{{CONTRATADO_CNAE}}',         desc: 'CNAE principal da empresa' },
  { tag: '{{CONTRATADO_ENDERECO}}',     desc: 'Endereço da empresa contratada' },
  { tag: '{{CONTRATADO_REP_NOME}}',     desc: 'Nome do representante legal' },
  { tag: '{{CONTRATADO_REP_CPF}}',      desc: 'CPF do representante legal' },
  { tag: '{{TECNICO_NOME}}',            desc: 'Nome do técnico responsável indicado' },
  { tag: '{{TECNICO_CPF}}',             desc: 'CPF do técnico responsável' },
  { tag: '{{TECNICO_TELEFONE}}',        desc: 'Telefone do técnico responsável' },
  { tag: '{{TECNICO_EMAIL}}',           desc: 'E-mail do técnico responsável' },
  { tag: '{{TECNICO_ESPECIALIDADE}}',   desc: 'Especialidade do técnico responsável' },
  { tag: '{{VERSAO_CONTRATO}}',         desc: 'Versão do contrato (ex: contrato_mae_v1)' },
  { tag: '{{ID_DOCUMENTO}}',            desc: 'UUID único gerado no momento da assinatura' },
  { tag: '{{DATA_ASSINATURA}}',         desc: 'Data e hora da assinatura eletrônica' },
  { tag: '{{IP_ASSINATURA}}',           desc: 'Endereço IP do signatário' },
  { tag: '{{HASH_SHA256}}',             desc: 'Hash SHA-256 do documento assinado' },
]

// ─── Termo de Fechamento padrão ───────────────────────────────────────────────

export const DEFAULT_TERMO_FECHAMENTO = `TERMO MENSAL DE PRESTAÇÃO DE SERVIÇOS

CONTRATANTE: ILHA BELLA SERVICOS & ASSISTENCIA 24 HORAS LTDA
CNPJ: 28.864.149/0001-38
Representante Legal: Eleton Cristofe dos Santos

CONTRATADA: {{TECH_NOME}}
CNPJ/CPF: {{TECH_CNPJ_CPF}}

---

CLÁUSULA 1ª — OBJETO

O presente termo formaliza a prestação de serviços técnicos especializados realizados pela CONTRATADA no período de {{PERIODO_INICIO}} a {{PERIODO_FIM}}, referente à competência {{COMPETENCIA}}, conforme Ordem(ns) de Serviço registradas na plataforma ILHA BELLA.

---

CLÁUSULA 2ª — VALOR E FORMA DE PAGAMENTO

O valor total devido pelos serviços prestados no período é de {{VALOR_TOTAL}}, a ser pago mediante Pix para a chave {{PIX_TIPO}}: {{PIX_CHAVE}}, em até 10 (dez) dias úteis após a aprovação da Nota Fiscal pelo setor financeiro da CONTRATANTE.

---

CLÁUSULA 3ª — CONFIRMAÇÃO DA EXECUÇÃO

A CONTRATADA declara que todos os serviços listados no relatório de fechamento foram devidamente executados, que os dados informados são verídicos, e que a Nota Fiscal emitida reflete com precisão os serviços prestados.

---

CLÁUSULA 4ª — NATUREZA EMPRESARIAL

O presente Termo é firmado no âmbito do Contrato-Mãe de Prestação de Serviços vigente entre as partes e não gera qualquer vínculo empregatício, previdenciário ou trabalhista entre a CONTRATANTE e a CONTRATADA ou seus colaboradores.

---

CLÁUSULA 5ª — RESPONSABILIDADES

A CONTRATADA mantém integral responsabilidade pela qualidade dos serviços prestados, pela documentação das ordens de serviço, pela emissão de Nota Fiscal válida e pelo recolhimento de todos os tributos incidentes sobre os valores recebidos.

---

CLÁUSULA 6ª — ASSINATURA ELETRÔNICA

Esta assinatura eletrônica possui validade jurídica nos termos da MP 2.200-2/2001 e Lei 14.063/2020.

Assinado em: {{DATA_ASSINATURA}}
IP de assinatura: {{IP_ASSINATURA}}`

// ─── Variáveis do Termo de Fechamento ────────────────────────────────────────

export const VARS_TERMO_FECHAMENTO = [
  { tag: '{{TECH_NOME}}',        desc: 'Nome do técnico / razão social' },
  { tag: '{{TECH_CNPJ_CPF}}',    desc: 'CNPJ ou CPF do técnico' },
  { tag: '{{COMPETENCIA}}',      desc: 'Competência do fechamento (ex: Jan/2026)' },
  { tag: '{{PERIODO_INICIO}}',   desc: 'Data de início do período' },
  { tag: '{{PERIODO_FIM}}',      desc: 'Data de fim do período' },
  { tag: '{{VALOR_TOTAL}}',      desc: 'Valor total do fechamento (R$)' },
  { tag: '{{PIX_TIPO}}',         desc: 'Tipo da chave Pix' },
  { tag: '{{PIX_CHAVE}}',        desc: 'Chave Pix de recebimento' },
  { tag: '{{DATA_ASSINATURA}}',  desc: 'Data e hora da assinatura eletrônica' },
  { tag: '{{IP_ASSINATURA}}',    desc: 'Endereço IP do signatário' },
]
