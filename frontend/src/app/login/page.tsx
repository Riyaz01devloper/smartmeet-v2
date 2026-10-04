"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.access_token);
      window.dispatchEvent(new Event("auth-change"));

      toast.success("Welcome back!");

      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch (err) {
      console.error(err);
      toast.error("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#080b12] text-white">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-[-180px] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-indigo-500/[0.07] blur-[130px]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-5 py-12">
        <div className="w-full">

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/10">
              <div className="h-3 w-3 rounded-full bg-indigo-400 shadow-[0_0_18px_rgba(129,140,248,0.9)]" />
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-indigo-400">
              <Sparkles size={13} />
              SmartMeet AI
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              Welcome back
            </h1>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
              Sign in to access your meetings, summaries and AI-generated
              insights.
            </p>
          </div>

          {/* Login card */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#10151f] p-6 shadow-2xl shadow-black/30 sm:p-8">

            <form onSubmit={handleLogin} className="space-y-5">

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                  />

                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full rounded-xl border border-[#273244] bg-[#080b12] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-200"
                  >
                    Password
                  </label>
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-[#273244] bg-[#080b12] py-3.5 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-600 transition hover:bg-white/[0.05] hover:text-slate-300"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  "Signing in..."
                ) : (
                  <>
                    Sign in
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/[0.06]" />
              <span className="text-xs text-slate-600">OR</span>
              <div className="h-px flex-1 bg-white/[0.06]" />
            </div>

            {/* Register */}
            <div className="text-center">
              <p className="text-sm text-slate-500">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-indigo-400 transition hover:text-indigo-300"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>

          {/* Bottom text */}
          <div className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-600">
            <LockKeyhole size={12} />
            <span>Secure authentication</span>
          </div>
        </div>
      </div>
    </main>
  );
}