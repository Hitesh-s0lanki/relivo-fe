import Image from "next/image";
import { type LucideIcon } from "lucide-react";

type Task = {
  label: string;
  status: "done" | "active" | "pending";
  agent: string;
};

type PanelContent = {
  cardTitle: string;
  tasks: Task[];
  headline: string;
  description: string;
  features: { icon: LucideIcon; text: string }[];
  testimonial: string;
  testimonialAuthor: string;
};

export function AuthBrandPanel({ content }: { content: PanelContent }) {
  const {
    cardTitle,
    tasks,
    headline,
    description,
    features,
    testimonial,
    testimonialAuthor,
  } = content;

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-neutral-950 px-12 py-10">
      {/* Subtle dot-grid pattern */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Ambient glow orbs */}
      <div
        aria-hidden
        className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-white/5 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/[0.03] blur-3xl"
      />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-2.5">
        <Image src="/logo-white.svg" alt="Relivo" width={32} height={32} />
        <span className="text-lg font-bold tracking-tight text-white">
          Relivo
        </span>
      </div>

      {/* Main content — pinned to bottom */}
      <div className="relative z-10 mt-auto flex flex-col gap-8">
        {/* Product mock-up card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
          <p className="mb-4 text-[11px] font-semibold tracking-widest text-white/35 uppercase">
            {cardTitle}
          </p>
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li key={task.label} className="flex items-center gap-3">
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    task.status === "done"
                      ? "bg-white/30"
                      : task.status === "active"
                        ? "bg-white/70"
                        : "bg-white/15"
                  }`}
                />
                <span
                  className={`flex-1 text-sm leading-none ${
                    task.status === "done"
                      ? "text-white/35 line-through"
                      : "text-white/80"
                  }`}
                >
                  {task.label}
                </span>
                <span className="rounded-md bg-white/10 px-2 py-1 text-[11px] leading-none font-medium text-white/45">
                  {task.agent}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Headline */}
        <div>
          <h1
            className="text-[2.75rem] leading-[1.1] font-extrabold tracking-tight text-white"
            dangerouslySetInnerHTML={{ __html: headline }}
          />
          <p className="mt-3 max-w-sm text-base leading-relaxed text-white/45">
            {description}
          </p>
        </div>

        {/* Feature list */}
        <ul className="space-y-3.5">
          {features.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10">
                <Icon className="h-3.5 w-3.5 text-white/55" />
              </div>
              <span className="text-sm text-white/65">{text}</span>
            </li>
          ))}
        </ul>

        {/* Testimonial */}
        <div className="border-t border-white/10 pt-6">
          <p className="text-sm leading-relaxed text-white/40 italic">
            &ldquo;{testimonial}&rdquo;
          </p>
          <p className="mt-1.5 text-xs text-white/25">{testimonialAuthor}</p>
        </div>
      </div>
    </div>
  );
}
