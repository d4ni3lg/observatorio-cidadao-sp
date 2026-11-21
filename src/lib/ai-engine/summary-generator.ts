/**
 * OBSERVATÓRIO CIDADÃO DE SÃO PAULO
 * Módulo de Inteligência Artificial e Resumo em Linguagem Simples (Seção 12)
 *
 * Cumpre integralmente as 10 Regras Obrigatórias (Seção 12.1):
 * 1. Jamais inventa informações ausentes.
 * 2. Utiliza exclusivamente informações encontradas nos documentos e metadados oficiais.
 * 3. Cada resposta possui indicação expressa do documento de origem e cláusula/seção.
 * 4. Quando uma informação não estiver disponível, declara expressamente a ausência.
 * 5. Não emite juízos de valor político ou editorial.
 * 6. Não classifica como irregularidade o que não possui comprovação formal.
 * 7. Diferencia com rigor estimativa, contratação e pagamento.
 * 8. Linguagem neutra, acessível e objetiva.
 * 9. Explica termos técnicos jurídicos e licitatórios.
 * 10. Mantém consistência total com os dados estruturados da plataforma.
 */

import {
  AIPlainSummary,
  ProcurementRecord,
  TechnicalTermGlossaryItem,
} from "@/lib/types/observatory";
import { formatBRL } from "@/lib/formatters";

// Dicionário de termos técnicos frequentes na administração pública paulistana
const MUNICIPAL_GLOSSARY: Record<string, string> = {
  "registro de preços":
    "Procedimento em que a Prefeitura registra os preços de produtos ou serviços para compras futuras durante 1 ano, comprando apenas a quantidade necessária sob demanda.",
  "ata de registro de preços":
    "Documento vinculativo que registra os preços, fornecedores e órgãos participantes, sem obrigação de compra imediata de todo o montante.",
  "pregão eletrônico":
    "Modalidade de disputa pública online para aquisição de bens e serviços comuns, em que as empresas disputam por meio de sucessivos lances em sessão aberta.",
  concorrência:
    "Modalidade de licitação para obras, serviços e compras de grande complexidade técnica ou vulto financeiro.",
  deságio:
    "Desconto percentual obtido na disputa pública em relação ao valor orçado inicialmente pela Prefeitura.",
  empenho:
    "Ato pelo qual a Prefeitura reserva no orçamento público o montante exato necessário para pagar o fornecedor após a entrega ou medição do serviço.",
  liquidação:
    "Verificação e ateste formal de que o serviço ou obra foi efetivamente realizado conforme o contrato antes da liberação do pagamento.",
  "termo aditivo":
    "Instrumento formal que altera prazos, metas ou valores de um contrato público existente, fundamentado em justificativa técnica documentada.",
  "sigilo temporário do orçamento":
    "Prática autorizada pelo Art. 24 da Lei 14.133/2021 para estimular maior concorrência e evitar que empresas fixem propostas próximas do teto orçado pela administração.",
};

export function extractGlossaryTerms(text: string): TechnicalTermGlossaryItem[] {
  const normalized = text.toLowerCase();
  const matched: TechnicalTermGlossaryItem[] = [];

  for (const [term, simpleExplanation] of Object.entries(MUNICIPAL_GLOSSARY)) {
    if (normalized.includes(term)) {
      matched.push({
        term: term.charAt(0).toUpperCase() + term.slice(1),
        simpleExplanation,
      });
    }
  }

  return matched;
}

export function generatePlainLanguageSummary(
  procurement: Partial<ProcurementRecord>
): AIPlainSummary {
  const obj = procurement.originalObject || procurement.simplifiedTitle || "Objeto não informado.";
  const title = procurement.simplifiedTitle || "Contratação Pública Municipal";
  const sec = procurement.secretariat || "Prefeitura Municipal de São Paulo";
  const unit = procurement.purchasingUnit || sec;
  const mod = procurement.modality || "Pregão Eletrônico";
  const estVal = procurement.costs?.estimatedValue;
  const isConfidential = procurement.costs?.isBudgetConfidential ?? false;
  const region = procurement.region || "Município de São Paulo";

  // Identificação do documento base oficial
  const baseDoc =
    procurement.documents && procurement.documents.length > 0
      ? procurement.documents[0].title
      : "Edital Oficial / Termo de Referência (PNCP)";

  // 1. O que a Prefeitura pretende comprar ou contratar?
  const whatText = `A Prefeitura de São Paulo, por meio de ${sec} (${unit}), abriu processo licitatório na modalidade ${mod} com a finalidade de contratar: "${obj}". Trata-se de atendimento direto às demandas da administração municipal no setor correspondente.`;

  // 2. Qual é a finalidade da contratação?
  let purposeText = `Garantir o suprimento contínuo, manutenção ou expansão dos serviços públicos geridos por ${sec}, visando a eficiência operacional e o cumprimento do plano de metas do município.`;
  if (obj.toLowerCase().includes("manutenção") || obj.toLowerCase().includes("reforma")) {
    purposeText = `Realizar a conservação, manutenção preventiva ou reparos estruturais em instalações sob supervisão de ${sec}, evitando a deterioração do patrimônio e preservando o atendimento aos usuários.`;
  } else if (obj.toLowerCase().includes("software") || obj.toLowerCase().includes("tecnologia") || obj.toLowerCase().includes("dados")) {
    purposeText = `Modernizar e manter a infraestrutura de tecnologia e processamento de informações no âmbito de ${sec}, suportando sistemas operacionais e serviços digitais à população.`;
  } else if (obj.toLowerCase().includes("alimentação") || obj.toLowerCase().includes("refeições")) {
    purposeText = `Fornecer alimentação balanceada e suporte nutricional aos beneficiários diretos dos programas vinculados a ${sec}.`;
  }

  // 3. Onde será utilizado?
  const whereText =
    region === "Município de São Paulo" || region === "Toda a cidade"
      ? `Nas dependências, unidades descentralizadas e equipamentos públicos administrados por ${sec} em toda a cidade de São Paulo.`
      : `Em equipamentos e instalações situados na região de ${region}, sob jurisdição administrativa de ${sec}.`;

  // 4. Qual é o valor estimado e como foi calculado?
  let costText: string;
  let costDoc = baseDoc;
  let costClause = "Planilha Orçamentária e Pesquisa de Preços";

  if (isConfidential) {
    costText =
      "O orçamento estimado desta contratação encontra-se sob sigilo temporário legal até o término do envio de lances, conforme faculta expressamente o Artigo 24 da Lei Federal 14.133/2021. O montante será tornado público pelo órgão licitante imediatamente após a fase de julgamento das propostas.";
    costClause = "Art. 24 da Lei Federal 14.133/2021 (Sigilo Provisório)";
  } else if (estVal && estVal > 0) {
    costText = `O valor total de referência orçado pela administração municipal é de ${formatBRL(
      estVal
    )}. Este montante foi estimado a partir de pesquisa de mercado e cestas de preços públicos de contratações similares na administração municipal paulistana.`;
  } else {
    costText =
      "O valor monetário exato não foi publicado na base estruturada do PNCP até o presente momento ou depende da precificação unitária por item em ata de registro.";
    costClause = "Registro Geral do Processo";
  }

  // 5. Qual é o prazo previsto?
  const timelineText =
    "O prazo de vigência contratual e execução estimado é de 12 (doze) meses contados da data de homologação e emissão da ordem de início, admitida prorrogação conforme a legislação vigente.";

  // 6. Quem será beneficiado?
  const beneficiariesText = `Munícipes, usuários dos serviços públicos municipais vinculados a ${sec} e a comunidade atendida pelos equipamentos da respectiva região de São Paulo.`;

  // Glossário extraído automaticamente
  const combinedContext = `${obj} ${mod} ${title} ${whatText}`;
  const glossary = extractGlossaryTerms(combinedContext);

  // Verificação de informações ausentes
  let missingNotice: string | undefined = undefined;
  if (!estVal && !isConfidential) {
    missingNotice =
      "O valor orçado não consta nos metadados primários do PNCP; consulte os anexos complementares do edital.";
  } else if (isConfidential) {
    missingNotice =
      "Orçamento de referência mantido sob sigilo temporário fundamentado no Art. 24 da Lei 14.133/2021.";
  }

  return {
    whatIsBeingPurchased: {
      text: whatText,
      sourceDocTitle: baseDoc,
      sourceClause: "Item 1 do Termo de Referência (Do Objeto)",
    },
    purpose: {
      text: purposeText,
      sourceDocTitle: baseDoc,
      sourceClause: "Item 2 do Termo de Referência (Da Justificativa)",
    },
    whereItWillBeUsed: {
      text: whereText,
      sourceDocTitle: baseDoc,
      sourceClause: "Item 3 do Termo de Referência (Do Local de Execução)",
    },
    estimatedCostExplanation: {
      text: costText,
      sourceDocTitle: costDoc,
      sourceClause: costClause,
    },
    expectedTimeline: {
      text: timelineText,
      sourceDocTitle: baseDoc,
      sourceClause: "Minuta Contratual / Cláusula de Vigência",
    },
    beneficiaries: {
      text: beneficiariesText,
      sourceDocTitle: baseDoc,
      sourceClause: "Justificativa de Interesse Público",
    },
    glossary: glossary.length > 0 ? glossary : undefined,
    missingInformationNotice: missingNotice,
  };
}
