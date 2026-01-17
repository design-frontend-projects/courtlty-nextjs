"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Mail,
  Phone,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Heart,
} from "lucide-react";

const footerLinks = {
  platform: [
    { label: "Find Courts", href: "/courts" },
    { label: "Browse Teams", href: "/teams" },
    { label: "List Your Court", href: "/courts/submit" },
    { label: "Pricing", href: "#" },
  ],
  account: [
    { label: "Login", href: "/login" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Profile", href: "/profile" },
    { label: "Settings", href: "#" },
  ],
  support: [
    { label: "Help Center", href: "#" },
    { label: "Contact Us", href: "#" },
    { label: "FAQs", href: "#" },
    { label: "Community", href: "#" },
  ],
  legal: [
    { label: "Terms of Service", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "Refund Policy", href: "#" },
  ],
};

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />

      {/* Main content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/" className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Courtly
                </span>
              </Link>

              <p className="text-slate-400 mb-6 max-w-sm">
                Your ultimate sports court booking platform. Connect with
                players, book courts, and never miss a game.
              </p>

              <div className="space-y-3 text-slate-400">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  <span>Cairo, Egypt</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-emerald-400" />
                  <a
                    href="mailto:hello@courtly.com"
                    className="hover:text-white transition-colors"
                  >
                    hello@courtly.com
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-emerald-400" />
                  <a
                    href="tel:+201234567890"
                    className="hover:text-white transition-colors"
                  >
                    +20 123 456 7890
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Links columns */}
          {Object.entries(footerLinks).map(([category, links], index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
            >
              <h4 className="font-semibold text-white mb-4 capitalize">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-emerald-400 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6"
        >
          {/* Copyright */}
          <div className="flex items-center gap-1 text-slate-400 text-sm">
            <span>© {new Date().getFullYear()} Courtly. Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <span>in Egypt</span>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-gradient-to-br hover:from-emerald-500 hover:to-cyan-500 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300"
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5" />
              </motion.a>
            ))}
          </div>

          {/* Language/Currency selector placeholder */}
          <div className="flex items-center gap-4 text-slate-400 text-sm">
            <button className="hover:text-white transition-colors">
              English
            </button>
            <span>|</span>
            <button className="hover:text-white transition-colors">EGP</button>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
