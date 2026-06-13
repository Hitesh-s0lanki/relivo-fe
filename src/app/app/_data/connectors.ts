export interface Connector {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

export const CONNECTORS: Connector[] = [
  {
    id: "slack",
    name: "Slack",
    description: "Send messages and get notified in Slack channels.",
    emoji: "💬",
  },
  {
    id: "github",
    name: "GitHub",
    description: "Access repos, PRs, and issues directly from Relivo.",
    emoji: "🐙",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Read and write pages in your Notion workspace.",
    emoji: "📝",
  },
  {
    id: "jira",
    name: "Jira",
    description: "Create and track issues in your Jira projects.",
    emoji: "📋",
  },
  {
    id: "figma",
    name: "Figma",
    description: "Inspect designs and extract assets from Figma files.",
    emoji: "🎨",
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Read, compose, and send emails via Gmail.",
    emoji: "📧",
  },
  {
    id: "linear",
    name: "Linear",
    description: "Manage issues and projects in Linear.",
    emoji: "⚡",
  },
  {
    id: "drive",
    name: "Google Drive",
    description: "Access and manage files in Google Drive.",
    emoji: "📁",
  },
];
