import type { Metadata } from "next";
import { Playfair_Display, Inter, Cormorant_Garamond, Bodoni_Moda, Outfit } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { getSessionUser } from "@/lib/supabase/server";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

// Cormorant Garamond — editorial serif used for the artist profile's
// Professional Details section (18-Jun tracker item 2). Distinct from
// Playfair so the spec sheet reads as its own curated typography.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

// Bodoni Moda + Outfit pair — 23-Jun tracker item 4. Bodoni Moda is the
// high-contrast Italian fashion-magazine serif (display); Outfit is the
// geometric humanist sans (body / nav / buttons). Both load alongside
// the classic Playfair + Inter pair so flipping FONT_THEME below is a
// single-line change.
const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

// ▶ ONE-LINE REVERT KNOB
// "bodoni"  → Bodoni Moda (display) + Outfit (body)  — current live theme
// "classic" → Playfair Display (display) + Inter (body) — pre-23-Jun look
// Flip this constant to revert if Suraksha doesn't like the new pair.
const FONT_THEME: "bodoni" | "classic" = "bodoni";

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
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${cormorant.variable} ${bodoni.variable} ${outfit.variable} ${
        FONT_THEME === "bodoni" ? "fonts-bodoni" : ""
      } h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Nav user={user} />
        <div className="h-20 lg:h-24 shrink-0" aria-hidden />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
