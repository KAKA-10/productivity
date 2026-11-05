'use client';

import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { Button } from '@/components/ui/button';
import { Field, TextInput, Textarea } from '@/components/ui/field';

export default function ContactPage() {
  const [sending, setSending] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success('Message noted. Our Nairobi team will follow up.');
      (e.target as HTMLFormElement).reset();
    }, 600);
  };

  return (
    <div className="mesh min-h-screen">
      <SiteHeader />
      <main className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-forest-600">Contact</p>
          <h1 className="font-display mt-3 text-4xl font-bold tracking-tight">Talk to Productivity Consulting.</h1>
          <p className="mt-4 text-slate-600">
            OSH audits, NEMA filings, productivity diagnostics, or a TODOMU demo — send a note and
            we will route it to the right consultant.
          </p>
          <div className="mt-8 space-y-3 text-sm">
            <p><span className="font-semibold">Approvals:</span> DOSHS · NITA · NEMA</p>
            <p><span className="font-semibold">Focus:</span> Kenya and the wider East African region</p>
            <p><span className="font-semibold">Platform:</span> TODOMU OSH compliance for SMEs</p>
          </div>
        </div>
        <form
          onSubmit={onSubmit}
          className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-xl backdrop-blur"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name"><TextInput name="name" required /></Field>
            <Field label="Organisation"><TextInput name="org" required /></Field>
            <Field label="Email"><TextInput type="email" name="email" required /></Field>
            <Field label="Phone"><TextInput name="phone" /></Field>
            <Field label="How can we help?" className="sm:col-span-2">
              <Textarea name="message" required />
            </Field>
          </div>
          <Button type="submit" className="mt-5 w-full" size="lg" disabled={sending}>
            {sending ? 'Sending…' : 'Send message'}
          </Button>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
