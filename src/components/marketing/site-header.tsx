'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';

const LINKS = [
  { href: '/#about', label: 'About' },
  { href: '/#services', label: 'Services' },
  { href: '/#network', label: 'Network' },
  { href: '/#track-record', label: 'Track record' },
  { href: '/#faq', label: 'FAQs' },
  { href: '/contact', label: 'Contact' },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-forest-100/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/brand/productivity-logo.png"
            alt="Productivity Consulting Limited"
            width={100}
            height={100}
            preload
            className="h-10 w-10 shrink-0 rounded-full bg-white object-contain"
          />
          <div>
            <p className="font-display text-sm font-bold leading-tight text-forest-950">Productivity Consulting Limited</p>
            <p className="mt-0.5 text-[10px] font-semibold tracking-[0.08em] text-slate-500">Inspiring a competitive Kenya</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-[13px] font-semibold text-slate-600 lg:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-forest-700">{l.label}</Link>
          ))}
          <Link href="/login" className="inline-flex items-center gap-1.5 rounded-xl bg-forest-700 px-4 py-2.5 font-bold text-white shadow-sm transition hover:bg-forest-800">
            Productivity OSHAPP login <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </nav>
        <button
          type="button"
          className="rounded-xl border border-forest-100 p-2 text-forest-800 transition hover:bg-forest-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-700 lg:hidden"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open ? (
        <nav id="mobile-navigation" className="flex flex-col gap-1 border-t border-forest-100 bg-white px-6 py-3 text-sm font-semibold text-slate-700 lg:hidden">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 transition hover:bg-forest-50 hover:text-forest-800">{l.label}</Link>
          ))}
          <Link href="/login" onClick={() => setOpen(false)} className="mt-1 rounded-xl bg-forest-700 px-4 py-3 text-center text-white">Productivity OSHAPP login</Link>
        </nav>
      ) : null}
    </header>
  );
}
