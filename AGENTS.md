# daycode

## About
AI-Powered Terminal Coding Assistant (Daycode)
Built a full-stack AI coding assistant that runs entirely in the terminal, featuring real-time streaming chat with multi-model AI support (Gemini, Claude, GPT), OAuth authentication, and a credit-based billing system. Architected as a Bun monorepo with a TypeScript server (Hono) and an interactive OpenTUI client. Implemented multi-mode AI interaction — PLAN mode for read-only code analysis and BUILD mode for file manipulation and command execution — along with smart autocomplete for file/directory mentions. Integrated Clerk for authentication, Neon PostgreSQL for session persistence, Polar.sh for usage metering, and Sentry for error monitoring.

## Commands
- `bun install` — install all workspace deps from root
- `bun run dev:cli` — run `@daycode/cli` in watch mode from root
- `bun run dev` — run inside `packages/cli` directly

## Architecture
- **Monorepo** (bun workspaces) under `packages/*`
- **One package**: `@daycode/cli` — entry at `packages/cli/src/index.tsx`
- JSX import source is `@opentui/react` (NOT React DOM)
- TypeScript config: extends `tsconfig.base.json` with `jsx: "react-jsx"`, `jsxImportSource: "@opentui/react"`
- Theme persistence file: `~/.daycode/preferences.join`
- Currently no test suite

## Tech stack
- Package manager: **bun** (lockfile: `bun.lock`)
- Framework: **OpenTUI** (`@opentui/core` + `@opentui/react`)
- Runtime: **bun** (types include `bun`)
- Build: TypeScript with `noEmit` + `moduleResolution: "bundler"` (bun handles transpilation)
