# Ilha Bella Serviços — Site Institucional

Site institucional da **Ilha Bella Serviços**, desenvolvido em Next.js 14 com App Router, TypeScript e Tailwind CSS.

## Stack

| Tecnologia | Versão | Função |
|---|---|---|
| Next.js | 14.x | Framework principal (SSG/SSR) |
| TypeScript | 5.x | Tipagem estática |
| Tailwind CSS | 3.x | Estilização utilitária |
| Lucide React | 0.400 | Ícones |
| clsx | 2.x | Classes condicionais |

## Estrutura de pastas

```
src/
├── app/                        # App Router (Next.js 14)
│   ├── layout.tsx              # Layout raiz com Header, Footer, WhatsApp
│   ├── globals.css             # Estilos globais + Tailwind
│   ├── page.tsx                # Home
│   ├── quem-somos/page.tsx     # Quem Somos
│   ├── servicos/page.tsx       # Serviços
│   ├── areas-atendidas/page.tsx# Áreas Atendidas
│   ├── seja-parceiro/page.tsx  # Seja Parceiro
│   └── contato/page.tsx        # Contato
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # Navbar responsiva com scroll effect
│   │   ├── Footer.tsx          # Rodapé completo
│   │   └── WhatsAppButton.tsx  # Botão flutuante WhatsApp
│   ├── home/
│   │   ├── Hero.tsx            # Seção principal da home
│   │   ├── ServicesPreview.tsx # Preview dos serviços
│   │   ├── Differentials.tsx   # Diferenciais da empresa
│   │   ├── Stats.tsx           # Números e estatísticas
│   │   └── CTA.tsx             # Call-to-Action (usado em todas as páginas)
│   └── ui/
│       ├── Button.tsx          # Componente de botão reutilizável
│       ├── SectionTitle.tsx    # Título de seção padronizado
│       └── ServiceCard.tsx     # Card de serviço com CTA WhatsApp
│
└── lib/
    ├── constants.ts            # Dados da empresa, serviços, diferenciais
    └── whatsapp.ts             # Utilitário para links WhatsApp

public/
├── logo.png                    # ← VOCÊ PRECISA COLOCAR AQUI
├── og-image.jpg                # ← Imagem OG para redes sociais (1200x630px)
└── favicon.ico                 # ← Gere em favicon.io
```

## Pré-requisitos

- **Node.js** 18.17 ou superior → [nodejs.org](https://nodejs.org)
- **npm** ou **pnpm** (recomendado)
- **Git**

Verificação:
```bash
node -v   # deve mostrar v18.17+
git -v
```

## Instalação e execução local

```bash
# 1. Entre na pasta do projeto
cd site_ilhabella

# 2. Instale as dependências
npm install
# ou, com pnpm (mais rápido):
pnpm install

# 3. Rode o servidor de desenvolvimento
npm run dev
# ou:
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Build para produção

```bash
# Gerar build de produção otimizado
npm run build

# Rodar o build localmente (para testar)
npm run start
```

## Configurações obrigatórias antes do deploy

### 1. Número do WhatsApp

Abra `src/lib/constants.ts` e atualize:

```ts
whatsapp: '5548999999999', // ← coloque o número real (somente dígitos, com DDI 55)
```

Exemplo para o número (48) 99876-5432:
```ts
whatsapp: '5548998765432',
```

### 2. Logo e favicon

- Copie o arquivo `logo.png` para a pasta `/public`
- Gere o favicon em [favicon.io](https://favicon.io/favicon-converter/) e coloque na pasta `/public`
- Crie uma imagem OG (1200×630px) em `/public/og-image.jpg` para compartilhamento em redes sociais

### 3. Verificar metadados SEO

Revise `src/lib/constants.ts`:
- `siteUrl` deve ser a URL real do domínio
- `description` é usada como meta description padrão

## Deploy na Vercel (recomendado)

### Opção A — Via GitHub (recomendado)

1. Suba o projeto para um repositório GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: projeto inicial Ilha Bella Serviços"
   git branch -M main
   git remote add origin https://github.com/seu-usuario/ilha-bella-servicos.git
   git push -u origin main
   ```

2. Acesse [vercel.com](https://vercel.com) → "Add New Project"
3. Selecione o repositório
4. Clique em "Deploy" — a Vercel detecta Next.js automaticamente

### Opção B — Via CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Domínio personalizado

1. No dashboard da Vercel → Settings → Domains
2. Adicione `ilhabellaservicos.com.br` e `www.ilhabellaservicos.com.br`
3. Configure os registros DNS conforme instruído pela Vercel

## Variáveis de ambiente

O projeto não usa variáveis de ambiente por padrão. Caso precise adicionar no futuro:

```bash
# .env.local (nunca commitar)
NEXT_PUBLIC_WHATSAPP_NUMBER=5548999999999
```

## Scripts disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (porta 3000) |
| `npm run build` | Build de produção |
| `npm run start` | Serve o build de produção localmente |
| `npm run lint` | Verifica erros de linting |

## Personalização

### Adicionar/editar serviços

Edite o array `SERVICES` em `src/lib/constants.ts`.

### Mudar cores

As cores da marca estão definidas em `tailwind.config.ts`:
```ts
brand: {
  blue: '#1A7DC1',       // azul principal
  gold: '#C4992A',       // dourado principal
  ...
}
```

### Adicionar páginas

1. Crie uma pasta em `src/app/nova-pagina/`
2. Crie o arquivo `page.tsx` dentro dela
3. Adicione o link em `src/lib/constants.ts` → `NAV_LINKS`

## Manutenção

- **Dados da empresa**: `src/lib/constants.ts`
- **Serviços**: `src/lib/constants.ts` → `SERVICES`
- **Cidades atendidas**: `src/app/areas-atendidas/page.tsx`
- **Tipos de parceria**: `src/app/seja-parceiro/page.tsx`

---

Desenvolvido com Next.js 14 · Tailwind CSS · TypeScript
