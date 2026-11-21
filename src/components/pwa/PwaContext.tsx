"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getNotificationPermission,
  isNotificationSupported,
  requestNotificationPermission,
  triggerNativeNotification,
  CivicNotificationOptions,
} from "@/lib/pwa/notifications";
import { getPendingOfflineActions } from "@/lib/pwa/offline-queue";

interface PwaContextType {
  isOnline: boolean;
  isOffline: boolean;
  simulatedOffline: boolean;
  toggleSimulatedOffline: () => void;
  updateAvailable: boolean;
  applyUpdate: () => void;
  notificationPermission: NotificationPermission;
  requestPermission: () => Promise<NotificationPermission>;
  sendNotification: (title: string, options?: CivicNotificationOptions) => Promise<boolean>;
  canInstall: boolean;
  triggerInstall: () => Promise<void>;
  offlineQueueCount: number;
}

const PwaContext = createContext<PwaContextType | null>(null);

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [browserOnline, setBrowserOnline] = useState<boolean>(true);
  const [simulatedOffline, setSimulatedOffline] = useState<boolean>(false);
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState<boolean>(false);
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(0);

  // Status efetivo: offline se o navegador estiver desconectado OU se o usuário ativou a simulação offline
  const isOnline = browserOnline && !simulatedOffline;
  const isOffline = !isOnline;

  const toggleSimulatedOffline = useCallback(() => {
    setSimulatedOffline((prev) => !prev);
  }, []);

  // 1. Monitoramento de Conexão com o Navegador
  useEffect(() => {
    if (typeof window !== "undefined") {
      setBrowserOnline(navigator.onLine);

      const handleOnline = () => setBrowserOnline(true);
      const handleOffline = () => setBrowserOnline(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  // 2. Registro do Service Worker e Detecção de Atualizações do App
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          // Se já houver um worker em espera
          if (registration.waiting) {
            setWaitingWorker(registration.waiting);
            setUpdateAvailable(true);
          }

          // Escuta novas atualizações
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  setWaitingWorker(newWorker);
                  setUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn("Falha no registro do Service Worker:", err);
        });

      // Recarrega quando o novo SW assume o controle
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  // 3. Aplica atualização pendente
  const applyUpdate = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    } else {
      window.location.reload();
    }
  }, [waitingWorker]);

  // 4. Captura de Evento de Instalação (PWA Install Prompt)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleBeforeInstall = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setCanInstall(true);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstall);

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      };
    }
  }, []);

  const triggerInstall = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setCanInstall(false);
      }
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  // 5. Permissão de Notificações
  useEffect(() => {
    if (isNotificationSupported()) {
      setNotificationPermission(getNotificationPermission());
    }
  }, []);

  const requestPermission = useCallback(async () => {
    const res = await requestNotificationPermission();
    setNotificationPermission(res);
    return res;
  }, []);

  const sendNotification = useCallback(
    async (title: string, options?: CivicNotificationOptions) => {
      return triggerNativeNotification(title, options);
    },
    []
  );

  // 6. Atualização da Contagem da Fila Offline
  useEffect(() => {
    async function checkQueue() {
      try {
        const pending = await getPendingOfflineActions();
        setOfflineQueueCount(pending.length);
      } catch {
        setOfflineQueueCount(0);
      }
    }
    checkQueue();
  }, [isOnline]);

  return (
    <PwaContext.Provider
      value={{
        isOnline,
        isOffline,
        simulatedOffline,
        toggleSimulatedOffline,
        updateAvailable,
        applyUpdate,
        notificationPermission,
        requestPermission,
        sendNotification,
        canInstall,
        triggerInstall,
        offlineQueueCount,
      }}
    >
      {children}
    </PwaContext.Provider>
  );
}

export function usePwa() {
  const context = useContext(PwaContext);
  if (!context) {
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    return {
      isOnline,
      isOffline: !isOnline,
      simulatedOffline: false,
      toggleSimulatedOffline: () => {},
      updateAvailable: false,
      applyUpdate: () => {},
      notificationPermission: "default" as NotificationPermission,
      requestPermission: async () => "default" as NotificationPermission,
      sendNotification: async () => false,
      canInstall: false,
      triggerInstall: async () => {},
      offlineQueueCount: 0,
    };
  }
  return context;
}
