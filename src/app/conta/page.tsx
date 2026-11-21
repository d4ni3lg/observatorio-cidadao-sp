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

    const clean = cpfInput.replace(/\D/g, "");
    if (clean.length !== 11) {
      setErrorMsg("O CPF deve conter 11 dígitos numéricos.");
      return;
    }

    if (!isValidCPF(clean)) {
      setErrorMsg(
        "CPF matematicamente inválido. Verifique os números digitados (regras de validação módulo 11)."
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
      setSuccessMsg("Identidade cívica verificada! Você agora pode votar com validade de 1 CPF = 1 voto.");
      fetchVotes(newSession.citizenToken);
    } catch (err: any) {
      setErrorMsg("Falha na comunicação com o servidor de verificação.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearClientCitizenSession();
    setSession(null);
    setCpfInput("");
    setSuccessMsg("Sessão encerrada neste dispositivo.");
  };

  const handleDeleteAccount = async () => {
    if (!session) return;
    const confirm = window.confirm(
      "CONFIRMAÇÃO DE DIREITO LGPD (Art. 18, VI):\n\nTem certeza de que deseja excluir permanentemente sua conta cívica e anonimizar todos os seus votos e manifestações? Esta ação não pode ser desfeita."
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
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
        Carregando painel de cidadania e privacidade...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Cabeçalho */}
      <div className="space-y-2">
        <div className="text-xs font-mono uppercase tracking-wider text-blue-800 font-semibold">
          Seção 7.1, 7.2 e Seção 8 • Identidade Verificada por CPF e Privacidade por Design
        </div>
        <h1 className="font-display text-3xl font-bold text-slate-900">
          Conta Cidadã & Participação Auditável
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Verifique sua identidade com CPF válido para participar de votações em empresas
          e contratações da Prefeitura de São Paulo. Seus dados pessoais são estritamente
          protegidos pela LGPD (Lei 13.709/2018).
        </p>
      </div>

      {/* Alertas */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-950 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
          <div>{errorMsg}</div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div>{successMsg}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Painel Esquerdo: Verificação ou Sessão Ativa */}
        {!session ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                Identidade Não Verificada
              </span>
              <h2 className="font-display font-bold text-xl text-slate-900 mt-2">
                Validar CPF para Habilitar Voto Cidadão
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Conforme a Seção 7.1, cada voto deve estar atrelado a um CPF real para
                coibir bots, fraudes e manipulações no ranking popular.
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Número do seu CPF (apenas números ou formatado)
                </label>
                <input
                  type="text"
                  maxLength={14}
                  value={cpfInput}
                  onChange={handleCpfChange}
                  placeholder="000.000.000-00"
                  className="w-full px-3.5 py-2.5 text-base font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  required
                />
                <span className="text-[11px] text-slate-500 block mt-1">
                  O CPF é validado matematicamente pelo algoritmo oficial de 11 dígitos.
                </span>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-700">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={residenceCheck}
                    onChange={(e) => setResidenceCheck(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <span>
                    Declaro que sou morador, contribuinte ou interessado na fiscalização
                    dos gastos públicos do Município de São Paulo (Seção 7.1).
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lgpdCheck}
                    onChange={(e) => setLgpdCheck(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                    required
                  />
                  <span>
                    <strong>Consentimento LGPD (Art. 7º, I da Lei 13.709/2018):</strong>{" "}
                    Concordo com a geração de token criptográfico HMAC irreversível para
                    garantir a unicidade do meu voto (1 CPF = 1 voto). Meu CPF nunca
                    será exibido publicamente nem armazenado em texto aberto.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-900 text-white text-xs font-bold hover:bg-blue-800 disabled:opacity-50 transition-colors shadow-sm"
              >
                {loading ? "Verificando dígitos do CPF..." : "Verificar CPF e Ativar Votação"}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-emerald-200 p-6 sm:p-7 space-y-5 bg-gradient-to-b from-emerald-50/20 to-white">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 inline-flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-700" />
                Cidadão Verificado por CPF (Ativo)
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1"
                title="Desconectar deste navegador"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sair
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Pseudônimo Cívico Público</span>
                <strong className="font-display text-base text-blue-950 block mt-0.5">
                  {session.pseudonym}
                </strong>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Identificador público em manifestações e votos (seu nome real e CPF não aparecem).
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">CPF Verificado (Ofuscado)</span>
                <strong className="font-mono text-sm text-slate-800 block mt-0.5">
                  {session.maskedCpf}
                </strong>
                <span className="text-[11px] text-emerald-800 mt-1 block font-medium">
                  ✓ Validado pelo algoritmo módulo 11 da Receita Federal
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 block">
                  Token Criptográfico Irreversível (HMAC-SHA256)
                </span>
                <code className="font-mono text-[10px] text-slate-700 break-all bg-white p-1.5 rounded border border-slate-200 block">
                  {session.citizenToken}
                </code>
                <span className="text-[11px] text-slate-500 block">
                  Garante que 1 CPF = 1 voto por empresa ou contratação.
                </span>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 text-emerald-950 text-[11px]">
                <strong>Consentimento LGPD Registrado:</strong> Versão{" "}
                {session.consentVersion} em{" "}
                {new Date(session.consentDate).toLocaleString("pt-BR")}.
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-2">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={loading}
                className="w-full py-2.5 rounded-xl border border-rose-300 text-rose-800 text-xs font-semibold hover:bg-rose-50 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                Excluir Conta e Anonimizar Dados (Art. 18 LGPD)
              </button>
            </div>
          </div>
        )}

        {/* Painel Direito: Garantias LGPD & Links Rápidos */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Shield className="w-5 h-5 text-blue-900" />
              Garantias Legais e Diretrizes da ANPD
            </h2>

            <ul className="space-y-3 text-xs text-slate-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Unicidade com Pseudonimização:</strong> O hash HMAC
                  impossibilita a engenharia reversa para descobrir o CPF original,
                  mas impede tecnicamente a criação de perfis duplicados para manipular rankings.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
                <div>
                  <strong>Direito de Retificação (Seção 7.1):</strong> Se você mudar de
                  opinião sobre uma empresa ou licitação, pode alterar seu voto. O voto
                  novo substitui o anterior imediatamente.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <KeyRound className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Direito à Eliminação dos Dados (Art. 18, VI LGPD):</strong>{" "}
                  Ao solicitar a exclusão da conta, seu token é removido e suas
                  manifestações são completamente desvinculadas e desindexadas.
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-3">
            <h3 className="font-display font-bold text-base">Participe Agora das Votações</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Com sua identidade cívica verificada, suas avaliações passam a compor os
              indicadores de apoio e o ranking popular de fornecedores da cidade.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Link
                href="/licitacoes"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-xs font-semibold"
              >
                <FileText className="w-3.5 h-3.5" />
                Votar em Licitações
              </Link>
              <Link
                href="/empresas"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700"
              >
                <Building2 className="w-3.5 h-3.5" />
                Avaliar Empresas
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Histórico de Votos do Cidadão */}
      {session && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-blue-900 font-bold">
                Seu Histórico Cívico
              </span>
              <h2 className="font-display text-xl font-bold text-slate-900 mt-1">
                Manifestações e Votos Registrados com seu Token
              </h2>
            </div>
            <button
              type="button"
              onClick={() => fetchVotes(session.citizenToken)}
              className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Atualizar
            </button>
          </div>

          {loadingVotes ? (
            <div className="text-xs text-slate-400 py-4">Carregando histórico...</div>
          ) : userVotes.companies.length === 0 && userVotes.procurements.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-center">
              Você ainda não registrou votos em empresas ou licitações. Navegue pelas seções
              de <Link href="/licitacoes" className="text-blue-900 underline font-semibold">Licitações</Link> e{" "}
              <Link href="/empresas" className="text-blue-900 underline font-semibold">Empresas</Link> para participar!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {userVotes.procurements.map((v) => (
                <div
                  key={v.procurementId}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-slate-500">
                      Licitação: {v.procurementId}
                    </span>
                    <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-blue-100 text-blue-900">
                      {v.voteType === "SUPPORT"
                        ? "Apoio"
                        : v.voteType === "OPPOSE"
                        ? "Não Apoio"
                        : "Necessita Esclarecimento"}
                    </span>
                  </div>
                  {v.justification && (
                    <p className="text-slate-700 italic border-l-2 border-blue-400 pl-2">
                      &quot;{v.justification}&quot;
                    </p>
                  )}
                  <div className="text-[11px] text-slate-400">
                    Última alteração: {new Date(v.updatedAt).toLocaleString("pt-BR")}
                  </div>
                  <Link
                    href={`/licitacoes/${v.procurementId}`}
                    className="text-blue-900 hover:underline font-semibold block pt-1"
                  >
                    Abrir licitação e alterar voto →
                  </Link>
                </div>
              ))}

              {userVotes.companies.map((v) => (
                <div
                  key={v.companyCnpj}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-slate-500">
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
                    <p className="text-slate-700 italic border-l-2 border-emerald-400 pl-2">
                      &quot;{v.justification}&quot;
                    </p>
                  )}
                  <div className="text-[11px] text-slate-400">
                    Última alteração: {new Date(v.updatedAt).toLocaleString("pt-BR")}
                  </div>
                  <Link
                    href={`/empresas/${v.companyCnpj}`}
                    className="text-blue-900 hover:underline font-semibold block pt-1"
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
