"use client";

/**
 * OBSERVATÓRIO CIDADÃO DE SÃO PAULO
 * Gerenciamento de Sessão Cidadã no Navegador (Cliente)
 */

export interface StoredCitizenSession {
  citizenToken: string;
  pseudonym: string;
  maskedCpf: string;
  consentVersion: string;
  consentDate: string;
  residenceAffirmed: boolean;
}

const STORAGE_KEY = "observatorio_sp_citizen_session";

export function getClientCitizenSession(): StoredCitizenSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveClientCitizenSession(session: StoredCitizenSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (e) {
    console.error("Falha ao salvar sessão cidadã no localStorage:", e);
  }
}

export function clearClientCitizenSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Falha ao remover sessão cidadã:", e);
  }
}
