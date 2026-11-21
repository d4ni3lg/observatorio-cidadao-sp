import { NextRequest, NextResponse } from "next/server";
import {
  timingSafeStringCompare,
  validateHoneypot,
  checkRateLimit,
  createAdminSessionToken,
  verifyAdminSessionToken,
} from "@/lib/security";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Farol@SP2026!";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, _hp } = body;

    // 1. Defesa anti-bot por Honeypot
    if (!validateHoneypot(_hp)) {
      return NextResponse.json({ error: "Requisição rejeitada." }, { status: 400 });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    // 2. Rate Limiting estrito de tentativas de login (5 tentativas por minuto por IP)
    const rate = checkRateLimit(`login:admin:${ip}`, 5, 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          error:
            "Muitas tentativas de login incorretas. Por segurança, aguarde 1 minuto para tentar novamente.",
        },
        { status: 429 }
      );
    }

    // 3. Validação de Usuário
    const isUserValid =
      username &&
      (username.toLowerCase().trim() === ADMIN_USERNAME.toLowerCase() ||
        username.toLowerCase().trim() === "admin@farolcidadao.sp.gov.br");

    // 4. Validação de Senha em Tempo Constante (Timing-Safe)
    const isPasswordValid = timingSafeStringCompare(password || "", ADMIN_PASSWORD);

    if (!isUserValid || !isPasswordValid) {
      return NextResponse.json(
        {
          error: "Credenciais administrativas incorretas. Verifique o usuário e a senha.",
        },
        { status: 401 }
      );
    }

    // 5. Sucesso: Gera token de sessão assinado
    const token = createAdminSessionToken();

    const response = NextResponse.json({
      success: true,
      message: "Autenticação administrativa realizada com sucesso.",
      user: {
        username: "admin",
        name: "Controlador Cívico Master",
        role: "ADMINISTRADOR_AUDITOR",
      },
      token,
    });

    // Grava cookie HttpOnly seguro
    response.cookies.set({
      name: "farol_admin_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 8 * 60 * 60, // 8 horas
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Erro interno no servidor de autenticação." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const token =
    request.cookies.get("farol_admin_session")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  const isValid = verifyAdminSessionToken(token);

  if (!isValid) {
    return NextResponse.json(
      { authenticated: false, error: "Sessão expirada ou não autenticada." },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      username: "admin",
      name: "Controlador Cívico Master",
      role: "ADMINISTRADOR_AUDITOR",
    },
  });
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: "Sessão administrativa encerrada.",
  });

  response.cookies.set({
    name: "farol_admin_session",
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  return response;
}
