"use client"
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [search, setSearch] = useState("");
  
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="max-w-6xl mx-auto px-8 py-24">

        <div className="text-center">

          <h1 className="text-6xl font-bold">
            AI Meeting Intelligence
          </h1>

          <p className="text-slate-400 text-xl mt-6 max-w-3xl mx-auto">
            Upload meeting recordings, generate AI summaries,
            extract action items, and manage meetings in one place.
          </p>
        

          <div className="flex justify-center gap-4 mt-10">
 

            <Link
              href="/upload"
              className="bg-blue-600 px-8 py-4 rounded-xl hover:bg-blue-700"
            >
              Upload Meeting
            </Link>

            <Link
              href="/meetings"
              className="border border-slate-700 px-8 py-4 rounded-xl hover:bg-slate-900"
            >
              View Dashboard
            </Link>

          </div>

        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-24">

          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
            <h3 className="text-2xl font-bold">
              🎤 Speech to Text
            </h3>

            <p className="text-slate-400 mt-3">
              Convert meeting audio into accurate transcripts using Whisper.
            </p>
          </div>

          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
            <h3 className="text-2xl font-bold">
              🤖 AI Summaries
            </h3>

            <p className="text-slate-400 mt-3">
              Generate concise summaries and important insights.
            </p>
          </div>

          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
            <h3 className="text-2xl font-bold">
              📋 Action Items
            </h3>

            <p className="text-slate-400 mt-3">
              Extract tasks and decisions automatically.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}