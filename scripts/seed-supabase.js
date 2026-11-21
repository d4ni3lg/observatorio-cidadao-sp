/**
 * OBSERVATÓRIO CIDADÃO DE SÃO PAULO
 * Script de Ingestão e Migração dos Dados Oficiais para o Supabase
 *
 * Transfere automaticamente todas as entidades sincronizadas:
 * - 6 Fontes Oficiais de Dados
 * - 92 Empresas Fornecedoras Reais (CNPJ normalizado de 14 dígitos)
 * - 15 Contratações Públicas (Licitações Abertas e PCA 2027)
 * - 20 Obras Públicas com Atraso Documentado e Balanço Físico vs. Financeiro
 * - 5 Contratos com Indicadores Objetivos de Atenção
 */

const fs = require("fs");
const path = require("path");

function getEnvConfig() {
  const envPath = path.join(process.cwd(), ".env.local");
  const config = {
    SUPABASE_URL:
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_KEY:
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("SUPABASE_URL=")) {
        config.SUPABASE_URL = trimmed.replace("SUPABASE_URL=", "").trim();
      }
      if (trimmed.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) {
        config.SUPABASE_URL = trimmed.replace("NEXT_PUBLIC_SUPABASE_URL=", "").trim();
      }
      if (trimmed.startsWith("SUPABASE_SERVICE_ROLE_KEY=")) {
        config.SUPABASE_KEY = trimmed.replace("SUPABASE_SERVICE_ROLE_KEY=", "").trim();
      }
      if (!config.SUPABASE_KEY && trimmed.startsWith("SUPABASE_KEY=")) {
        config.SUPABASE_KEY = trimmed.replace("SUPABASE_KEY=", "").trim();
      }
      if (!config.SUPABASE_KEY && trimmed.startsWith("NEXT_PUBLIC_SUPABASE_ANON_KEY=")) {
        config.SUPABASE_KEY = trimmed.replace("NEXT_PUBLIC_SUPABASE_ANON_KEY=", "").trim();
      }
    }
  }

  return config;
}

async function supabaseInsert(table, rows) {
  const { SUPABASE_URL, SUPABASE_KEY } = getEnvConfig();
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error(
      "SUPABASE_URL e SUPABASE_KEY não configuradas. Salve-as em .env.local para prosseguir."
    );
  }

  const endpoint = `${SUPABASE_URL}/rest/v1/${table}`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify(rows),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Erro ao inserir na tabela '${table}' [${res.status}]: ${errText}`);
  }

  return true;
}

async function seedSupabase() {
  const { SUPABASE_URL } = getEnvConfig();
  console.log(`\n======================================================`);
  console.log(`MIGRAÇÃO DE DADOS OFICIAIS PARA O SUPABASE`);
  console.log(`Destino: ${SUPABASE_URL}`);
  console.log(`======================================================\n`);

  const snapshotPath = path.join(process.cwd(), "data", "official-sync-db.json");
  if (!fs.existsSync(snapshotPath)) {
    throw new Error("Arquivo 'data/official-sync-db.json' não encontrado.");
  }

  const db = JSON.parse(fs.readFileSync(snapshotPath, "utf-8"));

  // 1. Data Sources
  if (db.dataSources && db.dataSources.length > 0) {
    console.log(`→ Inserindo ${db.dataSources.length} Fontes de Dados Oficiais...`);
    const dsRows = db.dataSources.map((s) => ({
      id: s.id || `src-${s.code.toLowerCase()}`,
      code: s.code,
      name: s.name,
      official_url: s.officialUrl,
      api_documentation_url: s.apiEndpointTested || null,
      refresh_frequency: s.refreshFrequency,
      last_successful_sync:
        s.lastSuccessfulSyncAt || s.lastConsultationAt || new Date().toISOString(),
      current_status: s.status,
    }));
    await supabaseInsert("data_sources", dsRows);
    console.log(`✓ data_sources migrado com sucesso.`);
  }

  // 2. Companies (92 empresas)
  if (db.companies && db.companies.length > 0) {
    console.log(`→ Inserindo ${db.companies.length} Empresas Fornecedoras...`);
    const compRows = db.companies.map((c) => ({
      id: c.id,
      cnpj_normalized: c.cnpjNormalized,
      cnpj_formatted: c.cnpjFormatted,
      legal_name: c.legalName,
      trade_name: c.tradeName || null,
      registration_status:
        c.registrationStatus ||
        (c.ceisCnepStatus && c.ceisCnepStatus.hasActiveSanction ? "SANCIONADA" : "REGULAR"),
      identified_procurements_count: c.identifiedProcurementsCount || 0,
      identified_contracts_count: c.identifiedContractsCount || 0,
      total_contracted_amount: c.totalContractedAmount || 0,
      company_public_statement: c.companyPublicStatement || null,
      is_demo_data: Boolean(c.isDemoData),
      last_synced_at: c.lastSyncedAt || new Date().toISOString(),
    }));

    for (let i = 0; i < compRows.length; i += 25) {
      const batch = compRows.slice(i, i + 25);
      await supabaseInsert("companies", batch);
      console.log(`  Lote de empresas: ${Math.min(i + 25, compRows.length)}/${compRows.length}...`);
    }
    console.log(`✓ companies migrado com sucesso.`);
  }

  // 3. Procurements (25 licitações e PCA 2027)
  if (db.procurements && db.procurements.length > 0) {
    const seenProc = new Set();
    const uniqueProcurements = db.procurements.filter((p) => {
      const key = p.id || p.pncpNumber;
      if (seenProc.has(key)) return false;
      seenProc.add(key);
      return true;
    });

    console.log(`→ Inserindo ${uniqueProcurements.length} Contratações Públicas e PCA 2027...`);
    const procRows = uniqueProcurements.map((p) => ({
      id: p.id,
      pncp_control_number: p.pncpNumber,
      process_number: p.processNumber,
      record_type: p.recordType,
      simplified_title: p.simplifiedTitle,
      original_object: p.originalObject,
      secretariat: p.secretariat,
      purchasing_unit: p.purchasingUnit,
      modality: p.modality,
      category: p.category,
      region: p.region || null,
      status: p.status,
      published_at: p.publishedAt ? new Date(p.publishedAt).toISOString() : null,
      public_session_at: p.sessionDate ? new Date(p.sessionDate).toISOString() : null,
      planned_period: p.plannedWindow || null,
      is_budget_confidential: Boolean(p.costs?.isBudgetConfidential),
      estimated_value: p.costs?.estimatedValue || null,
      max_acceptable_value: p.costs?.maxAcceptableValue || null,
      homologated_value: p.costs?.homologatedValue || null,
      contracted_value: p.costs?.contractedValue || null,
      paid_value: p.costs?.paidValue || null,
      ai_plain_summary_json: p.aiSummary || null,
      source_url: p.sourceUrl,
      data_source_id: "src-pncp",
      is_demo_data: Boolean(p.isDemoData),
      last_synced_at: p.lastSyncedAt || new Date().toISOString(),
    }));

    await supabaseInsert("procurements", procRows);
    console.log(`✓ procurements migrado com sucesso.`);
  }

  // 4. Delayed Works & Contracts
  if (db.delayedWorks && db.delayedWorks.length > 0) {
    console.log(`→ Inserindo Contratos e ${db.delayedWorks.length} Obras Públicas Atrasadas...`);

    const contractRows = [];
    const workRows = [];

    for (const w of db.delayedWorks) {
      contractRows.push({
        id: `ct-${w.id}`,
        contract_number: w.contractNumber,
        process_number: w.adminProcessNumber || w.processNumber || "6022.2023/0000000-0",
        company_id: w.companyId,
        secretariat: w.secretariat,
        object_description: w.description,
        signed_at: new Date(w.schedule.plannedStartDate).toISOString(),
        start_date: new Date(w.schedule.plannedStartDate).toISOString(),
        original_end_date: new Date(w.schedule.contractualEndDate).toISOString(),
        current_end_date: new Date(w.schedule.updatedEndDate).toISOString(),
        initial_value: w.costs.initialBudget,
        current_value_after_add: w.costs.updatedAmountAfterAmendments,
        committed_value: w.costs.committedAmount,
        paid_value: w.costs.paidAmount,
        attention_score: 50,
        official_contract_url:
          w.officialContractUrl ||
          w.sourceUrl ||
          w.officialSourceUrl ||
          "https://dados.prefeitura.sp.gov.br",
        is_demo_data: false,
        last_synced_at: new Date().toISOString(),
      });

      workRows.push({
        id: w.id,
        official_work_code: w.officialCode,
        name: w.name,
        description: w.description,
        address_location: w.addressLocation,
        subprefecture: w.subprefecture,
        secretariat: w.secretariat,
        company_id: w.companyId,
        contract_id: `ct-${w.id}`,
        admin_process_number: w.adminProcessNumber || w.processNumber || "6022.2023/0000000-0",
        planned_start_date: new Date(w.schedule.plannedStartDate).toISOString(),
        actual_start_date: w.schedule.actualStartDate
          ? new Date(w.schedule.actualStartDate).toISOString()
          : null,
        expected_completion_year: w.schedule.expectedCompletionYear,
        contractual_end_date: new Date(w.schedule.contractualEndDate).toISOString(),
        updated_end_date: new Date(w.schedule.updatedEndDate).toISOString(),
        current_status: w.schedule.currentStatus,
        delay_months_calculated: w.schedule.delayMonths,
        official_justification: w.schedule.officialJustification || null,
        initial_budget: w.costs.initialBudget,
        contracted_amount: w.costs.contractedAmount,
        updated_amount_after_add: w.costs.updatedAmountAfterAmendments,
        committed_amount: w.costs.committedAmount,
        paid_amount: w.costs.paidAmount,
        physical_execution_value: w.costs.physicalExecutedValue || null,
        financial_execution_pct: w.costs.financialExecutionPct,
        physical_execution_pct: w.costs.physicalExecutionPct || null,
        official_source_url:
          w.officialSourceUrl || w.sourceUrl || "https://dados.prefeitura.sp.gov.br",
        is_demo_data: false,
        last_synced_at: new Date().toISOString(),
      });
    }

    await supabaseInsert("contracts", contractRows);
    console.log(`✓ contracts migrado com sucesso.`);

    await supabaseInsert("public_works", workRows);
    console.log(`✓ public_works migrado com sucesso.`);
  }

  console.log(`\n🎉 MIGRAÇÃO PARA O SUPABASE CONCLUÍDA COM ÊXITO!\n`);
}

module.exports = { seedSupabase, getEnvConfig };

if (require.main === module) {
  seedSupabase().catch((err) => {
    console.error("\n❌ Falha na migração para o Supabase:", err.message);
    process.exit(1);
  });
}
