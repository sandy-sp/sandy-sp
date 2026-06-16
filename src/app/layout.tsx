import type { Metadata } from "next";
import { Geist, Geist_Mono, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import { ParticleSphereLoader } from "@/components/shared/particle-sphere-loader";
import { PostHogProvider } from "@/components/shared/posthog-provider";
import { SphereSceneController } from "@/components/shared/sphere-scene-controller";
import { ThemeProvider, themeNoFlashScript } from "@/components/shared/theme-provider";
import { ThemeToggle } from "@/components/shared/theme-toggle";

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
  title: "Sandeep Paidipati",
  description: "Portfolio website",
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
      <body className="min-h-screen flex flex-col">
        <ThemeProvider>
          <PostHogProvider>
            <ParticleSphereLoader />
            <SphereSceneController />
            {children}
            <ThemeToggle />
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
