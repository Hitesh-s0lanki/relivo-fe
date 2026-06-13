# Relivo Product Requirements

## Overview

Relivo is an agent orchestration platform for building, running, and embedding AI agent workflows.

Organizations can create custom workflows using models, tools, MCP servers, custom skills, business data, and orchestration logic. Those workflows can then be used inside Relivo Chat, through streaming APIs, through SDKs and frontend components, or inside existing business applications.

## Product Promise

Build an agent workflow once. Use it everywhere.

## Target Users

- AI product teams building model-powered products with workflow logic, tool execution, streaming, and monitoring.
- SaaS companies adding AI agents to their own products.
- Enterprises connecting internal agents to proprietary systems with security, permissions, and auditability.
- Developers and AI engineers who want SDKs, APIs, provider flexibility, and debugging tools.
- Agencies and AI consultants building reusable agent workflows for multiple clients.

## Problem

Production agent systems require many disconnected pieces:

- LLM provider integrations.
- Workflow orchestration.
- Tool and MCP connectivity.
- Custom business skills.
- Streaming infrastructure.
- Conversation state.
- Authentication and API keys.
- Usage tracking.
- Error handling and approvals.
- Chat interfaces.
- Monitoring and debugging.

Relivo provides a unified platform for creating, testing, publishing, and consuming agent workflows.

## Core Concepts

### Workspace

A workspace contains members, agents, workflows, skills, MCP servers, API keys, conversations, environments, logs, traces, and usage information.

### Agent

An agent has a model, instructions, tools, skills, knowledge sources, memory configuration, guardrails, and output configuration.

### Workflow

A workflow defines how agents, skills, tools, conditions, shared state, routing, retries, approvals, and final responses work together.

### Skill

A skill is a reusable capability with instructions, input schema, output schema, model configuration, tool permissions, validation rules, examples, and version information.

### MCP Server

An MCP server connects agents to external tools, systems, APIs, and data sources. Relivo should test connections, discover tools, show schemas, manage permissions, and log executions.

### Run

A run is one workflow execution. It records input, output, model calls, tool calls, transitions, timing, errors, stream events, metadata, token usage, and trace data.

### Deployment

A deployment is a published workflow version that can be accessed through chat, API, SDKs, embedded UI, webhooks, or internal integrations.

## MVP Scope

The MVP should let users create an agent workflow, test it, publish it, and consume it through chat or API.

MVP capabilities:

1. Workspace and authentication.
2. Agent creation.
3. Custom skills.
4. URL-based MCP server integration.
5. Workflow orchestration.
6. Real-time streaming.
7. Relivo chat interface.
8. API deployment.
9. API key management.
10. Conversation history.
11. Basic execution logs.
12. Usage tracking.
13. Workflow versioning.
14. Basic documentation.

## Functional Requirements

### Authentication and Workspaces

Users can sign up, create workspaces, invite team members, switch workspaces, assign roles, and manage workspace settings.

Initial roles:

- Owner
- Admin
- Developer
- Viewer

### Agent Builder

Users can define an agent name, description, instructions, model, parameters, skills, MCP tools, output format, memory settings, execution limits, and timeout settings.

### Custom Skills

Users can create, test, version, and reuse skills across agents. MVP priority is prompt-based and tool-based skills.

### MCP Integration

Users can add MCP servers by URL, configure authentication, test connections, discover tools, enable or disable tools, and inspect execution logs.

### Orchestrator

The orchestrator manages agent execution, transitions, tool calls, skill execution, conditions, shared state, retries, errors, streaming, execution limits, and final output generation.

Initial node types:

- Start
- Agent
- Skill
- Tool
- Condition
- Router
- Transform
- Human approval
- Final response

### Workflow Builder

Users can create workflows, add agents, connect steps, map inputs and outputs, add conditions, test workflows, view intermediate results, and publish versions.

### Testing Playground

The playground shows user messages, streaming responses, active agents, tool calls, skill calls, intermediate events, timing, token usage, errors, and final output.

### Chat Interface

Relivo Chat supports new conversations, history, streaming responses, markdown, code blocks, attachments, tool indicators, agent status, stop generation, retry, edit and resend, copy response, workflow selection, and error states.

### Streaming API

Every published workflow should receive a production endpoint:

```http
POST /v1/workflows/{workflow_id}/runs
```

The API should support API key authentication, rate limiting, streaming and non-streaming responses, idempotency, cancellation, timeout handling, usage tracking, structured errors, conversation continuity, and metadata.

## Non-Functional Requirements

- First stream event should ideally begin within two seconds for simple requests.
- Streaming should avoid unnecessary buffering.
- Workflows should have retries, timeouts, final states, and idempotency controls.
- Credentials must be encrypted at rest and never exposed to the browser.
- Workspace data must be isolated.
- The system should support concurrent runs, long-lived streams, model/provider adapters, background execution, and high-volume tool calls.

## Development Priorities

1. Execution foundation: workspace, auth, model gateway, basic agents, runs, streaming, and conversation storage.
2. Tools and skills: skill creation, MCP connection, discovery, permissions, and logging.
3. Workflow orchestration: workflow definitions, sequential steps, conditions, shared state, retry, and timeout handling.
4. Deployment: publishing, streaming API, API keys, environments, and usage tracking.
5. Product experience: chat UI, run inspector, documentation, onboarding, and templates.
6. Developer distribution: JavaScript SDK, React chat library, headless hooks, temporary client tokens, and embedded widget.

## Out of Scope for Initial MVP

- Full autonomous agent teams.
- Complex visual workflow editing.
- Enterprise SSO.
- Self-hosting.
- Marketplace.
- Advanced RAG platform.
- Voice agents.
- Browser automation.
- Fine-tuning.
- Complex billing.
- Full no-code application builder.

## Differentiation

- Workflow-first architecture.
- MCP-native connectivity.
- Build once, consume everywhere.
- Usable by business teams and developers.
- Streaming as a first-class capability.
- Provider-neutral execution.
- Production visibility into steps, calls, failures, tokens, and transitions.

## Long-Term Vision

Relivo becomes the infrastructure through which businesses build, deploy, and operate their AI workforce.
