"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Upload,
  User,
  ListChecks,
  Search,
  FolderOpen
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      setIsLoggedIn(!!token);
    };

    checkAuth();

    window.addEventListener("storage", checkAuth);
    window.addEventListener("auth-change", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("auth-change", checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setMenuOpen(false);
    window.dispatchEvent(new Event("auth-change"));
    router.push("/login");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#080b12]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">

        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
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
        <div className="flex items-center gap-1.5 sm:gap-3">
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white md:block"
              >
                Dashboard
              </Link>

              <Link
                href="/meetings"
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white sm:block"
              >
                Meetings
              </Link>

              <Link
                href="/tasks"
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white md:block"
              >
                Action Items
              </Link>

              <Link
                href="/search"
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white sm:block"
              >
                Intelligence Search
              </Link>

              <Link
                href="/upload"
                className="rounded-lg bg-indigo-500/10 border border-indigo-500/30 px-3.5 py-1.5 text-sm font-medium text-indigo-300 transition hover:bg-indigo-500 hover:text-white"
              >
                + Upload
              </Link>

              {/* User Menu */}
              <div className="relative ml-2">
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.04] px-2.5 py-2 transition hover:border-indigo-400/30 hover:bg-indigo-500/10"
                  aria-label="Open account menu"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
                    <User size={15} />
                  </div>

                  <ChevronDown
                    size={14}
                    className={`hidden text-slate-500 transition-transform sm:block ${
                      menuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown */}
                {menuOpen && (
                  <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-white/[0.08] bg-[#10151f] p-1.5 shadow-2xl shadow-black/40">
                    <div className="border-b border-white/[0.06] px-3 py-2.5">
                      <p className="text-sm font-medium text-white">SmartMeet AI</p>
                      <p className="text-xs text-slate-500">Workspace Active</p>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>

                    <Link
                      href="/meetings"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
                    >
                      <FolderOpen size={16} />
                      All Meetings
                    </Link>

                    <Link
                      href="/tasks"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
                    >
                      <ListChecks size={16} />
                      Action Items
                    </Link>

                    <Link
                      href="/search"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
                    >
                      <Search size={16} />
                      Cross-Meeting Search
                    </Link>

                    <Link
                      href="/upload"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
                    >
                      <Upload size={16} />
                      Upload Meeting
                    </Link>

                    <div className="my-1 border-t border-white/[0.06]" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
                    >
                      <LogOut size={16} />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg border border-white/[0.10] bg-white/[0.03] px-4 py-2 text-sm font-medium text-slate-200 transition-all hover:border-indigo-400/30 hover:bg-indigo-500/10 hover:text-white"
              >
                Sign in
              </Link>

              <Link
                href="/register"
                className="hidden rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 sm:block"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}