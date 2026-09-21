import type { Metadata } from "next";
import { Inter, Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "@/lib/audio-context";
import { VideoProvider } from "@/lib/video-context";
import PageTransition from "@/components/PageTransition";
import ThemeProvider from "@/components/ThemeProvider";
import ConditionalLayout from "@/components/ConditionalLayout";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-barlow",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Brainerd Baptist Church — Chattanooga, TN",
  description:
    "A church family in Chattanooga, TN. Join us Sundays at 8:30 AM and 11:00 AM at 300 Brookfield Ave.",
  keywords: ["church", "Chattanooga", "Baptist", "Brainerd", "worship", "life groups"],
  openGraph: {
    title: "Brainerd Baptist Church",
    description: "A church family in Chattanooga, TN.",
    type: "website",
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
    shortcut: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${barlow.variable} ${barlowCondensed.variable} antialiased`}>
        <ThemeProvider>
          <AudioProvider>
            <VideoProvider>
              <PageTransition />
              <ConditionalLayout>{children}</ConditionalLayout>
            </VideoProvider>
          </AudioProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
