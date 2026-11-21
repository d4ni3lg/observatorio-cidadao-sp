import { NextRequest, NextResponse } from "next/server";
import {
  getCitizenSession,
  castCompanyVote,
  getCompanyVoteStats,
} from "@/lib/citizen-auth/vote-store";

/**
 * Votação Cidadã em Empresas Fornecedoras (Seção 7.1)
 * POST: Registra ou atualiza o voto do cidadão (1 CPF = 1 voto)
 * GET: Retorna estatísticas de votação da empresa
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { citizenToken, companyCnpj, voteType, justification } = body;

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

    if (!companyCnpj) {
      return NextResponse.json(
        { error: "CNPJ da empresa é obrigatório." },
        { status: 400 }
      );
    }

    const validTypes = ["RECOMMEND", "DO_NOT_RECOMMEND", "NO_OPINION"];
    if (!validTypes.includes(voteType)) {
      return NextResponse.json(
        {
          error:
            "Tipo de voto inválido. Opções válidas: 'RECOMMEND', 'DO_NOT_RECOMMEND' ou 'NO_OPINION'.",
        },
        { status: 400 }
      );
    }

    // Registra ou atualiza o voto
    const vote = castCompanyVote(
      citizenToken,
      session.pseudonym,
      companyCnpj,
      voteType,
      justification
    );

    const updatedStats = getCompanyVoteStats(companyCnpj);

    return NextResponse.json({
      success: true,
      message:
        "Voto registrado com sucesso! Conforme a Seção 7.1, você pode alterar seu voto a qualquer momento.",
      vote,
      stats: updatedStats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao registrar voto na empresa.", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const companyCnpj = searchParams.get("companyCnpj");

  if (!companyCnpj) {
    return NextResponse.json(
      { error: "Parâmetro 'companyCnpj' é obrigatório." },
      { status: 400 }
    );
  }

  const stats = getCompanyVoteStats(companyCnpj);
  return NextResponse.json(stats);
}
