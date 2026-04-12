import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Target, Lightbulb, Rocket } from "lucide-react";

export const metadata: Metadata = {
  title: "About — Relivo",
  description:
    "Relivo is an AI orchestration platform for building structured, multi-agent systems.",
};

const problems = [
  "Unclear execution paths with monolithic models",
  "Poor scalability as complexity grows",
  "Limited control over logic and flow",
];

const differentiators = [
  {
    icon: Target,
    title: "Orchestration-first",
    desc: "We focus on how agents work together, not just what any single model can do.",
  },
  {
    icon: Lightbulb,
    title: "Multi-agent by design",
    desc: "Relivo was built from the ground up for agent collaboration — it's not an afterthought.",
  },
  {
    icon: Rocket,
    title: "Production-ready",
    desc: "Streaming, state management, and handoffs designed for real-world deployment.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-white text-gray-900">
      {/* Header */}
      <section className="border-b border-gray-100 px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gray-400">
            About Relivo
          </p>
          <h1 className="mb-5 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            The execution layer for intelligent systems
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Relivo is an AI orchestration platform designed to help developers
            build structured, multi-agent systems that scale.
          </p>
        </div>
      </section>

      {/* Problem + Approach */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gray-400">
                The Problem
              </p>
              <h2 className="mb-5 text-2xl font-bold text-gray-900">
                One model doing everything doesn&apos;t scale.
              </h2>
              <p className="mb-6 text-gray-500 leading-relaxed">
                Most AI applications rely on a single model handling every task.
                This breaks down fast — execution paths become unclear, systems
                become brittle at scale, and you lose meaningful control over
                the logic.
              </p>
              <ul className="space-y-3">
                {problems.map((p) => (
                  <li
                    key={p}
                    className="flex items-center gap-3 text-sm text-gray-600"
                  >
                    <span className="flex size-1.5 shrink-0 rounded-full bg-red-400" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8">
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gray-400">
                Our Approach
              </p>
              <h3 className="mb-4 text-xl font-bold text-gray-900">
                Multiple agents. One system.
              </h3>
              <p className="text-gray-500 leading-relaxed">
                Instead of one model, Relivo lets you define multiple agents —
                each with a clear role, each capable of handing off tasks, each
                contributing to a coordinated system that&apos;s greater than
                the sum of its parts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="border-t border-gray-100 bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gray-400">
              Differentiators
            </p>
            <h2 className="text-3xl font-bold text-gray-900">
              What makes Relivo different
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {differentiators.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-gray-200 bg-white p-7"
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

      {/* Vision */}
      <section className="border-t border-gray-100 py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-10 md:p-14">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-gray-400">
              Our Vision
            </p>
            <blockquote className="text-2xl font-semibold text-gray-900 leading-relaxed md:text-3xl">
              &ldquo;To become the execution layer for intelligent systems.&rdquo;
            </blockquote>
            <p className="mt-6 text-gray-500 leading-relaxed">
              We believe the future of AI isn&apos;t a single superintelligent
              model — it&apos;s an ecosystem of specialized agents working
              together, each doing what it does best, orchestrated seamlessly
              into coherent workflows.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-100 bg-gray-900 py-20">
        <div className="mx-auto max-w-xl px-6 text-center">
          <h2 className="mb-4 text-2xl font-bold text-white">
            Ready to start building?
          </h2>
          <p className="mb-8 text-gray-400">
            Join developers building multi-agent AI systems with Relivo.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Start Building
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
