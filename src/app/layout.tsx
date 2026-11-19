import type { Metadata } from "next";
import { Hanken_Grotesk, Fraunces, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LangProvider } from "@/lib/i18n";
import "./globals.css";

const geistSans = Hanken_Grotesk({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], axes: ["opsz", "SOFT"] });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Astraea AI — Intelligent workspace",
  description: "A premium AI workspace for conversations, knowledge, and focused work.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} dark h-full`}>
      <body className="min-h-full bg-background antialiased">
        <LangProvider><TooltipProvider>{children}</TooltipProvider></LangProvider>
      </body>
    </html>
  );
}
