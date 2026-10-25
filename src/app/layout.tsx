import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "FinPact — Student Money Tracker", template: "%s | FinPact" },
  description: "Catat uang jajan, pantau saldo, dan capai target tabunganmu.",
};

export const viewport: Viewport = {
  themeColor: "#2477d4",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body className="font-sans antialiased">
        <a
          href="#konten"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:shadow"
        >
          Lewati ke konten
        </a>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}