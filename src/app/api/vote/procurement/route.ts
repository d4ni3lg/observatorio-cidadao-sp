import { NextRequest, NextResponse } from "next/server";
import {
  getCitizenSession,
  castProcurementVote,
  getProcurementVoteStats,
} from "@/lib/citizen-auth/vote-store";

/**
 * Votação Cidadã em Contratações e Licitações (Seção 7.3)
 * POST: Registra ou atualiza o voto do cidadão (1 CPF = 1 voto)
 * GET: Retorna estatísticas de votação da licitação
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { citizenToken, procurementId, voteType, justification } = body;

    if (!citizenToken) {
      return NextResponse.json(
        {
          error:
            "É necessária a verificação de identidade por CPF para votar (Seção 7.1). Acesse a aba 'Conta' para validar.",
        },
        { status: 401 }
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

    const vote = castProcurementVote(
      citizenToken,
      session.pseudonym,
      procurementId,
      voteType,
      justification
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
