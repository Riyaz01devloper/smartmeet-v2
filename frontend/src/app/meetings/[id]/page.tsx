"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import { jsPDF } from "jspdf";
import ProtectedRoute from "@/component/ProtectedRoute";
import { Download, ArrowLeft, Trash2, ListChecks, HelpCircle, FileText, Calendar } from "lucide-react";
import toast from "react-hot-toast";

export default function MeetingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchMeeting();
    }
  }, [id]);

  const fetchMeeting = async () => {
    try {
      const response = await api.get(`/meeting/${id}`);
      setMeeting(response.data);
    } catch (error) {
      console.error("Meeting details fetch error:", error);
      toast.error("Failed to load meeting details.");
    } finally {
      setLoading(false);
    }
  };

  const deleteMeeting = async () => {
    if (!window.confirm("Are you sure you want to delete this meeting?")) {
      return;
    }
    try {
      await api.delete(`/meeting/${id}`);
      toast.success("Meeting deleted");
      router.push("/meetings");
    } catch (error) {
      console.error("Delete meeting error:", error);
      toast.error("Failed to delete meeting.");
    }
  };

  const downloadPDF = () => {
    if (!meeting) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxLineWidth = pageWidth - margin * 2;
    let y = margin;

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    // Title
    doc.setFontSize(20);
    doc.text("Meeting Intelligence Report", margin, y);
    y += 12;

    // Metadata
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`File: ${meeting.filename || "Untitled"}`, margin, y);
    y += 6;
    if (meeting.created_at) {
      doc.text(`Date: ${new Date(meeting.created_at).toLocaleString()}`, margin, y);
      y += 6;
    }
    y += 6;
    doc.setTextColor(0);

    // Summary Section
    checkPageBreak(25);
    doc.setFontSize(14);
    doc.text("Executive Summary", margin, y);
    y += 8;

    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(meeting.summary || "No summary recorded.", maxLineWidth);
    summaryLines.forEach((line: string) => {
      checkPageBreak(7);
      doc.text(line, margin, y);
      y += 6;
    });
    y += 8;

    // Action Items Section
    if (meeting.tasks && meeting.tasks.length > 0) {
      checkPageBreak(25);
      doc.setFontSize(14);
      doc.text("Action Items", margin, y);
      y += 8;

      doc.setFontSize(10);
      meeting.tasks.forEach((task: string, i: number) => {
        const taskLines = doc.splitTextToSize(`[ ] ${task}`, maxLineWidth);
        taskLines.forEach((line: string) => {
          checkPageBreak(7);
          doc.text(line, margin, y);
          y += 6;
        });
      });
      y += 8;
    }

    // Key Decisions Section
    if (meeting.decisions && meeting.decisions.length > 0) {
      checkPageBreak(25);
      doc.setFontSize(14);
      doc.text("Key Decisions", margin, y);
      y += 8;

      doc.setFontSize(10);
      meeting.decisions.forEach((decision: string, i: number) => {
        const decLines = doc.splitTextToSize(`- ${decision}`, maxLineWidth);
        decLines.forEach((line: string) => {
          checkPageBreak(7);
          doc.text(line, margin, y);
          y += 6;
        });
      });
      y += 8;
    }

    // Full Transcript Section
    checkPageBreak(25);
    doc.setFontSize(14);
    doc.text("Transcript", margin, y);
    y += 8;

    doc.setFontSize(9);
    doc.setTextColor(60);
    const transcriptLines = doc.splitTextToSize(meeting.transcript || "No transcript available.", maxLineWidth);
    transcriptLines.forEach((line: string) => {
      checkPageBreak(6);
      doc.text(line, margin, y);
      y += 5.5;
    });

    const safeFilename = (meeting.filename || "meeting").replace(/[^a-zA-Z0-9_-]/g, "_");
    doc.save(`${safeFilename}_report.pdf`);
    toast.success("PDF downloaded successfully!");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-white pb-20">
        <div className="max-w-4xl mx-auto p-5 sm:p-8">
          {/* Navigation Bar */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/meetings"
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
            >
              <ArrowLeft size={16} />
              Back to Meetings
            </Link>

            {meeting && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={downloadPDF}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm font-semibold transition"
                >
                  <Download size={16} />
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={deleteMeeting}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/20 px-3 py-2 text-sm font-medium transition"
                  title="Delete meeting"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <p className="text-slate-400 text-lg">Loading meeting details...</p>
            </div>
          ) : !meeting ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
              <h2 className="text-2xl font-bold">Meeting Not Found</h2>
              <p className="text-slate-400 mt-2">The meeting you are looking for may have been deleted or does not exist.</p>
              <Link
                href="/meetings"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Return to Dashboard
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Meeting Header */}
              <div className="border-b border-slate-800 pb-6">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  🎙️ {meeting.filename}
                </h1>
                {meeting.created_at && (
                  <p className="text-slate-500 text-xs sm:text-sm mt-2 flex items-center gap-1.5">
                    <Calendar size={14} />
                    {new Date(meeting.created_at).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Summary */}
              <div>
                <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <FileText className="text-indigo-400" size={20} />
                  Executive Summary
                </h2>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-slate-300 leading-relaxed text-sm sm:text-base">
                  {meeting.summary || "No summary available."}
                </div>
              </div>

              {/* Action Items */}
              <div>
                <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <ListChecks className="text-emerald-400" size={20} />
                  Action Items ({meeting.tasks?.length || 0})
                </h2>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                  {meeting.tasks && meeting.tasks.length > 0 ? (
                    <ul className="space-y-3">
                      {meeting.tasks.map((task: string, index: number) => (
                        <li key={index} className="flex items-start gap-3 text-sm sm:text-base text-slate-300">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 mt-2 shrink-0" />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500">No action items found in this meeting.</p>
                  )}
                </div>
              </div>

              {/* Key Decisions */}
              <div>
                <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <HelpCircle className="text-indigo-400" size={20} />
                  Key Decisions ({meeting.decisions?.length || 0})
                </h2>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                  {meeting.decisions && meeting.decisions.length > 0 ? (
                    <ul className="space-y-3">
                      {meeting.decisions.map((decision: string, index: number) => (
                        <li key={index} className="flex items-start gap-3 text-sm sm:text-base text-slate-300">
                          <span className="h-2 w-2 rounded-full bg-indigo-400 mt-2 shrink-0" />
                          <span>{decision}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500">No key decisions extracted from this meeting.</p>
                  )}
                </div>
              </div>

              {/* Full Transcript */}
              <div>
                <h2 className="text-xl font-bold mb-3">
                  Full Transcript
                </h2>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap max-h-[30rem] overflow-y-auto">
                  {meeting.transcript || "No transcript available."}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}