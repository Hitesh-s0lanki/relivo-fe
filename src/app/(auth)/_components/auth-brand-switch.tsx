"use client";

import { usePathname } from "next/navigation";
import {
  BarChart3,
  History,
  RefreshCw,
  Shield,
  Users,
  Zap,
} from "lucide-react";

import { AuthBrandPanel } from "./auth-brand-panel";

const signInContent = {
  cardTitle: "Your workspace",
  tasks: [
    { label: "Q2 roadmap review", status: "done" as const, agent: "Writer" },
    {
      label: "Analyze user feedback",
      status: "active" as const,
      agent: "Analyst",
    },
    {
      label: "Weekly report draft",
      status: "pending" as const,
      agent: "Writer",
    },
  ],
  headline: "Welcome<br />back.",
  description:
    "Your tasks are waiting. Pick up right where you left off — your AI agents never stopped.",
  features: [
    { icon: History, text: "Resume any workflow in one click" },
    { icon: Users, text: "See what your team shipped while you were away" },
    { icon: RefreshCw, text: "AI agents kept working in the background" },
  ],
  testimonial: "Relivo keeps our team aligned without a single status meeting.",
  testimonialAuthor: "— Marcus R., Engineering Lead",
};

const signUpContent = {
  cardTitle: "Getting started",
  tasks: [
    {
      label: "Set up your workspace",
      status: "active" as const,
      agent: "Planner",
    },
    { label: "Invite your team", status: "pending" as const, agent: "Planner" },
    {
      label: "Create first workflow",
      status: "pending" as const,
      agent: "Writer",
    },
  ],
  headline: "Start getting<br />things done.",
  description:
    "Set up your AI workspace in seconds. Delegate tasks, automate workflows, and stay in flow from day one.",
  features: [
    { icon: Zap, text: "Delegate tasks to AI agents instantly" },
    { icon: BarChart3, text: "Automate repetitive workflows" },
    { icon: Shield, text: "Track every step in real time" },
  ],
  testimonial:
    "Relivo helped our team cut planning time by 40% in the first week.",
  testimonialAuthor: "— Sarah K., Product Lead at Striq",
};

export function AuthBrandSwitch() {
  const pathname = usePathname();
  const content = pathname.includes("/sign-up") ? signUpContent : signInContent;
  return <AuthBrandPanel content={content} />;
}
