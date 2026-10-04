import type { Metadata, Viewport } from "next";
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
  // Without an explicit title here, "Add to Home Screen" on iOS falls back
  // to truncating the full page <title> ("Brainerd Baptist Church —
  // Chattanooga, TN"), which is where the squished "BrainerdBaptist..."
  // label (reported 2026-10-04) came from. This is what actually controls
  // that label — short and deliberate, not left to iOS's own truncation.
  appleWebApp: {
    title: "Brainerd Baptist",
  },
  // Same label, for Android/Chrome's "Install app" — applicationName is
  // the non-manifest fallback; app/manifest.ts's name/short_name cover the
  // full PWA installed-app case.
  applicationName: "Brainerd Baptist",
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1525" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
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
