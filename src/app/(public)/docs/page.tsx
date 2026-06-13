import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Boxes,
  Code2,
  GitBranch,
  KeyRound,
  Layers,
  Plug,
  Radio,
  Workflow,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Learn the Relivo product model: workspaces, agents, workflows, MCP servers, deployments, runs, and streaming APIs.",
};

const quickStart = [
  {
    step: "1",
    title: "Create a workspace",
    description: "Start with a team environment for agents and workflows.",
  },
  {
    step: "2",
    title: "Define agents and skills",
    description: "Attach instructions, tools, reusable skills, and models.",
  },
  {
    step: "3",
    title: "Build a workflow",
    description: "Route requests through agents, tools, and conditions.",
  },
  {
    step: "4",
    title: "Publish a deployment",
    description: "Use the workflow from chat, API, SDKs, or embedded UI.",
  },
];

const concepts = [
  {
    icon: Boxes,
    id: "workspaces",
    title: "Workspaces",
    description:
      "A workspace owns members, agents, workflows, skills, MCP servers, API keys, conversations, logs, usage, and environments.",
  },
  {
    icon: Layers,
    id: "agents",
    title: "Agents",
    description:
      "Agents are execution units with model settings, instructions, tools, skills, memory, guardrails, and output configuration.",
  },
  {
    icon: Workflow,
    id: "workflows",
    title: "Workflows",
    description:
      "Workflows coordinate agents, tools, skills, conditions, shared state, retries, approvals, and final responses.",
  },
  {
    icon: Plug,
    id: "mcp",
    title: "MCP servers",
    description:
      "MCP servers connect Relivo agents to external tools, APIs, data systems, and business workflows.",
  },
  {
    icon: GitBranch,
    id: "deployments",
    title: "Deployments",
    description:
      "A deployment is a published workflow version that can power Relivo Chat, APIs, SDKs, webhooks, or internal apps.",
  },
  {
    icon: Radio,
    id: "runs",
    title: "Runs",
    description:
      "A run records one workflow execution with input, output, model calls, tool calls, timing, errors, stream events, and trace data.",
  },
];

const apiExample = {
  endpoint: "POST /v1/workflows/{workflow_id}/runs",
  request: `{
  "input": {
    "message": "Analyze our sales performance"
  },
  "conversation_id": "optional-conversation-id",
  "metadata": {
    "source": "customer-dashboard"
  },
  "stream": true
}`,
  events: `event: run.started
data: {"run_id":"run_123"}

event: agent.started
data: {"agent_id":"research_agent"}

event: agent.message.delta
data: {"delta":"Based on the available data..."}

event: run.completed
data: {"run_id":"run_123","status":"completed"}`,
};

const mvpPriorities = [
  "Workspace and authentication",
  "Agent creation and model configuration",
  "Custom skills and URL-based MCP integration",
  "Workflow orchestration with visible execution events",
  "Real-time streaming through chat and API",
  "Deployment, API keys, usage tracking, and basic logs",
];

export default function DocsPage() {
  return (
    <div className="bg-white text-gray-900">
      <section className="border-b border-gray-100 px-6 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-sm font-semibold tracking-widest text-gray-400 uppercase">
            Documentation
          </p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Build an agent workflow once. Use it everywhere.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-500">
            Relivo helps teams build, run, deploy, and embed production-ready AI
            agent workflows with streaming, MCP connectivity, skills,
            observability, and chat UI.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-700"
            >
              Start building
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="#api"
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
            >
              View API model
              <Code2 className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-6 py-16">
        <section className="mb-16">
          <div className="mb-7 flex items-center gap-3">
            <BookOpen className="size-5 text-gray-700" />
            <h2 className="text-2xl font-bold text-gray-900">Quick start</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            {quickStart.map((item) => (
              <div
                key={item.step}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-gray-900 font-mono text-xs font-bold text-white">
                  {item.step}
                </span>
                <h3 className="mt-4 text-sm font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="mb-7 flex items-center gap-3">
            <Layers className="size-5 text-gray-700" />
            <h2 className="text-2xl font-bold text-gray-900">Core concepts</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {concepts.map((concept) => (
              <article
                key={concept.id}
                id={concept.id}
                className="rounded-lg border border-gray-200 bg-white p-5"
              >
                <div className="mb-4 flex size-9 items-center justify-center rounded-lg bg-gray-900">
                  <concept.icon className="size-4 text-white" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                  {concept.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {concept.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="api" className="mb-16">
          <div className="mb-7 flex items-center gap-3">
            <Code2 className="size-5 text-gray-700" />
            <h2 className="text-2xl font-bold text-gray-900">
              Workflow run API
            </h2>
          </div>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="border-b border-gray-100 bg-gray-50 px-5 py-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-md border border-gray-200 bg-gray-900 px-2.5 py-1 font-mono text-xs font-semibold text-white">
                  POST
                </span>
                <code className="font-mono text-sm text-gray-700">
                  {apiExample.endpoint}
                </code>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-500">
                Published workflows should support streaming and non-streaming
                runs, API key authentication, idempotency, cancellation,
                structured errors, usage tracking, and conversation continuity.
              </p>
            </div>
            <div className="grid lg:grid-cols-2">
              <CodeBlock title="Request" code={apiExample.request} />
              <CodeBlock title="SSE events" code={apiExample.events} />
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="mb-7 flex items-center gap-3">
            <KeyRound className="size-5 text-gray-700" />
            <h2 className="text-2xl font-bold text-gray-900">MVP priorities</h2>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
            <ul className="grid gap-3 md:grid-cols-2">
              {mvpPriorities.map((priority) => (
                <li
                  key={priority}
                  className="flex items-start gap-3 text-sm text-gray-600"
                >
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gray-900" />
                  {priority}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-gray-900 p-8 text-white">
          <h2 className="text-2xl font-bold">Developer distribution</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-300">
            Relivo will expose workflows through production APIs, a JavaScript
            SDK, a React chat package, headless hooks, temporary client tokens,
            and embeddable chat surfaces.
          </p>
          <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4">
            <pre className="overflow-x-auto font-mono text-sm leading-relaxed text-gray-100">
              npm install @relivo/chat
            </pre>
          </div>
        </section>
      </main>
    </div>
  );
}

function CodeBlock({ title, code }: { title: string; code: string }) {
  return (
    <div className="border-b border-gray-100 p-5 last:border-b-0 lg:border-r lg:border-b-0 lg:last:border-r-0">
      <p className="mb-3 font-mono text-xs font-semibold tracking-wider text-gray-400 uppercase">
        {title}
      </p>
      <pre className="overflow-x-auto font-mono text-sm leading-relaxed text-gray-700">
        {code}
      </pre>
    </div>
  );
}
