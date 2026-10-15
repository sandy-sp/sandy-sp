import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Schibsted_Grotesk } from "next/font/google";
import { ViewTransition } from "react";
import "./globals.css";
import { PostHogProvider } from "@/components/shared/posthog-provider";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { LavaScene } from "@/components/scene/lava-scene";
import { SceneDirector, SmoothScroll } from "@/components/motion/smooth-scroll";

const schibsted = Schibsted_Grotesk({
  variable: "--font-schibsted",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

const title = "Sandy-SP — AI Solutions Engineer";
const description =
  "Sandeep (Sandy) builds retrieval pipelines, multi-agent workflows and the evals that keep them honest. Open-source tools: Gittxt, ollama-scout, Audionomy.";

export const metadata: Metadata = {
  title: { default: title, template: "%s — Sandy-SP" },
  description,
  keywords: ["Sandy-SP", "sandy-sp", "Sandeep", "AI engineer", "RAG", "LangGraph", "multi-agent", "Gittxt", "ollama-scout"],
  authors: [{ name: "Sandy-SP" }],
  creator: "Sandy-SP",
  metadataBase: new URL("https://www.sandy-sp.info"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.sandy-sp.info",
    title,
    description,
    siteName: "Sandy-SP",
  },
  twitter: { card: "summary_large_image", title, description },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: "#0b0a09",
  colorScheme: "dark",
  viewportFit: "cover",
};

// Marks that scripts run, so reveal pre-states may hide content (see globals.css).
const motionFlag = `document.documentElement.classList.add("motion")`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${schibsted.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionFlag }} />
      </head>
      <body className="min-h-screen">
        <PostHogProvider>
          <LavaScene />
          <SmoothScroll />
          <SceneDirector />
          <a
            href="#main"
            className="t-mono fixed left-4 top-4 z-[60] -translate-y-24 bg-bone px-3 py-2 text-ink! focus:translate-y-0"
          >
            Skip to content
          </a>
          <SiteHeader />
          <ViewTransition default="page-fade">
            <div className="relative">
              <main id="main">{children}</main>
              <SiteFooter />
            </div>
          </ViewTransition>
        </PostHogProvider>
      </body>
    </html>
  );
}
