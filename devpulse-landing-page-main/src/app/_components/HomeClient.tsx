"use client"

import { Github } from "lucide-react";

export function HomeClient() {
  return (
    <main className="relative min-h-screen bg-white text-neutral-900">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-3 items-center">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-black" />
            <span className="text-base font-semibold tracking-tight">DevPulse</span>
          </div>
          <nav className="hidden md:flex items-center justify-center gap-6 text-sm text-neutral-600">
            <a className="hover:text-neutral-900 transition" href="#features">Features</a>
            <a className="hover:text-neutral-900 transition" href="#pricing">Pricing</a>
            <a className="hover:text-neutral-900 transition" href="#docs">Docs</a>
          </nav>
          <div className="flex justify-end">
            <button className="inline-flex items-center gap-2 rounded-md bg-black text-white px-4 py-2 text-sm font-medium hover:bg-neutral-800">
              <Github className="h-4 w-4" /> Connect GitHub
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-16 md:pt-24 pb-10">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-neutral-600">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-neutral-400" />
            Introducing DevPulse
          </div>
          <h1 className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Stop guessing. <span className="text-neutral-500">Start improving.</span>
          </h1>
          <p className="mt-4 md:mt-5 text-neutral-600 text-lg md:text-xl max-w-2xl mx-auto">
            Turn GitHub activity into actionable insights for better code, healthier teams, and faster delivery.
          </p>
          <div className="mt-7 flex items-center justify-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold bg-black hover:bg-neutral-800 text-white border border-gray-300">
              <Github className="h-5 w-5" /> Connect GitHub
            </button>
          </div>
        </div>
      </section>

      {/* Slim stats strip */}
      <section className="pb-6">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[{ k: "PRs merged", v: "342" }, { k: "Lead time", v: "2.3d" }, { k: "Focus blocks", v: "+18%" }, { k: "Review SLA", v: "94%" }].map((s) => (
              <div key={s.k} className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-center">
                <div className="text-xs text-neutral-500">{s.k}</div>
                <div className="mt-1 text-lg font-semibold tracking-tight text-neutral-900">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Logos row */}
      <section className="py-8">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
            {["Shopify", "Vercel", "Linear", "HashiCorp", "GitHub"].map((n) => (
              <div key={n} className="text-neutral-500 text-sm border border-gray-200 rounded-md px-3 py-1 bg-white">{n}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center text-neutral-500 text-sm">
        © {new Date().getFullYear()} DevPulse. Built for developers.
      </footer>
    </main>
  );
}