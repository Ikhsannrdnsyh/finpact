import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AppNavigation } from "@/components/layout/AppNavigation";
import { StorageNotice } from "@/components/layout/StorageNotice";
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
        <div className="min-h-dvh md:flex">
          <AppNavigation />
          <main id="konten" className="flex-1 px-4 pb-28 pt-6 md:px-8 md:pb-12 md:pt-8">
            <div className="mx-auto max-w-6xl">
              <StorageNotice />
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}