export type RecordType = "PUBLISHED_BID" | "PCA_PLANNING";

export type ProcurementStatus =
  | "RECEIVING_PROPOSALS"
  | "SCHEDULED_SESSION"
  | "PUBLISHED_UPCOMING"
  | "IN_DISPUTE"
  | "HOMOLOGATED"
  | "PCA_PLANNED";

export interface OfficialDocumentRef {
  id: string;
  type:
    | "Edital"
    | "Termo de Referência"
    | "Estudo Técnico Preliminar (ETP)"
    | "Anexos"
    | "Ata da Sessão"
    | "Propostas Abertas"
    | "Resultado / Homologação"
    | "Contrato"
    | "Termo Aditivo"
    | "Relatório TCM-SP";
  title: string;
  url: string;
  publishedAt: string;
  sourceName: string;
}

export interface TechnicalTermGlossaryItem {
  term: string;
  simpleExplanation: string;
}

export interface AIPlainSummary {
  whatIsBeingPurchased: { text: string; sourceDocTitle: string; sourceClause: string };
  purpose: { text: string; sourceDocTitle: string; sourceClause: string };
  whereItWillBeUsed: { text: string; sourceDocTitle: string; sourceClause: string };
  estimatedCostExplanation: { text: string; sourceDocTitle: string; sourceClause: string };
  expectedTimeline: { text: string; sourceDocTitle: string; sourceClause: string };
  beneficiaries: { text: string; sourceDocTitle: string; sourceClause: string };
  glossary?: TechnicalTermGlossaryItem[];
  missingInformationNotice?: string;
  generatedAt?: string;
}

export interface ProcurementParticipant {
  companyId: string;
  companyName: string;
  cnpjFormatted: string;
  cnpjNormalized: string;
  initialProposalValue: number | null;
  finalBidValue: number | null;
  rankingPosition: number | null;
  participationStatus: "Habilitada" | "Em análise documental" | "Classificada" | "Inabilitada";
  disputeResult: "Vencedora / Adjudicada" | "2ª Colocada" | "3ª Colocada" | "Disputa futura (propostas abertas)" | "Desclassificada";
}

export interface BidEvent {
  id: string;
  companyName: string;
  cnpjFormatted: string;
  value: number;
  timestamp: string;
  positionAtMoment: number;
  rankingShift: string;
  isWinningBid: boolean;
  sourceDocTitle: string;
}

export interface ProcurementVoteStats {
  totalVotes: number;
  supportCount: number;
  opposeCount: number;
  needsClarificationCount: number;
  commentsCount: number;
  lastUpdatedAt: string;
}

export interface ProcurementRecord {
  id: string;
  isDemoData: boolean; // Fase 2: false para registros oficiais sincronizados
  recordType: RecordType;
  processNumber: string;
  pncpNumber: string;
  simplifiedTitle: string;
  originalObject: string;
  secretariat: string;
  purchasingUnit: string;
  modality: string;
  category: string;
  region: string;
  publishedAt: string | null;
  sessionDate: string;
  plannedWindow?: string; // Exclusivo quando recordType === "PCA_PLANNING"
  status: ProcurementStatus;
  statusLabel: string;

  // Custos estritamente separados (Seção 6.2.C e Regra 10)
  costs: {
    isBudgetConfidential: boolean;
    confidentialityLegalBasis?: string;
    estimatedValue: number | null;
    maxAcceptableValue: number | null;
    homologatedValue: number | null;
    contractedValue: number | null;
    paidValue: number | null;
  };

  participantsCount: number | null;
  participants: ProcurementParticipant[];
  bidHistoryAvailable: boolean;
  bidHistoryLimitationNote?: string;
  bids: BidEvent[];
  aiSummary: AIPlainSummary;
  documents: OfficialDocumentRef[];
  voteStats: ProcurementVoteStats;
  sourceName: string;
  sourceUrl: string;
  lastSyncedAt: string;
}

export interface CompanyVoteHistoryPoint {
  month: string;
  recommendPct: number;
  rejectPct: number;
  neutralPct: number;
  sampleSize: number;
}

export interface CompanyComment {
  id: string;
  authorPseudonym: string;
  verifiedCitizenBadge: boolean;
  position: "RECOMMEND" | "DO_NOT_RECOMMEND" | "NO_OPINION";
  content: string;
  createdAt: string;
  moderationRuleApplied: string;
}

export interface CompanyRecord {
  id: string;
  isDemoData: boolean;
  legalName: string;
  tradeName: string;
  cnpjNormalized: string; // 14 dígitos exatos
  cnpjFormatted: string;
  sector: string;
  identifiedProcurementsCount: number;
  identifiedContractsCount: number;
  totalContractedAmount: number;
  votes: {
    totalVotes: number;
    recommendCount: number;
    rejectCount: number;
    neutralCount: number;
    recommendPct: number;
    rejectPct: number;
    neutralPct: number;
    commentsCount: number;
    evaluationPeriod: string;
    meetsMinimumSampleForLeadership: boolean; // Proteção contra distorções (Seção 8.3)
  };
  voteEvolution: CompanyVoteHistoryPoint[];
  comments: CompanyComment[];
  companyOfficialResponse?: {
    submittedAt: string;
    representativeRole: string;
    statement: string;
  };
  ceisCnepStatus: {
    hasActiveSanction: boolean;
    summary: string;
    lastCheckedAt: string;
    sourceUrl: string;
  };
  lastSyncedAt: string;
}

export interface WorkAmendment {
  id: string;
  amendmentNumber: string;
  date: string;
  type: "Prorrogação de Prazo" | "Acréscimo de Valor e Prazo" | "Reequilíbrio Financeiro";
  daysAdded: number;
  valueDelta: number;
  justification: string;
  officialDocUrl: string;
}

export interface WorkChronologyItem {
  date: string;
  title: string;
  description: string;
  physicalPctAtDate: number | null;
  sourceName: string;
}

export interface CitizenWorkReport {
  id: string;
  category:
    | "Paralisação observada no local"
    | "Ausência de trabalhadores"
    | "Divergência entre placa da obra e sistema"
    | "Questionamento sobre andamento"
    | "Problema de qualidade visível";
  summary: string;
  createdAt: string;
  moderationStatus: "Aprovado após moderação objetiva";
  hasPhotoAttachment: boolean;
}

export interface DelayedWorkRecord {
  id: string;
  isDemoData: boolean;
  officialCode: string;
  name: string;
  description: string;
  addressLocation: string;
  subprefecture: string;
  region: string;
  secretariat: string;
  companyId: string;
  companyName: string;
  companyCnpjFormatted: string;
  contractNumber: string;
  adminProcessNumber: string;

  // Cronograma (Seção 9.1 - Recorte 07/11/2021 a 07/11/2026)
  schedule: {
    plannedStartDate: string;
    actualStartDate: string | null;
    expectedCompletionYear: number;
    contractualEndDate: string;
    updatedEndDate: string;
    currentStatus: "Em execução com atraso documentado" | "Paralisada temporariamente" | "Em reprogramação contratual";
    delayMonths: number;
    officialJustification: string | null;
  };

  // Custos separados (Regra 10: Valor pago != Obra concluída)
  costs: {
    initialBudget: number;
    contractedAmount: number;
    updatedAmountAfterAmendments: number;
    committedAmount: number; // Empenhado
    paidAmount: number; // Efetivamente pago
    physicalExecutedValue: number | null;
    financialExecutionPct: number;
    physicalExecutionPct: number | null;
  };

  amendments: WorkAmendment[];
  chronology: WorkChronologyItem[];
  citizenReports: CitizenWorkReport[];
  sourceName: string;
  sourceUrl: string;
  lastSyncedAt: string;
}

export interface RiskIndicatorDetail {
  indicatorNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  indicatorName: string;
  weightPointsAwarded: number;
  maxWeightPossible: number;
  calculationCriterion: string;
  sourceName: string;
  updatedAt: string;
  evidenceDocTitle: string;
  evidenceDocUrl: string;
}

export interface AttentionContractRecord {
  id: string;
  rankPosition: 1 | 2 | 3 | 4 | 5;
  isDemoData: boolean;
  contractNumber: string;
  processNumber: string;
  simplifiedName: string;
  secretariat: string;
  companyId: string;
  companyName: string;
  companyCnpjFormatted: string;
  currentContractValue: number;
  initialEstimatedValue: number;
  totalAttentionScore: number; // Máximo 100 pontos objetivos
  documentedOccurrencesCount: number;
  primaryOccurrenceTypes: string[];
  lastRecordDate: string;
  inclusionExplanation: string;

  // Separação rigorosa exigida na Seção 10.3:
  separatedOccurrences: {
    thisContractOccurrences: { title: string; date: string; source: string; docUrl: string }[];
    otherContractsSameCompanyOccurrences: { contractRef: string; title: string; date: string; source: string }[];
    definitiveAdministrativePenalties: { penaltyType: string; date: string; scope: string; docUrl: string }[];
    controlOrganPointingsUnderAnalysis: { organ: string; processRef: string; summary: string; status: string }[];
  };

  indicatorsBreakdown: RiskIndicatorDetail[];
  officialDocuments: OfficialDocumentRef[];
  lastSyncedAt: string;
}

export interface DataSourceStatusRecord {
  code: "PNCP" | "TCMSP" | "OBRAS_ABERTAS" | "DADOS_SP" | "TRANSPARENCIA_SP" | "CEIS_CNEP";
  name: string;
  officialUrl: string;
  apiEndpointTested: string;
  refreshFrequency: string;
  lastConsultationAt: string;
  sourceLastUpdatedAt: string | null;
  recordsCount: number;
  status: "ONLINE_SYNCED" | "PARTIAL_WARNING" | "SOURCE_UNAVAILABLE";
  statusMessage: string;
}

export interface SyncLogEntry {
  id: string;
  sourceCode: string;
  startedAt: string;
  finishedAt: string;
  sourceLastUpdatedAt: string | null;
  recordsProcessed: number;
  newRecordsAdded: number;
  updatedRecordsCount: number;
  historicalRecordsPreserved: number;
  status: "SUCCESS" | "PARTIAL_WARNING" | "FAILED_FALLBACK_USED";
  details: string;
}

export interface OfficialDatabaseSnapshot {
  version: string;
  lastGlobalSyncAt: string;
  procurements: ProcurementRecord[];
  companies: CompanyRecord[];
  delayedWorks: DelayedWorkRecord[];
  attentionContracts: AttentionContractRecord[];
  dataSources: DataSourceStatusRecord[];
  syncLogs: SyncLogEntry[];
}

