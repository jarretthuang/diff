import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Diff Tool",
  description: "A simple tool to compare two blocks of text",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col h-screen w-screen overflow-hidden`}
      >
        {/* Header */}
        <header className="flex items-center gap-4 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm px-6 py-3">
          <Link href="/" className="select-none opacity-90 hover:opacity-100 transition-opacity duration-200">
            <Image
              src="/jh.png"
              alt="JH"
              className="h-8 w-8 shrink-0"
              draggable="false"
              width={50}
              height={50}
            />
          </Link>
          <h1 className="flex-1 text-xl font-bold">Diff Tool</h1>
        </header>
        <main className="flex-1 min-h-0">{children}</main>
        <footer className="w-full flex justify-center">
          <span className="text-xs opacity-30 pb-3">
            @ {new Date().getFullYear()}{" "}
            <a href="https://jhuang.ca" target="_blank">
              Jarrett Huang
            </a>{" "}
            |{" "}
            <a
              href="https://github.com/jarretthuang/diff"
              target="_blank"
            >
              Github
            </a>
          </span>
        </footer>
      </body>
    </html>
  );
}
