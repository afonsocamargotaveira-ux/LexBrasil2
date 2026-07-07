import "./globals.css";

export const metadata = {
  title: "LexBrasil — Pesquisa de Legislação",
  description:
    "Pesquise a base pública de legislação da Câmara dos Deputados (Legislação Federal e Legislação Interna) e exporte os resultados em Word (.docx).",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚖️</text></svg>",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
