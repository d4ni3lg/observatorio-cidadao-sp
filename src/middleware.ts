import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Padrões de ataque comuns em URLs e parâmetros (Path Traversal, SQLi, XSS)
const SUSPICIOUS_PATTERNS = [
  /\.\.\//, // ../
  /\.\.\\/, // ..\
  /<script>/i,
  /union\s+select/i,
  /exec\s*\(/i,
  /etc\/passwd/i,
  /windows[\\/]system32/i,
];

// Map em memória simples para Rate Limit na borda (Edge / Middleware)
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  // 1. Bloqueio de injeções e ataques óbvios na URL
  const fullPathAndQuery = `${pathname}${search}`;
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(fullPathAndQuery)) {
      return new NextResponse(
        JSON.stringify({ error: "Requisição rejeitada por motivos de segurança." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // 2. Proteção CSRF básica em rotas de API com mutação (POST / PUT / DELETE)
  if (pathname.startsWith("/api/")) {
    const method = request.method.toUpperCase();
    if (["POST", "PUT", "DELETE"].includes(method)) {
      const origin = request.headers.get("origin");
      const host = request.headers.get("host");

      if (origin && host) {
        const originUrl = new URL(origin);
        // Permite se a origem corresponder ao host ou se estiver em localhost / vercel preview
        const isSameHost = originUrl.host === host;
        const isAllowedPreview =
          originUrl.hostname.endsWith(".vercel.app") ||
          originUrl.hostname === "localhost" ||
          originUrl.hostname === "127.0.0.1";

        if (!isSameHost && !isAllowedPreview) {
          return new NextResponse(
            JSON.stringify({ error: "Origem da requisição não autorizada (CSRF Protection)." }),
            { status: 403, headers: { "Content-Type": "application/json" } }
          );
        }
      }
    }

    // 3. Rate Limiting em rotas de voto e autenticação cidadã
    if (pathname.startsWith("/api/vote/") || pathname.startsWith("/api/citizen/")) {
      const now = Date.now();
      const windowMs = 60 * 1000; // 1 minuto
      const maxRequests = 40; // Max 40 req/min por IP

      const record = ipRequestCounts.get(ip);
      if (!record || now > record.resetTime) {
        ipRequestCounts.set(ip, { count: 1, resetTime: now + windowMs });
      } else {
        if (record.count >= maxRequests) {
          return new NextResponse(
            JSON.stringify({
              error: "Limite de requisições excedido. Por favor, aguarde alguns instantes.",
              retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000),
            }),
            {
              status: 429,
              headers: {
                "Content-Type": "application/json",
                "Retry-After": Math.ceil((record.resetTime - now) / 1000).toString(),
              },
            }
          );
        }
        record.count += 1;
      }
    }
  }

  // 4. Injeção de Cabeçalhos de Segurança na Resposta
  const response = NextResponse.next();

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=()"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Aplica em todas as rotas exceto arquivos estáticos (_next/static, favicon, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
