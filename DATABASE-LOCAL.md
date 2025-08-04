# 🐘 PostgreSQL Local - Next.js Dashboard

## 🚀 Setup Rápido

### 1. Iniciar o Banco PostgreSQL
```bash
# Iniciar apenas o PostgreSQL
pnpm db:start

# OU iniciar com pgAdmin (interface web)
pnpm pgadmin:start
```

### 2. Verificar se está rodando
```bash
# Ver logs do banco
pnpm db:logs

# OU verificar diretamente
docker ps
```

### 3. Rodar o Seed
```bash
# Iniciar o Next.js (em outro terminal)
pnpm dev

# Executar o seed
pnpm seed
# OU acessar: http://localhost:3000/seed
```

## 📋 Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `pnpm db:start` | Inicia PostgreSQL |
| `pnpm db:stop` | Para PostgreSQL |
| `pnpm db:restart` | Reinicia PostgreSQL |
| `pnpm db:logs` | Mostra logs |
| `pnpm db:reset` | **APAGA TUDO** e recria |
| `pnpm pgadmin:start` | Inicia pgAdmin (web) |
| `pnpm seed` | Executa seed via HTTP |

## 🔧 Configurações

### Banco PostgreSQL Local
- **Host:** localhost
- **Porta:** 5432
- **Banco:** nextjs_dashboard
- **Usuário:** postgres
- **Senha:** postgres123

### pgAdmin (Interface Web)
- **URL:** http://localhost:8080
- **Email:** admin@admin.com
- **Senha:** admin123

## 🔍 Testando Conexão

Acesse: http://localhost:3000/test-db

## ⚠️ Problemas Comuns

### Docker não instalado?
```bash
# macOS (Homebrew)
brew install --cask docker

# Ou baixe em: https://www.docker.com/products/docker-desktop
```

### Porta 5432 ocupada?
```bash
# Ver o que está usando a porta
sudo lsof -i :5432

# Parar PostgreSQL local se houver
brew services stop postgresql
```

### Reset completo?
```bash
pnpm db:reset
```

## 📁 Estrutura Criada

```
├── docker-compose.yml          # Configuração Docker
├── init-db/
│   └── 01-init.sql            # Scripts de inicialização
├── .env.local                 # Variáveis ambiente (local)
└── package.json              # Scripts npm adicionados
```
