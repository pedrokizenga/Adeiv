-- Adiciona colunas para rastreamento de UTM na tabela 'leads'
-- Execute isso no Editor SQL do Supabase

ALTER TABLE leads ADD COLUMN IF NOT EXISTS "utm_source" text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS "utm_medium" text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS "utm_campaign" text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS "utm_term" text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS "utm_content" text;

-- Opcional: Adicionar uma coluna de status para o lead no dashboard
ALTER TABLE leads ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'Novo';
