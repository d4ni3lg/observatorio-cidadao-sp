import { NextRequest, NextResponse } from "next/server";
import {
  getCitizenSession,
  castProcurementVote,
  getProcurementVoteStats,
} from "@/lib/citizen-auth/vote-store";
import { sanitizeInput, validateHoneypot, checkRateLimit } from "@/lib/security";

/**
 * Votação Cidadã em Contratações e Licitações (Seção 7.3)
 * POST: Registra ou atualiza o voto do cidadão (1 CPF = 1 voto)
 * GET: Retorna estatísticas de votação da licitação
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { citizenToken, procurementId, voteType, justification, _hp } = body;

    // Defesa anti-bot por Honeypot
    if (!validateHoneypot(_hp)) {
      return NextResponse.json({ error: "Requisição rejeitada." }, { status: 400 });
    }

    if (!citizenToken) {
      return NextResponse.json(
        {
          error:
            "É necessária a verificação de identidade por CPF para votar (Seção 7.1). Acesse a aba 'Conta' para validar.",
        },
        { status: 401 }
      );
    }

    // Rate limiting por token do cidadão
    const rate = checkRateLimit(`vote:proc:${citizenToken}`, 15, 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Limite de votos por minuto excedido. Aguarde alguns instantes." },
        { status: 429 }
      );
    }

    const session = getCitizenSession(citizenToken);
    if (!session) {
      return NextResponse.json(
        {
          error:
            "Token de verificação inválido ou expirado. Por favor, revalide seu CPF na área de conta.",
        },
        { status: 403 }
      );
    }

    if (!procurementId) {
      return NextResponse.json(
        { error: "Identificador da contratação é obrigatório." },
        { status: 400 }
      );
    }

    const validTypes = ["SUPPORT", "OPPOSE", "NEEDS_CLARIFICATION"];
    if (!validTypes.includes(voteType)) {
      return NextResponse.json(
        {
          error:
            "Tipo de voto inválido. Opções válidas: 'SUPPORT', 'OPPOSE' ou 'NEEDS_CLARIFICATION'.",
        },
        { status: 400 }
      );
    }

    // Sanitiza justificativa textual contra injeção e XSS
    const sanitizedJustification = justification ? sanitizeInput(justification, 500) : undefined;

    const vote = castProcurementVote(
      citizenToken,
      session.pseudonym,
      procurementId,
      voteType,
      sanitizedJustification
    );

    const updatedStats = getProcurementVoteStats(procurementId);

    return NextResponse.json({
      success: true,
      message:
        "Manifestação registrada com sucesso! Conforme a Seção 7.3, você pode alterar sua posição a qualquer momento.",
      vote,
      stats: updatedStats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao registrar voto na licitação.", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const procurementId = searchParams.get("procurementId");

  if (!procurementId) {
    return NextResponse.json(
      { error: "Parâmetro 'procurementId' é obrigatório." },
      { status: 400 }
    );
  }

  const stats = getProcurementVoteStats(procurementId);
  return NextResponse.json(stats);
}
