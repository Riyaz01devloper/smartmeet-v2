"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/services/api";
import { jsPDF } from "jspdf";

export default function MeetingDetailsPage() {
  const params = useParams();
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
      console.log("Fetching:", id);

      const response = await api.get(`/meeting/${id}`);

      console.log("Response:", response.data);

      setMeeting(response.data);
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setLoading(false);
    }
  };

const downloadPDF = () => {
  const doc = new jsPDF();

  let y = 20;

  doc.setFontSize(20);
  doc.text("Meeting Report", 20, y);

  y += 20;

  doc.setFontSize(12);
  doc.text(`File: ${meeting.filename}`, 20, y);

  y += 20;

  doc.text("Summary:", 20, y);

  y += 10;

  const summaryLines = doc.splitTextToSize(
    meeting.summary || "No Summary",
    170
  );

  doc.text(summaryLines, 20, y);

  y += summaryLines.length * 7 + 10;

  doc.text("Transcript:", 20, y);

  y += 10;

  const transcriptLines = doc.splitTextToSize(
    meeting.transcript || "No Transcript",
    170
  );

  doc.text(transcriptLines, 20, y);

  doc.save(`${meeting.filename}.pdf`);
};

  if (loading) {
    return <p className="p-8">Loading...</p>;
  }

  if (!meeting) {
    return <p className="p-8">Meeting Not Found</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">
        {meeting.filename}
      </h1>
      <button
  onClick={downloadPDF}
  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg mb-6"
>
  📄 Download PDF
</button>

      <h2 className="text-2xl font-bold mb-2">
        Summary
      </h2>

      <div className="border rounded p-4 mb-6">
        {meeting.summary}
      </div>

      <h2 className="text-2xl font-bold mb-2">
        Transcript
      </h2>

      <div className="border rounded p-4 whitespace-pre-wrap">
        {meeting.transcript}
      </div>
    </div>
  );
}