"use client";

import { useState } from "react";

import { Switch } from "@/components/ui/switch";

const SKILLS = [
  {
    id: "web-search",
    emoji: "🌐",
    name: "Web Search",
    description: "Let Relivo search the web for real-time information.",
  },
  {
    id: "code-interpreter",
    emoji: "💻",
    name: "Code Interpreter",
    description: "Run and debug code snippets directly in your workflow.",
  },
  {
    id: "file-reader",
    emoji: "📄",
    name: "File Reader",
    description: "Read and extract content from uploaded files.",
  },
  {
    id: "image-analysis",
    emoji: "🖼️",
    name: "Image Analysis",
    description: "Analyze and describe images with AI vision.",
  },
  {
    id: "data-summarizer",
    emoji: "📊",
    name: "Data Summarizer",
    description: "Summarize tables, CSVs, and structured datasets.",
  },
  {
    id: "email-composer",
    emoji: "✉️",
    name: "Email Composer",
    description: "Draft and format professional emails.",
  },
];

export default function SkillsSettingsPage() {
  const [enabled, setEnabled] = useState<Set<string>>(
    new Set(["web-search", "code-interpreter"])
  );

  function toggleSkill(id: string) {
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Skills
        </h2>
        <p className="mt-1 text-[12px] text-zinc-500">
          Enable AI skills to expand what Relivo can do for you.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {SKILLS.map((skill) => (
          <div
            key={skill.id}
            className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <span className="text-xl leading-none">{skill.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">
                {skill.name}
              </p>
              <p className="mt-0.5 text-[12px] text-zinc-500">
                {skill.description}
              </p>
            </div>
            <Switch
              checked={enabled.has(skill.id)}
              onCheckedChange={() => toggleSkill(skill.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
