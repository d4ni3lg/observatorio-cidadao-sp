"use client";

// Gerenciador de Notificações Nativas do Sistema Operacional (Farol Cidadão SP)

export interface CivicNotificationOptions {
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
}

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return "denied";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    console.warn("API de Notificações não suportada neste navegador.");
    return "denied";
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // Dispara uma confirmação imediata
      triggerNativeNotification("🔔 Farol Cidadão: Alertas Ativados!", {
        body: "Você receberá atualizações sobre licitações de SP, obras atrasadas e confirmações de votos cívicos.",
        tag: "permission_granted",
      });
    }
    return permission;
  } catch (error) {
    console.error("Erro ao solicitar permissão de notificações:", error);
    return "denied";
  }
}

export async function triggerNativeNotification(
  title: string,
  options?: CivicNotificationOptions
): Promise<boolean> {
  // Sempre emite evento in-app para exibição imediata no toast visual ajustado na tela
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(
        new CustomEvent("civic_notification", {
          detail: {
            title,
            body: options?.body,
            icon: options?.icon,
            tag: options?.tag,
          },
        })
      );
    } catch (e) {
      console.warn("Falha ao emitir evento civic_notification:", e);
    }
  }

  if (!isNotificationSupported()) return false;

  if (Notification.permission !== "granted") {
    return false;
  }

  const defaultIcon = "/icon.svg";
  const defaultBadge = "/icon.svg";

  try {
    // 1. Tenta via Service Worker Registration (melhor para Mobile e Android)
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && registration.showNotification) {
        await registration.showNotification(title, {
          icon: options?.icon || defaultIcon,
          badge: options?.badge || defaultBadge,
          body: options?.body || "",
          tag: options?.tag || `notif_${Date.now()}`,
          vibrate: [200, 100, 200],
          data: options?.data || { url: "/" },
          requireInteraction: options?.requireInteraction || false,
        } as any);
        return true;
      }
    }

    // 2. Fallback para Notification API nativa direta (Desktop / Safari)
    const n = new Notification(title, {
      icon: options?.icon || defaultIcon,
      badge: options?.badge || defaultBadge,
      body: options?.body,
      tag: options?.tag,
    });

    n.onclick = () => {
      window.focus();
      n.close();
    };

    return true;
  } catch (err) {
    console.warn("Falha ao emitir notificação nativa:", err);
    return false;
  }
}

// -------------------------------------------------------------
// Disparos Especializados do Farol Cidadão
// -------------------------------------------------------------

export function notifyVoteRegistered(subjectName: string, voteType: string) {
  triggerNativeNotification("🗳️ Voto Cívico Registrado com Sucesso!", {
    body: `Sua manifestação (${voteType}) para "${subjectName}" foi criptografada e salva na trilha de auditoria pública.`,
    tag: `vote_${Date.now()}`,
  });
}

export function notifyAccountActivated(anonId: string) {
  triggerNativeNotification("🛡️ Conta Cidadã Verificada", {
    body: `Dispositivo autenticado com token anônimo #${anonId}. Seus dados estão seguros e em conformidade com a LGPD.`,
    tag: "account_auth",
  });
}

export function notifyNewProcurementAlert(title: string, value: string) {
  triggerNativeNotification("📢 Novo Edital Publicado em São Paulo!", {
    body: `${title} • Orçamento estimado em ${value}. Confira no Farol da Transparência.`,
    tag: `bid_${Date.now()}`,
  });
}

export function notifyDelayedWorkAlert(workName: string, delayMonths: number) {
  triggerNativeNotification("⚠️ Atualização de Obra com Atraso", {
    body: `A obra "${workName}" possui novo registro de atraso (${delayMonths} meses). Fiscalize os aditivos contratuais.`,
    tag: `work_${Date.now()}`,
  });
}

export function notifyVoteSuggestion(companyName: string) {
  triggerNativeNotification("💡 Sugestão para Avaliação Cidadã", {
    body: `A empresa "${companyName}" foi homologada em nova contratação pública. Deixe sua percepção cívica.`,
    tag: `suggest_${Date.now()}`,
  });
}

export function notifyAppUpdateAvailable(version: string) {
  triggerNativeNotification("✨ Farol Cidadão Atualizado", {
    body: `A versão ${version} está pronta para uso com melhorias de segurança e dados do PNCP.`,
    tag: "app_update",
    requireInteraction: true,
  });
}
