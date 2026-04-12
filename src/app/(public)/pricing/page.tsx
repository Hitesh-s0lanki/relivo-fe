import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing — Relivo",
  description:
    "Simple, transparent pricing for building and scaling multi-agent AI systems.",
};

const plans = [
  {
    name: "Free",
    price: "$0",
    period: null,
    tagline: "Start building for free",
    features: [
      "100 requests / month",
      "Basic agent orchestration",
      "2 agents max",
      "Community support",
      "API access",
    ],
    cta: "Get Started",
    ctaHref: "/signup",
    highlighted: false,
    badge: null,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    tagline: "For individual developers and startups",
    features: [
      "10,000 requests / month",
      "Unlimited agent orchestration",
      "Streaming API access",
      "Multi-agent workflows",
      "Priority support",
      "Usage analytics",
    ],
    cta: "Start Pro",
    ctaHref: "/signup",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Team",
    price: "$99",
    period: "/month",
    tagline: "For growing teams",
    features: [
      "50,000 requests / month",
      "Shared projects",
      "Advanced orchestration",
      "Team collaboration",
      "Usage analytics",
      "Priority support",
    ],
    cta: "Contact Sales",
    ctaHref: "/contact",
    highlighted: false,
    badge: null,
  },
];

const faqs = [
  {
    q: "What counts as a request?",
    a: "Each message sent to your agent system counts as one request, regardless of how many agents are involved in processing it.",
  },
  {
    q: "Can I switch plans anytime?",
    a: "Yes. Upgrade or downgrade at any time. Changes take effect immediately and billing is prorated.",
  },
  {
    q: "Is usage-based billing available?",
    a: "Usage-based billing may apply for high-volume usage above your plan limit. Custom plans are available on request.",
  },
  {
    q: "What is enterprise pricing?",
    a: "Enterprise plans include custom request limits, dedicated infrastructure, SLA support, and advanced security. Contact us for a quote.",
  },
];

export default function PricingPage() {
  return (
    <div className="bg-white text-gray-900">
      {/* Header */}
      <section className="border-b border-gray-100 px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gray-400">
            Pricing
          </p>
          <h1 className="mb-5 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-gray-500">
            Start for free. Scale when you&apos;re ready. No surprises.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-lg border p-8 transition-all duration-200 ${
                  plan.highlighted
                    ? "border-gray-900 bg-gray-900"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-white border border-gray-200 px-3 py-1 font-mono text-xs font-semibold text-gray-700 shadow-sm">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3
                    className={`mb-1 text-lg font-semibold ${plan.highlighted ? "text-white" : "text-gray-900"}`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`text-sm ${plan.highlighted ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {plan.tagline}
                  </p>
                  <div className="mt-5 flex items-end gap-1">
                    <span
                      className={`text-4xl font-bold ${plan.highlighted ? "text-white" : "text-gray-900"}`}
                    >
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span
                        className={`mb-1 text-sm ${plan.highlighted ? "text-gray-400" : "text-gray-500"}`}
                      >
                        {plan.period}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className={`flex items-center gap-2.5 text-sm ${plan.highlighted ? "text-gray-300" : "text-gray-600"}`}
                    >
                      <CheckCircle2
                        className={`size-4 shrink-0 ${plan.highlighted ? "text-white" : "text-gray-900"}`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.ctaHref}
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                    plan.highlighted
                      ? "bg-white text-gray-900 hover:bg-gray-100"
                      : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            ))}
          </div>

          {/* Enterprise */}
          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-8">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Zap className="size-4 text-gray-700" />
                  <h3 className="font-semibold text-gray-900">Enterprise</h3>
                </div>
                <p className="text-sm text-gray-500">
                  Custom limits, dedicated infrastructure, SLA support, and
                  advanced security for large-scale deployments.
                </p>
              </div>
              <Link
                href="/contact"
                className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
              >
                Contact Us
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          <p className="mt-5 text-center text-sm text-gray-400">
            Usage-based billing may apply. Custom plans available on request.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-gray-100 bg-gray-50 py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Frequently asked questions
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="rounded-lg border border-gray-200 bg-white p-6"
              >
                <h3 className="mb-2 font-semibold text-gray-900">{faq.q}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
