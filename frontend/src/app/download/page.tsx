"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Laptop,
  Smartphone,
  Download,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  QrCode,
  ShieldCheck,
  Zap,
  Bell,
  ArrowRight
} from "lucide-react";
import toast from "react-hot-toast";

export default function DownloadPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [userOS, setUserOS] = useState<"windows" | "android" | "other">("other");

  useEffect(() => {
    // Detect OS
    if (typeof window !== "undefined") {
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes("win")) {
        setUserOS("windows");
      } else if (userAgent.includes("android")) {
        setUserOS("android");
      }
    }

    // Capture PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async (platform: "windows" | "android") => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        toast.success(`SmartMeet AI installed for ${platform === "windows" ? "Windows" : "Android"}!`);
      }
      setDeferredPrompt(null);
      setIsInstallable(false);
    } else {
      // Guide instructions if browser doesn't expose deferred prompt
      if (platform === "windows") {
        toast((t) => (
          <span>
            To install on Windows: Click the <strong>Install App</strong> icon in your browser address bar (top right).
          </span>
        ), { duration: 6000 });
      } else {
        toast((t) => (
          <span>
            To install on Android: Tap the <strong>three dots menu (⋮)</strong> in Chrome and tap <strong>&ldquo;Add to Home screen&rdquo;</strong>.
          </span>
        ), { duration: 6000 });
      }
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#080b12] text-white pb-24">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-[-140px] h-[450px] w-[700px] -translate-x-1/2 rounded-full bg-indigo-500/[0.08] blur-[130px]" />

      <div className="relative mx-auto max-w-6xl px-5 pt-12 sm:pt-20">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-medium text-indigo-300 mb-4">
            <Sparkles size={13} />
            Native Standalone Experience
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
            Get SmartMeet AI on{" "}
            <span className="text-indigo-400">Windows</span> &amp;{" "}
            <span className="text-emerald-400">Android</span>
          </h1>
          <p className="text-slate-400 mt-4 text-base sm:text-lg leading-relaxed">
            Install SmartMeet AI directly onto your Windows PC or Android smartphone as a standalone desktop and mobile application. No app store login required.
          </p>
        </div>

        {/* Platform Download Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {/* Card 1: Windows Desktop */}
          <div className={`rounded-3xl border p-8 transition-all relative overflow-hidden flex flex-col justify-between ${
            userOS === "windows"
              ? "border-indigo-500/50 bg-gradient-to-b from-indigo-950/30 to-slate-900/80 shadow-2xl shadow-indigo-500/10"
              : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
          }`}>
            {userOS === "windows" && (
              <div className="absolute top-4 right-4 bg-indigo-500 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Recommended for you
              </div>
            )}

            <div>
              <div className="h-14 w-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6">
                <Laptop size={30} />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Windows Desktop App
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Run SmartMeet AI in a dedicated borderless desktop window directly from your Windows Taskbar and Start Menu.
              </p>

              {/* Feature bullets */}
              <div className="space-y-3 mb-8 text-sm text-slate-300">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Windows 10 &amp; 11 Native Integration</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Instant launch from Taskbar without browser tabs</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Full PDF export &amp; multi-meeting intelligence</span>
                </div>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => handleInstallClick("windows")}
                className="w-full inline-flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-base transition shadow-lg shadow-indigo-500/25"
              >
                <Download size={18} />
                Install on Windows PC
              </button>
              <p className="text-xs text-slate-500 text-center mt-3">
                Click above or look for the Install icon in your Edge/Chrome address bar.
              </p>
            </div>
          </div>

          {/* Card 2: Android App */}
          <div className={`rounded-3xl border p-8 transition-all relative overflow-hidden flex flex-col justify-between ${
            userOS === "android"
              ? "border-emerald-500/50 bg-gradient-to-b from-emerald-950/30 to-slate-900/80 shadow-2xl shadow-emerald-500/10"
              : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
          }`}>
            {userOS === "android" && (
              <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Recommended for you
              </div>
            )}

            <div>
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
                <Smartphone size={30} />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Android Mobile App
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Record or upload meeting voice notes straight from your phone with a home screen app icon.
              </p>

              {/* Feature bullets */}
              <div className="space-y-3 mb-8 text-sm text-slate-300">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Compatible with all Android devices (Samsung, Pixel, etc.)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>One-tap voice recorder audio uploads</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Full mobile-optimized meeting chat &amp; task checklist</span>
                </div>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => handleInstallClick("android")}
                className="w-full inline-flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-base transition shadow-lg shadow-emerald-500/25"
              >
                <Download size={18} />
                Install on Android Phone
              </button>
              <p className="text-xs text-slate-500 text-center mt-3">
                Tap above or tap Chrome menu (⋮) &rarr; &ldquo;Add to Home screen&rdquo;.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="border-t border-slate-800 pt-16">
          <h3 className="text-xl sm:text-2xl font-bold text-center mb-12">
            Why Install the SmartMeet App?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
              <Zap className="text-indigo-400 mb-3" size={24} />
              <h4 className="font-semibold text-white mb-1.5">Zero Lag Launch</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Opens instantly as an independent window or mobile application without browser tab clutter.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
              <ShieldCheck className="text-emerald-400 mb-3" size={24} />
              <h4 className="font-semibold text-white mb-1.5">Always Updated</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automatically receives the latest AI speech models and summary features without manual updates.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
              <Bell className="text-amber-400 mb-3" size={24} />
              <h4 className="font-semibold text-white mb-1.5">Cross-Device Sync</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload on Android and manage action items on Windows seamlessly in real-time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

