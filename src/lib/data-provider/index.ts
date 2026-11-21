import {
  AttentionContractRecord,
  CompanyRecord,
  DelayedWorkRecord,
  OfficialDatabaseSnapshot,
  ProcurementRecord,
} from "@/lib/types/observatory";
import {
  DEMO_ATTENTION_CONTRACTS,
  DEMO_COMPANIES,
  DEMO_DELAYED_WORKS,
  DEMO_PROCUREMENTS,
} from "@/lib/demo-data";
import syncedDataJson from "../../../data/official-sync-db.json";

const snapshot = syncedDataJson as unknown as OfficialDatabaseSnapshot;

export function getOfficialSnapshot(): OfficialDatabaseSnapshot | null {
  return snapshot || null;
}

export function getProcurements(): ProcurementRecord[] {
  if (snapshot && snapshot.procurements && snapshot.procurements.length > 0) {
    return snapshot.procurements;
  }
  return DEMO_PROCUREMENTS;
}

export function getCompanies(): CompanyRecord[] {
  if (snapshot && snapshot.companies && snapshot.companies.length > 0) {
    return snapshot.companies;
  }
  return DEMO_COMPANIES;
}

export function getDelayedWorks(): DelayedWorkRecord[] {
  if (snapshot && snapshot.delayedWorks && snapshot.delayedWorks.length > 0) {
    return snapshot.delayedWorks;
  }
  return DEMO_DELAYED_WORKS;
}

export function getAttentionContracts(): AttentionContractRecord[] {
  if (snapshot && snapshot.attentionContracts && snapshot.attentionContracts.length > 0) {
    return snapshot.attentionContracts;
  }
  return DEMO_ATTENTION_CONTRACTS;
}

export function getDataSources() {
  if (snapshot && snapshot.dataSources && snapshot.dataSources.length > 0) {
    return snapshot.dataSources;
  }
  return null;
}

export function getCalculatedLiveIndicators() {
  const procurements = getProcurements();
  const companies = getCompanies();
  const delayedWorks = getDelayedWorks();
  const attentionContracts = getAttentionContracts();

  const publishedFutureProcurements = procurements.filter(
    (p) => p.recordType === "PUBLISHED_BID"
  );
  const pcaPlannedProcurements = procurements.filter(
    (p) => p.recordType === "PCA_PLANNING"
  );

  const totalEstimatedPublished = publishedFutureProcurements.reduce(
    (acc, item) => acc + (item.costs.estimatedValue ?? 0),
    0
  );
  const confidentialCount = publishedFutureProcurements.filter(
    (p) => p.costs.isBudgetConfidential
  ).length;

  const totalContractedInMonitoredWorks = delayedWorks.reduce(
    (acc, w) => acc + w.costs.updatedAmountAfterAmendments,
    0
  );

  const isLive = Boolean(snapshot && snapshot.procurements?.length > 0);

  return {
    isLive,
    futurePublishedBidsCount: publishedFutureProcurements.length,
    pcaPlannedCount: pcaPlannedProcurements.length,
    totalEstimatedFuturePublishedValue: totalEstimatedPublished,
    confidentialBudgetsExcludedCount: confidentialCount,
    identifiedParticipatingCompaniesCount: companies.length,
    delayedWorksDocumentedCount: delayedWorks.length,
    totalContractedInDelayedWorksValue: totalContractedInMonitoredWorks,
    contractsWithOccurrencesCount: attentionContracts.length,
    lastCalculationTimestamp: snapshot?.lastGlobalSyncAt
      ? new Date(snapshot.lastGlobalSyncAt).toLocaleString("pt-BR")
      : "Base Demonstrativa Fase 1",
  };
}
