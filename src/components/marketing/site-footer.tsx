import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Mail, MapPin } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-forest-950 text-forest-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:px-10">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/productivity-logo.png"
              alt="Productivity Consulting Limited"
              width={100}
              height={100}
              className="h-10 w-10 shrink-0 rounded-full bg-white object-contain"
            />
            <div>
              <p className="font-display font-bold text-white">Productivity Consulting Limited</p>
              <p className="font-mono text-[10px] tracking-[0.12em] text-forest-400">Inspiring a competitive Kenya</p>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-forest-200">
            Practical productivity, workplace safety and environmental support for organisations in Kenya and beyond.
          </p>
          <address className="mt-5 space-y-3 not-italic text-xs leading-5 text-forest-200">
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-safety-400" />
              <span>New Commercial House, 4th Floor, Commercial Street, Industrial Area, Nairobi. P.O. Box 13622-00100, G.P.O.</span>
            </p>
            <a href="mailto:PCL@productivityconsulting.co.ke" className="flex items-center gap-2 transition hover:text-white">
              <Mail className="h-4 w-4 shrink-0 text-safety-400" />
              PCL@productivityconsulting.co.ke
            </a>
          </address>
          <Link href="/contact" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-safety-400 transition hover:text-safety-300">
            Talk to our team <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-safety-400">Explore</p>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link href="/#about" className="hover:text-white">About</Link>
            <Link href="/#services" className="hover:text-white">Services</Link>
            <Link href="/#network" className="hover:text-white">Our network</Link>
            <Link href="/#track-record" className="hover:text-white">Track record</Link>
            <Link href="/#faq" className="hover:text-white">FAQs</Link>
            <Link href="/#platform" className="hover:text-white">Productivity OSHAPP</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
            <Link href="/login" className="hover:text-white">Client login</Link>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-safety-400">Approvals</p>
          <ul className="mt-3 space-y-2 text-sm text-forest-200">
            <li>DOSHS training approvals: first aid, fire safety and safety committees</li>
            <li>NITA industrial training provider</li>
            <li>NEMA Firm of Experts, certificate no. 2497</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-forest-300">
        © {new Date().getFullYear()} Productivity Consulting Limited. All rights reserved.
      </div>
    </footer>
  );
}
