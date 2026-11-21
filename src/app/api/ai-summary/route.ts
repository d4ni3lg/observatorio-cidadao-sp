import { NextRequest, NextResponse } from "next/server";
import { getProcurements } from "@/lib/data-provider";
import { generatePlainLanguageSummary } from "@/lib/ai-engine/summary-generator";

/**
 * Endpoint de Tradução em Linguagem Simples com IA (Seção 12)
 * GET /api/ai-summary?id={procurementId}
 * POST /api/ai-summary (com body contendo metadados da licitação)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Parâmetro 'id' da contratação é obrigatório." },
      { status: 400 }
    );
  }

  const procurements = getProcurements();
  const procurement = procurements.find((p) => p.id === id);

  if (!procurement) {
    return NextResponse.json(
      { error: "Contratação não localizada no observatório." },
      { status: 404 }
    );
  }

  // Gera ou enriquece o resumo com o motor de regras da Seção 12
  const enrichedSummary = generatePlainLanguageSummary(procurement);

  return NextResponse.json({
    procurementId: procurement.id,
    processNumber: procurement.processNumber,
    aiSummary: enrichedSummary,
    generatedAt: new Date().toISOString(),
    governanceNotice:
      "Resumo gerado em cumprimento estrito às 10 Regras Obrigatórias da Seção 12.1. Nenhuma informação ausente foi inventada e todas as declarações referenciam documentos oficiais.",
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const summary = generatePlainLanguageSummary(body);

    return NextResponse.json({
      aiSummary: summary,
      generatedAt: new Date().toISOString(),
      governanceNotice:
        "Resumo gerado em cumprimento estrito às 10 Regras Obrigatórias da Seção 12.1.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao processar resumo com IA.", details: error.message },
      { status: 500 }
    );
  }
}
