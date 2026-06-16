# OdontoReport

Sistema inteligente de geração de relatórios endodônticos com autenticação Google, banco de dados PostgreSQL, e suporte multi-usuário. Permite criar, editar, gerar PDFs e importar dados de relatórios existentes de forma simplificada.

## � Descrição

OdontoReport é uma aplicação web completa para dentistas endodontistas que simplifica o processo de criação e gerenciamento de relatórios clínicos. Com interface intuitiva e recursos avançados como importação de PDFs, geração automática de conduta e suporte a imagens, o sistema ajuda profissionais a documentar casos de forma eficiente e profissional.

## �🚀 Tecnologias

- **Next.js 16** com App Router e Turbopack
- **NextAuth.js** com Google OAuth
- **PostgreSQL** via Neon
- **Prisma ORM**
- **TypeScript**
- **Tailwind CSS v4**
- **Puppeteer** para geração de PDF
- **Sharp** para processamento de imagens
- **unpdf** para extração de dados de PDFs

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env.local` baseado no `.env.example`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/odontoreport
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

### 3. Configurar Google OAuth

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API Google+ e Google OAuth 2.0
4. Crie credenciais OAuth 2.0
5. Adicione `http://localhost:3000/api/auth/callback/google` como URI de redirecionamento autorizado
6. Copie o Client ID e Client Secret para o `.env.local`

### 4. Configurar banco de dados

```bash
npx prisma migrate dev --name init
```

### 5. Executar o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Compartilhando via ngrok

Para compartilhar o projeto via ngrok (para testes externos ou demonstração):

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Inicie o ngrok:
   ```bash
   ngrok http 3000
   ```

3. Copie a URL HTTPS do ngrok (ex: `https://abc123.ngrok-free.app`)

4. Atualize o `.env.local`:
   ```env
   NEXTAUTH_URL=https://abc123.ngrok-free.app
   NEXTAUTH_URL_INTERNAL=http://localhost:3000
   ```

5. Adicione a URL de callback do ngrok ao Google OAuth Console:
   - Acesse [Google Cloud Console](https://console.cloud.google.com/)
   - Vá em APIs & Services → Credentials → OAuth 2.0 Client
   - Adicione `https://abc123.ngrok-free.app/api/auth/callback/google` como "Authorized redirect URI"

6. Reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

7. Compartilhe a URL do ngrok — o login funcionará corretamente

**Notas importantes:**
- A URL do ngrok muda toda vez que o ngrok é reiniciado (a menos que use um domínio estático pago). Os passos 3-6 devem ser repetidos a cada vez.
- Nunca commit a URL do ngrok no `.env` — é temporário. Mantenha `.env.local` no `.gitignore`.
- Se usar ngrok com domínio estático (plano paga), a URL é fixa e só precisa ser configurada uma vez.

## Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/    # Configuração NextAuth
│   │   ├── configuracoes/         # API de configurações
│   │   └── relatorio/             # API de relatórios
│   ├── configuracoes/             # Página de configurações
│   ├── dashboard/                 # Dashboard com lista de relatórios
│   ├── login/                     # Página de login
│   ├── relatorio/
│   │   ├── novo/                  # Formulário novo relatório
│   │   └── [id]/                  # Visualização/edição de relatório
│   ├── layout.tsx                 # Layout raiz
│   ├── page.tsx                   # Página inicial (redirect)
│   └── globals.css               # Estilos globais
├── components/
│   ├── Providers.tsx              # SessionProvider
│   ├── ProtectedRoute.tsx        # Middleware de rota protegida
│   └── Sidebar.tsx                # Componente de sidebar
├── lib/
│   ├── auth.ts                    # Configuração NextAuth
│   └── prisma.ts                  # Cliente Prisma
└── types/
    └── next-auth.d.ts             # Tipos NextAuth
```

## Funcionalidades

- ✅ Autenticação com Google OAuth
- ✅ Dashboard com lista de relatórios
- ✅ Formulário completo de relatório endodôntico
- ✅ Odontometria dinâmica com múltiplos canais
- ✅ Upload de imagens com preview
- ✅ Geração manual de conduta com botão "Gerar Preview"
- ✅ Geração de PDF com Puppeteer
- ✅ Importação de dados de PDF existente
- ✅ Configurações personalizáveis (clínica, logo, cores)
- ✅ Suporte multi-usuário com isolamento de dados
- ✅ Aviso de alterações não salvas ao navegar
- ✅ Design responsivo
- ✅ Modais de confirmação para ações críticas

## Rotas

- `/` - Redireciona para login ou dashboard
- `/login` - Página de login com Google
- `/dashboard` - Dashboard com lista de relatórios
- `/configuracoes` - Configurações do usuário
- `/relatorio/novo` - Formulário para novo relatório
- `/relatorio/[id]` - Visualização de relatório existente

## API Routes

- `GET/POST /api/relatorio` - Listar/criar relatórios
- `GET/PUT/DELETE /api/relatorio/[id]` - Operações em relatório específico
- `GET/PUT /api/configuracoes` - Configurações do usuário
- `POST /api/relatorio/gerar-pdf` - Gerar PDF
- `POST /api/relatorio/importar` - Importar dados de PDF
