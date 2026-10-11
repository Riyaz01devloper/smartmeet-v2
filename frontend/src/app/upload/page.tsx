"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/services/api";
import ProtectedRoute from "@/component/ProtectedRoute";
import { Upload, FileAudio, CheckCircle2, ListChecks, HelpCircle, ArrowRight, Loader2 } from "lucide-react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select an audio file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    try {
      const response = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResult(response.data);
      toast.success("Meeting analyzed successfully!");
    } catch (error: any) {
      console.error("Upload error:", error);
      const detail = error.response?.data?.detail || "Upload failed. Please check your file and try again.";
      toast.error(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-white pb-20">
        <div className="max-w-4xl mx-auto p-5 sm:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Upload Meeting Recording</h1>
            <p className="text-slate-400 mt-2 text-sm sm:text-base">
              Upload an MP3, WAV, or M4A audio file (up to 25 MB) to transcribe and extract intelligence.
            </p>
          </div>

          {/* Upload Box */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="flex-1 w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-slate-700 bg-slate-950 cursor-pointer hover:border-indigo-500 transition">
                <FileAudio className="text-indigo-400 shrink-0" size={24} />
                <span className="text-sm text-slate-300 truncate">
                  {file ? file.name : "Choose an audio file (.mp3, .wav, .m4a)"}
                </span>
                <input
                  type="file"
                  accept=".mp3,.wav,.m4a,.ogg,.flac,.aac,.webm"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  disabled={loading}
                />
              </label>

              <button
                type="button"
                onClick={handleUpload}
                disabled={loading || !file}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 font-semibold text-sm transition"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Analyzing Meeting...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload &amp; Analyze
                  </>
                )}
              </button>
            </div>

            {loading && (
              <div className="mt-6 p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 text-sm flex items-center gap-3">
                <Loader2 size={18} className="animate-spin text-indigo-400 shrink-0" />
                <span>Transcribing audio with Groq Whisper and generating intelligence with Gemini AI... Please wait.</span>
              </div>
            )}
          </div>

          {/* Results View */}
          {result && (
            <div className="mt-10 space-y-8">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-400" size={24} />
                  Analysis Complete: {result.filename}
                </h2>
                {result.meeting_id && (
                  <Link
                    href={`/meetings/${result.meeting_id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition"
                  >
                    View Details
                    <ArrowRight size={14} />
                  </Link>
                )}
              </div>

              {/* Summary */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <span>📝</span> Meeting Summary
                </h3>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-sm text-slate-300 leading-relaxed">
                  {result.summary || "No summary available."}
                </div>
              </div>

              {/* Action Items */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <ListChecks className="text-emerald-400" size={18} />
                  Action Items ({result.tasks?.length || 0})
                </h3>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                  {result.tasks && result.tasks.length > 0 ? (
                    <ul className="space-y-2.5">
                      {result.tasks.map((task: string, index: number) => (
                        <li key={index} className="flex items-start gap-2.5 text-sm text-slate-300">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 mt-2 shrink-0" />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500">No action items detected in this meeting.</p>
                  )}
                </div>
              </div>

              {/* Key Decisions */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <HelpCircle className="text-indigo-400" size={18} />
                  Key Decisions ({result.decisions?.length || 0})
                </h3>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                  {result.decisions && result.decisions.length > 0 ? (
                    <ul className="space-y-2.5">
                      {result.decisions.map((decision: string, index: number) => (
                        <li key={index} className="flex items-start gap-2.5 text-sm text-slate-300">
                          <span className="h-2 w-2 rounded-full bg-indigo-400 mt-2 shrink-0" />
                          <span>{decision}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500">No explicit key decisions noted in this meeting.</p>
                  )}
                </div>
              </div>

              {/* Transcript */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <span>📜</span> Full Transcript
                </h3>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-sm text-slate-300 whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
                  {result.transcript || "No transcript available."}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
