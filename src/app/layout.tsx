import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { getSessionUser } from "@/lib/supabase/server";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

export const metadata: Metadata = {
  title: "Roop — Where the creation meets the moment",
  description:
    "Discover and book India's most talented makeup artists, hairstylists and beauty professionals. Curated portfolios. Verified artists. On-demand booking.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getSessionUser();
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Nav user={user} />
        <div className="h-16 lg:h-20 shrink-0" aria-hidden />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
