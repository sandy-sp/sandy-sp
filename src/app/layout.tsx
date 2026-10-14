import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { PostHogProvider } from "@/components/shared/posthog-provider";
import { ThemeProvider, themeNoFlashScript } from "@/components/shared/theme-provider";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { CommandPalette } from "@/components/shared/command-palette";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const shareTechMono = Share_Tech_Mono({
  variable: "--font-share-tech-mono",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Sandy | AI Solution Specialist & Full-Stack Engineer",
  description:
    "Portfolio of Sandy. 9+ years engineering scalable systems, autonomous multi-agent orchestration, high-signal RAG architectures, and open-source developer tools.",
  keywords: [
    "Sandy",
    "Sandy-SP",
    "AI Solution Specialist",
    "Multi-Agent Orchestration",
    "LangGraph",
    "Generative AI Engineer",
    "RAG",
    "FastAPI",
    "Gittxt",
    "Audionomy",
  ],
  authors: [{ name: "Sandy" }],
  creator: "Sandy",
  metadataBase: new URL("https://www.sandy-sp.info"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.sandy-sp.info",
    title: "Sandy | AI Solution Specialist & Full-Stack Engineer",
    description:
      "Autonomous Multi-Agent Systems, High-Signal LLM Pipelines, and Scalable Cloud Infrastructure.",
    siteName: "Sandy Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sandy | AI Solution Specialist & Full-Stack Engineer",
    description:
      "Autonomous Multi-Agent Systems, High-Signal LLM Pipelines, and Scalable Cloud Infrastructure.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f8" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0f14" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${shareTechMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeNoFlashScript }} />
      </head>
      <body className="min-h-screen flex flex-col bg-[#faf9f8] dark:bg-[#0e0f14] text-zinc-900 dark:text-zinc-100 selection:bg-red-500/20 selection:text-red-700 dark:selection:text-red-300">
        <ThemeProvider>
          <PostHogProvider>
            {/* Ambient lightweight particle canvas */}
            <AmbientBackground />

            {/* Global Keyboard-Driven Command Palette (Cmd+K) */}
            <CommandPalette />

            {/* Sticky Modern Header */}
            <SiteHeader />

            {/* Main Application Content */}
            <main className="flex-1 w-full flex flex-col">
              {children}
            </main>

            {/* Site Footer */}
            <SiteFooter />
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
