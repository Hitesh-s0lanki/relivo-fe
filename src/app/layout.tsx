import "./globals.css";

import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";

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
  title: "Relivo — AI Task Assistant",
  description:
    "Assign tasks, automate workflows, and get things done with Relivo.",
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
          <ReactQueryProvider>{children}</ReactQueryProvider>
          <Toaster richColors position="bottom-right" visibleToasts={3} />
          {process.env.VERCEL_ENV === "production" && <Analytics />}
        </body>
      </html>
    </ClerkProvider>
  );
}
