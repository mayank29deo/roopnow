import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const metadata = { title: "Services — Roop" };

const services = [
  {
    name: "Bridal",
    desc: "The most meaningful day of your life deserves an Artist who listens, plans, and shows up ready. From intimate sangeets to grand ceremonies.",
    img: "/landing/service-bridal.jpg",
    price: "from ₹8,000",
    sessions: ["Trial & Planning", "Sangeet & Mehndi", "Wedding Day", "Reception Look"],
  },
  {
    name: "Party & Glam",
    desc: "Birthdays, cocktails, nights out — whenever you want to walk in and own the room. Dewy skin, sculpted features, fearless looks.",
    img: "/landing/service-party.jpg",
    price: "from ₹4,500",
    sessions: ["Evening Glam", "Cocktail Looks", "Birthday Ready", "Night Out"],
  },
  {
    name: "Editorial",
    desc: "Camera-ready, magazine-perfect, high-definition artistry. For lookbooks, campaigns, covers, and personal portfolios that last.",
    img: "/landing/service-editorial.jpg",
    price: "from ₹10,000",
    sessions: ["Editorial Shoots", "Campaign Work", "Personal Portfolio", "Commercial"],
  },
  {
    name: "His Look",
    desc: "Grooms, ceremony-ready styling, board-meeting polish, everything in between. Skin, beard, hair — done with intention.",
    img: "/landing/service-his-look.jpg",
    price: "from ₹3,500",
    sessions: ["Groom Package", "Beard Sculpt", "Event Ready", "Shoot Prep"],
  },
  {
    name: "Just the Hair",
    desc: "The crown that crowns your crown. Color, cuts, blowouts, bridal updos, extensions — all forms of hair magic.",
    img: "/landing/service-just-the-hair.jpg",
    price: "from ₹2,500",
    sessions: ["Blowout", "Color & Gloss", "Bridal Hair", "Special Occasions"],
  },
  {
    name: "Family Makeup",
    desc: "Pre-wedding glam for the whole family — parents, siblings, the wedding party. Coordinated looks, everyone camera-ready.",
    img: "/landing/service-family-makeup.jpg",
    price: "from ₹6,000",
    sessions: ["Pre-wedding Family", "Sister of the Bride", "Group Shoots", "Coordinated Looks"],
  },
];

export default function ServicesPage() {
  return (
    <>
      <section className="relative pt-16 pb-12">
        <div className="max-w-5xl mx-auto px-5 lg:px-8 text-center">
          <h1 className="font-display text-6xl lg:text-8xl leading-[0.95] mb-6">
            Every kind of
            <br /><span className="italic text-gradient-primary">beautiful.</span>
          </h1>
          <p className="text-lg text-ink-dim max-w-xl mx-auto">
            Every Artist, every style, every occasion. Curated categories to help you find exactly what you&apos;re after.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 space-y-16 lg:space-y-24">
          {services.map((s, i) => (
            <div key={s.name} className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${i % 2 ? "lg:grid-flow-dense" : ""}`}>
              <div className={`${i % 2 ? "lg:col-start-2" : ""}`}>
                <div className="text-xs uppercase tracking-widest text-gold mb-3">{s.price}</div>
                <h2 className="font-display text-5xl lg:text-7xl leading-[0.95] mb-5">{s.name}</h2>
                <p className="text-ink-dim text-lg mb-8 leading-relaxed max-w-xl">{s.desc}</p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {s.sessions.map((sess) => (
                    <span key={sess} className="chip">{sess}</span>
                  ))}
                </div>
                <Link href={`/discover?category=${encodeURIComponent(s.name)}`} className="btn-primary shine group">
                  Browse {s.name} Artists
                  <ArrowUpRight size={16} className="group-hover:rotate-45 transition-transform" />
                </Link>
              </div>
              <div className="relative rounded-3xl overflow-hidden aspect-[4/5] border border-border">
                <img src={s.img} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg/60 to-transparent" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
