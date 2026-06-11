import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-slate-950 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
        <Link href="/">
          <h1 className="text-2xl font-bold text-white">
            🎙️ MeetingAI
          </h1>
        </Link>

        <div className="flex gap-4">
          <Link
            href="/upload"
            className="text-slate-300 hover:text-white"
          >
            Upload
          </Link>

          <Link
            href="/meetings"
            className="text-slate-300 hover:text-white"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}