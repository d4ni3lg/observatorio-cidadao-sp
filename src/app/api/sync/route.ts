import { NextResponse } from "next/server";
import { runOfficialDataSynchronization, readOfficialDatabaseSnapshot } from "@/lib/integrations/official-sync";

export async function GET() {
  const snapshot = readOfficialDatabaseSnapshot();
  return NextResponse.json({
    status: "ok",
    hasSnapshot: Boolean(snapshot),
    lastSync: snapshot?.lastGlobalSyncAt || null,
    procurementsCount: snapshot?.procurements.length || 0,
    companiesCount: snapshot?.companies.length || 0,
    delayedWorksCount: snapshot?.delayedWorks.length || 0,
    attentionContractsCount: snapshot?.attentionContracts.length || 0,
    dataSources: snapshot?.dataSources || [],
    syncLogs: snapshot?.syncLogs || [],
  });
}

export async function POST() {
  try {
    const updatedSnapshot = await runOfficialDataSynchronization();
    return NextResponse.json({
      status: "success",
      message: "Sincronização com bases oficiais executada com sucesso.",
      lastSync: updatedSnapshot.lastGlobalSyncAt,
      procurementsCount: updatedSnapshot.procurements.length,
      companiesCount: updatedSnapshot.companies.length,
      delayedWorksCount: updatedSnapshot.delayedWorks.length,
      attentionContractsCount: updatedSnapshot.attentionContracts.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error?.message || "Erro durante a sincronização oficial.",
      },
      { status: 500 }
    );
  }
}
