import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";

const nunito = localFont({
  src: "../../public/fonts/Nunito-Regular.woff",
  variable: "--font-nunito",
  display: "swap",
});

const bebasNeue = localFont({
  src: "../../public/fonts/BebasNeue-Regular.woff",
  variable: "--font-bebas",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JackedAI – AI-Powered Gym Tracker",
  description: "Track your workouts and meals with AI assistance",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body
        className={`${nunito.variable} ${bebasNeue.variable} antialiased`}
      >
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
