import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://elmira.su"),
  title: "El'mira Yu. Kalimulina — Mathematics for Complex Systems",
  description:
    "Stochastic modelling, applied mathematics, computer and telecommunications networks, machine learning and reliability of complex systems. Research, industry projects, publications and teaching by El'mira Yu. Kalimulina.",
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
    title: "El'mira Yu. Kalimulina — Mathematics for Complex Systems",
    description:
      "Researcher, lecturer and industry expert working across stochastic systems, machine learning and telecommunications.",
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
