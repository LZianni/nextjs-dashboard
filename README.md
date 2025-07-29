# 📊 Next.js Dashboard

Um dashboard moderno e responsivo construído com Next.js, TypeScript e TailwindCSS.

## 🚀 Funcionalidades

- ✅ Dashboard principal com métricas
- 👥 Gerenciamento de clientes
- 🧾 Gerenciamento de faturas
- 🔍 Sistema de busca
- 📱 Design responsivo
- 🎨 Interface moderna com TailwindCSS
- 🔐 Autenticação (NextAuth.js)
- 🗄️ Banco de dados PostgreSQL

## 🛠️ Tecnologias Utilizadas

- **Next.js** - Framework React
- **TypeScript** - Tipagem estática
- **TailwindCSS** - Estilização
- **NextAuth.js** - Autenticação
- **PostgreSQL** - Banco de dados
- **Zod** - Validação de schemas
- **Heroicons** - Ícones

## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/SEU_USUARIO/nextjs-dashboard.git
cd nextjs-dashboard
```

2. Instale as dependências:
```bash
pnpm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

4. Execute o projeto:
```bash
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000) para ver o resultado.

## 🏗️ Estrutura do Projeto

```
app/
├── dashboard/          # Páginas do dashboard
│   ├── customers/      # Gerenciamento de clientes
│   └── invoices/       # Gerenciamento de faturas
├── lib/               # Utilitários e configurações
├── ui/                # Componentes de interface
└── page.tsx           # Página inicial
```

## 🚀 Deploy

Este projeto pode ser facilmente deployado na Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SEU_USUARIO/nextjs-dashboard)

## 📝 Licença

Este projeto está sob a licença MIT.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

---

*Baseado no [curso Next.js App Router](https://nextjs.org/learn) - Next.js Website.*
