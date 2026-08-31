import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://elmira.su"),
  title: "El'mira Yu. Kalimulina — Stochastic Networks & Applied Mathematics",
  description:
    "Probability, queueing theory and applied mathematical modelling for stochastic networks in telecommunications, transport, distributed computing and financial systems. Research and industry work by El'mira Yu. Kalimulina.",
  authors: [{ name: "El'mira Yu. Kalimulina" }],
  creator: "El'mira Yu. Kalimulina",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "El'mira Yu. Kalimulina",
    "El'mira Yu. Kalimulina",
    "stochastic networks",
    "mathematical modelling",
    "queueing theory",
    "system reliability",
    "machine learning",
    "computer networks",
    "telecommunications networks",
    "R&D",
  ],
  openGraph: {
    title: "El'mira Yu. Kalimulina — Stochastic Networks & Applied Mathematics",
    description:
      "Probability, queueing theory and mathematical modelling for stochastic networks and industrial systems under uncertainty.",
    type: "website",
    locale: "en_GB",
    url: "/",
  },
  other: {
    "codex-preview": "development",
    "alternate-name": "El'mira Yu. Kalimulina",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
