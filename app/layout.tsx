import type { Metadata } from "next";
import { Lora, Inter } from "next/font/google";
import "./globals.css";
import { DevToolbar } from "./components/DevToolbar";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Harvest — Share what you grow",
  description:
    "A community platform for home growers to trade, give away, or sell their home-grown produce with neighbours.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lora.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        {children}
        <DevToolbar /> {/* DEV ONLY — remove this line before launch */}
      </body>
    </html>
  );
}
