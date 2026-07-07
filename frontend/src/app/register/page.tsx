"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../services/api";

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleRegister = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setLoading(true);

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
      });

      alert("Registration Successful!");

      router.push("/login");
    } catch (err: any) {
      console.error(err);

      alert(
        err.response?.data?.detail ||
          "Registration Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-4">

      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-10">

        <div className="text-center mb-10">

          <h1 className="text-6xl font-bold text-blue-600">
            SmartMeet AI
          </h1>

          <p className="text-gray-600 mt-4 text-xl">
            Create your account to get started
          </p>

        </div>

        <form
          onSubmit={handleRegister}
          className="space-y-6"
        >

          <div>

            <label className="block text-xl font-semibold text-slate-800 mb-2">
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
className="w-full border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"            />

          </div>

          <div>

            <label className="block text-xl font-semibold text-slate-800 mb-2">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
className="w-full border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"            />

          </div>

          <div>

            <label className="block text-xl font-semibold text-slate-800 mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
className="w-full border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"            />

            <p className="text-gray-500 text-sm mt-2">
              Password should be at least 6 characters.
            </p>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xl font-semibold py-4 rounded-2xl transition"
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>

        <div className="mt-8 text-center text-lg text-gray-700">

          Already have an account?{" "}

          <Link
            href="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Login
          </Link>

        </div>

      </div>

    </div>
  );
}