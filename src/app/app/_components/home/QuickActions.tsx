import { BarChart2, FileText, ImageIcon, Lightbulb } from "lucide-react";

interface QuickAction {
  label: string;
  icon: React.ElementType;
  color: string;
}

const ACTIONS: QuickAction[] = [
  { label: "Create image", icon: ImageIcon, color: "text-violet-500" },
  { label: "Analyze data", icon: BarChart2, color: "text-emerald-500" },
  { label: "Summarize text", icon: FileText, color: "text-sky-500" },
  { label: "Brainstorm", icon: Lightbulb, color: "text-orange-500" },
];

export function QuickActions() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {ACTIONS.map(({ label, icon: Icon, color }) => (
        <button
          key={label}
          className="flex cursor-pointer items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-sm text-zinc-700 shadow-sm transition-all duration-150 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 hover:shadow dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <Icon className={`size-3.5 shrink-0 ${color}`} />
          {label}
        </button>
      ))}
    </div>
  );
}
