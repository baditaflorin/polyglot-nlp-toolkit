# 0003 - Frontend Framework And Build Tooling

## Status

Accepted

## Context

The frontend must be static, accessible, Pages-ready, and ergonomic for corpus
analysis.

## Decision

Use React, TypeScript strict mode, Vite, Tailwind CSS, TanStack Query, Zod, and
lucide-react.

## Consequences

- Vite provides fast local development and deterministic Pages builds.
- TypeScript and Zod keep the API boundary checked on both sides.
- Tailwind keeps the interface compact without adding runtime CSS tooling.

## Alternatives Considered

- Vanilla TypeScript: lower bundle size but slower to build a reliable app UI.
- Next.js: unnecessary because GitHub Pages serves a static app only.
