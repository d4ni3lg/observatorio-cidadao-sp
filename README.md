# Observatório Cidadão de São Paulo

> **Plataforma independente de transparência pública, participação popular e fiscalização cidadã sobre contratações, licitações, empresas e obras da Prefeitura de São Paulo.**

---

## 🏛️ 1. Visão Geral do Projeto

O **Observatório Cidadão de São Paulo** é uma iniciativa cívica e independente que reúne, traduz e fiscaliza informações sobre compras públicas, licitações municipais, empresas fornecedoras e execução de obras da Prefeitura Municipal de São Paulo.

O projeto transforma dados burocráticos complexos em visualizações acessíveis, permitindo que qualquer cidadão acompanhe o uso do dinheiro público municipal e participe diretamente com manifestações auditáveis vinculadas a CPF (com total privacidade e conformidade com a LGPD).

### ⚠️ Declaração de Independência e Natureza Cívica
- **Independência Institucional:** O Observatório Cidadão não possui vínculo formal, subordinação ou representação oficial da Prefeitura Municipal de São Paulo, da Câmara Municipal ou de órgãos de controle.
- **Sem Efeito Jurídico:** A plataforma não realiza licitações, não substitui diários oficiais e não possui autoridade para aprovar, anular ou embargar contratações públicas.
- **Imparcialidade e Veracidade:** A plataforma não inventa informações, não faz acusações sem respaldo documental e não emite juízos político-partidários. Toda afirmação técnica é ancorada em dados oficiais abertos.

---

## 🎯 2. Objetivos Fundamentais

1. **Centralização de Dados:** Consolidar informações dispersas de contratações do município de São Paulo.
2. **Linguagem Cidadã:** Traduzir termos jurídicos e administrativos herméticos para uma explicação simples e direta.
3. **Valores Monetários em Destaque:** Diferenciar estritamente valor estimado, valor homologado, valor contratado e valor efetivamente pago.
4. **Histórico e Concorrência de Lances:** Apresentar a linha do tempo das disputas e o deságio obtido em relação ao orçamento base.
5. **Participação Cidadã com CPF:** Permitir que o cidadão manifeste sua opinião (1 CPF = 1 voto) sem jamais ter seu documento exposto.
6. **Ranking Popular de Empresas:** Exibir a percepção cidadã sobre os fornecedores do município através de critérios transparentes.
7. **Fiscalização de Obras Atrasadas:** Acompanhar cronogramas, termos aditivos e comparar medição física de engenharia vs. percentual financeiro pago.
8. **Inteligência Artificial Responsável:** Gerar resumos estruturados com citações expressas de cláusulas oficiais, recusando alucinações.
9. **Relatórios e Compartilhamento:** Disponibilizar fichas síntese em PDF e textos formatados para envio imediato pelo WhatsApp.

---

## 🧩 3. Módulos do Sistema

### 📋 Módulo de Licitações e Planejamento (PCA)
- **Licitações Publicadas:** Acompanhamento de pregões eletrônicos e concorrências com sessões públicas abertas ou agendadas.
- **Planejamento PCA 2027:** Apresentação estritamente segregada de intenções de compras previstas no Plano de Contratações Anual, alertando o usuário de que ainda não são pregões abertos.
- **Gráfico Interativo de Lances:** Visualização gráfica da evolução dos lances na disputa e identificação da melhor proposta.
- **Resumo IA em 6 Perguntas Essenciais:**
  1. O que a Prefeitura pretende comprar?
  2. Qual é a finalidade da contratação?
  3. Onde será utilizado?
  4. Qual é o valor estimado e como foi calculado?
  5. Qual é o prazo previsto?
  6. Quem será beneficiado?

### 🚧 Módulo de Obras Atrasadas
- **Monitoramento Quinquenal:** Histórico de obras municipais com atraso documentado nos últimos 5 anos.
- **Regra Metodológica nº 10:** Separação obrigatória entre percentual financeiro pago e percentual físico atestado. Desembolso financeiro nunca é tratado como obra concluída.
- **Gráfico de Balanço Financeiro:** Comparativo entre orçamento inicial, acréscimos por termos aditivos, valor pago e medição física.
- **Badges de Alerta:**
  - Severidade de atraso (Crítico > 18m, Significativo 6-18m, Moderado < 6m).
  - Alerta de descompasso quando o financeiro pago supera o físico em mais de 15 pontos percentuais.

### 🏢 Módulo de Fornecedores e Ranking Popular
- **Vinculação Exclusiva por CNPJ de 14 Dígitos:** Previne confusões entre empresas homônimas ou de outros municípios.
- **Ranking Cidadão:** Ordenação por volume de contratos, percentual de recomendações e participação em licitações.
- **Trava Antidistorção:** Empresas com menos de 10 manifestações populares não lideram rankings percentuais.

### 🔐 Módulo de Participação e Privacidade (LGPD)
- **Validação de CPF:** Validação algorítmica matemática (módulo 11) dos dígitos verificadores.
- **Pseudonimização Irreversível:** O CPF em texto aberto jamais é salvo em banco ou logs. Utiliza-se um token HMAC-SHA256 com sal criptográfico e pseudônimo cívico (ex.: `Cidadão Paulistano #3457`).
- **Unicidade de Voto:** Cada CPF possui direito a exatamente 1 voto por empresa e por licitação.
- **Direito à Retificação:** O cidadão pode alterar seu voto a qualquer momento, substituindo o anterior sem duplicar o total da amostra.
- **Conformidade com o Art. 18 da LGPD:** Botão de eliminação e anonimização total da conta cívica e de suas manifestações.

### 🛠️ Painel Administrativo e Trilha de Auditoria
- **Monitor de Fontes:** Indicadores em tempo real do status das 6 fontes oficiais integradas.
- **Fila de Moderação:** Moderação de justificativas com regras objetivas para barrar calúnias e acusações sem prova.
- **Audit Logs Imutáveis:** Registro público de todas as decisões administrativas.

---

## 📡 4. Fontes de Dados Oficiais Integradas

| Fonte Oficial | Âmbito | Tipo de Informação Ingerida |
|---|---|---|
| **PNCP (Portal Nacional de Contratações Públicas)** | Municipal (IBGE 3550308) | Editais publicados, pregões eletrônicos, atas de RP e PCA 2027 |
| **Portal Dados Abertos SP (SIURB / Gesconfi)** | Prefeitura de SP | Contratos, medições, liquidações, empenhos e aditivos de obras |
| **Portal Obras Abertas PMSP** | Prefeitura de SP | Cronogramas físicos, coordenadas de canteiros e fotos |
| **TCM-SP (Tribunal de Contas do Município)** | Órgão de Controle | Relatórios de fiscalização e apontamentos de regularidade |
| **Transparência SP (SF / CGM)** | Controladoria Geral | Execução orçamentária detalhada e notas de empenho |
| **CEIS / CNEP (Portal da Transparência Federal)** | Controle Federal | Consulta de sanções e impedimentos de licitar |

---

## 💻 5. Tecnologias Utilizadas

- **Framework Web:** [Next.js 15](https://nextjs.org/) (App Router, Server & Client Components)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS (Design System Editorial de Alto Contraste)
- **Visualização de Dados:** [Recharts](https://recharts.org/) (Gráficos interativos SVG e responsivos)
- **Modelagem Relacional:** Prisma ORM (20 entidades estruturadas)
- **Ícones:** Lucide React
- **Segurança Criptográfica:** Node.js Crypto (HMAC-SHA256)

---

## 🚀 6. Como Rodar o Projeto Localmente

### Pré-requisitos
- Node.js (v18 ou superior)
- npm ou yarn

### Instalação

```bash
# 1. Clonar o repositório
git clone https://github.com/SEU-USUARIO/observatorio-cidadao-sp.git
cd observatorio-cidadao-sp

# 2. Instalar dependências
npm install

# 3. Compilar para produção
npm run build

# 4. Iniciar servidor de produção
npm run start
```

Acesse no seu navegador: `http://localhost:3000`

---

## 📦 7. Política de Versionamento e Atualizações

Este repositório adota o padrão de **Versionamento Semântico (SemVer)**:
- **`vMAJOR.MINOR.PATCH`** (Ex.: `v1.0.0`)
- **Preservação de Histórico:** Toda atualização enviada para a branch principal (`main`) gera automaticamente uma nova tag no GitHub e um registro no `CHANGELOG.md`, preservando todo o código anterior intacto.
- **Auditoria Cívica:** Qualquer alteração em regras de risco, metodologia de dados ou cálculo de pontuação fica imutavelmente documentada na árvore de commits do Git.

---

## 📜 8. Licença

Este projeto é disponibilizado sob a licença **MIT** — código aberto para auditoria cidadã, fomento à transparência e aprimoramento da administração pública.
