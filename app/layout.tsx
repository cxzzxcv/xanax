import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono, Barlow_Condensed, Rajdhani } from "next/font/google";
import "./globals.css";

// Your local Spanish font for the hero name
const spanish = localFont({
  src: "../fonts/Spanish.ttf",
  variable: "--font-spanish",
  display: "swap",
});

const mono = JetBrains_Mono({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const barlow = Barlow_Condensed({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-barlow",
  display: "swap",
});

// Intro boot-console font
const rajdhani = Rajdhani({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-rajdhani",
  display: "swap",
});

export const metadata: Metadata = {
  title: "luca",
  description: "developer · creator · vrchat enthusiast",
};

export const viewport: Viewport = {
  themeColor: "#19191e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spanish.variable} ${mono.variable} ${barlow.variable} ${rajdhani.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
