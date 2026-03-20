import Link from 'next/link';
import {
  Camera,
  BarChart3,
  Zap,
  Target,
  CheckCircle,
  ArrowRight,
  Sparkles,
  BookOpen,
  TrendingUp,
} from 'lucide-react';

const features = [
  {
    icon: Camera,
    color: 'text-violet-500',
    bg: 'bg-violet-50',
    title: 'AI Meal Photo Analysis',
    description:
      'Snap a photo of your meal and let Gemini AI instantly extract calories, protein, carbs, and fat. No manual lookup needed.',
  },
  {
    icon: BarChart3,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    title: '30-Day Analytics',
    description:
      'Visualise your nutrition trends with streak tracking, weekly summaries, and macro adherence charts over the past month.',
  },
  {
    icon: Zap,
    color: 'text-yellow-500',
    bg: 'bg-yellow-50',
    title: 'Daily AI Coaching',
    description:
      'Receive a personalised coaching report every day based on your goals and what you\'ve eaten — powered by Google Gemini.',
  },
  {
    icon: Target,
    color: 'text-green-500',
    bg: 'bg-green-50',
    title: 'Smart Goal Advisor',
    description:
      'Set your goals intelligently. AI calculates your BMR and TDEE, then recommends personalised calorie and macro targets.',
  },
  {
    icon: BookOpen,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    title: 'Personal Food Library',
    description:
      'Build your own database of custom foods for quick re-logging. Never search for the same meal twice.',
  },
  {
    icon: TrendingUp,
    color: 'text-pink-500',
    bg: 'bg-pink-50',
    title: 'AI Nutrition Insights',
    description:
      'Get a comprehensive monthly AI analysis identifying trends, gaps, and specific recommendations to hit your targets.',
  },
];

const techStack = [
  'Next.js 16', 'TypeScript', 'Tailwind CSS', 'Drizzle ORM',
  'Neon PostgreSQL', 'Clerk Auth', 'Stripe', 'Google Gemini',
  'Docker', 'AWS EC2', 'AWS ECR', 'Terraform', 'GitHub Actions',
];

const freePlanFeatures = [
  'Daily macro & calorie tracking',
  '30-day analytics dashboard',
  'Personal food library',
  '5 AI photo analyses per month',
];

const premiumPlanFeatures = [
  'Everything in Free',
  'Unlimited AI photo analyses',
  'AI Nutrition Insights reports',
  'AI Goal Advisor (BMR/TDEE)',
  'Daily AI coaching reports',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-16 py-4 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Sparkles className="text-violet-600" size={22} />
          <span className="text-xl font-bold tracking-tight">NutriTrack AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg transition"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white px-5 py-2 rounded-lg transition"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-36 pb-24 px-6 md:px-16 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <Sparkles size={14} />
          Powered by Google Gemini 2.0 Flash
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6">
          Track nutrition smarter
          <br />
          <span className="text-violet-600">with AI by your side</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Log meals with a photo, get daily AI coaching, and understand your nutrition with 30-day analytics — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-8 py-3.5 rounded-xl transition text-lg shadow-lg shadow-violet-200"
          >
            Start for free <ArrowRight size={20} />
          </Link>
          <Link
            href="/pricing"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium px-6 py-3.5 rounded-xl border border-gray-200 hover:border-gray-300 transition text-lg"
          >
            View pricing
          </Link>
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ── */}
      <section className="px-6 md:px-16 pb-24 max-w-6xl mx-auto">
        <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-2xl shadow-gray-100 bg-gray-50">
          {/* Mock browser bar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 border-b border-gray-200">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <div className="flex-1 mx-4 bg-white rounded-md px-3 py-1 text-xs text-gray-400 text-center">
              nutritrackai.xyz/dashboard
            </div>
          </div>
          {/* Mock dashboard UI */}
          <div className="p-6 md:p-10 bg-gray-50">
            <div className="flex gap-6">
              {/* Sidebar mock */}
              <div className="hidden md:flex flex-col w-44 bg-gray-900 rounded-xl p-4 gap-3 flex-none">
                <div className="text-white font-bold text-sm mb-2 px-1">NutriTrack AI</div>
                {['Dashboard', 'Log Meal', 'Food Library', 'Analytics', 'Settings'].map((item, i) => (
                  <div key={item} className={`text-xs px-3 py-2 rounded-lg ${i === 0 ? 'bg-white/20 text-white' : 'text-gray-400'}`}>
                    {item}
                  </div>
                ))}
              </div>
              {/* Main content mock */}
              <div className="flex-1 space-y-4">
                <div className="text-lg font-bold text-gray-800">Daily Nutrition Tracker</div>
                {/* KPI cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Consumed', value: '1,840 kcal', color: 'text-red-500', border: 'border-red-100' },
                    { label: 'Remaining', value: '360 kcal', color: 'text-green-500', border: 'border-green-100' },
                    { label: 'Food Items', value: '24', color: 'text-blue-500', border: 'border-blue-100' },
                    { label: 'Protein Left', value: '18g', color: 'text-orange-500', border: 'border-orange-100' },
                  ].map((kpi) => (
                    <div key={kpi.label} className={`bg-white rounded-xl p-4 border shadow-sm ${kpi.border}`}>
                      <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
                      <p className={`text-xl font-extrabold ${kpi.color}`}>{kpi.value}</p>
                    </div>
                  ))}
                </div>
                {/* AI coaching mock */}
                <div className="bg-white rounded-xl border-2 border-blue-100 p-4 shadow-sm">
                  <p className="text-xs font-bold text-blue-700 mb-2 flex items-center gap-1">
                    <Zap size={12} /> AI Goal Coach Report
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Great work today! You're 82% toward your calorie goal with solid protein intake. Consider adding a protein-rich snack before your evening workout to hit your 160g target. Your carb timing looks optimal for energy...
                  </p>
                </div>
                {/* Macro gauges mock */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Calories', pct: 84, color: 'bg-red-400' },
                    { label: 'Protein', pct: 72, color: 'bg-green-400' },
                    { label: 'Carbs', pct: 91, color: 'bg-blue-400' },
                    { label: 'Fat', pct: 65, color: 'bg-yellow-400' },
                  ].map((g) => (
                    <div key={g.label} className="bg-white rounded-xl p-3 border shadow-sm text-center">
                      <p className="text-xs text-gray-500 mb-2">{g.label}</p>
                      <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                        <div className={`${g.color} h-2 rounded-full`} style={{ width: `${g.pct}%` }} />
                      </div>
                      <p className="text-xs font-bold text-gray-700">{g.pct}%</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="px-6 md:px-16 py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4">Everything you need to nail your nutrition</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              From AI-powered logging to deep analytics — NutriTrack handles the hard parts so you can focus on your goals.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
                <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${f.bg} mb-4`}>
                  <f.icon className={f.color} size={22} />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="px-6 md:px-16 py-24 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold mb-4">Simple, transparent pricing</h2>
          <p className="text-gray-500 text-lg">Start free. Upgrade when you're ready.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free */}
          <div className="rounded-2xl border border-gray-200 p-8">
            <h3 className="text-xl font-bold mb-1">Free</h3>
            <p className="text-gray-500 text-sm mb-6">Perfect for getting started</p>
            <p className="text-5xl font-extrabold mb-8">$0<span className="text-lg font-normal text-gray-400">/mo</span></p>
            <ul className="space-y-3 mb-8">
              {freePlanFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle size={16} className="text-green-500 flex-none" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/sign-up"
              className="block text-center border border-gray-300 hover:border-gray-400 font-semibold py-3 rounded-xl transition"
            >
              Get started free
            </Link>
          </div>
          {/* Premium */}
          <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 p-8 text-white shadow-xl shadow-violet-200">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xl font-bold">Premium</h3>
              <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">MOST POPULAR</span>
            </div>
            <p className="text-white/70 text-sm mb-6">For serious nutrition tracking</p>
            <p className="text-5xl font-extrabold mb-8">$9.99<span className="text-lg font-normal text-white/60">/mo</span></p>
            <ul className="space-y-3 mb-8">
              {premiumPlanFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-white/90">
                  <CheckCircle size={16} className="text-white flex-none" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/sign-up"
              className="block text-center bg-white text-violet-700 hover:bg-gray-50 font-semibold py-3 rounded-xl transition"
            >
              Start Premium
            </Link>
          </div>
        </div>
      </section>

      {/* ── TECH STACK ── */}
      <section className="px-6 md:px-16 py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">Built with</p>
          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="text-sm text-gray-600 bg-white border border-gray-200 px-4 py-1.5 rounded-full font-medium shadow-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 md:px-16 py-24 text-center max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
          Ready to take control of your nutrition?
        </h2>
        <p className="text-gray-500 text-lg mb-10">
          Join for free. No credit card required.
        </p>
        <Link
          href="/sign-up"
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-10 py-4 rounded-xl transition text-lg shadow-lg shadow-violet-200"
        >
          Get started free <ArrowRight size={20} />
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100 px-6 md:px-16 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-violet-500" />
            <span className="font-semibold text-gray-600">NutriTrack AI</span>
          </div>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-gray-600 transition">Pricing</Link>
            <Link href="/sign-in" className="hover:text-gray-600 transition">Sign In</Link>
            <Link href="/sign-up" className="hover:text-gray-600 transition">Sign Up</Link>
          </div>
          <p>Built with Next.js, AWS & Google Gemini</p>
        </div>
      </footer>

    </div>
  );
}
