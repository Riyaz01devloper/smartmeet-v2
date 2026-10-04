"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileAudio,
  ListChecks,
  Sparkles,
  Upload,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-4rem)] overflow-hidden bg-[#080b12] text-white">

      {/* Hero */}
      <section className="relative">
        {/* Subtle background glow */}
        <div className="pointer-events-none absolute left-1/2 top-[-180px] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-indigo-500/[0.08] blur-[120px]" />

        <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-20 text-center sm:px-8 sm:pt-28">

          {/* Eyebrow */}
          <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-400/15 bg-indigo-500/[0.06] px-3.5 py-1.5 text-xs font-medium text-indigo-300">
            <Sparkles size={13} />
            AI-powered meeting intelligence
          </div>

          {/* Heading */}
          <h1 className="mx-auto max-w-4xl text-4xl font-semibold leading-[1.08] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
            Turn meetings into{" "}
            <span className="text-indigo-400">
              actionable intelligence.
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Upload a meeting recording and let AI transform the conversation
            into a searchable transcript, concise summary, key decisions,
            and actionable follow-ups.
          </p>

          {/* Primary actions */}
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/upload"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-400 sm:w-auto"
            >
              <Upload size={17} />
              Upload a meeting
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/meetings"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-slate-200 transition hover:border-white/[0.18] hover:bg-white/[0.06] sm:w-auto"
            >
              Explore meetings
            </Link>
          </div>

          {/* Small trust points */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Check size={13} className="text-emerald-400" />
              AI transcription
            </span>

            <span className="flex items-center gap-1.5">
              <Check size={13} className="text-emerald-400" />
              Smart summaries
            </span>

            <span className="flex items-center gap-1.5">
              <Check size={13} className="text-emerald-400" />
              Action items
            </span>
          </div>
        </div>
      </section>

      {/* Product Preview */}
      <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d121b] shadow-2xl shadow-black/30">

          {/* Window header */}
          <div className="flex h-12 items-center border-b border-white/[0.07] px-4">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
            </div>

            <div className="mx-auto rounded-md border border-white/[0.06] bg-white/[0.02] px-5 py-1 text-[10px] text-slate-600">
              app.smartmeet.ai
            </div>

            <div className="w-12" />
          </div>

          {/* Preview */}
          <div className="grid gap-0 lg:grid-cols-[180px_1fr]">

            {/* Sidebar */}
            <div className="hidden border-r border-white/[0.06] p-5 lg:block">
              <div className="mb-7 text-xs font-semibold text-white">
                SmartMeet <span className="text-indigo-400">AI</span>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="rounded-lg bg-indigo-500/10 px-3 py-2 text-indigo-300">
                  Overview
                </div>
                <div className="px-3 py-2 text-slate-600">
                  Meetings
                </div>
                <div className="px-3 py-2 text-slate-600">
                  Analytics
                </div>
              </div>
            </div>

            {/* Main preview */}
            <div className="p-6 sm:p-8">

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-indigo-400">
                    Meeting intelligence
                  </p>

                  <h3 className="mt-2 text-lg font-semibold">
                    Product Strategy
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    42 minutes · 6 participants
                  </p>
                </div>

                <div className="hidden rounded-lg border border-emerald-400/10 bg-emerald-500/[0.06] px-3 py-1.5 text-[10px] text-emerald-400 sm:block">
                  AI analyzed
                </div>
              </div>

              {/* Summary */}
              <div className="mt-7 rounded-xl border border-white/[0.07] bg-[#10151f] p-5">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-indigo-400" />
                  <span className="text-xs font-semibold">
                    AI Summary
                  </span>
                </div>

                <p className="mt-3 text-xs leading-6 text-slate-400">
                  The team reviewed the Q4 product roadmap, discussed the
                  November launch timeline, and agreed to prioritize the new
                  analytics dashboard before the beta release.
                </p>
              </div>

              {/* Insight cards */}
              <div className="mt-4 grid gap-4 md:grid-cols-2">

                <div className="rounded-xl border border-white/[0.07] bg-[#10151f] p-5">
                  <div className="flex items-center gap-2">
                    <FileAudio
                      size={15}
                      className="text-indigo-400"
                    />

                    <span className="text-xs font-semibold">
                      Key decisions
                    </span>
                  </div>

                  <div className="mt-4 space-y-3 text-xs text-slate-400">
                    <div className="flex gap-2">
                      <span className="text-indigo-400">01</span>
                      Launch beta in November
                    </div>

                    <div className="flex gap-2">
                      <span className="text-indigo-400">02</span>
                      Prioritize analytics dashboard
                    </div>

                    <div className="flex gap-2">
                      <span className="text-indigo-400">03</span>
                      Review API before launch
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.07] bg-[#10151f] p-5">
                  <div className="flex items-center gap-2">
                    <ListChecks
                      size={15}
                      className="text-emerald-400"
                    />

                    <span className="text-xs font-semibold">
                      Action items
                    </span>
                  </div>

                  <div className="mt-4 space-y-3 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded border border-slate-600" />
                      Finalize API design
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded border border-slate-600" />
                      Prepare launch campaign
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded border border-slate-600" />
                      Review analytics
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">

          <div className="max-w-xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-indigo-400">
              Built for better meetings
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              From conversation to clarity.
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              SmartMeet turns unstructured meeting recordings into useful,
              searchable information.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">

            <Capability
              number="01"
              icon={<FileAudio size={18} />}
              title="Transcription"
              description="Convert meeting recordings into searchable transcripts using speech recognition."
            />

            <Capability
              number="02"
              icon={<Sparkles size={18} />}
              title="AI insights"
              description="Generate concise summaries, key decisions and important discussion points."
            />

            <Capability
              number="03"
              icon={<ListChecks size={18} />}
              title="Action items"
              description="Extract follow-up tasks and decisions so nothing gets lost after the meeting."
            />

          </div>
        </div>
      </section>
    </main>
  );
}

function Capability({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border border-white/[0.07] bg-[#10151f] p-6 transition hover:-translate-y-0.5 hover:border-indigo-400/20 hover:bg-[#111824]">

      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/10 bg-indigo-500/10 text-indigo-400">
          {icon}
        </div>

        <span className="text-xs font-medium text-slate-700">
          {number}
        </span>
      </div>

      <h3 className="mt-6 font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}