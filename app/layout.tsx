import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastHost } from "@/components/ToastHost";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Yayasan Rumsram - Company Profile",
  description:
    "Company profile website (non-profit) with Supabase CMS. Static-export ready for shared hosting.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {/*
          NOTE:
          NavBar/Footer sengaja TIDAK diletakkan di RootLayout.
          Semua public page membungkus konten dengan <PublicShell /> masing-masing,
          supaya modal/lightbox di page mana pun tampil konsisten dan tidak “terpisah”.
        */}
        {children}
        <ToastHost />
      </body>
    </html>
  );
}
