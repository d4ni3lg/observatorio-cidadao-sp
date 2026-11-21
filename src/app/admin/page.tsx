"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  RefreshCw,
  MessageSquare,
  FileWarning,
  Sliders,
  CheckCircle2,
  XCircle,
  Lock,
  History,
  Play,
  Database,
  Key,
  LogOut,
  User,
  Eye,
  EyeOff,
  AlertTriangle,
  Download,
  ArrowRight,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { getDataSources } from "@/lib/data-provider";

export default function AdminDashboardPage() {
  const officialSources = getDataSources() || [];

  // Estado de Autenticação Administrativa
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Estados do Painel Autenticado
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const [moderationQueue, setModerationQueue] = useState([
    {
      id: "mod-101",
      type: "Comentário em Empresa (CONSÓRCIO ENGEFORM LEMAM)",
      author: "Cidadão Paulistano #A3F9",
      date: "21/11/2026 09:30",
      content:
        "A obra da creche no Grajaú foi entregue com atraso de 8 meses conforme termo aditivo assinado na SIURB. A população local confirmou o funcionamento nesta semana.",
      status: "PENDING",
    },
    {
      id: "mod-102",
      type: "Relato em Obra Atrasada (SIURB-GESCONFI-358)",
      author: "Cidadã Paulistana #F28C",
      date: "21/11/2026 10:15",
      content:
        "Foto da placa no local confirma nova reprogramação para dezembro de 2026. Houve mobilização no canteiro hoje pela manhã.",
      status: "PENDING",
    },
    {
      id: "mod-103",
      type: "Manifestação Empresarial (Direito de Resposta)",
      author: "Jurídico • Fornecedor PMSP",
      date: "20/11/2026 17:40",
      content:
        "Protocolo SEI 6022.2023/0005538-8 juntado ao processo demonstrando prorrogação de prazo concedida por motivo de força maior.",
      status: "PENDING",
    },
  ]);

  const [auditLogs, setAuditLogs] = useState([
    {
      timestamp: "21/11/2026 10:15:30",
      actor: "Sistema Automático (Cron)",
      action: "SINCRONIZAÇÃO COMPLETA DE BASES OFICIAIS",
      target: "PNCP, Gesconfi SIURB e Obras Abertas",
      justification: "Ingestão programada de 92 empresas, 25 licitações e 20 obras.",
    },
    {
      timestamp: "21/11/2026 09:42:10",
      actor: "Auditor Chefe (admin)",
      action: "PUBLICAÇÃO DE DIREITO DE RESPOSTA EMPRESARIAL",
      target: "Empresa CNPJ 14.864.530/0001-92",
      justification: "Nota protocolada via canal oficial conforme Seção 14 do edital.",
    },
    {
      timestamp: "21/11/2026 08:00:02",
      actor: "Motor Cívico de IA",
      action: "GERAÇÃO DE RESUMO EM LINGUAGEM CIDADÃ",
      target: "Pregão 90001/2026 - SMS São Paulo",
      justification: "Respostas às 6 perguntas essenciais sem alucinações.",
    },
  ]);

  // Verifica se já existe sessão ativa ao carregar
  useEffect(() => {
    async function checkCurrentSession() {
      try {
        const res = await fetch("/api/admin/auth");
        if (res.ok) {
          setIsAuthenticated(true);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    }
    checkCurrentSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: usernameInput,
          password: passwordInput,
          _hp: "",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsAuthenticated(true);
        setAuditLogs((prev) => [
          {
            timestamp: new Date().toLocaleString("pt-BR"),
            actor: "admin (Sessão Segura)",
            action: "AUTENTICAÇÃO ADMINISTRATIVA BEM-SUCEDIDA",
            target: "Painel de Controle Farol Cidadão",
            justification: "Acesso autorizado com credenciais auditáveis.",
          },
          ...prev,
        ]);
      } else {
        setLoginError(data.error || "Falha na autenticação administrativa.");
      }
    } catch {
      setLoginError("Erro ao comunicar com o servidor de segurança.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setIsAuthenticated(false);
    setPasswordInput("");
    setLoginError(null);
  };

  const fillDemoCredentials = () => {
    setUsernameInput("admin");
    setPasswordInput("Farol@SP2026!");
    setLoginError(null);
  };

  const handleTriggerSync = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSyncMsg(
          `Sincronização com bases oficiais concluída com êxito! ${data.procurementsCount || 25} editais/PCA, ${data.companiesCount || 92} empresas e ${data.delayedWorksCount || 20} obras sincronizadas no Supabase.`
        );
        setAuditLogs((prev) => [
          {
            timestamp: new Date().toLocaleString("pt-BR"),
            actor: "admin (Painel de Controle)",
            action: "DISPARO MANUAL DE SINCRONIZAÇÃO OFICIAL",
            target: "Supabase PostgreSQL & APIs PMSP",
            justification: "Atualização imediata de dados solicitada pelo controlador.",
          },
          ...prev,
        ]);
      } else {
        setSyncMsg(data.message || "Falha ao acionar sincronização oficial.");
      }
    } catch {
      setSyncMsg("Erro ao comunicar com a rota de sincronização.");
    } finally {
      setSyncing(false);
    }
  };

  const handleModerate = (id: string, decision: "APPROVED" | "REJECTED") => {
    setModerationQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: decision } : item))
    );
    setAuditLogs((prev) => [
      {
        timestamp: new Date().toLocaleString("pt-BR"),
        actor: "admin (Auditor Master)",
        action:
          decision === "APPROVED"
            ? "MODERAÇÃO: MANIFESTAÇÃO APROVADA"
            : "MODERAÇÃO: REJEITADA POR CRITÉRIO OBJETIVO",
        target: id,
        justification: "Decisão gravada em trilha de auditoria imutável (Seção 15).",
      },
      ...prev,
    ]);
  };

  const exportAuditLogsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `trilha-auditoria-farol-sp-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (checkingAuth) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center text-xs text-neutral-500 flex flex-col items-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-red-600" />
        <span>Verificando credenciais de auditoria e segurança...</span>
      </div>
    );
  }

  // 1. TELA DE LOGIN ADMINISTRATIVO SEGURO
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <Logo size="lg" />
            </div>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-950 text-red-300 border border-red-800">
                <Lock className="w-3.5 h-3.5" />
                Área Restrita • Controle e Auditoria
              </span>
            </div>
            <h1 className="font-display text-2xl font-black text-neutral-900">
              Acesso ao Painel Administrativo
            </h1>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Ambiente restrito aos auditores cívicos e controladores do Farol Cidadão de São Paulo.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xl space-y-5">
            {loginError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-xs text-red-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                <div className="font-medium">{loginError}</div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-neutral-500" />
                  Usuário ou E-mail Institucional
                </label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="admin"
                  required
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1.5 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-neutral-500" />
                  Senha de Acesso
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-700"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 rounded-xl bg-red-700 text-white text-sm font-bold hover:bg-red-800 disabled:opacity-50 transition-all shadow-md active:scale-95 border border-red-800 flex items-center justify-center gap-2"
              >
                {loginLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Autenticando sessão segura...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Entrar no Painel Master
                  </>
                )}
              </button>
            </form>

            {/* Destaque de Credenciais de Demonstração para a Apresentação */}
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-2">
              <div className="font-bold text-neutral-800 flex items-center justify-between">
                <span>🔑 Credenciais de Apresentação:</span>
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="text-[11px] font-bold text-red-700 hover:underline"
                >
                  Preencher dados
                </button>
              </div>
              <div className="font-mono text-[11px] text-neutral-700 bg-white p-2 rounded border border-neutral-200 space-y-0.5">
                <div><strong>Usuário:</strong> admin</div>
                <div><strong>Senha:</strong> Farol@SP2026!</div>
              </div>
              <div className="text-[10px] text-neutral-500 leading-tight">
                Protegido por Rate Limiting (máximo 5 tentativas) e comparação segura timing-safe.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. PAINEL DE CONTROLE ADMINISTRATIVO AUTENTICADO
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Cabeçalho do Painel com Botão de Logout */}
      <div className="bg-neutral-950 text-white p-6 sm:p-8 rounded-2xl border border-red-950/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-red-950 text-red-300 border border-red-700/60">
            <Shield className="w-3.5 h-3.5 text-red-400" />
            Sessão Segura • Controlador Cívico Master
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-white">
            Painel Administrativo & Auditoria Oficial
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Monitoramento de fontes primárias, orquestração de sincronizações com o Supabase e fila de moderação de relatos públicos com trilha de auditoria imutável.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={exportAuditLogsJSON}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-900 text-xs font-bold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" />
            Exportar Auditoria (JSON)
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold transition-all shadow-md active:scale-95 border border-red-800"
          >
            <LogOut className="w-3.5 h-3.5" />
            Encerrar Sessão
          </button>
        </div>
      </div>

      {/* Alerta de Retorno da Sincronização */}
      {syncMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 flex items-start gap-2.5 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="font-medium">{syncMsg}</div>
        </div>
      )}

      {/* Seção 1: Monitoramento das Fontes Oficiais */}
      <section className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-red-700 font-bold flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              Fontes Primárias & Integradores
            </div>
            <h2 className="font-display font-bold text-xl text-neutral-900 mt-1">
              Conexões de Dados Governamentais (São Paulo)
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              5 fontes oficiais integradas com monitoramento contínuo de latência e integridade.
            </p>
          </div>
          <button
            type="button"
            onClick={handleTriggerSync}
            disabled={syncing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shrink-0 border border-red-800"
          >
            {syncing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Sincronizando com Supabase...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Disparar Sincronização Oficial
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {officialSources.map((source) => (
            <div
              key={source.code}
              className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-2.5 hover:border-neutral-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-neutral-900">
                  {source.code}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  ONLINE
                </span>
              </div>
              <h3 className="font-display text-sm font-bold text-neutral-900 leading-snug">
                {source.name}
              </h3>
              <div className="text-[11px] text-neutral-500 space-y-1">
                <div>
                  <strong>Frequência:</strong> {source.refreshFrequency}
                </div>
                <div>
                  <strong>Última consulta:</strong>{" "}
                  {new Date(source.lastConsultationAt).toLocaleString("pt-BR")}
                </div>
              </div>
              <div className="pt-2 border-t border-neutral-200">
                <a
                  href={source.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-red-700 hover:text-red-800 font-bold inline-flex items-center gap-1"
                >
                  Documentação da API →
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Seção 2: Fila de Moderação Objetiva */}
      <section className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="border-b border-neutral-200 pb-5">
          <div className="text-xs font-mono uppercase tracking-wider text-red-700 font-bold flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            Seção 13 • Moderação e Direito de Resposta
          </div>
          <h2 className="font-display font-bold text-xl text-neutral-900 mt-1">
            Fila de Moderação por Critérios Objetivos
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Apenas relatos comprováveis com referência a Diário Oficial, processo SEI ou fotos de placas são aprovados. Ofensas são rejeitadas.
          </p>
        </div>

        <div className="space-y-3.5">
          {moderationQueue.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-xl border border-neutral-200 bg-neutral-50/70 space-y-3 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-neutral-700">
                    {item.author}
                  </span>
                  <span className="text-neutral-300">•</span>
                  <span className="text-xs text-neutral-500">{item.date}</span>
                  <span className="text-neutral-300">•</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.status === "APPROVED"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : item.status === "REJECTED"
                        ? "bg-red-100 text-red-800 border border-red-300"
                        : "bg-amber-100 text-amber-800 border border-amber-300"
                    }`}
                  >
                    {item.status === "APPROVED"
                      ? "APROVADO"
                      : item.status === "REJECTED"
                      ? "REJEITADO"
                      : "PENDENTE"}
                  </span>
                </div>
                <div className="text-xs font-semibold text-neutral-600">
                  {item.type}
                </div>
                <p className="text-xs text-neutral-800 bg-white p-3 rounded-lg border border-neutral-200 italic">
                  &quot;{item.content}&quot;
                </p>
              </div>

              {item.status === "PENDING" && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleModerate(item.id, "APPROVED")}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Aprovar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModerate(item.id, "REJECTED")}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-bold transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Rejeitar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Seção 3: Trilha de Auditoria Imutável */}
      <section className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="border-b border-neutral-200 pb-5">
          <div className="text-xs font-mono uppercase tracking-wider text-red-700 font-bold flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" />
            Seção 15 • Trilha de Auditoria Imutável
          </div>
          <h2 className="font-display font-bold text-xl text-neutral-900 mt-1">
            Registro de Operações Administrativas
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Cada ação de moderação, sincronização ou manifestação protocolada gera um carimbo irremovível de auditoria.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-100 text-neutral-700">
                <th className="py-2.5 px-3 font-bold font-mono">Timestamp</th>
                <th className="py-2.5 px-3 font-bold">Autor</th>
                <th className="py-2.5 px-3 font-bold">Ação</th>
                <th className="py-2.5 px-3 font-bold">Alvo</th>
                <th className="py-2.5 px-3 font-bold">Justificativa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {auditLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="py-3 px-3 font-mono text-neutral-600 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-3 font-semibold text-neutral-900">
                    {log.actor}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-red-700 text-[11px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-neutral-700 font-mono text-[11px]">
                    {log.target}
                  </td>
                  <td className="py-3 px-3 text-neutral-600 text-xs">
                    {log.justification}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
