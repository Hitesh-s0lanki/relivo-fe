# Relivo Documentation

Relivo is an agent orchestration platform for building, running, and embedding production-ready AI agent workflows.

## Start Here

- [Product requirements](./product-requirements.md): product vision, scope, concepts, MVP priorities, and long-term direction.
- [Current chat streaming API](./api-chat.md): current frontend/backend streaming contract for the Relivo chat experience.

## Core Concepts

### Workspace

A workspace is the team or customer environment that owns members, agents, workflows, skills, MCP servers, API keys, conversations, usage, logs, and environments.

### Agent

An agent is an execution unit with model configuration, system instructions, available tools, skills, knowledge sources, memory settings, guardrails, and output configuration.

### Workflow

A workflow coordinates agents, skills, tools, conditions, routing, retries, shared state, approvals, and final response generation.

### Skill

A skill is a reusable capability that can be attached to agents. Skills can be prompt-based, tool-based, code-based, API-based, or composite.

### MCP Server

An MCP server connects Relivo agents to external systems. Relivo should discover tools, show schemas, store credentials securely, and record execution logs.

### Run

A run is one execution of an agent or workflow. Runs include input, output, model calls, tool calls, transitions, timing, errors, stream events, token usage, and trace data.

### Deployment

A deployment is a published workflow version that can be used through Relivo Chat, a streaming API, SDKs, an embedded UI, webhooks, or internal applications.

## MVP Product Flow

```txt
Create workflow -> Test workflow -> Publish workflow -> Chat/API usage
```

The first release should make it possible for a business to create an agent, add skills, connect an MCP server, build a basic workflow, test it with visible events, publish it, and consume it through chat or API.

## API Direction

Published workflows should expose production endpoints such as:

```http
POST /v1/workflows/{workflow_id}/runs
```

Initial streaming should use Server-Sent Events with run, agent, tool, skill, and completion events. See [Current chat streaming API](./api-chat.md) for the frontend contract implemented today.
