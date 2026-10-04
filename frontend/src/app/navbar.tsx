import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#080b12]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">

        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10">
            <div className="h-2.5 w-2.5 rounded-full bg-indigo-400 shadow-[0_0_14px_rgba(129,140,248,0.8)]" />
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-[17px] font-semibold tracking-tight text-white">
              SmartMeet
            </span>

            <span className="text-[17px] font-medium text-indigo-400">
              AI
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-2 sm:gap-6">

          <Link
            href="/meetings"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-white"
          >
            Dashboard
          </Link>

          <Link
            href="/upload"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-white"
          >
            Upload
          </Link>

          <Link
            href="/login"
            className="rounded-lg border border-white/[0.10] bg-white/[0.03] px-4 py-2 text-sm font-medium text-slate-200 transition-all hover:border-indigo-400/30 hover:bg-indigo-500/10 hover:text-white"
          >
            Sign in
          </Link>

        </div>
      </div>
    </nav>
  );
}