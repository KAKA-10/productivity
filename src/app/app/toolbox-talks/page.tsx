'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Printer, Search, Sparkles, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useCollection } from '@/hooks/use-collection';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { ChoiceCards, Field, TextInput, Textarea } from '@/components/ui/field';
import { CardGridSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { generateToolboxTalk } from '@/lib/ai';
import { downloadPdf } from '@/lib/pdf';

type Talk = {
  id: string;
  ref: string;
  topic: string;
  category: string;
  audience: string;
  duration: string;
  author: string;
  attendeesCount: number;
  status: string;
  content: string;
};

const STAGES = [
  'Consulting OSHA 2007 Sec. 6…',
  'Mapping DOSHS briefing practice…',
  'Drafting shift script…',
];

export default function ToolboxTalksPage() {
  const { items, loading, create, update } = useCollection<Talk>('toolbox-talks');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [reader, setReader] = useState<Talk | null>(null);
  const [topic, setTopic] = useState('Dust control at grain transfer');
  const [audience, setAudience] = useState('Shift operators');
  const [duration, setDuration] = useState('10 Mins');
  const [stage, setStage] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const filtered = useMemo(
    () => items.filter((t) => `${t.topic} ${t.category} ${t.ref}`.toLowerCase().includes(q.toLowerCase())),
    [items, q],
  );

  const generate = async () => {
    if (!topic || !audience) {
      toast.error('Topic and audience are required');
      return;
    }
    for (const s of STAGES) {
      setStage(s);
      await new Promise((r) => setTimeout(r, 700));
    }
    setDraft(generateToolboxTalk(topic, audience, duration));
    setStage(null);
    toast.success('Briefing drafted from OSHA 2007 controls');
  };

  const save = async () => {
    if (!draft) {
      toast.error('Generate a script first');
      return;
    }
    await create({
      topic,
      category: 'AI Generated',
      audience,
      duration,
      author: 'AI Generator (OSHA 2007)',
      attendeesCount: 0,
      status: 'Scheduled',
      content: draft,
    });
    toast.success('Talk added to the library');
    setOpen(false);
    setDraft('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="AI toolbox talks"
        description="10-minute shift briefings aligned to Kenyan OSH practice."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Sparkles className="h-4 w-4" /> Generate briefing
          </Button>
        }
      />

      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search talks"
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      {loading ? (
        <CardGridSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="No briefings yet" description="Generate the first OSHA-aligned talk." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((talk, i) => (
            <motion.button
              key={talk.id}
              type="button"
              onClick={() => setReader(talk)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="font-mono text-[11px] text-slate-400">{talk.ref}</p>
              <h3 className="mt-2 font-bold">{talk.topic}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-slate-500">{talk.content}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="forest">{talk.duration}</Badge>
                <Badge>
                  <Users className="mr-1 h-3 w-3" />
                  {talk.attendeesCount}
                </Badge>
                <Badge tone={talk.status}>{talk.status}</Badge>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="AI script generator"
        subtitle="Simulated OSHA 2007 briefing writer"
        wide
        footer={
          <>
            <Button variant="secondary" onClick={() => void generate()} disabled={!!stage}>
              {stage || 'Generate script'}
            </Button>
            <Button onClick={() => void save()} disabled={!draft}>
              Save to library
            </Button>
          </>
        }
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Hazard / topic">
              <TextInput value={topic} onChange={(e) => setTopic(e.target.value)} />
            </Field>
            <Field label="Audience">
              <TextInput value={audience} onChange={(e) => setAudience(e.target.value)} />
            </Field>
            <div>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                Length
              </p>
              <ChoiceCards
                value={duration}
                onChange={setDuration}
                options={[
                  { value: '5 Mins', label: '5 min', hint: 'Huddle' },
                  { value: '10 Mins', label: '10 min', hint: 'Standard' },
                  { value: '15 Mins', label: '15 min', hint: 'High risk' },
                ]}
              />
            </div>
            {stage ? (
              <div className="flex items-center gap-3 rounded-2xl bg-forest-50 px-4 py-3 text-sm font-medium text-forest-800">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-forest-200 border-t-forest-700" />
                {stage}
              </div>
            ) : null}
          </div>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Generated script appears here…"
            className="min-h-72"
          />
        </div>
      </Modal>

      <Modal
        open={!!reader}
        onClose={() => setReader(null)}
        title={reader?.topic || ''}
        subtitle={reader?.ref}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={async () => {
                if (!reader) return;
                await update(reader.id, { attendeesCount: reader.attendeesCount + 1, status: 'Completed' });
                toast.success('Attendance recorded');
                setReader(null);
              }}
            >
              Sign attendance +1
            </Button>
            <Button
              onClick={() => {
                if (!reader) return;
                downloadPdf(reader.ref, `Toolbox talk ${reader.ref}`, [
                  `Topic: ${reader.topic}`,
                  `Audience: ${reader.audience}`,
                  `Duration: ${reader.duration}`,
                  `Attendees: ${reader.attendeesCount}`,
                  '',
                  ...reader.content.split('\n'),
                ]);
                toast.success('PDF downloaded');
              }}
            >
              <Printer className="h-4 w-4" /> Download PDF
            </Button>
          </>
        }
      >
        <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-slate-700">
          {reader?.content}
        </pre>
      </Modal>
    </div>
  );
}
