# Vibe Coder

Your autonomous AI build crew - chat, brainstorm, and ship apps with 5 AI agents.

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/vibe-coder)

## Setup

1. Open the app URL
2. Enter your Anthropic API key as the primary provider
3. Optionally enter Gemini AI Studio and Groq API keys as fallbacks
4. Optionally set a password to protect the URL
5. Start chatting with your crew

You can update saved provider keys later from the **AI Keys** tab inside the app.

## Your Crew

- **Jordan** - Product Manager. Writes specs, proposes ideas, runs brainstorms
- **Maya** - Architect. Designs component structure and tech approach
- **Kai** - Lead Builder. Spawns parallel sub-agents to code components simultaneously
- **Priya** - Reviewer. Reviews all code for quality and consistency
- **Leo** - Deployer. Auto-commits to GitHub after every build

## Features

- Conversational - just chat naturally, no commands needed
- Autonomous idea generation with your approval
- Parallel building (multiple agents coding at once)
- Persistent memory - the crew learns your preferences over time
- GitHub auto-commit after every build
- File explorer with copy/download
- Works on any device via URL
- AI provider fallback chain: Anthropic, then Gemini, then Groq

## API Key Security

Your AI provider API keys are stored only in your browser's localStorage.
They are never sent to any server other than their matching provider APIs directly.
