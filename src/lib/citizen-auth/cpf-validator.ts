/**
 * OBSERVATÓRIO CIDADÃO DE SÃO PAULO
 * Validação Matemática de CPF, Pseudonimização Irreversível e LGPD (Seção 7.2 e Seção 8)
 *
 * Em conformidade estrita com a Lei Geral de Proteção de Dados (Lei 13.709/2018):
 * - O CPF em texto aberto NUNCA é persistido em banco de dados ou logs.
 * - O hash HMAC-SHA256 irreversível com salt é utilizado para garantir que 1 CPF = 1 voto.
 * - Pseudônimos cívicos públicos são gerados aleatoriamente a partir do token.
 */

import crypto from "crypto";

// Salt de aplicação para pseudonimização do CPF (em produção configurado via env)
const OBSERVATORY_HMAC_SALT =
  process.env.OBSERVATORY_CPF_SALT ||
  "sp-observatorio-cidadao-hmac-salt-secret-2026-lgpd";

/**
 * Limpa qualquer caractere não numérico
 */
export function cleanCPF(raw: string): string {
  return (raw || "").replace(/\D/g, "");
}

/**
 * Formata CPF para o padrão 000.000.000-00
 */
export function formatCPF(clean: string): string {
  const digits = clean.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

/**
 * Validação algorítmica matemática dos 2 dígitos verificadores de CPF (módulo 11)
 * Rejeita explicitamente sequências de 11 dígitos iguais.
 */
export function isValidCPF(raw: string): boolean {
  const cpf = cleanCPF(raw);

  if (cpf.length !== 11) return false;

  // Rejeita sequências conhecidas de dígitos repetidos (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // Cálculo do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i), 10) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  let d1 = rev >= 10 ? 0 : rev;
  if (d1 !== parseInt(cpf.charAt(9), 10)) return false;

  // Cálculo do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i), 10) * (11 - i);
  }
  rev = 11 - (sum % 11);
  let d2 = rev >= 10 ? 0 : rev;
  if (d2 !== parseInt(cpf.charAt(10), 10)) return false;

  return true;
}

/**
 * Gera um token irreversível HMAC-SHA256 para o CPF
 * Este token é o único dado persistido, impossibilitando a recuperação reversa do CPF.
 */
export function hashCpfToPseudonymToken(rawCpf: string): string {
  const clean = cleanCPF(rawCpf);
  return crypto
    .createHmac("sha256", OBSERVATORY_HMAC_SALT)
    .update(clean)
    .digest("hex");
}

/**
 * Gera um pseudônimo público legível para o cidadão sem expor seu nome civil ou CPF
 * Exemplo: "Cidadão Paulistano #A3F9"
 */
export function generateCitizenPseudonym(token: string): string {
  const shortId = token.slice(0, 4).toUpperCase();
  return `Cidadão Paulistano #${shortId}`;
}
