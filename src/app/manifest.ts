import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Farol Cidadão de São Paulo",
    short_name: "Farol Cidadão",
    description:
      "Plataforma cívica independente de transparência pública, controle social e fiscalização de licitações, empresas e obras de São Paulo.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#09090B",
    theme_color: "#09090B",
    orientation: "portrait-primary",
    lang: "pt-BR",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
