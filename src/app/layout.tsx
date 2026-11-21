import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { PwaProvider } from "@/components/pwa/PwaContext";
import { OfflineBanner } from "@/components/pwa/OfflineBanner";
import { UpdateToast } from "@/components/pwa/UpdateToast";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#09090B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Farol Cidadão de São Paulo | Observatório de Transparência e Controle Social",
  description:
    "Farol Cidadão de São Paulo: plataforma cívica independente de iluminação dos gastos públicos, participação popular auditável e acompanhamento de editais, empresas e obras públicas do Município de São Paulo.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Farol Cidadão",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen flex flex-col font-sans bg-neutral-50 text-neutral-900 antialiased selection:bg-red-700 selection:text-white">
        <PwaProvider>
          {/* Notificação Fixa de Modo Offline */}
          <OfflineBanner />

          {/* Cabeçalho Oficial */}
          <Header />

          {/* Conteúdo Principal */}
          <main className="flex-1 pb-16 xl:pb-0">{children}</main>

          {/* Rodapé e Navegação Mobile */}
          <Footer />
          <MobileBottomNav />

          {/* Alertas de Atualização e Prompt de Instalação */}
          <UpdateToast />
          <InstallPrompt />
        </PwaProvider>
      </body>
    </html>
  );
}
