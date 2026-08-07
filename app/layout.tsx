import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://elmira.su"),
  title: "Elmira Yu. Kalimulina — Mathematics for Complex Systems",
  description:
    "Stochastic modelling, R&D, machine learning and reliability of complex networks. Research, industry projects, publications and teaching by Elmira Yu. Kalimulina.",
  authors: [{ name: "Elmira Yu. Kalimulina" }],
  creator: "Elmira Yu. Kalimulina",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "Elmira Yu. Kalimulina",
    "El'mira Yu. Kalimulina",
    "stochastic networks",
    "mathematical modelling",
    "queueing theory",
    "system reliability",
    "machine learning",
    "R&D",
  ],
  openGraph: {
    title: "Elmira Yu. Kalimulina — Mathematics for Complex Systems",
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
