# Vibe Coder Upgrade Architecture

This repo is currently a static browser app. The app now keeps generated project files as persistent project state in `localStorage`, lets users edit/resave those files, and gives agents current file context before applying changes.

## Current Implementation

- User intent lives in the chat and agent routing flow.
- Project state lives in `S.files`, with persistence through `vc_project`.
- Agents can inspect the current file tree and file contents before returning complete replacement files.
- Preview runs through StackBlitz WebContainers so generated React/Vite files execute in an isolated browser runtime.
- Generated projects include `src/lib/financials.ts` with commission, unemployment claim, surplus, and CAC guardrail helpers.

## Target Architecture

- Frontend: Next.js App Router with Tailwind CSS and shadcn/ui.
- AI orchestration: Vercel AI SDK for streaming chat, tool calls, and structured multi-agent turns.
- State: Zustand for active project state and Supabase or Neon Postgres for durable projects, deployment history, and business logic records.
- Execution: WebContainers for browser-side Vite/Next previews, with serverless sandboxing only for jobs that cannot run safely in the browser.
- Deployments: GitHub API creates or updates a project repo, then Vercel API links and deploys it.

## Migration Roadmap

1. Move the static UI into a Next.js 15 App Router project.
2. Replace direct provider calls with Vercel AI SDK route handlers and streaming UI updates.
3. Promote `S.files` into a typed project store backed by Zustand and persisted to Postgres.
4. Convert the StackBlitz preview bridge into a first-class WebContainer project runtime.
5. Add Vercel deployment records and GitHub repository provisioning.
