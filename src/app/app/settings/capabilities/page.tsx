"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const MODELS = [
  { value: "relivo-standard", label: "Relivo Standard" },
  { value: "relivo-advanced", label: "Relivo Advanced" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
];

export default function CapabilitiesSettingsPage() {
  const [model, setModel] = useState("relivo-standard");
  const [language, setLanguage] = useState("en");
  const [memory, setMemory] = useState(false);
  const [reasoning, setReasoning] = useState(false);

  return (
    <div className="space-y-8">
      {/* Model */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Model
        </h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="model" className="text-[13px]">
              Default model
            </Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger id="model" className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODELS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="language" className="text-[13px]">
              Language preference
            </Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language" className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Features
        </h2>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100">
                Enable memory
              </p>
              <p className="text-[12px] text-zinc-500">
                Allow Relivo to remember context across conversations.
              </p>
            </div>
            <Switch checked={memory} onCheckedChange={setMemory} />
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100">
                Show reasoning steps
              </p>
              <p className="text-[12px] text-zinc-500">
                Display Relivo&apos;s thinking process before the final
                response.
              </p>
            </div>
            <Switch checked={reasoning} onCheckedChange={setReasoning} />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button size="sm">Save changes</Button>
      </div>
    </div>
  );
}
