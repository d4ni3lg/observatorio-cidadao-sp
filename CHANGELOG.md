# Registro de Mudanças (Changelog)

Todas as alterações notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado no [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [1.2.0] - 2026-11-21

### 🚀 Migração Efetiva para Nuvem (Supabase) Concluída
- **População e Validação em Tempo Real no Supabase PostgreSQL**:
  - `data_sources`: 5 fontes oficiais de dados integradas.
  - `companies`: 92 empresas fornecedoras da PMSP cadastradas com CNPJ de 14 dígitos normalizado e status de regularidade cadastral.
  - `procurements`: 25 contratações públicas e itens do Plano de Contratações Anual (PCA 2027) devidamente segregados e deduplicados.
  - `contracts`: 20 contratos vigentes vinculados com numeração oficial, processos SEI e valores empenhados/pagos.
  - `public_works`: 20 obras públicas atrasadas com cronogramas contratuais, medição física, datas e justificativas oficiais.
- **Tratamento de Integridade e Constraints**:
  - Resolução de constraints `NOT NULL` para `registration_status` e URLs de comprovação oficial dos contratos.
  - Deduplicação de registros de PCA no snapshot e no script de ingestão com resolução segura de duplicatas.

---

## [1.1.0] - 2026-11-21

### 🚀 Banco de Dados em Nuvem (Supabase) e Deploy Vercel
- **DDL PostgreSQL para Supabase (`supabase/schema.sql`)**: 20 tabelas relacionais com chaves primárias, estrangeiras, índices e views agregadas de votos cidadãos.
- **Script de Ingestão e Migração Oficial (`scripts/seed-supabase.js`)**: Transferência automática de 92 empresas reais, 15 licitações e itens PCA 2027, 20 obras públicas atrasadas com cronogramas e balanço físico vs. financeiro para o Supabase.
- **Cliente Supabase Universal (`src/lib/supabase/client.ts`)**: Suporte a consultas e inserções em nuvem com fallback automático.
- **Otimização de Deploy Vercel (`.npmrc`)**: Configuração de `legacy-peer-deps=true` para resolução segura de dependências com React 19.

---

## [1.0.0] - 2026-11-21

### ✨ Lançamento Inicial Oficial (Fases 1, 2, 3, 4 e 5)

#### 🏛️ Arquitetura e Identidade Visual (Fase 1)
- Identidade visual editorial com alto contraste, paleta própria (azul-marinho, branco, cinza) e tipografia moderna.
- Banner obrigatório e permanente de independência cívica (não representa a Prefeitura de São Paulo e não possui efeitos jurídicos em licitações).
- Implementação das 7 seções centrais da plataforma: Início, Licitações, Empresas, Obras Atrasadas, Contratações com Indicadores de Atenção, Como Funciona e Sobre o Projeto.
- Schema Prisma relacional com 20 entidades (`users`, `companies`, `procurements`, `contracts`, `public_works`, `votes`, `audit_logs`, etc.).

#### 📡 Integração com Dados Oficiais Reais da PMSP (Fase 2)
- Ingestão ao vivo da API do PNCP para editais e pregões de São Paulo (código IBGE 3550308).
- Consulta estruturada ao Plano de Contratações Anual (PCA 2027) com separação estrita de itens de planejamento.
- Ingestão das planilhas oficiais do Portal Dados Abertos SP (SIURB Gesconfi e Obras Abertas).
- Indexação de 92 empresas fornecedoras com CNPJ exato de 14 dígitos.
- Mapeamento de 20 obras públicas com atraso documental nos últimos 5 anos.
- Snapshot consolidado em `data/official-sync-db.json` e rotas `/api/sync`.

#### 📊 Inteligência Artificial e Visualização de Dados (Fase 3)
- Gráficos interativos com biblioteca Recharts:
  - `BidTimelineChart`: Linha do tempo dos lances e deságio concorrido.
  - `WorkFinancialChart`: Comparativo entre orçamento inicial, termos aditivos, valor pago e medição física.
- Badges visuais de severidade de atraso (`DelaySeverityBadge`) e de descompasso financeiro vs. físico (`ExecutionDiscrepancyBadge`).
- Motor de IA em linguagem simples (`/api/ai-summary`) respondendo às 6 perguntas essenciais com citações de documentos e cláusulas oficiais, sem alucinações.
- Glossário cívico automático para termos licitatórios complexos.

#### 🔐 Participação Popular e Conformidade LGPD (Fase 4)
- Validação matemática de CPF (algoritmo módulo 11 da Receita Federal).
- Tokenização HMAC-SHA256 irreversível: o CPF do cidadão jamais é salvo ou exibido.
- Pseudônimos cívicos públicos (ex.: `Cidadão Paulistano #3457`).
- Regra de unicidade de voto (1 CPF = 1 voto por empresa e por licitação).
- Permissão para alteração de voto a qualquer momento, recalculando os percentuais sem duplicar a contagem.
- Painel `/conta` com consentimento formal e botão de exclusão e anonimização de dados conforme o Art. 18 da LGPD.
- APIs `/api/citizen/auth`, `/api/vote/company` e `/api/vote/procurement`.

#### 📄 Relatórios, Compartilhamento e Painel de Moderação (Fase 5)
- Ficha síntese para impressão e exportação em formato PDF.
- Compartilhamento formatado em um clique para o WhatsApp com resumo de indicadores e link oficial.
- Painel administrativo `/admin` com monitoramento das 6 fontes oficiais, botão para sincronização imediata, moderação com critérios objetivos e registros imutáveis de auditoria (`audit_logs`).
