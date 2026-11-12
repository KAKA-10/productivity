import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-forest-950 text-forest-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:px-10">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-safety-500 text-forest-950">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display font-bold text-white">Productivity Consulting Limited</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-forest-400">
                Nairobi · Kenya
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-forest-200">
            Practical productivity, workplace safety and environmental support for organisations in Kenya and beyond.
          </p>
          <Link href="/contact" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-safety-400 transition hover:text-safety-300">
            Talk to our team <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-safety-400">Explore</p>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link href="/#about" className="hover:text-white">About</Link>
            <Link href="/#services" className="hover:text-white">Services</Link>
            <Link href="/#facility" className="hover:text-white">Facility setup</Link>
            <Link href="/#platform" className="hover:text-white">Productivity OSHAPP</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
            <Link href="/login" className="hover:text-white">Client login</Link>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-safety-400">Approvals</p>
          <ul className="mt-3 space-y-2 text-sm text-forest-200">
            <li>DOSHS approved trainer</li>
            <li>NITA industrial training provider</li>
            <li>NEMA registered environmental experts</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-forest-300">
        © {new Date().getFullYear()} Productivity Consulting Limited. All rights reserved.
      </div>
    </footer>
  );
}
