-- Execute este comando no Editor SQL do Supabase para atualizar a tabela 'leads'
-- Isso evitará erros ao enviar o formulário com os novos campos separados.

ALTER TABLE leads ADD COLUMN "Clinica" text;
ALTER TABLE leads ADD COLUMN "Localizacao" text;

-- Nota: Os campos antigos "Clínica e Localização" continuarão existindo com os dados antigos.
-- Se desejar remover a coluna antiga futuramente, use:
-- ALTER TABLE leads DROP COLUMN "Clínica e Localização";
