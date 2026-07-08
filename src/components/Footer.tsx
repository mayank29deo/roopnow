import Link from "next/link";
import { Logo } from "./Logo";
import { Instagram, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-border">
      <div className="absolute inset-x-0 -top-24 h-24 bg-gradient-to-b from-transparent to-bg pointer-events-none" />
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
        <div className="grid lg:grid-cols-5 gap-12 mb-12">
          <div className="lg:col-span-2">
            <Logo size="lg" withTagline />
            <p className="mt-6 text-ink-dim max-w-sm text-sm leading-relaxed">
              India&apos;s curated marketplace for beauty artistry. Discover
              verified makeup Artists, hairstylists, and beauty professionals.
              Book moments that matter.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://www.instagram.com/roop.now"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Roop on Instagram"
                className="w-10 h-10 rounded-full bg-surface hover:bg-surface-2 border border-border flex items-center justify-center transition-colors"
              >
                <Instagram size={16} />
              </a>
              <a href="mailto:roopsupport@gmail.com" className="w-10 h-10 rounded-full bg-surface hover:bg-surface-2 border border-border flex items-center justify-center">
                <Mail size={16} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest text-gold mb-4">For customers</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/discover" className="text-ink-dim hover:text-ink">Discover Artists</Link></li>
              <li><Link href="/services" className="text-ink-dim hover:text-ink">All Services</Link></li>
              <li><Link href="/signup" className="text-ink-dim hover:text-ink">Create Account</Link></li>
              <li><Link href="/about" className="text-ink-dim hover:text-ink">How it works</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest text-gold mb-4">For Artists</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/for-artists" className="text-ink-dim hover:text-ink inline-flex items-center gap-1">Join Roop <ArrowUpRight size={12} /></Link></li>
              <li><Link href="/signup?role=artist" className="text-ink-dim hover:text-ink">Artist Signup</Link></li>
              <li><Link href="/login" className="text-ink-dim hover:text-ink">Artist Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest text-gold mb-4">Get in touch</h4>
            <ul className="space-y-2.5 text-sm text-ink-dim">
              <li className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 text-gold" /> Bengaluru, India</li>
              <li className="flex items-start gap-2"><Mail size={14} className="mt-0.5 text-gold" /> roopsupport@gmail.com</li>
              <li className="flex items-start gap-2">
                <Phone size={14} className="mt-0.5 text-gold" />
                <a href="tel:+918088718846" className="hover:text-ink">+91 80887 18846</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row gap-4 items-start md:items-center justify-between text-xs text-muted">
          <p>© {new Date().getFullYear()} Roop. Crafted with intent.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-ink">Terms</Link>
            <Link href="/privacy" className="hover:text-ink">Privacy</Link>
            <Link href="/contact" className="hover:text-ink">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
