"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Progress } from "@/components/ui/progress";

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
  { label: "Total Tasks Run", value: "54" },
  { label: "Active Connectors", value: "0" },
  { label: "Skills Enabled", value: "2" },
];

const USED = 54;
const LIMIT = 100;

export default function UsageSettingsPage() {
  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          This Month
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {STATS.map(({ label, value }) => (
            <div
              key={label}
              className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {value}
              </p>
              <p className="mt-0.5 text-[12px] text-zinc-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Message limit */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Message Limit
        </h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-zinc-600 dark:text-zinc-400">
              {USED} of {LIMIT} messages used
            </span>
            <span className="text-zinc-400">{LIMIT - USED} remaining</span>
          </div>
          <Progress value={(USED / LIMIT) * 100} className="h-2" />
        </div>
      </section>

      {/* Bar chart */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Daily Usage
        </h2>
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={USAGE_DATA} barSize={20}>
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
                  borderRadius: 6,
                  border: "1px solid #e4e4e7",
                }}
              />
              <Bar dataKey="messages" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
