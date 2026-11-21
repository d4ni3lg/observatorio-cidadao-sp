/**
 * OBSERVATÓRIO CIDADÃO DE SÃO PAULO
 * Módulo de Segurança e Defesa em Profundidade
 * 
 * - Sanitização estrita contra XSS e Injeções
 * - Verificação de Timing-Safe para tokens criptográficos
 * - Validação e honeypots anti-bot
 * - Rate Limiting em memória por IP / Identificador
 */

import crypto from "crypto";

/**
 * Sanitiza strings removendo tags HTML, scripts e sequências perigosas
 */
export function sanitizeInput(input: unknown, maxLength = 1000): string {
  if (typeof input !== "string") return "";
  
  return input
    .replace(/<[^>]*>?/gm, "") // Remove tags HTML
    .replace(/javascript:/gi, "") // Remove pseudo-protocolo javascript
    .replace(/[<>'"&]/g, (char) => {
      switch (char) {
        case "<": return "&lt;";
        case ">": return "&gt;";
        case "'": return "&#39;";
        case '"': return "&quot;";
        case "&": return "&amp;";
        default: return char;
      }
    })
    .trim()
    .slice(0, maxLength);
}

/**
 * Comparação em tempo constante (Timing-Safe) para evitar ataques de temporização
 */
export function timingSafeStringCompare(a: string, b: string): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a, "utf-8");
  const bufB = Buffer.from(b, "utf-8");
  
  if (bufA.length !== bufB.length) {
    // Para manter tempo constante aproximado
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Validação de Honeypot contra robôs de spam e crawling malicioso
 */
export function validateHoneypot(honeypotValue: unknown): boolean {
  // Se o campo honeypot invisível foi preenchido, é um bot automático
  if (honeypotValue !== undefined && honeypotValue !== null && honeypotValue !== "") {
    return false;
  }
  return true;
}

/**
 * Limite de requisições em memória (Sliding Window Rate Limiter)
 */
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitCache = new Map<string, RateLimitRecord>();

// Limpeza periódica da memória a cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitCache.entries()) {
    if (now > record.resetAt) {
      rateLimitCache.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function checkRateLimit(
  identifier: string,
  limit = 20,
  windowMs = 60 * 1000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const existing = rateLimitCache.get(identifier);

  if (!existing || now > existing.resetAt) {
    rateLimitCache.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
  };
}
