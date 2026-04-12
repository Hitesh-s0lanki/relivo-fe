import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Mail, MessageSquare, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact — Relivo",
  description:
    "Get in touch with the Relivo team for support, sales, or general inquiries.",
};

const channels = [
  {
    icon: Mail,
    title: "Email Support",
    desc: "For technical questions, bugs, and account issues.",
    value: "support@relivo.ai",
    href: "mailto:support@relivo.ai",
  },
  {
    icon: MessageSquare,
    title: "Sales & Enterprise",
    desc: "Custom plans, integrations, and large-scale deployments.",
    value: "sales@relivo.ai",
    href: "mailto:sales@relivo.ai",
  },
];

export default function ContactPage() {
  return (
    <div className="bg-white text-gray-900">
      {/* Header */}
      <section className="border-b border-gray-100 px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gray-400">
            Contact
          </p>
          <h1 className="mb-5 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Get in touch
          </h1>
          <p className="text-lg text-gray-500">
            Have questions or need help? We typically respond within 24 hours.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-20">
        {/* Response time */}
        <div className="mb-12 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2">
            <Clock className="size-4 text-gray-500" />
            <span className="text-sm text-gray-500">
              Typical response time:{" "}
              <span className="font-semibold text-gray-900">under 24 hours</span>
            </span>
          </div>
        </div>

        {/* Channels */}
        <div className="grid gap-5 sm:grid-cols-2 mb-10">
          {channels.map((channel) => (
            <div
              key={channel.title}
              className="rounded-lg border border-gray-200 bg-gray-50 p-7"
            >
              <div className="mb-4 flex size-9 items-center justify-center rounded-lg bg-gray-900">
                <channel.icon className="size-4 text-white" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">
                {channel.title}
              </h3>
              <p className="mb-5 text-sm text-gray-500 leading-relaxed">
                {channel.desc}
              </p>
              <a
                href={channel.href}
                className="group flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
              >
                {channel.value}
                <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          ))}
        </div>

        {/* Contact form */}
        <div className="rounded-lg border border-gray-200 p-8 md:p-10">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Send us a message
          </h2>
          <p className="mb-8 text-sm text-gray-500">
            Fill out the form and we&apos;ll get back to you shortly.
          </p>

          <form className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-300 transition-colors"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-300 transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="subject"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Subject
              </label>
              <select
                id="subject"
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-300 transition-colors"
              >
                <option value="">Select a topic</option>
                <option value="support">Technical Support</option>
                <option value="sales">Sales / Enterprise</option>
                <option value="billing">Billing</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Message
              </label>
              <textarea
                id="message"
                rows={5}
                placeholder="Tell us what you need..."
                className="w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-300 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-700 transition-colors cursor-pointer"
            >
              Send Message
              <ArrowRight className="size-4" />
            </button>
          </form>
        </div>

        {/* Enterprise note */}
        <div className="mt-6 flex items-start gap-4 rounded-lg border border-gray-100 bg-gray-50 p-6">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gray-900">
            <Zap className="size-4 text-white" />
          </div>
          <div>
            <h4 className="mb-1 font-semibold text-gray-900">
              Enterprise inquiries
            </h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              Looking for custom plans or a white-glove integration experience?{" "}
              <Link
                href="mailto:sales@relivo.ai"
                className="font-medium text-gray-900 underline underline-offset-2 hover:no-underline transition-colors cursor-pointer"
              >
                Reach out to sales
              </Link>{" "}
              and we&apos;ll set up a call.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
