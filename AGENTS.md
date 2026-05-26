# daycode

## About
TUI app (terminal UI) built with OpenTUI (`@opentui/react`). Created via `bun create tui`.

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
