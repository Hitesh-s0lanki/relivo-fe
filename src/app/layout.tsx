import "./globals.css";

import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ReactQueryProvider } from "@/providers/query-client-provider";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Relivo - Agent Orchestration Platform",
    template: "%s | Relivo",
  },
  description:
    "Build, run, deploy, and embed production-ready AI agent workflows with Relivo.",
  applicationName: "Relivo",
  keywords: [
    "Relivo",
    "agent orchestration",
    "AI agents",
    "agent workflows",
    "MCP",
    "streaming API",
    "embeddable AI chat",
  ],
  openGraph: {
    title: "Relivo - Agent Orchestration Platform",
    description:
      "Build an agent workflow once, then use it through chat, APIs, SDKs, and embedded UI.",
    siteName: "Relivo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Relivo - Agent Orchestration Platform",
    description:
      "Build, run, deploy, and embed production-ready AI agent workflows.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      afterSignOutUrl="/sign-in"
      appearance={{ variables: { colorPrimary: "#111827" } }}
    >
      <html
        lang="en"
        className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
      >
        <body className="flex min-h-full flex-col">
          <TooltipProvider>
            <ReactQueryProvider>{children}</ReactQueryProvider>
          </TooltipProvider>
          <Toaster richColors position="bottom-right" visibleToasts={3} />
          {process.env.VERCEL_ENV === "production" && <Analytics />}
        </body>
      </html>
    </ClerkProvider>
  );
}
