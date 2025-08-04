-- Script de inicialização do banco PostgreSQL local
-- Este arquivo será executado automaticamente quando o container for criado

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Conectar ao banco nextjs_dashboard
\c nextjs_dashboard;

-- Confirmar que o banco foi criado
SELECT 'Banco PostgreSQL local configurado com sucesso!' AS status;
