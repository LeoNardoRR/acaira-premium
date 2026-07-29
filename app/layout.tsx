import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const sans = DM_Sans({ variable: "--font-sans", subsets: ["latin"] });
const display = Playfair_Display({ variable: "--font-display", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  return {
    title: { default: "Açaíra — Açaí feito de verdade", template: "%s | Açaíra" },
    description: "Açaí premium, frutas frescas e combinações inesquecíveis. Peça online e receba em casa.",
    keywords: ["açaí", "delivery de açaí", "bowl", "açaí premium", "São Paulo"],
    openGraph: {
      title: "Açaíra — Seu momento mais gostoso",
      description: "Açaí de verdade, frutas frescas e combinações inesquecíveis.",
      type: "website",
      locale: "pt_BR",
      images: [{ url: `${origin}/og.png`, width: 1730, height: 909, alt: "Açaíra — Seu momento mais gostoso" }],
    },
    twitter: { card: "summary_large_image", images: [`${origin}/og.png`] },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className={`${sans.variable} ${display.variable}`}>{children}</body></html>;
}
