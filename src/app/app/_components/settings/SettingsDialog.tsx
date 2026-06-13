"use client";

import { type ReactNode, useState } from "react";
import Link from "next/link";
import {
  BarChart2,
  Check,
  Layers,
  Plug,
  Settings,
  User,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { CONNECTORS } from "../../_data/connectors";

type SettingsDialogProps = {
  open: boolean;
  activeTab: string;
  onOpenChange: (open: boolean) => void;
  onActiveTabChange: (tab: string) => void;
};

const SETTINGS_TABS = [
  { value: "general", label: "General", icon: Settings },
  { value: "account", label: "Account", icon: User },
  { value: "usage", label: "Usage", icon: BarChart2 },
  { value: "capabilities", label: "Capabilities", icon: Zap },
  { value: "connectors", label: "Connectors", icon: Plug },
  { value: "skills", label: "Skills", icon: Layers },
];

const WORK_FUNCTIONS = [
  { value: "engineering", label: "Engineering" },
  { value: "design", label: "Design" },
  { value: "product", label: "Product" },
  { value: "marketing", label: "Marketing" },
  { value: "data", label: "Data" },
  { value: "other", label: "Other" },
];

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

const USAGE_DATA = [
  { day: "Apr 1", messages: 4 },
  { day: "Apr 3", messages: 7 },
  { day: "Apr 5", messages: 3 },
  { day: "Apr 7", messages: 9 },
  { day: "Apr 9", messages: 5 },
  { day: "Apr 11", messages: 12 },
  { day: "Apr 13", messages: 8 },
  { day: "Apr 15", messages: 6 },
];

const STATS = [
  { label: "Tasks run", value: "54" },
  { label: "Active connectors", value: "0" },
  { label: "Skills enabled", value: "2" },
];

const SKILLS = [
  {
    id: "web-search",
    name: "Web Search",
    description: "Search the web for real-time information.",
  },
  {
    id: "code-interpreter",
    name: "Code Interpreter",
    description: "Run and debug code snippets.",
  },
  {
    id: "file-reader",
    name: "File Reader",
    description: "Read and extract uploaded files.",
  },
  {
    id: "image-analysis",
    name: "Image Analysis",
    description: "Analyze and describe images.",
  },
  {
    id: "data-summarizer",
    name: "Data Summarizer",
    description: "Summarize tables and datasets.",
  },
  {
    id: "email-composer",
    name: "Email Composer",
    description: "Draft and format emails.",
  },
];

const USED_MESSAGES = 54;
const MESSAGE_LIMIT = 100;

export function SettingsDialog({
  open,
  activeTab,
  onOpenChange,
  onActiveTabChange,
}: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grid h-[min(760px,calc(100vh-2rem))] max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-5xl grid-rows-[auto_1fr] gap-0 overflow-hidden rounded-xl bg-white p-0 text-zinc-950 sm:max-w-5xl dark:bg-zinc-950 dark:text-zinc-50">
        <DialogHeader className="border-b border-zinc-200 px-5 py-4 pr-14 dark:border-zinc-800">
          <DialogTitle className="text-lg font-semibold">Settings</DialogTitle>
          <DialogDescription>
            Manage account, preferences, usage, connectors, and Relivo
            capabilities.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={onActiveTabChange}
          orientation="vertical"
          className="min-h-0 gap-0 md:flex-row"
        >
          <TabsList
            variant="line"
            className="h-auto w-full shrink-0 justify-start overflow-x-auto rounded-none border-b border-zinc-200 px-3 py-2 md:w-56 md:flex-col md:overflow-x-visible md:border-r md:border-b-0 md:p-3 dark:border-zinc-800"
          >
            {SETTINGS_TABS.map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="h-9 justify-start px-3 text-[13px] md:w-full"
              >
                <Icon className="size-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <SettingsPanel value="general" title="General">
              <GeneralSettings />
            </SettingsPanel>
            <SettingsPanel value="account" title="Account">
              <AccountSettings />
            </SettingsPanel>
            <SettingsPanel value="usage" title="Usage">
              <UsageSettings />
            </SettingsPanel>
            <SettingsPanel value="capabilities" title="Capabilities">
              <CapabilitiesSettings />
            </SettingsPanel>
            <SettingsPanel value="connectors" title="Connectors">
              <ConnectorsSettings />
            </SettingsPanel>
            <SettingsPanel value="skills" title="Skills">
              <SkillsSettings />
            </SettingsPanel>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function SettingsPanel({
  value,
  title,
  children,
}: {
  value: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <TabsContent value={value} className="m-0">
      <div className="space-y-5 p-5">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
          {title}
        </h2>
        {children}
      </div>
    </TabsContent>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {title}
      </h3>
      {children}
    </section>
  );
}

function GeneralSettings() {
  const [fullName, setFullName] = useState("Hitesh Solanki");
  const [displayName, setDisplayName] = useState("Hitesh Solanki");
  const [workFunction, setWorkFunction] = useState("");
  const [preferences, setPreferences] = useState("");
  const [responseCompletions, setResponseCompletions] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);

  return (
    <div className="space-y-6">
      <Section title="Profile">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="settings-full-name">
            <Input
              id="settings-full-name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </Field>
          <Field label="Display name" htmlFor="settings-display-name">
            <Input
              id="settings-display-name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </Field>
        </div>

        <Field label="Work function" htmlFor="settings-work-function">
          <Select value={workFunction} onValueChange={setWorkFunction}>
            <SelectTrigger id="settings-work-function" className="w-full">
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
        </Field>

        <Field
          label="Response preferences"
          description="Applied to all conversations within Relivo guidelines."
          htmlFor="settings-preferences"
        >
          <Textarea
            id="settings-preferences"
            value={preferences}
            onChange={(event) => setPreferences(event.target.value)}
            className="min-h-24 resize-none"
          />
        </Field>
      </Section>

      <Section title="Notifications">
        <SettingSwitch
          title="Response completions"
          description="Notify when long-running responses finish."
          checked={responseCompletions}
          onCheckedChange={setResponseCompletions}
        />
        <SettingSwitch
          title="Emails from Relivo"
          description="Email when web tasks finish or need your response."
          checked={emailNotifications}
          onCheckedChange={setEmailNotifications}
        />
      </Section>

      <DialogActions />
    </div>
  );
}

function AccountSettings() {
  return (
    <div className="space-y-6">
      <Section title="Plan">
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/70">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Free Plan</span>
                <Badge variant="secondary">Current</Badge>
              </div>
              <p className="text-xs text-zinc-500">
                100 messages/month, 2 connectors, basic skills.
              </p>
            </div>
            <Button size="sm" asChild>
              <Link href="/pricing">Upgrade</Link>
            </Button>
          </div>
        </div>
      </Section>

      <Section title="Account details">
        <DetailsRow label="Email" value="hitesh.solanki@strique.io" />
        <DetailsRow label="Member since" value="April 2026" />
        <DetailsRow label="Account ID" value="usr_relivo_001" mono />
      </Section>
    </div>
  );
}

function UsageSettings() {
  return (
    <div className="space-y-6">
      <Section title="This month">
        <div className="grid gap-3 sm:grid-cols-3">
          {STATS.map(({ label, value }) => (
            <div
              key={label}
              className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/70"
            >
              <p className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
                {value}
              </p>
              <p className="mt-1 text-xs text-zinc-500">{label}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Message limit">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-600 dark:text-zinc-400">
              {USED_MESSAGES} of {MESSAGE_LIMIT} messages used
            </span>
            <span className="text-zinc-400">
              {MESSAGE_LIMIT - USED_MESSAGES} remaining
            </span>
          </div>
          <Progress
            value={(USED_MESSAGES / MESSAGE_LIMIT) * 100}
            className="h-2"
          />
        </div>
      </Section>

      <Section title="Daily usage">
        <div className="h-56 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={USAGE_DATA} barSize={18}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "#a1a1aa" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#a1a1aa" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #e4e4e7",
                }}
              />
              <Bar dataKey="messages" fill="#18181b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>
    </div>
  );
}

function CapabilitiesSettings() {
  const [model, setModel] = useState("relivo-standard");
  const [language, setLanguage] = useState("en");
  const [memory, setMemory] = useState(false);
  const [reasoning, setReasoning] = useState(false);

  return (
    <div className="space-y-6">
      <Section title="Model">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Default model" htmlFor="settings-model">
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger id="settings-model" className="w-full">
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
          </Field>

          <Field label="Language preference" htmlFor="settings-language">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="settings-language" className="w-full">
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
          </Field>
        </div>
      </Section>

      <Section title="Features">
        <SettingSwitch
          title="Enable memory"
          description="Allow Relivo to remember context across conversations."
          checked={memory}
          onCheckedChange={setMemory}
        />
        <SettingSwitch
          title="Show reasoning steps"
          description="Display visible steps before the final response."
          checked={reasoning}
          onCheckedChange={setReasoning}
        />
      </Section>

      <DialogActions />
    </div>
  );
}

function ConnectorsSettings() {
  const [connected, setConnected] = useState<Set<string>>(new Set());

  function toggleConnector(id: string) {
    setConnected((current) => {
      const next = new Set(current);
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
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">
          Connect tools Relivo can use during tasks.
        </p>
      </div>

      <div className="grid gap-2">
        {CONNECTORS.map((connector) => {
          const isConnected = connected.has(connector.id);

          return (
            <div
              key={connector.id}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-base dark:bg-zinc-900">
                {connector.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                  {connector.name}
                </p>
                <p className="truncate text-xs text-zinc-500">
                  {connector.description}
                </p>
              </div>
              <Button
                size="sm"
                variant={isConnected ? "outline" : "default"}
                onClick={() => toggleConnector(connector.id)}
              >
                {isConnected ? "Disconnect" : "Connect"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SkillsSettings() {
  const [enabled, setEnabled] = useState<Set<string>>(
    new Set(["web-search", "code-interpreter"])
  );

  function toggleSkill(id: string) {
    setEnabled((current) => {
      const next = new Set(current);
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
      <p className="text-sm text-zinc-500">
        Enable AI skills to expand what Relivo can do for you.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {SKILLS.map((skill) => (
          <div
            key={skill.id}
            className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <span
              className={cn(
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                enabled.has(skill.id)
                  ? "border-zinc-950 bg-zinc-950 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-950"
                  : "border-zinc-200 text-transparent dark:border-zinc-800"
              )}
            >
              <Check className="size-3" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                {skill.name}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">
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

function Field({
  label,
  description,
  htmlFor,
  children,
}: {
  label: string;
  description?: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-semibold">
        {label}
      </Label>
      {description && <p className="text-xs text-zinc-500">{description}</p>}
      {children}
    </div>
  );
}

function SettingSwitch({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
          {title}
        </p>
        <p className="text-xs text-zinc-500">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function DetailsRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 py-3 last:border-b-0 dark:border-zinc-800">
      <span className="text-sm text-zinc-500">{label}</span>
      <span
        className={cn(
          "text-sm font-medium text-zinc-950 dark:text-zinc-50",
          mono && "font-mono text-xs text-zinc-500"
        )}
      >
        {value}
      </span>
    </div>
  );
}

function DialogActions() {
  return (
    <div className="sticky bottom-0 -mx-5 flex justify-end border-t border-zinc-200 bg-white/90 px-5 py-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <Button size="sm">Save changes</Button>
    </div>
  );
}
