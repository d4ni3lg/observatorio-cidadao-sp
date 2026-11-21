/**
 * OBSERVATÓRIO CIDADÃO DE SÃO PAULO
 * Armazenamento e Cômputo de Votos Cidadãos (Seção 7 e Seção 8 - LGPD)
 *
 * Garante:
 * 1. Unicidade de voto (1 CPF = 1 voto por empresa ou contratação).
 * 2. Cidadão pode alterar seu voto a qualquer momento, substituindo o anterior sem duplicar contagem.
 * 3. Justificativas opcionais públicas atreladas ao pseudônimo cívico.
 * 4. Exclusão e revogação sob demanda (Art. 18 da LGPD).
 */

import fs from "fs";
import path from "path";

export interface CompanyVoteRecord {
  citizenToken: string;
  pseudonym: string;
  companyCnpj: string;
  voteType: "RECOMMEND" | "DO_NOT_RECOMMEND" | "NO_OPINION";
  justification?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProcurementVoteRecord {
  citizenToken: string;
  pseudonym: string;
  procurementId: string;
  voteType: "SUPPORT" | "OPPOSE" | "NEEDS_CLARIFICATION";
  justification?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CitizenSession {
  citizenToken: string;
  pseudonym: string;
  consentGiven: boolean;
  consentDate: string;
  consentVersion: string;
  maskedCpf: string; // Ex: "123.***.***-45"
  residenceAffirmed: boolean;
  createdAt: string;
}

interface VoteStorageData {
  sessions: Record<string, CitizenSession>;
  companyVotes: Record<string, CompanyVoteRecord>; // key: `${companyCnpj}_${citizenToken}`
  procurementVotes: Record<string, ProcurementVoteRecord>; // key: `${procurementId}_${citizenToken}`
}

const STORAGE_FILE = path.join(process.cwd(), "data", "citizen-votes.json");

function loadStore(): VoteStorageData {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const raw = fs.readFileSync(STORAGE_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Erro ao ler citizen-votes.json:", e);
  }
  return {
    sessions: {},
    companyVotes: {},
    procurementVotes: {},
  };
}

function saveStore(data: VoteStorageData): void {
  try {
    const dir = path.dirname(STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Erro ao salvar citizen-votes.json:", e);
  }
}

// ============================================================================
// GESTÃO DE SESSÃO E CONSENTIMENTO LGPD
// ============================================================================

export function registerCitizenSession(
  citizenToken: string,
  pseudonym: string,
  maskedCpf: string,
  residenceAffirmed: boolean
): CitizenSession {
  const store = loadStore();
  const session: CitizenSession = {
    citizenToken,
    pseudonym,
    consentGiven: true,
    consentDate: new Date().toISOString(),
    consentVersion: "LGPD-v1.0-NOV2026",
    maskedCpf,
    residenceAffirmed,
    createdAt: store.sessions[citizenToken]?.createdAt || new Date().toISOString(),
  };

  store.sessions[citizenToken] = session;
  saveStore(store);
  return session;
}

export function getCitizenSession(citizenToken: string): CitizenSession | null {
  const store = loadStore();
  return store.sessions[citizenToken] || null;
}

export function deleteCitizenAccount(citizenToken: string): boolean {
  const store = loadStore();
  delete store.sessions[citizenToken];

  // Remove todos os votos do cidadão (Art. 18 LGPD - Direito à eliminação)
  for (const key of Object.keys(store.companyVotes)) {
    if (store.companyVotes[key].citizenToken === citizenToken) {
      delete store.companyVotes[key];
    }
  }

  for (const key of Object.keys(store.procurementVotes)) {
    if (store.procurementVotes[key].citizenToken === citizenToken) {
      delete store.procurementVotes[key];
    }
  }

  saveStore(store);
  return true;
}

// ============================================================================
// VOTOS EM EMPRESAS (Seção 7.1)
// ============================================================================

export function castCompanyVote(
  citizenToken: string,
  pseudonym: string,
  companyCnpj: string,
  voteType: "RECOMMEND" | "DO_NOT_RECOMMEND" | "NO_OPINION",
  justification?: string
): CompanyVoteRecord {
  const store = loadStore();
  const cleanCnpj = companyCnpj.replace(/\D/g, "");
  const key = `${cleanCnpj}_${citizenToken}`;
  const now = new Date().toISOString();

  const existing = store.companyVotes[key];

  const vote: CompanyVoteRecord = {
    citizenToken,
    pseudonym,
    companyCnpj: cleanCnpj,
    voteType,
    justification: justification?.trim() || undefined,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  store.companyVotes[key] = vote;
  saveStore(store);
  return vote;
}

export function getCompanyVoteStats(
  companyCnpj: string,
  baselineStats?: {
    totalVotes: number;
    recommendCount: number;
    doNotRecommendCount: number;
    noOpinionCount: number;
  }
) {
  const store = loadStore();
  const cleanCnpj = companyCnpj.replace(/\D/g, "");

  const liveVotes = Object.values(store.companyVotes).filter(
    (v) => v.companyCnpj === cleanCnpj
  );

  let rec = baselineStats?.recommendCount || 0;
  let noRec = baselineStats?.doNotRecommendCount || 0;
  let noOp = baselineStats?.noOpinionCount || 0;

  for (const vote of liveVotes) {
    if (vote.voteType === "RECOMMEND") rec++;
    else if (vote.voteType === "DO_NOT_RECOMMEND") noRec++;
    else noOp++;
  }

  const total = rec + noRec + noOp;
  const recPct = total > 0 ? Math.round((rec / total) * 100) : 0;
  const noRecPct = total > 0 ? Math.round((noRec / total) * 100) : 0;
  const noOpPct = total > 0 ? 100 - recPct - noRecPct : 0;

  const publicComments = liveVotes
    .filter((v) => v.justification && v.justification.length > 0)
    .map((v, idx) => ({
      id: `live-comm-${idx}`,
      authorPseudonym: v.pseudonym,
      verifiedCitizenBadge: true,
      position: v.voteType,
      content: v.justification!,
      createdAt: v.updatedAt,
      moderationRuleApplied: "Conformidade Cidadã (Seção 7.2)",
    }));

  return {
    totalVotes: total,
    recommendCount: rec,
    doNotRecommendCount: noRec,
    noOpinionCount: noOp,
    recommendPct: recPct,
    doNotRecommendPct: noRecPct,
    noOpinionPct: noOpPct,
    liveVotesCount: liveVotes.length,
    publicComments,
  };
}

// ============================================================================
// VOTOS EM LICITAÇÕES (Seção 7.3)
// ============================================================================

export function castProcurementVote(
  citizenToken: string,
  pseudonym: string,
  procurementId: string,
  voteType: "SUPPORT" | "OPPOSE" | "NEEDS_CLARIFICATION",
  justification?: string
): ProcurementVoteRecord {
  const store = loadStore();
  const key = `${procurementId}_${citizenToken}`;
  const now = new Date().toISOString();

  const existing = store.procurementVotes[key];

  const vote: ProcurementVoteRecord = {
    citizenToken,
    pseudonym,
    procurementId,
    voteType,
    justification: justification?.trim() || undefined,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  store.procurementVotes[key] = vote;
  saveStore(store);
  return vote;
}

export function getProcurementVoteStats(
  procurementId: string,
  baselineStats?: {
    totalVotes: number;
    supportCount: number;
    opposeCount: number;
    needsClarificationCount: number;
  }
) {
  const store = loadStore();
  const liveVotes = Object.values(store.procurementVotes).filter(
    (v) => v.procurementId === procurementId
  );

  let sup = baselineStats?.supportCount || 0;
  let opp = baselineStats?.opposeCount || 0;
  let cla = baselineStats?.needsClarificationCount || 0;

  for (const vote of liveVotes) {
    if (vote.voteType === "SUPPORT") sup++;
    else if (vote.voteType === "OPPOSE") opp++;
    else cla++;
  }

  const total = sup + opp + cla;
  const supportPct = total > 0 ? Math.round((sup / total) * 100) : 0;
  const opposePct = total > 0 ? Math.round((opp / total) * 100) : 0;
  const clarifyPct = total > 0 ? 100 - supportPct - opposePct : 0;

  const publicJustifications = liveVotes
    .filter((v) => v.justification && v.justification.length > 0)
    .map((v) => ({
      authorPseudonym: v.pseudonym,
      voteType: v.voteType,
      justification: v.justification!,
      date: v.updatedAt,
    }));

  return {
    totalVotes: total,
    supportCount: sup,
    opposeCount: opp,
    needsClarificationCount: cla,
    supportPct,
    opposePct,
    clarifyPct,
    liveVotesCount: liveVotes.length,
    publicJustifications,
  };
}

export function getCitizenVotes(citizenToken: string) {
  const store = loadStore();
  const companies = Object.values(store.companyVotes).filter(
    (v) => v.citizenToken === citizenToken
  );
  const procurements = Object.values(store.procurementVotes).filter(
    (v) => v.citizenToken === citizenToken
  );

  return {
    companies,
    procurements,
  };
}
