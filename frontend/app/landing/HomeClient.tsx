"use client";

import { useState, useEffect } from "react";
import { Github, Activity, GitBranch, Star, Users, TrendingUp, Zap, Shield, BarChart3, Code2, GitCommit } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import PricingSection3 from "@/components/ui/pricing-section-3";
import Logo from "@/components/ui/logo";

export function HomeClient() {
  const router = useRouter();
  const [commitDots, setCommitDots] = useState<Array<{id: number, x: number, y: number, opacity: number}>>([]);
  const [showAnimation, setShowAnimation] = useState(false);

  const handleDemoMode = async () => {
    console.log('Demo mode clicked')
    // Clear any existing authentication
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/auth/session`, { 
        method: 'DELETE',
        credentials: 'include'
      })
      console.log('Logout response:', response.status)
    } catch (error) {
      console.log('No existing session to clear:', error)
    }
    
    // Clear specific auth cookies but preserve others
    document.cookie = "github_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "user_data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    // Set demo mode cookie to allow dashboard access
    document.cookie = "demo_mode=true; path=/; max-age=86400"; // 24 hours
    
    console.log('Navigating to dashboard')
    router.push('/dashboard?demo=true')
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowAnimation(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showAnimation) return;
    
    const interval = setInterval(() => {
      setCommitDots(prev => {
        const newDots = [...prev];
        if (Math.random() > 0.7) {
          newDots.push({
            id: Date.now(),
            x: Math.random() * 100,
            y: Math.random() * 100,
            opacity: 1
          });
        }
        return newDots
          .map(dot => ({ ...dot, opacity: dot.opacity - 0.02 }))
          .filter(dot => dot.opacity > 0)
          .slice(-15);
      });
    }, 200);

    return () => clearInterval(interval);
  }, [showAnimation]);

  return (
    <div className="min-h-screen bg-white text-neutral-900 overflow-x-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {commitDots.map(dot => (
          <div
            key={dot.id}
            className="absolute w-1 h-1 bg-neutral-300 rounded-full transition-opacity duration-1000"
            style={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              opacity: dot.opacity
            }}
          />
        ))}
      </div>

      <main className="relative">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-3 items-center">
            <div className="flex items-center gap-3">
              <Logo size="md" />
              <span className="text-base font-semibold tracking-tight">DevPulse</span>
            </div>
            <nav className="hidden md:flex items-center justify-center gap-6 text-sm text-neutral-600">
              <a className="hover:text-neutral-900 transition" href="#features">Features</a>
              <a className="hover:text-neutral-900 transition" href="#how-it-works">How it works</a>
              <Link href="/pricing" className="hover:text-neutral-900 transition">Pricing</Link>
            </nav>
            <div className="flex justify-end">
              <Link href="/auth/signin">
                <button className="inline-flex items-center gap-2 rounded-md bg-black text-white px-4 py-2 text-sm font-medium hover:bg-neutral-800 transition-colors">
                  <Github className="h-4 w-4" /> Connect GitHub
                </button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="pt-20 md:pt-32 pb-16 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-neutral-600 mb-8">
              <GitCommit className="h-3 w-3" />
              Introducing DevPulse
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
              Stop guessing. <br />
              <span className="text-neutral-500">Start improving.</span>
            </h1>
            <p className="text-neutral-600 text-xl md:text-2xl max-w-3xl mx-auto mb-10 leading-relaxed">
              Transform your GitHub activity into actionable insights for better code, healthier teams, and faster delivery.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/auth/signin">
                <button className="inline-flex items-center gap-3 rounded-lg px-8 py-4 text-base font-semibold bg-black hover:bg-neutral-800 text-white border border-gray-300 transition-all hover:scale-105">
                  <Github className="h-5 w-5" /> Connect GitHub
                </button>
              </Link>
              <button 
                onClick={handleDemoMode}
                className="inline-flex items-center gap-3 rounded-lg px-8 py-4 text-base font-semibold bg-white hover:bg-gray-50 text-black border border-gray-300 transition-all hover:scale-105"
              >
                <Activity className="h-5 w-5" />
                Try Demo
              </button>
            </div>
          </div>
        </section>

        {/* Stats showcase */}
        <section className="pb-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { k: "PRs merged", v: "342", icon: GitBranch },
                { k: "Lead time", v: "2.3d", icon: Activity },
                { k: "Focus blocks", v: "+18%", icon: Star },
                { k: "Review SLA", v: "94%", icon: Users }
              ].map((s) => (
                <div key={s.k} className="rounded-xl border border-gray-200 bg-white px-6 py-5 text-center hover:shadow-lg transition-shadow">
                  <s.icon className="h-5 w-5 text-neutral-400 mx-auto mb-2" />
                  <div className="text-sm text-neutral-500 mb-1">{s.k}</div>
                  <div className="text-2xl font-bold tracking-tight text-neutral-900">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-20 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-neutral-900 mb-4">See the story your code tells</h2>
              <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                Every commit, every PR, every late-night push tells a story about your development process.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Github className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Connect your repos</h3>
                <p className="text-neutral-600">
                  Link your GitHub repositories and we'll start analyzing your development patterns immediately.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-neutral-800 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Activity className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">AI analyzes patterns</h3>
                <p className="text-neutral-600">
                  Our AI identifies trends in your coding habits, collaboration patterns, and productivity cycles.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-neutral-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Get actionable insights</h3>
                <p className="text-neutral-600">
                  Receive personalized recommendations to improve your code quality and team collaboration.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-neutral-900 mb-4">Built for developers, by developers</h2>
              <p className="text-xl text-neutral-600">
                Real insights, not vanity metrics
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Developer Health Score",
                  description: "Track burnout signals and maintain sustainable coding practices",
                  icon: Activity
                },
                {
                  title: "Code Quality Trends",
                  description: "Monitor technical debt and code review effectiveness over time",
                  icon: Code2
                },
                {
                  title: "Team Collaboration",
                  description: "Understand how your team works together and identify bottlenecks",
                  icon: Users
                },
                {
                  title: "Focus Time Analysis",
                  description: "Discover your most productive hours and optimize your schedule",
                  icon: Star
                },
                {
                  title: "PR Lifecycle Insights",
                  description: "Reduce review time and improve deployment frequency",
                  icon: GitBranch
                },
                {
                  title: "Commit Pattern Analysis",
                  description: "Understand your coding rhythm and identify improvement opportunities",
                  icon: GitCommit
                }
              ].map((feature, index) => (
                <div key={index} className="p-6 rounded-xl border border-gray-200 bg-white hover:shadow-lg transition-shadow">
                  <feature.icon className="h-8 w-8 text-neutral-700 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social proof */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-neutral-500 text-sm mb-8">Trusted by developers at</p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {["Shopify", "Vercel", "Linear", "HashiCorp", "GitHub", "Stripe"].map((company) => (
                <div key={company} className="text-neutral-400 text-lg font-medium">
                  {company}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-neutral-900 mb-6">
              Ready to understand your development better?
            </h2>
            <p className="text-xl text-neutral-600 mb-10">
              Join thousands of developers who've improved their workflow with DevPulse.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/signin">
                <button className="inline-flex items-center gap-3 rounded-lg px-8 py-4 text-lg font-semibold bg-black hover:bg-neutral-800 text-white transition-all hover:scale-105">
                  <Github className="h-5 w-5" /> Get Started with GitHub
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="inline-flex items-center gap-3 rounded-lg px-8 py-4 text-lg font-semibold bg-white hover:bg-gray-50 text-black border border-gray-300 transition-all hover:scale-105">
                  <Activity className="h-5 w-5" />
                  View Live Demo
                </button>
              </Link>
            </div>
            <p className="text-neutral-500 text-sm mt-6">
              Free for individual developers • No credit card required
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 py-12 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-3 mb-4 md:mb-0">
                <Logo size="md" />
                <span className="text-base font-semibold">DevPulse</span>
              </div>
              <div className="text-neutral-500 text-sm">
                © {new Date().getFullYear()} DevPulse. Built for developers, by developers.
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}