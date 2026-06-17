# OdontoReport

Sistema completo de geração e gerenciamento de relatórios endodônticos com autenticação Google, multi-usuário, dashboard personalizado e suporte a imagens. Permite criar, editar, gerar PDFs, importar dados e configurar a clínica de forma integrada.

## 📋 Descrição

OdontoReport é uma aplicação web moderna para dentistas que oferece uma solução completa para documentação clínica. Com interface intuitiva, dashboard personalizado, geração de PDFs, importação de relatórios e sistema de configurações, o aplicativo ajuda profissionais a gerenciar casos de forma eficiente, profissional e organizada.

## 🚀 Tecnologias

- **Next.js 16** com App Router e Turbopack
- **NextAuth.js** com Google OAuth
- **PostgreSQL** via Prisma ORM
- **TypeScript**
- **Tailwind CSS v4**
- **Puppeteer** para geração de PDF
- **Sharp** para processamento de imagens
- **unpdf** para extração de dados de PDFs

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── api/              # API Routes (auth, relatórios, configurações)
│   ├── configuracoes/    # Página de configurações da clínica
│   ├── dashboard/        # Dashboard principal
│   ├── login/            # Página de login
│   ├── relatorio/        # Páginas de relatórios
│   └── suporte/          # Página de suporte
├── components/           # Componentes reutilizáveis
├── contexts/             # Contextos (Toast)
├── lib/                  # Utilitários (auth, prisma)
└── types/                # Tipos TypeScript

prisma/                   # Schema e migrations do banco de dados
public/                   # Arquivos estáticos
```

## 🔧 Scripts Disponíveis

```bash
npm run dev         # Inicia servidor de desenvolvimento (http://localhost:3000)
npm run build       # Compila para produção
npm start          # Inicia servidor de produção
npm run lint       # Executa linter ESLint
npm run postinstall # Regenera cliente Prisma (executado automaticamente após npm install)
```

> ⚠️ **Importante:** O script `postinstall` é essencial para CI/CD (Render, Vercel, etc.). Ele regenera o cliente Prisma após `npm install`, evitando erros de tipos TypeScript na build.

## 🌟 Recursos Principais

- ✅ Autenticação Google OAuth
- ✅ Dashboard personalizado com estatísticas
- ✅ Gerenciamento de relatórios (CRUD completo)
- ✅ Geração de PDF com Puppeteer
- ✅ Importação de relatórios via PDF
- ✅ Configurações personalizáveis da clínica
- ✅ Suporte a logotipo, cores e links de redes sociais
- ✅ Odontometria dinâmica com múltiplos canais
- ✅ Upload de imagens com preview
- ✅ Interface responsiva com Tailwind CSS
- ✅ Multi-usuário com autenticação segura
- ✅ Aviso de alterações não salvas
- ✅ Modais de confirmação para ações críticas

## ⚙️ Configuração

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

## 🚀 Deploy em Produção (Render)

1. Conecte seu repositório GitHub ao Render
2. Configure as variáveis de ambiente no Render
3. Configure o comando de build como `npm run build`
4. Configure o comando de start como `npm start`
5. O script `postinstall` executará automaticamente durante `npm install`

## 📡 Compartilhando via ngrok (Testes Externos)

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

**Notas:**
- A URL do ngrok muda quando reiniciado (a menos que use plano pago com domínio estático)
- Mantenha `.env.local` no `.gitignore`

## 🛣️ Rotas da Aplicação

- `/` - Redireciona para login ou dashboard
- `/login` - Página de login com Google
- `/dashboard` - Dashboard com lista de relatórios
- `/configuracoes` - Configurações do usuário e clínica
- `/relatorio/novo` - Formulário para novo relatório
- `/relatorio/[id]` - Visualização/edição de relatório existente
- `/suporte` - Página de suporte

## 📡 API Routes

- `GET/POST /api/relatorio` - Listar/criar relatórios
- `GET/PUT/DELETE /api/relatorio/[id]` - Operações em relatório específico
- `GET/PUT /api/configuracoes` - Configurações do usuário
- `POST /api/relatorio/gerar-pdf` - Gerar PDF
- `POST /api/relatorio/importar` - Importar dados de PDF
- `GET/POST /api/auth/[...nextauth]` - Autenticação NextAuth

## 🛠️ Desenvolvimento

### Prisma ORM

- Schema: `prisma/schema.prisma`
- Gerar tipos: `npx prisma generate`
- Criar migração: `npx prisma migrate dev --name <name>`
- Reset BD: `npx prisma migrate reset`

### TypeScript

Todos os tipos são validados em tempo de build. Execute `npm run build` para verificar erros TypeScript.

## 📝 Licença

MIT

## 👨‍💻 Autor

Desenvolvido como solução completa para gerenciamento de relatórios endodônticos.
