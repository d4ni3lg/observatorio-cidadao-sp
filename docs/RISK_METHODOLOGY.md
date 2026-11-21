# Metodologia do Modelo de Indicadores de Atenção e Governança de IA

## 1. Modelo Transparente de Pontuação ("Contratações que Merecem Atenção")

O Observatório Cidadão de São Paulo **não classifica automaticamente nenhuma contratação como ilegal, fraudulenta ou irregular**. O ranking das cinco contratações dos últimos seis meses utiliza exclusivamente um índice objetivo e reproduzível de **Indicadores de Atenção Documentados** ($I_{aten\text{ç}\tilde{a}o}$), calculado a partir de 10 critérios extraídos de documentos oficiais:

| # | Indicador Objetivo | Peso Máximo | Critério de Cálculo Reproduzível | Fonte Primária |
| :-: | :--- | :-: | :--- | :--- |
| **1** | Atraso documentado na execução | 15 pts | $+5$ pts para atraso $> 60$ dias; $+10$ pts para $> 180$ dias; $+15$ pts para $> 365$ dias em relação ao cronograma contratual vigente. | Obras Abertas / TCM-SP / Contratos |
| **2** | Penalidades contratuais oficialmente registradas | 15 pts | $+10$ pts por multa contratual publicada no Diário Oficial/Transparência; $+15$ pts por advertência cumulada com multa de inexecução. | Portal da Transparência SP / CEIS |
| **3** | Rescisão contratual documentada | 15 pts | $+15$ pts quando há rescisão unilateral ou amigável motivada por falha de execução publicada oficialmente. | PNCP / Transparência SP |
| **4** | Suspensão ou paralisação registrada | 12 pts | $+12$ pts quando a obra ou contrato encontra-se com status oficial de "Paralisada" ou "Suspensa por determinação técnica/cautelar". | TCM-SP / Obras Abertas |
| **5** | Aditivos com aumento relevante de valor | 10 pts | $+5$ pts para acréscimo acumulado entre $15\%$ e $25\%$; $+10$ pts para acréscimo acumulado $> 25\%$ sobre o valor inicial atualizado. *(Observação: aditivos legais isolados não constituem irregularidade)*. | PNCP / Transparência SP |
| **6** | Aditivos de prazo sucessivos | 8 pts | $+4$ pts para 2 prorrogações de prazo; $+8$ pts para 3 ou mais prorrogações sucessivas do cronograma de entrega. | Contratos / Obras Abertas |
| **7** | Diferença entre valor estimado e valor final | 5 pts | $+5$ pts quando o valor contratado ou atualizado supera o orçamento estimado inicial ou apresenta distorção atípica documentada em ata. | PNCP (Atas e Homologação) |
| **8** | Inexecução parcial ou total registrada | 10 pts | $+10$ pts quando há registro oficial de entrega inferior ao cronograma físico medido com retenção ou glosa documental. | TCM-SP / Fiscalização Contratual |
| **9** | Determinações ou apontamentos de órgãos de controle | 6 pts | $+3$ pts para apontamento técnico em análise no TCM-SP; $+6$ pts para decisão colegiada determinando correção ou diligência. | TCM-SP |
| **10** | Ausência de atualização de informações obrigatórias | 4 pts | $+4$ pts quando uma obra ou contrato ativo não recebe atualização de medição obrigatória há mais de 180 dias na base oficial. *(Ausência de dado não é tratada como prova de irregularidade)*. | Obras Abertas / PNCP |

### Separação Rigorosa de Escopo na Exibição
Em todas as páginas do sistema, os registros são separados visualmente e estruturalmente em 4 categorias distintas:
1. **Ocorrências desta contratação específica.**
2. **Ocorrências em outros contratos públicos da mesma empresa (CNPJ).**
3. **Penalidades administrativas definitivas (transitadas na esfera administrativa).**
4. **Apontamentos técnicos de órgãos de controle ainda em análise / contraditório.**

---

## 2. Regras de Governança da Inteligência Artificial (Seção 12)

A camada de IA do Observatório funciona exclusivamente como **tradutora de linguagem burocrática para linguagem cidadã**, submetida a 10 travas obrigatórias:
1. **Ancoragem Documental Estrita:** Toda frase gerada no resumo cita o documento oficial de origem (ex.: `[Fonte: Edital Pregão Eletrônico 90042/2026, Item 2.1]`).
2. **Declaração Explícita de Dados Ausentes:** Se um dado (como local exato de alocação ou orçamento sob sigilo legal do art. 24 da Lei 14.133/2021) não consta nos documentos públicos, o resumo informa expressamente: *"Informação não disponível nos documentos publicados até a última sincronização"*.
3. **Imutabilidade dos Dados Oficiais:** A IA jamais altera valores, datas, CNPJs ou status importados das APIs oficiais.
4. **Isolamento de Comentários Populares:** Comentários e votos de cidadãos jamais alimentam o contexto da IA para geração de resumos factuais.
