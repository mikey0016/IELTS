import { Link } from "react-router-dom";
import {
  Mail,
  MessageCircle,
  HelpCircle,
  Twitter,
  Youtube,
  Facebook,
  Linkedin,
  Instagram,
} from "lucide-react";
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
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Prepare Smarter. Achieve Your IELTS Goal. Structured lessons,
              practice tests, vocabulary, grammar, progress tracking and mock
              exams — all in one place.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:text-brand-600 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-700"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol title="Quick Links" items={FOOTER_LINKS.quick} />
          <FooterCol title="IELTS Resources" items={FOOTER_LINKS.resources} />
          <FooterCol
            title="Contact"
            items={[
              ...FOOTER_LINKS.contact,
              { label: "Live chat support", href: "#" },
              {
                label: "support@ieltsmaster.com",
                href: "mailto:support@ieltsmaster.com",
              },
            ]}
          />
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row dark:border-slate-800">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} IELTS Master. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Link to="#" className="transition hover:text-brand-600">
              Privacy Policy
            </Link>
            <Link to="#" className="transition hover:text-brand-600">
              Terms of Service
            </Link>
            <Link to="#" className="transition hover:text-brand-600">
              <HelpCircle className="inline h-3.5 w-3.5" /> Help
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">
        {title}
      </h4>
      <ul className="mt-4 space-y-2.5">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`}>
            <a
              href={item.href}
              className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-300"
            >
              {item.label === "support@ieltsmaster.com" ? (
                <Mail className="h-3.5 w-3.5" />
              ) : item.label === "Live chat support" ? (
                <MessageCircle className="h-3.5 w-3.5" />
              ) : null}
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
