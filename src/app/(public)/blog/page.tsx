import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Relivo",
  description: "Insights on building AI systems and multi-agent architectures.",
};

export default function BlogPage() {
  return (
    <div className="bg-white text-gray-900">
      {/* Header */}
      <section className="border-b border-gray-100 px-6 py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gray-400">
            Blog
          </p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Insights on intelligent systems
          </h1>
          <p className="max-w-xl text-lg text-gray-500">
            Best practices, deep dives, and product updates for developers
            building multi-agent AI.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-24">
        {/* Coming soon state */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-24 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
            <svg
              className="size-5 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Articles coming soon
          </h2>
          <p className="mb-8 max-w-sm text-sm text-gray-500 leading-relaxed">
            We&apos;re writing about multi-agent architectures, orchestration
            patterns, and how to build production AI systems. Check back soon.
          </p>

          {/* Newsletter */}
          <div className="flex w-full max-w-sm flex-col gap-2 sm:flex-row">
            <input
              type="email"
              placeholder="you@company.com"
              className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-300 transition-colors"
            />
            <button
              type="button"
              className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              Notify me
            </button>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            Get notified when we publish. No spam.
          </p>
        </div>
      </div>
    </div>
  );
}
