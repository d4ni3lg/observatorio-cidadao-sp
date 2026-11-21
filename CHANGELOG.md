# Registro de Mudanças (Changelog)

Todas as alterações notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado no [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [1.5.1] - 2026-11-21

### 🛠️ Correção do Token de Voto, Apagamento do Farol e Ajuste Visual de Notificações
- **Correção da Validação de Voto Serverless (`vote-store.ts`)**:
  - Resolução definitiva do erro de "token inválido/expirado": recuperação determinística stateless do hash HMAC-SHA256 (64 hex) nas rotas `/api/vote/company` e `/api/vote/procurement`.
  - Persistência híbrida com retenção em memória e diretório `/tmp` para suporte nativo a lambdas efêmeros do Vercel.
- **Farol Apagado Dinâmico (`Logo.tsx`)**:
  - Integração do componente com o estado global do PWA (`usePwa`).
  - Tanto a desconexão real quanto o interruptor de simulação offline agora desligam instantaneamente os feixes luminosos e a lanterna do farol em todas as telas.
- **Ajuste Espacial das Notificações & Modal**:
  - Integração do `OfflineBanner` diretamente na estrutura do `Header`, eliminando a colisão de elementos com `sticky top-0`.
  - Margens seguras (`pt-16` / `max-h-[82vh]`) no `NotificationCenterModal`, impedindo que o topo do modal fique cortado em telas de celulares ou sob entalhes (notches).
  - Adição do componente `NativeNotificationToast`, exibindo um card flutuante centralizado e totalmente legível em qualquer resolução.

---

## [1.5.0] - 2026-11-21

### 📱 Progressive Web App (PWA), Modo Offline, Farol Apagado & Notificações Nativas
- **Web App Manifest (`src/app/manifest.ts`)**: Suporte a instalação nativa standalone no Android, iOS e Windows com ícone vetorial de alta definição e cores paulistas.
- **Service Worker Nativo (`public/sw.js`)**: Cache-First para recursos estáticos, Stale-While-Revalidate para dados públicos e contingência offline para navegação.
- **Modo Offline & Conceito "Farol Apagado"**:
  - Quando offline (ou na simulação), o logotipo do **Farol Cidadão** desliga os feixes luminosos e assume tons de contingência apagada.
  - Notificação fixa no topo (`OfflineBanner.tsx`) avisando sobre o funcionamento local e salvamento seguro de ações.
  - Tela de contingência offline (`/offline`) com atalhos para os módulos pré-carregados.
  - Fila local com **IndexedDB** (`offline-queue.ts`) que retém votos realizados offline e os sincroniza automaticamente ao restaurar a conexão.
- **Central de Alertas & Notificações Nativas**:
  - Disparo de notificações nativas do sistema operacional com vibração e som para **Voto Registrado** (com hash HMAC) e **Conta Cidadã Ativada**.
  - Modal da Central de Alertas (`NotificationCenterModal.tsx`) acessível pela barra de navegação com teste instantâneo de alertas de editais, obras e sugestões de votação.
- **Detecção de Novas Versões & Prompt de Instalação**:
  - `UpdateToast.tsx` notifica o usuário quando há um novo build disponível com botão de recarregamento sem atrito (`SKIP_WAITING`).
  - `InstallPrompt.tsx` oferece instalação do app em um toque.

---

## [1.4.1] - 2026-11-21

### 🔒 Ocultação de Credenciais e Proteção Visual do Painel Administrativo
- **Remoção de Credenciais Visuais**: Exclusão total do bloco de credenciais de teste e do botão de preenchimento automático na tela de login `/admin`.
- **Discrição na Navegação Pública**: Remoção do botão ostensivo "Painel Admin" da barra de navegação superior (desktop) e do menu lateral gaveta (mobile).
- **Acesso Oculto e Protegido**: Ponto de acesso mantido exclusivamente por rota direta (`/admin`) e através de indicador discreto no rodapé institucional.
- **Segurança Ativa**: Rate limiting contra força bruta, tokens de sessão com assinatura HMAC-SHA256 em cookies `HttpOnly`, honeypots contra bots automatizados e comparação de senhas em tempo constante mantidos ativos.

---

## [1.4.0] - 2026-11-21

### 🔐 Versão Definitiva para Apresentação & Autenticação do Painel Administrativo

#### 🛡️ Portal e Autenticação do Painel Administrativo (`/admin`)
- **Autenticação Segura com Usuário e Senha (`/api/admin/auth`)**:
  - Implementação de login com credenciais institucionais: `admin` / `Farol@SP2026!`.
  - Token de sessão assinado com HMAC-SHA256 e transmitido via cookie seguro `HttpOnly` com validade de 8 horas.
  - Blindagem contra força bruta (Rate Limiting de 5 tentativas por minuto) e comparação de senha em tempo constante (*timing-safe*).
  - Botão de conveniência para preenchimento de teste rápido em apresentações e demonstrações ao vivo.
- **Painel de Controle e Auditoria Master**:
  - Monitoramento das 5 fontes primárias (PNCP, Dados Abertos SP, TCM-SP, Transparência Municipal, CEIS/CNEP).
  - Botão de disparo de sincronização oficial em tempo real com o banco de dados Supabase.
  - Fila de moderação com ações de Aprovar/Rejeitar relatos com justificativa gravada.
  - Trilha de auditoria imutável com carimbo de data/hora (*timestamp*), autor, ação e botão de exportação em JSON.

#### 🎯 Refinamento Geral da Apresentação
- **Fechamento Completo da Plataforma**:
  - 19 rotas compiladas e validadas em produção.
  - Logotipo e Favicon oficial do **Farol Cidadão da Transparência** ativo em todas as telas.
  - Barra de navegação inferior mobile ativa e ágil para qualquer smartphone.

---

## [1.3.1] - 2026-11-21

### 🏮 Redesign do Logotipo Oficial: Farol Cidadão da Transparência
- **Novo Símbolo e Conceito**: Criação de um logotipo moderno e estilizado com o **Farol da Transparência** iluminando os gastos públicos de São Paulo.
- **Geometria e Cores Paulistas**: Torre do farol com as faixas paulistas (preto nobre, vermelho bandeirante e branco puro), feixe de luz dourado projetado e squircle escuro refinado.
- **Favicon SVG Nativo (`src/app/icon.svg`)**: Adicionado ícone do farol vetorial de alta nitidez renderizado automaticamente na aba de todos os navegadores e dispositivos móveis.

---

## [1.3.0] - 2026-11-21

### 🎨 Nova Identidade Visual Paulista, Mobile de Alta Performance e Blindagem de Segurança

#### 🏛️ Identidade Visual Paulista (Vermelho, Preto e Branco)
- **Logotipo Cívico Oficial (`Logo.tsx`)**: Brasão vetorial estilizado com as cores da bandeira paulista (preto nobre, branco e vermelho bandeirante), estrela cívica e lupa de controle social.
- **Paleta de Cores Redesenhada**: Substituição integral das tonalidades genéricas pelo padrão paulista (`#09090B` preto nobre, `#B91C1C` / `#DC2626` vermelho institucional e branco puro de alto contraste).
- **Gráficos e Indicadores Customizados**: Atualização visual do `BidTimelineChart` e `WorkFinancialChart` com cores temáticas paulistas e tooltips escuros elegantes.

#### 📱 Experiência Mobile Refinada
- **Barra de Navegação Inferior Móvel (`MobileBottomNav.tsx`)**: Barra de atalhos rápidos fixada no rodapé em telas menores com ícones para Início, Licitações, Empresas, Obras e Minha Conta.
- **Menu Drawer Mobile Otimizado**: Drawer deslizante com fundo translúcido em desfoque (*backdrop-blur*), trava de scroll no body e áreas de toque com mínimo de 48px.
- **Compatibilidade com Áreas Seguras (`pb-safe`)**: Espaçamento adaptativo para smartphones modernos com entalhe (*notch*).

#### 🛡️ Blindagem Completa de Segurança e LGPD
- **Middleware Global de Segurança (`src/middleware.ts`)**:
  - Detecção e bloqueio de injeções (SQL Injection, Path Traversal `../`, pseudo-scripts e payloads perigosos).
  - Validação estrita de CSRF em todas as rotas mutantes da API (`POST`, `PUT`, `DELETE`).
  - Cabeçalhos de segurança HTTP em todas as respostas (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `HSTS`, `Permissions-Policy`).
  - Omissão de cabeçalho `X-Powered-By` no `next.config.ts`.
- **Proteção Anti-Bot por Honeypot**: Inclusão de armadilhas invisíveis nos formulários de autenticação de CPF e envio de votos para descarte de bots automatizados.
- **Rate Limiting em Memória (`src/lib/security/index.ts`)**: Limite de requisições por IP e por token para blindar contra tentativas de ataque por força bruta em CPFs e inundações de votos.
- **Sanitização Estrita de Entradas**: Remoção de tags HTML, scripts e sequências maliciosas com comparação de tokens em tempo constante (*timing-safe*).

---

## [1.2.2] - 2026-11-21

### 🛡️ Atualização de Segurança (CVE-2025-66478)
- **Atualização do Next.js para `^15.1.9`**: Correção de segurança obrigatória para mitigar a vulnerabilidade em React Server Components (React2Shell / CVE-2025-66478), desbloqueando o deploy em produção na Vercel.

---

## [1.2.1] - 2026-11-21

### 🔧 Correção de Build Web (Vercel) e Variáveis de Ambiente
- **Configuração Automática das Variáveis de Ambiente na Vercel**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` injetadas em Produção, Preview e Desenvolvimento.
- **Inclusão da Dependência Explícita `react-is`**: Correção de resolução de módulo (`Can't resolve 'react-is'`) exigida pelo Recharts 3.x no ecossistema Next.js 15 / React 19 durante a compilação do Webpack na Vercel.
- **Validação Completa de Build**: Compilação local com sucesso gerando todas as 17 rotas estáticas e dinâmicas da plataforma.

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
