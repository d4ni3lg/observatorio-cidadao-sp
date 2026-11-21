"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  UserCheck,
  Shield,
  Lock,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Trash2,
  LogOut,
  ArrowRight,
  RefreshCw,
  FileText,
  Building2,
} from "lucide-react";
import { formatCPF, isValidCPF } from "@/lib/citizen-auth/cpf-validator";
import {
  getClientCitizenSession,
  saveClientCitizenSession,
  clearClientCitizenSession,
  StoredCitizenSession,
} from "@/lib/citizen-auth/client-session";

export default function ContaCidadaPage() {
  const [session, setSession] = useState<StoredCitizenSession | null>(null);
  const [mounted, setMounted] = useState(false);

  // Formulário de Verificação
  const [cpfInput, setCpfInput] = useState("");
  const [honeypot, setHoneypot] = useState(""); // Honeypot anti-bot
  const [residenceCheck, setResidenceCheck] = useState(false);
  const [lgpdCheck, setLgpdCheck] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Histórico de Votos
  const [userVotes, setUserVotes] = useState<{
    companies: any[];
    procurements: any[];
  }>({ companies: [], procurements: [] });
  const [loadingVotes, setLoadingVotes] = useState(false);

  useEffect(() => {
    setMounted(true);
    const existing = getClientCitizenSession();
    if (existing) {
      setSession(existing);
      fetchVotes(existing.citizenToken);
    }
  }, []);

  const fetchVotes = async (token: string) => {
    try {
      setLoadingVotes(true);
      const res = await fetch(`/api/citizen/auth?token=${encodeURIComponent(token)}`);
      if (res.ok) {
        const data = await res.json();
        setUserVotes(data.votes || { companies: [], procurements: [] });
      }
    } catch (e) {
      console.error("Erro ao carregar votos do cidadão:", e);
    } finally {
      setLoadingVotes(false);
    }
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpfInput(formatted);
    setErrorMsg(null);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Se o honeypot estiver preenchido, rejeita silenciosamente
    if (honeypot) {
      setErrorMsg("Requisição rejeitada.");
      return;
    }

    const clean = cpfInput.replace(/\D/g, "");
    if (clean.length !== 11) {
      setErrorMsg("O CPF deve conter exatamente 11 dígitos numéricos.");
      return;
    }

    if (!isValidCPF(clean)) {
      setErrorMsg(
        "CPF matematicamente inválido. Verifique os números digitados (validação oficial módulo 11)."
      );
      return;
    }

    if (!lgpdCheck) {
      setErrorMsg("É obrigatório manifestar consentimento expresso nos termos da LGPD.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/citizen/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawCpf: clean,
          residentConfirmed: residenceCheck,
          acceptTerms: lgpdCheck,
          _hp: honeypot,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Erro ao verificar CPF.");
        return;
      }

      const newSession: StoredCitizenSession = {
        citizenToken: data.citizenToken,
        pseudonym: data.pseudonym,
        maskedCpf: data.maskedCpf,
        consentVersion: data.consentVersion,
        consentDate: data.consentDate,
        residenceAffirmed: data.residenceAffirmed,
      };

      saveClientCitizenSession(newSession);
      setSession(newSession);
      setSuccessMsg("Identidade cívica verificada! Você agora pode votar com regra de 1 CPF = 1 voto.");
      fetchVotes(newSession.citizenToken);
    } catch (err: any) {
      setErrorMsg("Falha na comunicação segura com o servidor de verificação.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearClientCitizenSession();
    setSession(null);
    setCpfInput("");
    setSuccessMsg("Sessão encerrada com segurança neste dispositivo.");
  };

  const handleDeleteAccount = async () => {
    if (!session) return;
    const confirm = window.confirm(
      "CONFIRMAÇÃO DE DIREITO LGPD (Art. 18, VI):\n\nTem certeza de que deseja excluir permanentemente sua conta cívica e anonimizar todos os seus votos? Esta ação é irreversível."
    );
    if (!confirm) return;

    try {
      setLoading(true);
      const res = await fetch("/api/citizen/auth", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: session.citizenToken }),
      });

      if (res.ok) {
        clearClientCitizenSession();
        setSession(null);
        setSuccessMsg(
          "Sua conta e todas as manifestações atreladas ao seu token foram permanentemente eliminadas e anonimizadas, conforme a Lei Geral de Proteção de Dados."
        );
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Erro ao excluir conta.");
      }
    } catch {
      setErrorMsg("Falha ao comunicar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-xs text-neutral-500">
        Carregando painel de cidadania e privacidade...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Cabeçalho */}
      <div className="space-y-2">
        <div className="text-xs font-mono uppercase tracking-wider text-red-700 font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-600"></span>
          Identidade Verificada por CPF • Criptografia HMAC & LGPD
        </div>
        <h1 className="font-display text-3xl font-black text-neutral-900">
          Conta Cidadã & Participação Auditável
        </h1>
        <p className="text-sm text-neutral-600 leading-relaxed max-w-3xl">
          Verifique sua identidade com CPF válido para participar de votações em empresas e contratações de São Paulo. Seus dados pessoais são estritamente protegidos pela LGPD (Lei 13.709/2018).
        </p>
      </div>

      {/* Alertas */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-xs text-red-950 flex items-start gap-2.5 shadow-sm">
          <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
          <div className="font-medium">{errorMsg}</div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 flex items-start gap-2.5 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="font-medium">{successMsg}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Painel Esquerdo: Verificação ou Sessão Ativa */}
        {!session ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-7 space-y-5 shadow-sm">
            <div className="border-b border-neutral-100 pb-3">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-neutral-100 text-neutral-800 border border-neutral-300">
                Identidade Pendente
              </span>
              <h2 className="font-display font-bold text-xl text-neutral-900 mt-2">
                Validar CPF para Habilitar Voto Cidadão
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Cada voto é atrelado a um CPF real para coibir bots, fraudes e manipulações no ranking popular paulista.
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              {/* Campo Honeypot Oculto Anti-Bot */}
              <div style={{ display: "none" }} aria-hidden="true">
                <input
                  type="text"
                  name="_hp_address"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                  Número do seu CPF (apenas números ou formatado)
                </label>
                <input
                  type="text"
                  maxLength={14}
                  value={cpfInput}
                  onChange={handleCpfChange}
                  placeholder="000.000.000-00"
                  className="w-full px-4 py-3 text-base font-mono rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                  required
                />
                <span className="text-[11px] text-neutral-500 block mt-1">
                  O CPF é validado matematicamente pelo algoritmo oficial da Receita Federal.
                </span>
              </div>

              <div className="space-y-3 pt-2 border-t border-neutral-100 text-xs text-neutral-700">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={residenceCheck}
                    onChange={(e) => setResidenceCheck(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-neutral-300 text-red-700 focus:ring-red-600"
                  />
                  <span>
                    Declaro que resido, trabalho ou tenho interesse direto na fiscalização dos gastos públicos de São Paulo.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lgpdCheck}
                    onChange={(e) => setLgpdCheck(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-neutral-300 text-red-700 focus:ring-red-600"
                    required
                  />
                  <span>
                    <strong>Consentimento LGPD (Art. 7º, I da Lei 13.709/2018):</strong>{" "}
                    Concordo com a geração de token criptográfico HMAC irreversível para garantir 1 CPF = 1 voto. O CPF nunca é salvo em texto puro nem compartilhado.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-red-700 text-white text-sm font-bold hover:bg-red-800 disabled:opacity-50 transition-all shadow-md active:scale-95 border border-red-800"
              >
                {loading ? "Verificando dígitos do CPF..." : "Verificar CPF e Ativar Votação"}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-emerald-200 p-6 sm:p-7 space-y-5 bg-gradient-to-b from-emerald-50/20 to-white shadow-sm">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 inline-flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-700" />
                Cidadão Verificado por CPF (Ativo)
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-neutral-500 hover:text-red-700 inline-flex items-center gap-1 font-semibold"
                title="Desconectar deste dispositivo"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sair
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-neutral-500 block">Pseudônimo Cívico Público</span>
                <strong className="font-display text-base text-neutral-900 block mt-0.5">
                  {session.pseudonym}
                </strong>
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Identificador público em manifestações (seu nome civil e CPF jamais aparecem).
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-neutral-500 block">CPF Verificado (Ofuscado)</span>
                <strong className="font-mono text-sm text-neutral-800 block mt-0.5">
                  {session.maskedCpf}
                </strong>
                <span className="text-[11px] text-emerald-700 mt-1 block font-bold">
                  ✓ Validado pelo algoritmo módulo 11 oficial
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                <span className="text-neutral-500 block">
                  Token Criptográfico Irreversível (HMAC-SHA256)
                </span>
                <code className="font-mono text-[10px] text-neutral-700 break-all bg-white p-2 rounded border border-neutral-200 block">
                  {session.citizenToken}
                </code>
                <span className="text-[11px] text-neutral-500 block">
                  Garante que 1 CPF = 1 voto por empresa ou contratação.
                </span>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-950 text-[11px]">
                <strong>Consentimento LGPD Registrado:</strong> Versão{" "}
                {session.consentVersion} em{" "}
                {new Date(session.consentDate).toLocaleString("pt-BR")}.
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200 space-y-2">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={loading}
                className="w-full py-3 rounded-xl border border-red-300 text-red-800 text-xs font-bold hover:bg-red-50 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                Excluir Conta e Anonimizar Dados (Art. 18 LGPD)
              </button>
            </div>
          </div>
        )}

        {/* Painel Direito: Garantias LGPD & Links Rápidos */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4 shadow-sm">
            <h2 className="font-display font-bold text-lg text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-3">
              <Shield className="w-5 h-5 text-red-700" />
              Garantias de Privacidade e Segurança
            </h2>

            <ul className="space-y-3.5 text-xs text-neutral-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Unicidade com Pseudonimização:</strong> O hash HMAC impossibilita a reversão do CPF original, mas impede que a mesma pessoa vote duas vezes ou crie bots.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Direito de Retificação:</strong> Você pode alterar seu voto a qualquer momento. O voto mais recente substitui o anterior sem duplicar contagens.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <KeyRound className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Eliminação de Dados (Art. 18 LGPD):</strong> Ao solicitar exclusão, seu token é purgado e todas as manifestações são totalmente desvinculadas.
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-neutral-950 text-white rounded-2xl p-6 space-y-3 shadow-lg border border-red-950/60">
            <h3 className="font-display font-bold text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Participe do Controle Social Paulista
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Com sua identidade cívica verificada, suas avaliações compõem a percepção popular auditável sobre empresas e editais de São Paulo.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Link
                href="/licitacoes"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-bold transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                Votar em Licitações
              </Link>
              <Link
                href="/empresas"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold border border-neutral-700 transition-colors"
              >
                <Building2 className="w-3.5 h-3.5" />
                Avaliar Fornecedores
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Histórico de Votos */}
      {session && (
        <section className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-red-700 font-bold">
                Histórico Pessoal
              </span>
              <h2 className="font-display text-xl font-bold text-neutral-900 mt-1">
                Manifestações Registradas com seu Token
              </h2>
            </div>
            <button
              type="button"
              onClick={() => fetchVotes(session.citizenToken)}
              className="text-xs text-neutral-600 hover:text-red-700 inline-flex items-center gap-1 font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Atualizar
            </button>
          </div>

          {loadingVotes ? (
            <div className="text-xs text-neutral-400 py-4">Carregando histórico...</div>
          ) : userVotes.companies.length === 0 && userVotes.procurements.length === 0 ? (
            <div className="p-6 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 text-center">
              Você ainda não registrou votos. Navegue pelas seções de{" "}
              <Link href="/licitacoes" className="text-red-700 underline font-bold">Licitações</Link> e{" "}
              <Link href="/empresas" className="text-red-700 underline font-bold">Empresas</Link> para participar!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {userVotes.procurements.map((v) => (
                <div
                  key={v.procurementId}
                  className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-neutral-500">
                      Licitação: {v.procurementId}
                    </span>
                    <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-red-100 text-red-900">
                      {v.voteType === "SUPPORT"
                        ? "Apoio"
                        : v.voteType === "OPPOSE"
                        ? "Não Apoio"
                        : "Necessita Esclarecimento"}
                    </span>
                  </div>
                  {v.justification && (
                    <p className="text-neutral-700 italic border-l-2 border-red-500 pl-2">
                      &quot;{v.justification}&quot;
                    </p>
                  )}
                  <div className="text-[11px] text-neutral-400">
                    Última alteração: {new Date(v.updatedAt).toLocaleString("pt-BR")}
                  </div>
                  <Link
                    href={`/licitacoes/${v.procurementId}`}
                    className="text-red-700 hover:underline font-bold block pt-1"
                  >
                    Abrir licitação e alterar voto →
                  </Link>
                </div>
              ))}

              {userVotes.companies.map((v) => (
                <div
                  key={v.companyCnpj}
                  className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-neutral-500">
                      CNPJ: {v.companyCnpj}
                    </span>
                    <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-emerald-100 text-emerald-900">
                      {v.voteType === "RECOMMEND"
                        ? "Recomenda"
                        : v.voteType === "DO_NOT_RECOMMEND"
                        ? "Não Recomenda"
                        : "Sem Opinião"}
                    </span>
                  </div>
                  {v.justification && (
                    <p className="text-neutral-700 italic border-l-2 border-emerald-500 pl-2">
                      &quot;{v.justification}&quot;
                    </p>
                  )}
                  <div className="text-[11px] text-neutral-400">
                    Última alteração: {new Date(v.updatedAt).toLocaleString("pt-BR")}
                  </div>
                  <Link
                    href={`/empresas/${v.companyCnpj}`}
                    className="text-red-700 hover:underline font-bold block pt-1"
                  >
                    Abrir empresa e alterar voto →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
