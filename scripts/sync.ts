import { runOfficialDataSynchronization } from "../src/lib/integrations/official-sync";

async function main() {
  console.log("Iniciando sincronização com fontes oficiais da Prefeitura e PNCP...");
  try {
    const snapshot = await runOfficialDataSynchronization();
    console.log("Sincronização concluída com sucesso!");
    console.log(`- Licitações & PCA: ${snapshot.procurements.length}`);
    console.log(`- Empresas mapeadas por CNPJ: ${snapshot.companies.length}`);
    console.log(`- Obras com atraso/prorrogação: ${snapshot.delayedWorks.length}`);
    console.log(`- Contratações em atenção (Top 5): ${snapshot.attentionContracts.length}`);
    console.log(`- Fontes monitoradas: ${snapshot.dataSources.length}`);
  } catch (error) {
    console.error("Erro na sincronização:", error);
    process.exit(1);
  }
}

main();
