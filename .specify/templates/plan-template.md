# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5+, Next.js 16 App Router, React 19  
**Primary Dependencies**: Tailwind CSS v4, shadcn/ui, Radix UI, TanStack Query, Zustand, React Hook Form, Zod, Lucide React  
**Storage**: PostgreSQL via Supabase (RLS enabled) and Prisma 7 ORM (`@prisma/adapter-pg`)  
**Testing**: Vitest (Unit/Integration), Playwright (E2E)  
**Target Platform**: Modern Web Browsers (Mobile & Desktop, LTR & RTL)  
**Project Type**: Next.js Full-Stack Web Application  
**Performance Goals**: Core Web Vitals (CLS = 0, LCP < 2.5s, FID/INP < 100ms)  
**Constraints**: Strict TypeScript, Supabase RLS on all tables, bilingual i18n (en/ar), proxy.ts routing  
**Scale/Scope**: Multi-court booking, tournament management, team rosters  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [ ] **Gate 1: Next.js & Atomic Architecture**: Follows App Router conventions, atomic component structure (`ui/blocks/pages`), and `src/proxy.ts` edge boundary.
- [ ] **Gate 2: Data Layer & Security**: Supabase RLS policies defined; Prisma 7 used for server-side queries/migrations; Zod schemas synchronized with DB constraints; zero hardcoded secrets.
- [ ] **Gate 3: State Segregation & Forms**: TanStack Query utilized for server state; Zustand used for client-only global state; React Hook Form with Zod validation.
- [ ] **Gate 4: Testing & Reliability**: Testing pyramid respected (Unit/Integration/E2E with Vitest/Playwright); error boundaries and `error.tsx` present.
- [ ] **Gate 5: i18n & Performance**: Strings localized in `en.json` and `ar.json` (RTL support); `next/image` with zero CLS target; SEO meta tags declared.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# Option 1: Next.js App Router project (DEFAULT for Courtly)
src/
├── app/                 # App Router pages, layouts, and route handlers
├── components/
│   ├── ui/              # shadcn/ui and Radix primitives
│   └── blocks/          # Composite domain widgets
├── lib/                 # Prisma client, Supabase client, server utilities
├── locales/             # Bilingual dictionaries (en.json, ar.json)
├── types/               # Shared TypeScript schemas and types
└── proxy.ts             # Edge routing proxy

tests/
├── unit/                # Vitest unit tests for business logic
├── integration/         # Integration tests for API/DB
└── e2e/                 # Playwright user journeys

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
