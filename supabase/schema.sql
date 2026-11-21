-- ============================================================================
-- OBSERVATÓRIO CIDADÃO DE SÃO PAULO
-- Schema Oficial PostgreSQL para o Supabase (Seção 13.1)
-- 20 Entidades Relacionais com Chaves Primárias, RLS e Boas Práticas do Supabase
-- ============================================================================

-- Habilitar extensão para geração de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    display_name TEXT,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'CITIZEN', -- CITIZEN, MODERATOR, AUDITOR, ADMIN
    mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 2. identity_verifications (LGPD & ANPD: sem CPF em texto aberto)
CREATE TABLE IF NOT EXISTS identity_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pseudonymized_cpf_token TEXT UNIQUE NOT NULL, -- HMAC-SHA256 irreversível
    verification_provider TEXT NOT NULL,
    provider_reference_id TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    sp_residency_verified BOOLEAN NOT NULL DEFAULT FALSE,
    legal_basis_consent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 3. data_sources
CREATE TABLE IF NOT EXISTS data_sources (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL, -- PNCP, TCMSP, OBRAS_ABERTAS, DADOS_SP, TRANSPARENCIA_SP, CEIS_CNEP
    name TEXT NOT NULL,
    official_url TEXT NOT NULL,
    api_documentation_url TEXT,
    refresh_frequency TEXT NOT NULL,
    last_successful_sync TIMESTAMP WITH TIME ZONE,
    current_status TEXT NOT NULL DEFAULT 'ACTIVE'
);

-- 4. companies (Associação exclusiva por CNPJ normalizado de 14 dígitos)
CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    cnpj_normalized VARCHAR(14) UNIQUE NOT NULL,
    cnpj_formatted VARCHAR(20) NOT NULL,
    legal_name TEXT NOT NULL,
    trade_name TEXT,
    registration_status TEXT NOT NULL,
    identified_procurements_count INTEGER NOT NULL DEFAULT 0,
    identified_contracts_count INTEGER NOT NULL DEFAULT 0,
    total_contracted_amount NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    company_public_statement TEXT,
    is_demo_data BOOLEAN NOT NULL DEFAULT FALSE,
    last_synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_companies_cnpj ON companies(cnpj_normalized);

-- 5. procurements (Licitações e Planejamento PCA 2026/2027)
CREATE TABLE IF NOT EXISTS procurements (
    id TEXT PRIMARY KEY,
    pncp_control_number TEXT UNIQUE NOT NULL,
    process_number TEXT NOT NULL,
    record_type TEXT NOT NULL DEFAULT 'PUBLISHED_BID', -- PUBLISHED_BID ou PCA_PLANNING
    simplified_title TEXT NOT NULL,
    original_object TEXT NOT NULL,
    secretariat TEXT NOT NULL,
    purchasing_unit TEXT NOT NULL,
    modality TEXT NOT NULL,
    category TEXT NOT NULL,
    region TEXT,
    status TEXT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    proposal_opening_at TIMESTAMP WITH TIME ZONE,
    public_session_at TIMESTAMP WITH TIME ZONE,
    planned_period TEXT,
    is_budget_confidential BOOLEAN NOT NULL DEFAULT FALSE,
    estimated_value NUMERIC(18, 2),
    max_acceptable_value NUMERIC(18, 2),
    homologated_value NUMERIC(18, 2),
    contracted_value NUMERIC(18, 2),
    paid_value NUMERIC(18, 2),
    ai_plain_summary_json JSONB,
    source_url TEXT NOT NULL,
    data_source_id TEXT REFERENCES data_sources(id),
    is_demo_data BOOLEAN NOT NULL DEFAULT FALSE,
    last_synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_procurements_type_status ON procurements(record_type, status);

-- 6. procurement_documents
CREATE TABLE IF NOT EXISTS procurement_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    procurement_id TEXT NOT NULL REFERENCES procurements(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    title TEXT NOT NULL,
    official_url TEXT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    file_hash_sha256 TEXT
);

-- 7. procurement_bids
CREATE TABLE IF NOT EXISTS procurement_bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    procurement_id TEXT NOT NULL REFERENCES procurements(id) ON DELETE CASCADE,
    company_id TEXT NOT NULL REFERENCES companies(id),
    initial_proposal_value NUMERIC(18, 2),
    final_bid_value NUMERIC(18, 2) NOT NULL,
    bid_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    ranking_position INTEGER NOT NULL,
    participation_status TEXT NOT NULL,
    dispute_result TEXT NOT NULL,
    is_winning_bid BOOLEAN NOT NULL DEFAULT FALSE,
    official_source_doc_url TEXT NOT NULL
);

-- 8. procurement_events
CREATE TABLE IF NOT EXISTS procurement_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    procurement_id TEXT NOT NULL REFERENCES procurements(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    description TEXT NOT NULL,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
    official_doc_url TEXT
);

-- 9. contracts
CREATE TABLE IF NOT EXISTS contracts (
    id TEXT PRIMARY KEY,
    contract_number TEXT UNIQUE NOT NULL,
    process_number TEXT NOT NULL,
    procurement_id TEXT REFERENCES procurements(id),
    company_id TEXT NOT NULL REFERENCES companies(id),
    secretariat TEXT NOT NULL,
    object_description TEXT NOT NULL,
    signed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    original_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    current_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    initial_value NUMERIC(18, 2) NOT NULL,
    current_value_after_add NUMERIC(18, 2) NOT NULL,
    committed_value NUMERIC(18, 2) NOT NULL,
    paid_value NUMERIC(18, 2) NOT NULL,
    attention_score INTEGER NOT NULL DEFAULT 0,
    official_contract_url TEXT NOT NULL,
    is_demo_data BOOLEAN NOT NULL DEFAULT FALSE,
    last_synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 10. contract_amendments
CREATE TABLE IF NOT EXISTS contract_amendments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id TEXT NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    amendment_number TEXT NOT NULL,
    amendment_type TEXT NOT NULL,
    value_delta NUMERIC(18, 2),
    days_extended INTEGER,
    justification TEXT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    official_doc_url TEXT NOT NULL
);

-- 11. contract_occurrences
CREATE TABLE IF NOT EXISTS contract_occurrences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id TEXT NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    company_id TEXT NOT NULL REFERENCES companies(id),
    category TEXT NOT NULL,
    indicator_code INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    weight_points INTEGER NOT NULL,
    source_name TEXT NOT NULL,
    evidence_document_url TEXT NOT NULL,
    registered_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 12. public_works (Obras públicas com atraso documentado)
CREATE TABLE IF NOT EXISTS public_works (
    id TEXT PRIMARY KEY,
    official_work_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    address_location TEXT NOT NULL,
    subprefecture TEXT NOT NULL,
    secretariat TEXT NOT NULL,
    company_id TEXT NOT NULL REFERENCES companies(id),
    contract_id TEXT NOT NULL REFERENCES contracts(id),
    admin_process_number TEXT NOT NULL,
    planned_start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_start_date TIMESTAMP WITH TIME ZONE,
    expected_completion_year INTEGER NOT NULL,
    contractual_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    current_status TEXT NOT NULL,
    delay_months_calculated INTEGER NOT NULL,
    official_justification TEXT,
    initial_budget NUMERIC(18, 2) NOT NULL,
    contracted_amount NUMERIC(18, 2) NOT NULL,
    updated_amount_after_add NUMERIC(18, 2) NOT NULL,
    committed_amount NUMERIC(18, 2) NOT NULL,
    paid_amount NUMERIC(18, 2) NOT NULL,
    physical_execution_value NUMERIC(18, 2),
    financial_execution_pct NUMERIC(5, 2),
    physical_execution_pct NUMERIC(5, 2),
    official_source_url TEXT NOT NULL,
    is_demo_data BOOLEAN NOT NULL DEFAULT FALSE,
    last_synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 13. work_updates
CREATE TABLE IF NOT EXISTS work_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    public_work_id TEXT NOT NULL REFERENCES public_works(id) ON DELETE CASCADE,
    update_type TEXT NOT NULL,
    summary TEXT NOT NULL,
    physical_pct_recorded NUMERIC(5, 2),
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    official_doc_url TEXT NOT NULL
);

-- 14. public_reports
CREATE TABLE IF NOT EXISTS public_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    procurement_id TEXT REFERENCES procurements(id),
    report_type TEXT NOT NULL,
    snapshot_payload JSONB NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 15. company_votes (1 CPF = 1 voto, auditável sem expor dados)
CREATE TABLE IF NOT EXISTS company_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    citizen_token TEXT NOT NULL,
    pseudonym TEXT NOT NULL,
    company_cnpj VARCHAR(14) NOT NULL,
    vote_type TEXT NOT NULL, -- RECOMMEND, DO_NOT_RECOMMEND, NO_OPINION
    justification TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(citizen_token, company_cnpj)
);

-- 16. procurement_votes (1 CPF = 1 voto)
CREATE TABLE IF NOT EXISTS procurement_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    citizen_token TEXT NOT NULL,
    pseudonym TEXT NOT NULL,
    procurement_id TEXT NOT NULL REFERENCES procurements(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL, -- SUPPORT, OPPOSE, NEEDS_CLARIFICATION
    justification TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(citizen_token, procurement_id)
);

-- 17. comments
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    citizen_token TEXT NOT NULL,
    pseudonym TEXT NOT NULL,
    company_id TEXT REFERENCES companies(id),
    procurement_id TEXT REFERENCES procurements(id),
    content TEXT NOT NULL,
    moderation_status TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    moderation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 18. complaints (Manifestações e relatos sobre obras)
CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    citizen_token TEXT,
    public_work_id TEXT NOT NULL REFERENCES public_works(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    photo_urls TEXT[],
    moderation_status TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    acknowledged_non_official_disclaimer BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 19. synchronization_logs
CREATE TABLE IF NOT EXISTS synchronization_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data_source_id TEXT NOT NULL REFERENCES data_sources(id),
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    finished_at TIMESTAMP WITH TIME ZONE,
    source_last_updated_at TIMESTAMP WITH TIME ZONE,
    records_processed INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL,
    error_message TEXT
);

-- 20. audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor TEXT NOT NULL,
    action_type TEXT NOT NULL,
    target_table TEXT NOT NULL,
    target_id TEXT NOT NULL,
    justification TEXT NOT NULL,
    diff_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- HABILITAR ROW LEVEL SECURITY (RLS) E POLÍTICAS DE ACESSO (BOAS PRÁTICAS SUPABASE)
-- ============================================================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_amendments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_occurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura Pública (Plataforma Cívica Aberta)
CREATE POLICY "Public read access for companies" ON companies FOR SELECT USING (true);
CREATE POLICY "Public read access for procurements" ON procurements FOR SELECT USING (true);
CREATE POLICY "Public read access for procurement_documents" ON procurement_documents FOR SELECT USING (true);
CREATE POLICY "Public read access for procurement_bids" ON procurement_bids FOR SELECT USING (true);
CREATE POLICY "Public read access for procurement_events" ON procurement_events FOR SELECT USING (true);
CREATE POLICY "Public read access for contracts" ON contracts FOR SELECT USING (true);
CREATE POLICY "Public read access for contract_amendments" ON contract_amendments FOR SELECT USING (true);
CREATE POLICY "Public read access for contract_occurrences" ON contract_occurrences FOR SELECT USING (true);
CREATE POLICY "Public read access for public_works" ON public_works FOR SELECT USING (true);
CREATE POLICY "Public read access for work_updates" ON work_updates FOR SELECT USING (true);
CREATE POLICY "Public read access for data_sources" ON data_sources FOR SELECT USING (true);
CREATE POLICY "Public read access for company_votes" ON company_votes FOR SELECT USING (true);
CREATE POLICY "Public insert access for company_votes" ON company_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read access for procurement_votes" ON procurement_votes FOR SELECT USING (true);
CREATE POLICY "Public insert access for procurement_votes" ON procurement_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read access for approved comments" ON comments FOR SELECT USING (moderation_status = 'APPROVED');
CREATE POLICY "Public insert access for comments" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert access for complaints" ON complaints FOR INSERT WITH CHECK (true);

-- Visualizações de Estatísticas de Votos Agregados com security_invoker = true
CREATE OR REPLACE VIEW view_company_vote_stats WITH (security_invoker = true) AS
SELECT 
    company_cnpj,
    COUNT(*) AS total_votes,
    COUNT(*) FILTER (WHERE vote_type = 'RECOMMEND') AS recommend_count,
    COUNT(*) FILTER (WHERE vote_type = 'DO_NOT_RECOMMEND') AS reject_count,
    COUNT(*) FILTER (WHERE vote_type = 'NO_OPINION') AS neutral_count
FROM company_votes
GROUP BY company_cnpj;

CREATE OR REPLACE VIEW view_procurement_vote_stats WITH (security_invoker = true) AS
SELECT 
    procurement_id,
    COUNT(*) AS total_votes,
    COUNT(*) FILTER (WHERE vote_type = 'SUPPORT') AS support_count,
    COUNT(*) FILTER (WHERE vote_type = 'OPPOSE') AS oppose_count,
    COUNT(*) FILTER (WHERE vote_type = 'NEEDS_CLARIFICATION') AS needs_clarification_count
FROM procurement_votes
GROUP BY procurement_id;
