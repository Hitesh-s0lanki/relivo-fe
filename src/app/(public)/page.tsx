import Link from "next/link";
import {
  ArrowRight,
  GitBranch,
  Layers,
  Radio,
  Database,
  Code2,
  MessageSquare,
  Bot,
  Megaphone,
  Search,
  Workflow,
  CheckCircle2,
  Zap,
} from "lucide-react";

const whyItems = [
  {
    icon: GitBranch,
    title: "Dynamic Routing",
    desc: "Route tasks between agents based on context, capability, and logic — not rigid pipelines.",
  },
  {
    icon: Layers,
    title: "Structured Flows",
    desc: "Maintain clear execution flows across multi-step agent conversations and decisions.",
  },
  {
    icon: Radio,
    title: "Real-time Streaming",
    desc: "Deliver streamed responses from your agent system directly to users in real time.",
  },
  {
    icon: Database,
    title: "State Management",
    desc: "Track conversations, agent transitions, and decisions across your entire workflow.",
  },
];

const buildItems = [
  {
    icon: MessageSquare,
    title: "Multi-agent chat",
    desc: "Build chat apps where specialized agents collaborate seamlessly.",
  },
  {
    icon: Bot,
    title: "AI Copilots",
    desc: "Create copilots with dedicated agents for planning, writing, and execution.",
  },
  {
    icon: Megaphone,
    title: "Marketing automation",
    desc: "Orchestrate content generation, analysis, and distribution workflows.",
  },
  {
    icon: Search,
    title: "Research engines",
    desc: "Build systems that search, summarize, and synthesize at scale.",
  },
  {
    icon: Workflow,
    title: "Tool-using workflows",
    desc: "Connect agents to external tools, APIs, and data sources intelligently.",
  },
];

const steps = [
  {
    num: "01",
    title: "Define Agents",
    desc: "Create specialized agents with clear roles — planner, executor, analyst, or any custom role you need.",
  },
  {
    num: "02",
    title: "Enable Handoffs",
    desc: "Agents delegate work to each other based on context. No rigid orchestration code required.",
  },
  {
    num: "03",
    title: "Stream Execution",
    desc: "Run your agent system in real time with streaming responses delivered to your application.",
  },
  {
    num: "04",
    title: "Maintain State",
    desc: "Conversations, decisions, and transitions are tracked across every agent in your system.",
  },
];

const capabilities = [
  {
    icon: Layers,
    title: "Multi-Agent Runtime",
    desc: "Run multiple agents in a coordinated system instead of forcing one model to do everything.",
    tag: "Core",
  },
  {
    icon: GitBranch,
    title: "Intelligent Handoffs",
    desc: "Dynamically route tasks between agents based on context, state, and logic.",
    tag: "Orchestration",
  },
  {
    icon: Radio,
    title: "Streaming API",
    desc: "Deliver real-time responses from your agent system to any application.",
    tag: "API",
  },
  {
    icon: Database,
    title: "State Management",
    desc: "Maintain execution flow, memory, and context across agents and sessions.",
    tag: "Data",
  },
];

const devFeatures = [
  "API-first architecture",
  "Flexible orchestration logic",
  "Works with your existing stack",
  "Designed for production systems",
];

export default function LandingPage() {
  return (
    <div className="bg-white text-gray-900">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gray-100 bg-gray-50 px-6 py-28 md:py-40">
        {/* Subtle dot grid — theme colors only */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 0%, #000 30%, transparent 100%)",
          }}
        />

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-1.5 shadow-sm">
            <span className="size-1.5 rounded-full bg-gray-900 animate-pulse" />
            <span className="text-xs font-semibold text-gray-900">Now in beta</span>
            <span className="text-xs text-gray-400">— join the waitlist</span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-6xl font-bold leading-[1.08] tracking-tight text-gray-900 md:text-[80px]">
            Build AI systems
            <br />
            that think together
          </h1>

          <p className="mx-auto mb-10 max-w-lg text-xl text-gray-500 leading-relaxed">
            Coordinate multiple specialized agents with intelligent handoffs,
            real-time streaming, and full state control.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row mb-14">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-7 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
            >
              Get Started — it&apos;s free
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-7 py-3.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200 cursor-pointer"
            >
              <Code2 className="size-4 text-gray-400" />
              View Docs
            </Link>
          </div>

          {/* Capability tags */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {[
              { icon: Layers, label: "Multi-Agent Runtime" },
              { icon: GitBranch, label: "Intelligent Handoffs" },
              { icon: Radio, label: "Streaming API" },
              { icon: Database, label: "State Management" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-600 shadow-sm"
              >
                <Icon className="size-3 text-gray-400" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Why Relivo */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gray-400">
              Why Relivo
            </p>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Most AI apps use one model for everything.
            </h2>
            <p className="mt-3 text-gray-500">That&apos;s the bottleneck.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyItems.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-gray-100 bg-gray-50 p-6 transition-all duration-200 hover:border-gray-200 hover:shadow-sm cursor-default"
              >
                <div className="mb-4 flex size-9 items-center justify-center rounded-lg bg-gray-900">
                  <item.icon className="size-4 text-white" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Can Build */}
      <section className="border-t border-gray-100 bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gray-400">
              Use Cases
            </p>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              What you can build
            </h2>
            <p className="mt-3 max-w-xl mx-auto text-gray-500">
              Relivo is designed for developers and teams building advanced AI
              systems.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {buildItems.map((item) => (
              <div
                key={item.title}
                className="group flex gap-4 rounded-lg border border-gray-200 bg-white p-6 transition-all duration-200 hover:border-gray-300 hover:shadow-sm cursor-default"
              >
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 group-hover:bg-gray-900 group-hover:border-gray-900 transition-all duration-200">
                  <item.icon className="size-4 text-gray-500 group-hover:text-white transition-colors duration-200" />
                </div>
                <div>
                  <h3 className="mb-1.5 font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-gray-100 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gray-400">
              How It Works
            </p>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Four steps to orchestration
            </h2>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.num} className="relative">
                {i < steps.length - 1 && (
                  <div className="absolute top-4 left-full hidden h-px w-full bg-gray-200 lg:block" />
                )}
                <div className="mb-4 font-mono text-3xl font-bold text-gray-100">
                  {step.num}
                </div>
                <h3 className="mb-2 text-base font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="border-t border-gray-100 bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gray-400">
              Capabilities
            </p>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Core capabilities
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {capabilities.map((cap) => (
              <div
                key={cap.title}
                className="flex gap-5 rounded-lg border border-gray-200 bg-white p-7 transition-all duration-200 hover:border-gray-300 hover:shadow-sm cursor-default"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-900">
                  <cap.icon className="size-4 text-white" />
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{cap.title}</h3>
                    <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 font-mono text-xs text-gray-400">
                      {cap.tag}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {cap.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for Developers */}
      <section className="border-t border-gray-100 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gray-400">
                Developer First
              </p>
              <h2 className="mb-5 text-3xl font-bold text-gray-900 md:text-4xl">
                Built for developers
              </h2>
              <p className="mb-8 text-gray-500 leading-relaxed">
                Relivo gives you control without unnecessary complexity. No
                vendor lock-in, no opinionated abstractions — just a powerful
                orchestration layer that fits your stack.
              </p>
              <ul className="space-y-3">
                {devFeatures.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-3 text-sm text-gray-700"
                  >
                    <CheckCircle2 className="size-4 shrink-0 text-gray-900" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
                >
                  <Code2 className="size-4 text-gray-400" />
                  Read the docs
                </Link>
              </div>
            </div>

            {/* Visual: agent flow diagram */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-10">
              <div className="flex flex-col items-center gap-3">
                {/* User input */}
                <div className="w-full rounded-lg border border-gray-200 bg-white px-5 py-3.5 text-center shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-0.5">User message</p>
                  <p className="text-sm text-gray-700">&ldquo;Analyze and summarize the report&rdquo;</p>
                </div>

                <div className="flex items-center gap-1 text-gray-300">
                  <div className="h-6 w-px bg-gray-200" />
                </div>

                {/* Planner */}
                <div className="w-full rounded-lg border border-gray-900 bg-gray-900 px-5 py-3.5 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-0.5">Planner Agent</p>
                  <p className="text-sm text-white">Breaks task into steps</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="h-4 w-px bg-gray-200" />
                    <ArrowRight className="size-3 text-gray-300 rotate-90" />
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="h-4 w-px bg-gray-200" />
                    <ArrowRight className="size-3 text-gray-300 rotate-90" />
                  </div>
                </div>

                {/* Sub-agents */}
                <div className="grid w-full grid-cols-2 gap-3">
                  <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-center shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-0.5">Researcher</p>
                    <p className="text-xs text-gray-600">Fetches data</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-center shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-0.5">Writer</p>
                    <p className="text-xs text-gray-600">Formats output</p>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  <div className="h-4 w-px bg-gray-200" />
                </div>

                {/* Result */}
                <div className="w-full rounded-lg border border-gray-200 bg-green-50 px-5 py-3.5 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-green-600 mb-0.5">Streamed result</p>
                  <p className="text-sm text-gray-700">Delivered to your app</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-100 bg-gray-900 py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <Zap className="mx-auto mb-5 size-7 text-white opacity-60" />
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Start building today
          </h2>
          <p className="mx-auto mb-10 text-gray-400 leading-relaxed">
            Join developers building the next generation of multi-agent AI
            systems with Relivo.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
            >
              Create Account
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              View pricing →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
