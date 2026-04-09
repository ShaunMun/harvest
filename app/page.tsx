"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const STEPS = [
  {
    num: "01",
    title: "List your surplus",
    body: "Eish, there's always too much of something. Post what you've grown in minutes — free, swap, or a small price.",
    image: "/images/photographing-leaf-on-smartphone-2026-03-24-04-58-26-utc.jpg",
  },
  {
    num: "02",
    title: "Find your neighbours",
    body: "See what's growing on your street. Filter by suburb, what's in season, or what your kitchen needs.",
    image: "/images/garden-tools-2026-03-17-21-25-16-utc.jpg",
  },
  {
    num: "03",
    title: "Meet and swap — it's lekker",
    body: "A doorstep drop, a garden visit, a quick WhatsApp. This is how communities eat better.",
    image: "/images/couldnt-do-this-alone-shot-of-a-young-male-farmer-2026-01-09-09-41-06-utc.jpg",
  },
];

const NOTICES = [
  {
    image: "/images/daytime-carrot-harvesting-in-garden-2026-03-14-22-14-20-utc.JPG",
    msg: "Loads of carrots going spare",
    person: "Thandi",
    suburb: "Fourways",
    type: "FREE" as const,
  },
  {
    image: "/images/pink-with-stripes-fresh-apples-from-branches-in-wo-2026-01-05-23-23-48-utc.jpg",
    msg: "Bramley apples — swap for veg?",
    person: "Sipho",
    suburb: "Lonehill",
    type: "SWAP" as const,
  },
  {
    image: "/images/woman-wearing-gardening-gloves-transplanting-flowe-2026-03-24-07-37-21-utc.jpg",
    msg: "Fresh basil bunches R15 each",
    person: "Anke",
    suburb: "Broadacres",
    type: "SELL" as const,
  },
];

const TICKER =
  "\u00a0\u00a0Carrots going spare — Fourways\u00a0\u00a0·\u00a0\u00a0Lemons swap for herbs — Broadacres\u00a0\u00a0·\u00a0\u00a0Free range eggs R45/doz — Paulshof\u00a0\u00a0·\u00a0\u00a0Homemade jam R25 — Douglasdale\u00a0\u00a0·\u00a0\u00a0Baby spinach — Kyalami\u00a0\u00a0·\u00a0\u00a0Chillies — Dainfern\u00a0\u00a0·\u00a0\u00a0Tomatoes — Lonehill\u00a0\u00a0·";

const badgeStyles = {
  FREE: { background: "#B8B68F", color: "#fff" },
  SWAP: { background: "#DECCA6", color: "#2C2A1E" },
  SELL: { background: "#B0714E", color: "#fff" },
};

export default function Home() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            observer.unobserve(e.target);
          }
        }),
      { threshold: 0.08 }
    );
    document
      .querySelectorAll(".fade-section, .stagger-children")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ background: "#ffffff", color: "#2C2A1E" }}>

      {/* ── Nav ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5"
        style={{
          background: scrolled ? "#ffffff" : "transparent",
          transition: "background 0.5s ease",
          borderBottom: scrolled ? "1px solid rgba(44,42,30,0.08)" : "none",
        }}
      >
        <Image
          src="/images/harvestlogo.png"
          alt="Harvest"
          width={160}
          height={43}
          priority
          style={{
            filter: scrolled ? "none" : "brightness(0) invert(1)",
            transition: "filter 0.5s ease",
          }}
        />
        <div className="flex items-center gap-6">
          <a
            href="#how-it-works"
            className="text-sm hidden sm:inline transition-colors duration-300"
            style={{ color: scrolled ? "#2C2A1E" : "rgba(255,255,255,0.85)" }}
          >
            How it works
          </a>
          <button
            className="text-sm px-5 py-2 rounded-full border transition-colors duration-300 hidden sm:inline-block"
            style={{
              color: scrolled ? "#2C2A1E" : "#fff",
              borderColor: scrolled ? "rgba(44,42,30,0.3)" : "rgba(255,255,255,0.5)",
              background: "transparent",
            }}
          >
            Sign in
          </button>
          <button
            className="text-sm px-5 py-2 rounded-full font-medium"
            style={{ background: "#B8B68F", color: "#fff" }}
          >
            Join Harvest
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        className="relative flex items-center justify-center text-center"
        style={{
          height: "100svh",
          minHeight: "600px",
          backgroundImage:
            "url('/images/woman-buying-organic-fruits-and-vegetables-at-farm-2026-03-19-01-59-57-utc.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="absolute inset-0"
          style={{ background: "rgba(0,0,0,0.38)" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "rgba(184,182,143,0.12)" }}
        />
        <div className="relative z-10 px-6 max-w-4xl mx-auto">
          <h1
            className="font-bold text-white leading-[1.05]"
            style={{ fontSize: "clamp(52px, 8vw, 96px)", letterSpacing: "-0.02em" }}
          >
            Where food finds family.
          </h1>
          <p
            className="mt-6 font-light leading-relaxed mx-auto"
            style={{
              fontSize: "clamp(16px, 2vw, 19px)",
              color: "rgba(255,255,255,0.78)",
              maxWidth: "520px",
              letterSpacing: "0.01em",
            }}
          >
            Joburg home growers sharing what the garden gives — trading,
            gifting, and growing community one street at a time. Sharp.
          </p>
          <button
            onClick={() => router.push('/onboarding')}
            className="mt-10 px-8 py-4 rounded-full font-medium text-white"
            style={{ background: "#B8B68F", fontSize: "15px", cursor: 'pointer' }}
          >
            Join the community — it&apos;s free
          </button>
        </div>
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", letterSpacing: "0.15em" }}
        >
          <span className="uppercase tracking-widest">Scroll</span>
          <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
            <rect x="6" y="1" width="4" height="7" rx="2" fill="currentColor" opacity="0.5" />
            <path d="M8 13 L4 17 L8 21 L12 17 Z" fill="currentColor" opacity="0.3" />
          </svg>
        </div>
      </section>

      {/* ── Ticker ── */}
      <div
        className="overflow-hidden"
        style={{
          background: "#FFFFFF",
          borderTop: "1px solid rgba(44,42,30,0.1)",
          borderBottom: "1px solid rgba(44,42,30,0.1)",
          padding: "14px 0",
        }}
      >
        <div
          className="ticker-track"
          style={{
            color: "#B8B68F",
            fontSize: "12px",
            fontWeight: 500,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
          }}
        >
          {[...Array(4)].map((_, i) => (
            <span key={i} className="pr-16 whitespace-nowrap">
              {TICKER}
            </span>
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <section id="how-it-works" className="px-8 py-32" style={{ background: "#ffffff" }}>
        <div className="max-w-5xl mx-auto">
          <div className="fade-section mb-20">
            <p
              className="uppercase tracking-widest text-xs mb-5"
              style={{ color: "#B8B68F" }}
            >
              Grown here. Shared here.
            </p>
            <h2
              className="font-bold leading-tight"
              style={{
                fontSize: "clamp(36px, 5vw, 52px)",
                color: "#2C2A1E",
                letterSpacing: "-0.02em",
              }}
            >
              How Harvest works
            </h2>
          </div>

          <div className="stagger-children grid md:grid-cols-3 gap-6">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="rounded-2xl overflow-hidden group"
                style={{ background: "#ffffff", border: "1px solid rgba(44,42,30,0.08)", boxShadow: "0 4px 24px rgba(44,42,30,0.07)" }}
              >
                {/* Image with brand haze overlay */}
                <div className="relative" style={{ height: "200px" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={step.image}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
                  />
                  <div
                    className="absolute inset-0 transition-all duration-300"
                    style={{ background: "rgba(184,182,143,0.45)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(184,182,143,0.25)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(184,182,143,0.45)")}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
                    <p
                      className="font-bold leading-none mb-1"
                      style={{ fontSize: "44px", color: "#fff", opacity: 0.7, letterSpacing: "-0.04em" }}
                    >
                      {step.num}
                    </p>
                    <h3
                      className="font-bold text-white"
                      style={{ fontSize: "17px" }}
                    >
                      {step.title}
                    </h3>
                  </div>
                </div>
                {/* Body text */}
                <div className="px-7 py-6">
                  <p
                    className="font-light leading-relaxed"
                    style={{ fontSize: "15px", color: "#6C6A5E", lineHeight: "1.75" }}
                  >
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Image break ── */}
      <div style={{ height: "500px", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/african-farmers-carrying-vegetables-and-a-hoe-2026-03-18-06-42-11-utc.jpg"
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>

      {/* ── Built for neighbours ── */}
      <section className="px-8 py-32" style={{ background: "#FFFFFF" }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="fade-section rounded-2xl overflow-hidden" style={{ height: "520px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/indian-family-picking-up-organic-carrots-from-hous-2026-03-26-03-58-59-utc.jpg"
              alt="Family picking carrots from the garden"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div className="fade-section">
            <p
              className="uppercase tracking-widest text-xs mb-5"
              style={{ color: "#B8B68F" }}
            >
              Made for Mzansi
            </p>
            <h2
              className="font-bold leading-tight mb-7"
              style={{
                fontSize: "clamp(30px, 4vw, 46px)",
                color: "#2C2A1E",
                letterSpacing: "-0.02em",
              }}
            >
              Real food. Real people. Right down the road.
            </h2>
            <p
              className="font-light leading-relaxed mb-9"
              style={{ fontSize: "16px", color: "#6C6A5E", lineHeight: "1.85" }}
            >
              No supermarkets. No middlemen. No nonsense. Just South Africans
              sharing what the garden gives — because eish, the cost of living
              isn&apos;t getting any easier, and the person next door is growing
              exactly what you need.
            </p>
            <ul className="space-y-4">
              {[
                "Free to join, free to list",
                "Trade, give away, or sell — you decide",
                "Your neighbourhood, your community, your food",
              ].map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-4"
                  style={{ fontSize: "15px", color: "#2C2A1E" }}
                >
                  <span
                    className="shrink-0 rounded-full"
                    style={{ width: "8px", height: "8px", background: "#B8B68F" }}
                  />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Notice board ── */}
      <section className="px-8 py-32" style={{ background: "#ffffff" }}>
        <div className="max-w-5xl mx-auto">
          <div className="fade-section text-center mb-16">
            <h2
              className="font-bold"
              style={{
                fontSize: "clamp(28px, 4vw, 48px)",
                color: "#2C2A1E",
                letterSpacing: "-0.02em",
              }}
            >
              What&apos;s growing in Fourways right now
            </h2>
          </div>

          <div className="stagger-children grid md:grid-cols-3 gap-6">
            {NOTICES.map((note) => (
              <div
                key={note.msg}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "#ffffff",
                  border: "1px solid rgba(44,42,30,0.08)",
                  boxShadow: "0 4px 24px rgba(44,42,30,0.07)",
                }}
              >
                {/* Full-bleed image */}
                <div className="relative" style={{ height: "200px" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={note.image}
                    alt={note.msg}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: "rgba(0,0,0,0.35)" }}
                  />
                  {/* Badge over image */}
                  <span
                    className="absolute top-4 right-4 text-xs font-semibold px-3 py-1 rounded-full"
                    style={badgeStyles[note.type]}
                  >
                    {note.type}
                  </span>
                </div>

                {/* Card body */}
                <div className="px-6 py-5">
                  <p
                    className="font-light mb-1"
                    style={{ fontSize: "12px", color: "#B8B68F", letterSpacing: "0.05em", textTransform: "uppercase" }}
                  >
                    {note.person} · {note.suburb}
                  </p>
                  <p
                    className="font-semibold leading-snug"
                    style={{ fontSize: "17px", color: "#2C2A1E" }}
                  >
                    {note.msg}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Vendors image banner ── */}
      <div style={{ height: "500px", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/team-of-diverse-vendors-giving-box-filled-with-org-2026-01-08-02-10-56-utc.jpg"
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
        />
      </div>

      {/* ── Harvest Gives ── */}
      <section className="fade-section px-8" style={{ background: "#ffffff", paddingTop: "80px", paddingBottom: "80px" }}>
        <div className="max-w-3xl mx-auto text-center">
          <p
            className="uppercase tracking-widest text-xs mb-5"
            style={{ color: "#B8B68F" }}
          >
            Harvest Gives
          </p>
          <h2
            className="font-bold leading-tight mb-6"
            style={{ fontSize: "clamp(28px, 4vw, 44px)", color: "#2C2A1E", letterSpacing: "-0.02em" }}
          >
            Your garden can feed more than your neighbourhood.
          </h2>
          <p
            className="font-light leading-relaxed mx-auto mb-14"
            style={{ fontSize: "16px", color: "#6B6454", lineHeight: "1.85", maxWidth: "620px" }}
          >
            Some harvests go further than a street swap. Through Harvest Gives,
            surplus produce from our community is collected, cooked, and
            delivered to orphanages, clinics, and NGOs across Joburg. Because
            in Mzansi, we don&apos;t waste — we share.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mb-14">
            {[
              { number: "100+", label: "Meals targeted per month" },
              { number: "3+",   label: "NGO partners at launch" },
              { number: "0 waste", label: "Every surplus finds a home" },
            ].map((stat) => (
              <div key={stat.label}>
                <p
                  className="font-bold leading-none mb-2"
                  style={{ fontSize: "clamp(28px, 4vw, 48px)", color: "#B8B68F", letterSpacing: "-0.03em" }}
                >
                  {stat.number}
                </p>
                <p
                  className="font-light"
                  style={{ fontSize: "13px", color: "#6B6454", lineHeight: "1.5" }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Outlined pill CTA */}
          <button
            className="px-8 py-3 rounded-full font-medium mb-4"
            style={{
              background: "transparent",
              border: "1.5px solid #B8B68F",
              color: "#B8B68F",
              fontSize: "15px",
            }}
          >
            Feed my community
          </button>
          <p
            className="block"
            style={{ fontSize: "12px", color: "#9C9A8E", letterSpacing: "0.01em" }}
          >
            Coming soon — drop-off points, donations, and corporate partnerships launching in Fourways.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        className="fade-section relative flex items-center justify-center text-center"
        style={{
          padding: "160px 24px",
          backgroundImage:
            "url('/images/feeding-hungry-mouths-cropped-shot-of-children-ge-2026-03-09-02-33-04-utc.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="absolute inset-0"
          style={{ background: "rgba(0,0,0,0.50)" }}
        />
        <div className="relative z-10 max-w-xl mx-auto">
          <h2
            className="font-bold text-white mb-5 leading-tight"
            style={{ fontSize: "clamp(32px, 5vw, 58px)", letterSpacing: "-0.02em" }}
          >
            Ready to share your harvest?
          </h2>
          <p
            className="font-light leading-relaxed mb-10"
            style={{ fontSize: "17px", color: "rgba(255,255,255,0.72)", lineHeight: "1.75" }}
          >
            Hundreds of Joburg growers already swapping, gifting, and selling
            across their streets. The community is waiting — yoh, it&apos;s
            growing fast.
          </p>
          <button
            className="px-9 py-4 rounded-full font-medium"
            style={{ background: "#EBE6D2", color: "#2C2A1E", fontSize: "15px" }}
          >
            Feed my community
          </button>
          <p
            className="mt-5"
            style={{ fontSize: "12px", color: "rgba(255,255,255,0.38)", letterSpacing: "0.02em" }}
          >
            No credit card. No spam. Just good food and good neighbours.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-8 pt-16 pb-10" style={{ background: "#2C2A1E" }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-10 mb-12">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/harvestlogo.png"
                alt="Harvest"
                style={{
                  height: "34px",
                  filter: "brightness(0) invert(1)",
                  marginBottom: "12px",
                  opacity: 0.9,
                }}
              />
              <p
                className="font-light"
                style={{ fontSize: "14px", color: "rgba(255,255,255,0.38)" }}
              >
                Grown with hands. Shared with heart. Made in Mzansi.
              </p>
            </div>
            <div className="flex gap-8">
              {["About", "Privacy", "Contact"].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="transition-colors"
                  style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "rgba(255,255,255,0.85)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(255,255,255,0.45)")
                  }
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
          <div
            className="pt-8"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.08)",
              fontSize: "12px",
              color: "rgba(255,255,255,0.22)",
              letterSpacing: "0.03em",
            }}
          >
            Made in Fourways, Johannesburg · Where food finds family
          </div>
        </div>
      </footer>
    </div>
  );
}
