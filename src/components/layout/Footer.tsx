import { Link } from "react-router-dom";
import { Mail, MessageCircle, HelpCircle, Twitter, Youtube, Facebook, Linkedin, Instagram, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { FOOTER_LINKS } from "@/data/landing";

const SOCIALS = [
  { icon: Twitter, label: "Twitter" },
  { icon: Youtube, label: "YouTube" },
  { icon: Instagram, label: "Instagram" },
  { icon: Linkedin, label: "LinkedIn" },
  { icon: Facebook, label: "Facebook" },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-white/10 dark:bg-[#0a0a0f]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-slate-500 dark:text-slate-400">Prepare Smarter. Achieve Your IELTS Goal. Structured lessons, practice tests, vocabulary, grammar, progress tracking and mock exams — all in one place.</p>
            <div className="mt-6 flex items-center gap-2">
              {SOCIALS.map((s) => (
                <a key={s.label} href="#" aria-label={s.label} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-[#0a0a0f] hover:text-white dark:bg-white/10 dark:text-white/70 dark:hover:bg-white dark:hover:text-[#0a0a0f]">
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <FooterCol title="Quick Links" items={FOOTER_LINKS.quick} />
          <FooterCol title="IELTS Resources" items={FOOTER_LINKS.resources} />
          <FooterCol title="Contact" items={[...FOOTER_LINKS.contact, { label: "Live chat support", href: "#" }, { label: "support@ieltsmaster.com", href: "mailto:support@ieltsmaster.com" }]} />
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row dark:border-white/10">
          <p className="text-xs font-medium text-slate-400 dark:text-white/40">© {new Date().getFullYear()} IELTS Master. All rights reserved. Crafted for ambitious learners.</p>
          <div className="flex items-center gap-5 text-xs font-semibold text-slate-600 dark:text-white/60">
            <Link to="#" className="transition hover:text-[#0a0a0f] dark:hover:text-white inline-flex items-center gap-1">Privacy Policy <ArrowUpRight className="h-3 w-3" /></Link>
            <Link to="#" className="transition hover:text-[#0a0a0f] dark:hover:text-white">Terms</Link>
            <Link to="#" className="transition hover:text-[#0a0a0f] dark:hover:text-white inline-flex items-center gap-1"><HelpCircle className="h-3.5 w-3.5" /> Help</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="text-[11px] font-black uppercase tracking-[0.14em] text-[#0a0a0f] dark:text-white">{title}</h4>
      <ul className="mt-4 space-y-3">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`}>
            <a href={item.href} className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#0a0a0f] hover:translate-x-0.5 dark:text-slate-400 dark:hover:text-white">
              {item.label === "support@ieltsmaster.com" ? <Mail className="h-3.5 w-3.5" /> : item.label === "Live chat support" ? <MessageCircle className="h-3.5 w-3.5" /> : null}
              <span className="group-hover:underline decoration-2 underline-offset-4">{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
