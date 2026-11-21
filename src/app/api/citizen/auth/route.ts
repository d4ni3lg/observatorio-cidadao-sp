import { NextRequest, NextResponse } from "next/server";
import {
  cleanCPF,
  formatCPF,
  isValidCPF,
  hashCpfToPseudonymToken,
  generateCitizenPseudonym,
} from "@/lib/citizen-auth/cpf-validator";
import {
  registerCitizenSession,
  getCitizenSession,
  deleteCitizenAccount,
  getCitizenVotes,
} from "@/lib/citizen-auth/vote-store";
import { validateHoneypot, checkRateLimit } from "@/lib/security";

/**
 * Autenticação Cidadã com CPF, Pseudonimização e LGPD (Seção 7.2 e Seção 8)
 * POST: Valida CPF, gera token HMAC irreversível e salva consentimento LGPD
 * GET: Consulta estado da sessão do cidadão e seus votos
 * DELETE: Exclusão total e anonimização de dados conforme Art. 18 da LGPD
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rawCpf, residentConfirmed, acceptTerms, _hp } = body;

    // Defesa anti-bot por Honeypot
    if (!validateHoneypot(_hp)) {
      return NextResponse.json({ error: "Requisição rejeitada." }, { status: 400 });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    // Rate Limiting estrito de validações por IP (máximo 10 tentativas por minuto para impedir brute-force de CPFs)
    const rate = checkRateLimit(`auth:cpf:${ip}`, 10, 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          error:
            "Muitas tentativas de validação consecutivas. Por motivos de segurança, aguarde 1 minuto.",
        },
        { status: 429 }
      );
    }

    if (!acceptTerms) {
      return NextResponse.json(
        {
          error:
            "É obrigatório o consentimento expresso com os Termos de Uso e Política de Privacidade (Art. 7º, I da LGPD).",
        },
        { status: 400 }
      );
    }

    const clean = cleanCPF(rawCpf);

    if (!clean || clean.length !== 11) {
      return NextResponse.json(
        { error: "O CPF deve conter exatamente 11 dígitos numéricos." },
        { status: 400 }
      );
    }

    if (!isValidCPF(clean)) {
      return NextResponse.json(
        {
          error:
            "CPF inválido. Verifique os dígitos informados conforme o algoritmo oficial da Receita Federal.",
        },
        { status: 422 }
      );
    }

    // Geração do token criptográfico HMAC irreversível
    const token = hashCpfToPseudonymToken(clean);
    const pseudonym = generateCitizenPseudonym(token);
    const maskedCpf = `${clean.slice(0, 3)}.***.***-${clean.slice(9, 11)}`;

    const session = registerCitizenSession(
      token,
      pseudonym,
      maskedCpf,
      Boolean(residentConfirmed)
    );

    return NextResponse.json({
      success: true,
      message: "Identidade verificada com sucesso. Token pseudonimizado ativo.",
      citizenToken: session.citizenToken,
      pseudonym: session.pseudonym,
      maskedCpf: session.maskedCpf,
      consentVersion: session.consentVersion,
      consentDate: session.consentDate,
      residenceAffirmed: session.residenceAffirmed,
      lgpdNotice:
        "Seu CPF nunca é armazenado em texto legível. Apenas o hash irreversível é utilizado para controle de unicidade de voto.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao processar verificação de identidade.", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Parâmetro 'token' é obrigatório." },
      { status: 400 }
    );
  }

  const session = getCitizenSession(token);
  if (!session) {
    return NextResponse.json(
      { error: "Sessão não localizada ou expirada." },
      { status: 404 }
    );
  }

  const votes = getCitizenVotes(token);

  return NextResponse.json({
    session,
    votes,
  });
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Token de identificação é obrigatório para exclusão." },
        { status: 400 }
      );
    }

    deleteCitizenAccount(token);

    return NextResponse.json({
      success: true,
      message:
        "Conta de participação e manifestações associadas foram permanentemente excluídas e anonimizadas, em cumprimento ao Artigo 18, inciso VI da Lei Geral de Proteção de Dados (Lei 13.709/2018).",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao processar exclusão de dados.", details: error.message },
      { status: 500 }
    );
  }
}
