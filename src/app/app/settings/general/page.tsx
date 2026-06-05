"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const WORK_FUNCTIONS = [
  { value: "engineering", label: "Engineering" },
  { value: "design", label: "Design" },
  { value: "product", label: "Product" },
  { value: "marketing", label: "Marketing" },
  { value: "data", label: "Data" },
  { value: "other", label: "Other" },
];

export default function GeneralSettingsPage() {
  const [fullName, setFullName] = useState("Hitesh Solanki");
  const [displayName, setDisplayName] = useState("Hitesh Solanki");
  const [workFunction, setWorkFunction] = useState("");
  const [preferences, setPreferences] = useState("");
  const [responseCompletions, setResponseCompletions] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);

  return (
    <div className="space-y-8">
      {/* Profile */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Profile
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="full-name" className="text-[13px]">
                Full name
              </Label>
              <Input
                id="full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="display-name" className="text-[13px]">
                What should Relivo call you?{" "}
                <span className="text-zinc-400">*</span>
              </Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="work-function" className="text-[13px]">
              What best describes your work?
            </Label>
            <Select value={workFunction} onValueChange={setWorkFunction}>
              <SelectTrigger id="work-function" className="w-full">
                <SelectValue placeholder="Select your work function" />
              </SelectTrigger>
              <SelectContent>
                {WORK_FUNCTIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="preferences" className="text-[13px]">
              What personal preferences should Relivo consider in responses?
            </Label>
            <p className="text-[12px] text-zinc-500">
              Your preferences will apply to all conversations, within
              Relivo&apos;s guidelines.
            </p>
            <Textarea
              id="preferences"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Notifications
        </h2>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100">
                Response completions
              </p>
              <p className="text-[12px] text-zinc-500">
                Get notified when Relivo has finished a response. Most useful
                for long-running tasks like tool calls and research.
              </p>
            </div>
            <Switch
              checked={responseCompletions}
              onCheckedChange={setResponseCompletions}
            />
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100">
                Emails from Relivo on the web
              </p>
              <p className="text-[12px] text-zinc-500">
                Get an email when Relivo on the web has finished building or
                needs your response.
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button size="sm">Save changes</Button>
      </div>
    </div>
  );
}
