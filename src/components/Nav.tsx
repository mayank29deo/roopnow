"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Logo } from "./Logo";
import { Menu, X, Sparkles, LayoutDashboard, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  role: string;
  artistId: string | null;
} | null;

export function Nav({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  const nav = [
    { href: "/discover", label: "Discover Artists" },
    { href: "/services", label: "Services" },
    { href: "/for-artists", label: "For Artists" },
    { href: "/about", label: "About" },
  ];

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    router.push("/");
  }

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all ${
        scrolled
          ? "bg-bg/85 backdrop-blur-xl border-b border-border-strong shadow-lg shadow-wine-deep/30"
          : "bg-bg/60 backdrop-blur-md border-b border-border"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex items-center justify-between h-20 lg:h-24">
          <Logo />

          <nav className="hidden lg:flex items-center gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  pathname?.startsWith(item.href)
                    ? "text-ink bg-surface"
                    : "text-ink-dim hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border hover:border-gold/40 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose to-violet flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm">{user.name.split(" ")[0]}</span>
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="absolute right-0 mt-2 w-56 glass-strong rounded-2xl p-2 shadow-2xl"
                    >
                      <div className="px-3 py-2 border-b border-border mb-1">
                        <p className="text-xs text-ink-dim">Signed in as</p>
                        <p className="text-sm font-medium truncate">{user.name}</p>
                      </div>
                      <Link
                        href={
                          user.role === "admin" ? "/admin"
                          : user.role === "artist" ? "/artist/dashboard"
                          : "/dashboard"
                        }
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-surface-2"
                      >
                        <LayoutDashboard size={16} /> Dashboard
                      </Link>
                      {user.role === "customer" && (
                        <Link
                          href="/for-artists"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-surface-2"
                        >
                          <Sparkles size={16} /> Become an Artist
                        </Link>
                      )}
                      <button
                        onClick={signOut}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-surface-2 text-rose"
                      >
                        <LogOut size={16} /> Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm px-4 py-2 text-ink-dim hover:text-ink">
                  Log in
                </Link>
                <Link href="/signup" className="btn-primary text-sm shine">
                  <Sparkles size={15} />
                  Get started
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden p-2 rounded-full bg-surface"
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden border-t border-border bg-bg/95 backdrop-blur-xl"
          >
            <div className="px-5 py-4 flex flex-col gap-1">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-3 rounded-xl hover:bg-surface text-ink-dim"
                >
                  {item.label}
                </Link>
              ))}
              <div className="h-px bg-border my-3" />
              {user ? (
                <>
                  <Link
                    href={
                      user.role === "admin" ? "/admin"
                      : user.role === "artist" ? "/artist/dashboard"
                      : "/dashboard"
                    }
                    className="btn-ghost"
                  >
                    Dashboard
                  </Link>
                  <button onClick={signOut} className="btn-ghost text-rose">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn-ghost">Log in</Link>
                  <Link href="/signup" className="btn-primary">Get started</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
