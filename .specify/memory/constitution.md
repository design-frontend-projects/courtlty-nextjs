<!--
Sync Impact Report
- Version change: 0.0.0 (Uninitialized Template) → 1.0.0
- List of modified principles:
  - Principle 1: I. Next.js App Router & Atomic Architecture
  - Principle 2: II. Schema-Driven Data & Security-First Access Layer (Prisma 7 & Supabase RLS)
  - Principle 3: III. State Segregation & Server-State Synchronization (TanStack Query & Zustand)
  - Principle 4: IV. Comprehensive Testing Discipline & Zero-Silent-Failure (Vitest / Playwright)
  - Principle 5: V. Bilingual Localization (i18n), Web Vitals & Accessibility
- Added sections:
  - Technical Stack & Architectural Constraints
  - Engineering Workflow & Quality Gates
- Removed sections:
  - None
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md (Constitution Check gates synchronized with Principles I-V)
  - ✅ .specify/templates/spec-template.md (Bilingual i18n, accessibility, and RLS security constraints aligned)
  - ✅ .specify/templates/tasks-template.md (Task phases synchronized with Prisma 7, Supabase RLS, Vitest, and i18n validations)
- Follow-up TODOs:
  - None
-->

# Courtly Constitution

## Core Principles

### I. Next.js App Router & Atomic Architecture
All frontend development MUST adhere strictly to the Next.js 16+ App Router model, React 19, and strict TypeScript.
- **Component Hierarchy**: Code organization MUST follow atomic component design:
  - `components/ui`: Primitive, presentation-only components based on shadcn/ui and Radix UI.
  - `components/blocks`: Composite domain widgets and interactive multi-element modules (e.g., court cards, booking filters, schedule pickers).
  - `components/pages` or `app/(routes)`: Route-level page layouts, SSG/SSR view compositions, and metadata wrappers.
- **Styling & Animation**: Styling MUST use Tailwind CSS v4 design tokens. Interactive and visual transitions MUST use Framer Motion. Icons MUST use `lucide-react`.
- **Edge Routing**: Any Edge routing or request interception MUST be defined in `src/proxy.ts` (renamed from `middleware.ts` for Next.js routing compatibility).
- **Rationale**: Standardizes component reusability, isolates reusable UI primitives from business logic, and guarantees predictable rendering cycles across devices.

### II. Schema-Driven Data & Security-First Access Layer (Prisma 7 & Supabase RLS)
Data integrity and security MUST be enforced at both the database and application boundary.
- **Supabase Row Level Security (RLS)**: RLS MUST be enabled by default on every database table. Direct client queries MUST be constrained by authenticated user identity and role policies.
- **Prisma 7 ORM**: Advanced server-side querying, administrative logic, relational joins, and database migrations MUST use Prisma 7 configured with the PostgreSQL adapter (`@prisma/adapter-pg`).
- **Schema Synchronization**: All API payloads, mutation inputs, and form submissions MUST be validated using Zod schemas strictly mapped to database constraints and SQL schemas. All queries and mutations MUST be cast to concrete TypeScript types (never `any`).
- **Zero-Trust Secrets**: API keys, service role secrets, and database credentials MUST NEVER be committed or logged. Secrets MUST be injected strictly via environment variables.
- **Rationale**: Eliminates SQL injection, IDOR vulnerabilities, and schema drift while ensuring type-safe query execution end-to-end.

### III. State Segregation & Server-State Synchronization
Client-side and server-side state MUST remain completely decoupled.
- **Server State**: TanStack Query (`@tanstack/react-query`) MUST be used for all server data fetching, mutations, caching, optimistic updates, and background invalidation. Manual `useEffect` data fetching is prohibited.
- **Client State**: Zustand MUST be used exclusively for global or multi-step client state (e.g., court booking draft parameters, multi-step filter state, persistent modal contexts). Local component state MUST use standard React primitives (`useState`, `useReducer`).
- **Form Architecture**: Complex forms MUST use React Hook Form paired with TanStack Form or `@hookform/resolvers/zod`. Forms MUST reflect SQL/Supabase relational schema rules and provide immediate inline feedback.
- **Rationale**: Eliminates race conditions, duplicate network roundtrips, and out-of-sync cache bugs across client navigation.

### IV. Comprehensive Testing Discipline & Zero-Silent-Failure
Code without automated test coverage is not production-ready.
- **Testing Pyramid**: Automated test suites MUST follow the distribution:
  - 70% Unit Tests (Vitest) for utility functions, math calculations, business pricing models, tournament scheduling algorithms, and schema validation.
  - 20% Integration Tests for database repository operations, API handlers, and composite blocks.
  - 10% End-to-End Tests (Playwright) covering critical end-user journeys (booking court, tournament registration, checkout).
- **Test-First Discipline**: TDD (Red-Green-Refactor) MUST be practiced for all core domain logic.
- **Resilience & Error Boundaries**: Next.js route segments MUST provide `error.tsx` handlers and global error boundaries. Silent failures are strictly prohibited; unexpected exceptions MUST be captured, logged, and tracked via `ERRORS.md`.
- **Mocking**: 3rd-party external integrations (e.g., OneSignal push notifications, Google Maps, payment processors) MUST be mocked in automated tests.
- **Rationale**: Guarantees tournament scoring and court booking reliability while preventing production crashes and regressions.

### V. Bilingual Localization (i18n), Web Vitals & Accessibility
Courtly is a localized, high-performance platform engineered for global accessibility.
- **Localization (i18n)**: All user-facing text MUST be extracted into locale dictionaries (`src/locales/en.json` and `src/locales/ar.json`). Hardcoded UI strings are forbidden. The application MUST seamlessly support both LTR (English) and RTL (Arabic) directional layouts.
- **Core Web Vitals & Zero CLS**: The Cumulative Layout Shift (CLS) target is 0. All media assets MUST be rendered via `next/image` with predefined aspect ratios, blur placeholders, or explicit dimensions.
- **SEO Standards**: All public-facing pages MUST implement dynamic or static OpenGraph metadata via `generateMetadata`, accompanied by `robots.txt` and `sitemap.xml`.
- **Accessibility**: UI components MUST comply with WCAG 2.1 AA standards, utilizing accessible Radix UI primitives with proper keyboard navigation and ARIA attributes.
- **Rationale**: Ensures inclusive usability, fast loading times, and superior search engine discoverability across international and regional audiences.

## Technical Stack & Architectural Constraints

- **Package Manager**: `pnpm` MUST be used exclusively. Lockfiles from other managers (`package-lock.json`, `yarn.lock`, `bun.lockb`) MUST NOT be committed.
- **Runtime & Framework**: Node.js 20+ LTS, Next.js 16 App Router, React 19, TypeScript 5+.
- **Database & Persistence**: PostgreSQL accessed via Prisma 7 (pg adapter) on server routes and Supabase client with RLS for client-side queries.
- **Styling & Theming**: Tailwind CSS v4, Lucide React icons, and `next-themes` (Dark/Light mode support).
- **Edge Routing**: All middleware logic MUST reside in `src/proxy.ts`.

## Engineering Workflow & Quality Gates

- **Branching Strategy**: All work MUST be developed on dedicated feature or fix branches (`feature/###-description`, `fix/###-description`) derived from `master`/`main`.
- **Commit Standards**: Conventional Commits MUST be enforced (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`).
- **Pre-Merge Quality Gates (PR Acceptance)**:
  1. `pnpm lint` passes with zero ESLint warnings/errors.
  2. `tsc --noEmit` passes with zero TypeScript compilation errors.
  3. `pnpm test` passes 100% of the Vitest suite.
  4. All new or modified user-facing strings have corresponding keys in both `en.json` and `ar.json`.
  5. Any database changes include verified Prisma schema updates or Supabase RLS migrations.
  6. No debug logs (`console.log`) or secrets present in the changeset.

## Governance

- **Supremacy**: This Constitution represents the binding architectural and engineering policy for Courtly. It supersedes informal conventions, ad-hoc shortcuts, and outdated documentation.
- **Amendment Procedure**:
  1. Amendments MUST be submitted via a Pull Request with a clear rationale, impact analysis, and migration path for affected code.
  2. The version number MUST be incremented following Semantic Versioning (MAJOR for breaking changes or principle removals, MINOR for new principles or significant guidance expansions, PATCH for non-semantic clarifications and typos).
  3. All dependent templates (`.specify/templates/*`) and agent rules (`.agent/rules/*`) MUST be synchronized immediately upon ratification.
- **Compliance & Auditing**: Every specification, implementation plan (`plan.md`), and pull request MUST undergo a Constitution Check gate before execution. Complexity beyond these principles MUST be explicitly justified.

**Version**: 1.0.0 | **Ratified**: 2025-12-31 | **Last Amended**: 2026-11-12
