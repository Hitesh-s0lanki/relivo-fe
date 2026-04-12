import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Code2,
  Database,
  ExternalLink,
  GitBranch,
  Layers,
  Radio,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Documentation — Relivo",
  description: "Learn how to build your first multi-agent system with Relivo.",
};

const gettingStarted = [
  { step: "1", title: "Create your account", href: "/signup" },
  { step: "2", title: "Define your first agent", href: "#agents" },
  { step: "3", title: "Send your first request", href: "#api" },
];

const concepts = [
  {
    icon: Layers,
    id: "agents",
    title: "Agents",
    desc: "Independent units that perform specific tasks. Each agent has a defined role, capabilities, and a set of other agents it can hand off to.",
    code: `const planner = relivo.agent("planner", {\n  role: "Break down complex tasks",\n  handoff: ["executor"],\n});`,
  },
  {
    icon: GitBranch,
    id: "orchestration",
    title: "Orchestration",
    desc: "The process of coordinating multiple agents in a workflow. Relivo handles routing, state, and execution flow automatically.",
    code: `const stream = await relivo.run({\n  agents: [planner, executor],\n  message: "Analyze this document",\n});`,
  },
  {
    icon: ArrowRight,
    id: "handoffs",
    title: "Handoffs",
    desc: "Agents can delegate work to other agents based on context. Handoffs are explicit, traceable, and configurable.",
    code: `agent.on("handoff", (target, context) => {\n  console.log(\`→ \${target}\`);\n});`,
  },
  {
    icon: Radio,
    id: "streaming",
    title: "Streaming",
    desc: "Real-time response delivery from your agent system. Stream chunks directly to your application as they are generated.",
    code: `for await (const chunk of stream) {\n  process.stdout.write(chunk.content);\n}`,
  },
];

const apiDocs = {
  endpoint: "POST /v1/run",
  description:
    "Send a message to your agent system and receive a streamed or complete response.",
  request: `{\n  "conversation_id": "conv_abc123",\n  "message": "Summarize the reports",\n  "stream": true\n}`,
  response: `{ "type": "chunk", "content": "The reports..." }\n{ "type": "handoff", "from": "planner", "to": "executor" }\n{ "type": "done", "conversation_id": "conv_abc123" }`,
};

const examples = [
  {
    title: "Multi-agent chat system",
    desc: "Build a chat app where agents collaborate to answer complex questions.",
    href: "#",
  },
  {
    title: "Research assistant",
    desc: "Chain a search agent, summarizer, and formatter for automated research.",
    href: "#",
  },
  {
    title: "Marketing automation",
    desc: "Orchestrate content generation, review, and distribution workflows.",
    href: "#",
  },
];

export default function DocsPage() {
  return (
    <div className="bg-white text-gray-900">
      {/* Header */}
      <section className="border-b border-gray-100 px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gray-400">
            Documentation
          </p>
          <h1 className="mb-5 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Build your first agent system
          </h1>
          <p className="max-w-2xl text-lg text-gray-500">
            Everything you need to start building multi-agent AI systems with
            Relivo.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {gettingStarted.map((item) => (
              <Link
                key={item.step}
                href={item.href}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 hover:border-gray-300 hover:bg-white transition-colors cursor-pointer"
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-gray-900 font-mono text-xs font-bold text-white">
                  {item.step}
                </span>
                {item.title}
                <ArrowRight className="ml-auto size-4 text-gray-400" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Core Concepts */}
        <section className="mb-20">
          <div className="mb-8 flex items-center gap-3">
            <BookOpen className="size-5 text-gray-700" />
            <h2 className="text-2xl font-bold text-gray-900">Core Concepts</h2>
          </div>

          <div className="space-y-6">
            {concepts.map((concept) => (
              <div
                key={concept.id}
                id={concept.id}
                className="overflow-hidden rounded-lg border border-gray-200"
              >
                <div className="flex items-start gap-4 p-6 pb-0">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gray-900">
                    <concept.icon className="size-4 text-white" />
                  </div>
                  <div>
                    <h3 className="mb-1.5 text-base font-semibold text-gray-900">
                      {concept.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {concept.desc}
                    </p>
                  </div>
                </div>
                <div className="m-6 rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <pre className="font-mono text-sm text-gray-700 leading-relaxed overflow-x-auto">
                    {concept.code}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* API Overview */}
        <section id="api" className="mb-20">
          <div className="mb-8 flex items-center gap-3">
            <Code2 className="size-5 text-gray-700" />
            <h2 className="text-2xl font-bold text-gray-900">API Overview</h2>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="rounded-md border border-gray-200 bg-gray-900 px-2.5 py-1 font-mono text-xs font-semibold text-white">
                  POST
                </span>
                <code className="font-mono text-sm text-gray-700">
                  {apiDocs.endpoint}
                </code>
              </div>
              <p className="mt-2 text-sm text-gray-500">{apiDocs.description}</p>
            </div>

            <div className="grid lg:grid-cols-2">
              <div className="border-b border-gray-100 p-6 lg:border-b-0 lg:border-r">
                <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Request
                </p>
                <pre className="font-mono text-sm text-gray-700 leading-relaxed overflow-x-auto">
                  {apiDocs.request}
                </pre>
              </div>
              <div className="p-6">
                <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Response (stream)
                </p>
                <pre className="font-mono text-sm text-gray-700 leading-relaxed overflow-x-auto">
                  {apiDocs.response}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* SDKs */}
        <section className="mb-20">
          <div className="mb-6 flex items-center gap-3">
            <Database className="size-5 text-gray-700" />
            <h2 className="text-2xl font-bold text-gray-900">SDKs</h2>
          </div>
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <p className="text-gray-500">
              Official SDKs coming soon — REST API is available now.
            </p>
            <p className="mt-2 font-mono text-sm text-gray-400">
              npm install @relivo/sdk &nbsp;·&nbsp; pip install relivo
            </p>
          </div>
        </section>

        {/* Examples */}
        <section className="mb-20">
          <h2 className="mb-7 text-2xl font-bold text-gray-900">Examples</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {examples.map((ex) => (
              <Link
                key={ex.title}
                href={ex.href}
                className="group rounded-lg border border-gray-200 bg-gray-50 p-6 hover:border-gray-300 hover:bg-white transition-all duration-200 cursor-pointer"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {ex.title}
                  </h3>
                  <ExternalLink className="size-3.5 shrink-0 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {ex.desc}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Need Help */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <h3 className="mb-2 font-semibold text-gray-900">Need help?</h3>
          <p className="mb-6 text-sm text-gray-500">
            Can&apos;t find what you&apos;re looking for? Reach out to our team.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
          >
            Contact Support
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
