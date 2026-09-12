import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MangaBook - Read Manga & Books",
  description: "A modern platform for reading manga and books.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col`}
      >
        <Navbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <footer className="w-full border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a0f0d] py-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            MangaBook - <span className="font-semibold text-brand-primary dark:text-brand-secondary">By comicbook.brave</span>
          </p>
        </footer>
      </body>
    </html>
  );
}
