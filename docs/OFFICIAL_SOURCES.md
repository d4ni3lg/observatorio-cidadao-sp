# Fontes Oficiais de Dados e Referências Legais — Observatório Cidadão de São Paulo

> **Regra Fundamental:** Nenhum indicador factual do Observatório Cidadão de São Paulo pode ser alimentado por fontes não verificadas. Toda informação exibida na plataforma deve preservar o identificador original, a data da última consulta e o link direto para o documento ou registro público de origem.

---

## 1. Fontes Primárias de Dados Públicos

### Fonte 1: Portal Nacional de Contratações Públicas (PNCP)
- **Portal Oficial:** [https://pncp.gov.br/](https://pncp.gov.br/)
- **Documentação Técnica da API (Swagger):** [https://pncp.gov.br/api/consulta/swagger-ui/index.html](https://pncp.gov.br/api/consulta/swagger-ui/index.html)
- **Escopo de Uso:**
  - Licitações publicadas da Prefeitura Municipal de São Paulo e administração indireta municipal.
  - Planos de Contratações Anuais (PCA 2026 e 2027) — **exibidos estritamente em seção separada de Planejamento**.
  - Editais, Termos de Referência, Estudos Técnicos Preliminares (ETP) e anexos.
  - Datas de abertura e encerramento de propostas.
  - Valores estimados (respeitando eventual sigilo temporário legal), valores homologados, atas de registro de preços, propostas abertas, lances e contratos.
- **Frequência de Sincronização Prevista (Fase 2):** A cada 6 horas para licitações futuras/abertas e diária para contratos/alterações.

### Fonte 2: Tribunal de Contas do Município de São Paulo (TCM-SP)
- **Portal Institucional:** [https://portal.tcm.sp.gov.br/](https://portal.tcm.sp.gov.br/)
- **Portal de Dados Abertos e APIs:** [https://portal.tcm.sp.gov.br/Pagina/78382](https://portal.tcm.sp.gov.br/Pagina/78382)
- **Escopo de Uso:**
  - Execução orçamentária municipal, empenhos, liquidações e valores efetivamente pagos.
  - Acompanhamento de obras, instalações e serviços de engenharia.
  - Relatórios de auditoria, fiscalizações, apontamentos técnicos e acórdãos/decisões colegiadas.
  - **Regra de Classificação:** Separar rigorosamente *apontamentos técnicos ainda em análise* de *decisões ou penalidades administrativas definitivas*.

### Fonte 3: Obras Abertas — Prefeitura de São Paulo
- **Portal Oficial:** [https://obrasabertas.prefeitura.sp.gov.br/](https://obrasabertas.prefeitura.sp.gov.br/)
- **Escopo de Uso:**
  - Monitoramento das obras públicas municipais (recorte de 07/11/2021 a 07/11/2026).
  - Georreferenciamento, subprefeitura responsável, secretaria executante e empresa contratada (CNPJ).
  - Cronograma físico-financeiro, datas previstas e reprogramadas, fotografias oficiais e situação de execução.

### Fonte 4: Portal de Dados Abertos da Prefeitura de São Paulo
- **Portal Oficial:** [https://dados.prefeitura.sp.gov.br/](https://dados.prefeitura.sp.gov.br/)
- **Escopo de Uso:**
  - Conjuntos de dados estruturados (CSVs/JSONs/APIs CKAN) de contratos, termos aditivos, despesas, empenhos, secretarias, subprefeituras e equipamentos públicos.

### Fonte 5: Portal da Transparência do Município de São Paulo
- **Portal Oficial:** [https://transparencia.prefeitura.sp.gov.br/](https://transparencia.prefeitura.sp.gov.br/)
- **Escopo de Uso:**
  - Validação cruzada de execução financeira, aditivos contratuais, ordens de pagamento e penalidades contratuais aplicadas no âmbito municipal.

### Fonte 6: Cadastros Nacionais de Sanções (CEIS e CNEP)
- **Portal da Transparência / CGU (API de Dados):** [https://portaldatransparencia.gov.br/sancoes](https://portaldatransparencia.gov.br/sancoes)
- **Escopo de Uso:**
  - Consulta de registros no Cadastro Nacional de Empresas Inidôneas e Suspensas (CEIS) e no Cadastro Nacional de Empresas Punidas (CNEP).
  - **Regra de Associação:** Vinculação exclusiva por CNPJ completo normalizado (14 dígitos). Jamais associar empresas por semelhança de razão social ou nome fantasia. Exibir sempre a abrangência e a vigência da sanção.

---

## 2. Referências Legais e Normativas

1. **Nova Lei de Licitações e Contratos Administrativos — [Lei Federal nº 14.133/2021](https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14133.htm):**
   - Fundamenta as modalidades de contratação, publicidade no PNCP, orçamento estimado (e hipóteses de orçamento sigiloso do art. 24), fases da disputa, termos aditivos e sanções contratuais.
2. **Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018) & [Guia Orientativo sobre Segurança da Informação da ANPD](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-sobre-seguranca-da-informacao-para-agentes-de-tratamento-de-pequeno-porte):**
   - Fundamenta a arquitetura de pseudonimização de CPF, proibição absoluta de armazenamento de CPF em texto aberto, proibição de exposição pública de identificadores pessoais, controle de acesso, prevenção contra fraude/automação e trilha de auditoria.
3. **Lei de Acesso à Informação (LAI — Lei Federal nº 12.527/2011):**
   - Ampara a reutilização cidadã de dados públicos abertos e documentos oficiais de contratações públicas.
