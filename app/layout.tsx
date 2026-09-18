import type { Metadata } from "next";
import { Inter, Barlow } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/nav/Navbar";
import Footer from "@/components/footer/Footer";
import { AudioProvider } from "@/lib/audio-context";
import GlobalAudioPlayer from "@/components/audio/GlobalAudioPlayer";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-barlow",
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${barlow.variable} antialiased`}>
        <AudioProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <GlobalAudioPlayer />
        </AudioProvider>
      </body>
    </html>
  );
}
