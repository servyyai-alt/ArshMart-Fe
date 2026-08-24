import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  ChevronRight,
  ShieldCheck,
  Headphones,
  Truck,
} from "lucide-react";
import api from "../utils/api.js";
import { runtimeConfig } from "../utils/runtime.js";
import Logo from "./Logo.jsx";

const FALLBACK_CATEGORIES = [
  { name: "Electronics" },
  { name: "Fashion" },
  { name: "Home & Kitchen" },
];

// Custom WhatsApp Icon Component for consistent sizing with Lucide icons
const WhatsAppIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [footerCategories, setFooterCategories] = useState([]);

  useEffect(() => {
    api
      .get("/categories")
      .then((res) => setFooterCategories(res.data.categories || []))
      .catch(() => setFooterCategories([]));
  }, []);

  const quickCategories = footerCategories.length
    ? footerCategories
    : FALLBACK_CATEGORIES;

  // Updated Social Media Configuration
  const socialLinks = [
    {
      Icon: WhatsAppIcon,
      href: "https://wa.me/8825696990",
      label: "WhatsApp",
    },
    {
      Icon: Instagram,
      href: runtimeConfig.instagramUrl || "https://www.instagram.com/arsh_mart_",
      label: "Instagram",
    },
    // {
    //   Icon: Twitter,
    //   href: "https://twitter.com/arshmart",
    //   label: "Twitter",
    // },
    {
      Icon: Facebook,
      href: "https://www.facebook.com/",
      label: "Facebook",
    },
    {
      Icon: Youtube,
      href: "https://youtube.com/@arshmart",
      label: "Youtube",
    },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-amber-100 bg-gradient-to-b from-white to-amber-50/70">
      {/* Decorative top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
      <div className="absolute -top-20 right-0 h-64 w-64 rounded-full bg-amber-200/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -left-20 h-64 w-64 rounded-full bg-amber-100/50 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] gap-10">
          {/* Brand */}
          <div className="space-y-5">
            <Logo />
            <p className="text-slate-600 text-sm leading-relaxed max-w-sm">
              Your premium shopping destination. Quality products, fast
              delivery, and exceptional service across India.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2">
              {[
                { Icon: Truck, label: "Fast Delivery" },
                { Icon: ShieldCheck, label: "Secure Pay" },
                { Icon: Headphones, label: "24/7 Support" },
              ].map(({ Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-amber-100 shadow-sm"
                >
                  <Icon className="w-3.5 h-3.5 text-amber-600" /> {label}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2.5">
              {socialLinks.map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="group flex items-center justify-center w-10 h-10 rounded-2xl bg-white text-slate-500 ring-1 ring-amber-100 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:bg-gradient-to-br hover:from-amber-500 hover:to-amber-600 hover:text-white hover:shadow-lg hover:shadow-amber-500/30"
                >
                  <social.Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <SectionTitle>Shop</SectionTitle>
            <ul className="mt-5 space-y-2.5">
              {[
                { to: "/products", label: "All Products" },
                ...quickCategories.slice(0, 4).map((c) => ({
                  to: `/products?category=${encodeURIComponent(c.name)}`,
                  label: c.name,
                })),
                { to: "/products?sort=discount", label: "Deals" },
              ].map((link) => (
                <li key={link.to + link.label}>
                  <FooterLink to={link.to}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-semibold text-slate-800 mb-5 text-sm uppercase tracking-wider">
              Support
            </h4>
            <ul className="space-y-2.5">
              {[
                { to: "/contact", label: "Help Center" },
                { to: "/refunds", label: "Returns & Refunds" },
                { to: "/shipping", label: "Shipping Policy" },
                { to: "/privacy", label: "Privacy Policy" },
                { to: "/terms", label: "Terms of Service" },
              ].map((link) => (
                <li key={link.to}>
                  <FooterLink to={link.to}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wider">
              Get in touch
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <MapPin className="w-4 h-4" />
                </span>
                <span className="text-slate-600 text-sm leading-relaxed">
                  {runtimeConfig.businessAddress}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Phone className="w-4 h-4" />
                </span>
                <a
                  href="tel:+918825696990"
                  className="text-slate-600 hover:text-amber-700 font-medium text-sm transition-colors"
                >
                  8825696990                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Mail className="w-4 h-4" />
                </span>
                <a
                  href={`mailto:${runtimeConfig.supportEmail}`}
                  className="text-slate-600 hover:text-amber-700 font-medium text-sm transition-colors"
                >
                  {runtimeConfig.supportEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-amber-100 pt-6 pb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm text-center">
            © {currentYear} Arsh Mart. All rights reserved. 
            {/* <span className="font-semibold text-amber-700">Least Action Company</span>. */}
          </p>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              100% Secure Payments
            </span>
            <span className="hidden sm:block h-4 w-px bg-amber-200" />
            <img
              src="https://w7.pngwing.com/pngs/93/992/png-transparent-razorpay-logo-tech-companies.png"
              alt="Razorpay"
              className="h-7 w-20 opacity-60 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}

function SectionTitle({ children }) {
  return (
    <h4 className="flex items-center gap-2 font-display font-semibold text-slate-900 uppercase tracking-wider text-sm">
      <span className="h-4 w-1 rounded-full bg-gradient-to-b from-amber-500 to-amber-600" />
      {children}
    </h4>
  );
}

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-1.5 text-sm text-slate-600 transition-colors hover:text-amber-700"
    >
      <ChevronRight className="w-3.5 h-3.5 text-amber-400 opacity-0 -ml-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5" />
      <span>{children}</span>
    </Link>
  );
}
