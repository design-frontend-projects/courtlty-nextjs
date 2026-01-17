name: ui/ux skills

description: Comprehensive UI/UX design skills for building intuitive, accessible, and scalable digital products.

---

# My Skill

This skill equips the agent to design, evaluate, and iterate user interfaces and user experiences that are usable, accessible, visually consistent, and aligned with business goals. It covers discovery, interaction design, visual design, accessibility, validation, and handoff to engineering.

## Core Capabilities

### 1) User Research & Discovery

- Stakeholder interviews and requirement synthesis
- User interviews, surveys, and usability testing
- Personas, empathy maps, and user journeys
- Problem framing and hypothesis creation

### 2) Information Architecture

- Sitemap creation and content modeling
- Navigation patterns and taxonomy
- User flows and task analysis
- Wireframing (low → mid fidelity)

### 3) Interaction Design

- Interaction patterns and micro-interactions
- State management (empty, loading, error, success)
- Responsive and adaptive behavior
- Motion principles (timing, easing, purpose)

### 4) Visual Design

- Design systems and component libraries
- Typography, color theory, spacing, and layout
- Brand alignment and visual hierarchy
- High-fidelity mockups and prototypes

### 5) Accessibility & Inclusivity

- WCAG 2.1/2.2 compliance (AA as default)
- Color contrast, focus states, keyboard navigation
- Screen reader semantics and ARIA guidance
- Inclusive language and bias-aware design

### 6) Validation & Iteration

- Heuristic evaluation and UX audits
- A/B testing and experiment design
- Analytics interpretation (funnels, drop-offs)
- Continuous improvement loops

### 7) Design-to-Dev Handoff

- Specs, redlines, and token usage
- Design tokens and theming
- Collaboration with engineers
- QA support and design review

## When to use this skill

- When designing a new product or feature from scratch
- When improving usability, conversion, or accessibility
- When creating or evolving a design system
- When auditing an existing UI/UX for issues
- When preparing designs for developer handoff

## How to use it

1. **Understand the Problem**
   - Clarify goals, constraints, and success metrics.
   - Identify primary users and key tasks.

2. **Research & Synthesize**
   - Conduct lightweight research if time-bound.
   - Create personas, journeys, and insights.

3. **Structure & Flow**
   - Define information architecture and user flows.
   - Produce low-fidelity wireframes.

4. **Design & Prototype**
   - Apply visual design and interaction patterns.
   - Build clickable prototypes for validation.

5. **Validate**
   - Run usability tests or heuristic reviews.
   - Iterate based on findings.

6. **Handoff & Support**
   - Prepare specs, tokens, and assets.
   - Support implementation and QA.

## Conventions & Best Practices

- Start with mobile-first unless stated otherwise
- Prioritize accessibility by default
- Prefer reusable components over one-offs
- Document decisions and assumptions
- Align design decisions with measurable outcomes

## Deliverables

- Personas, journeys, and user flows
- Wireframes and high-fidelity designs
- Prototypes (low/high fidelity)
- Design system components and tokens
- Handoff specs and accessibility notes

## Tools (Examples)

- Research: interviews, surveys, usability testing tools
- Design: Figma
- Prototyping: Figma
- Handoff: Figma Inspect
- Validation: analytics platforms, A/B testing tools

## Success Metrics

- Task success rate and time-on-task
- Conversion and retention improvements
- Accessibility compliance scores
- Reduced development rework

---

This skill should be applied iteratively and collaboratively, balancing user needs, business goals, and technical constraints.

---

name: Modern React UI/UX & Design Engineering
description: Expert guidance on building pixel-perfect, accessible, and highly interactive user interfaces using Tailwind, Shadcn UI, and Framer Motion.
skill_level: Senior Design Engineer

---

# My Skill

I am a **Senior Design Engineer** who bridges the gap between Figma designs and production code. I do not just "style" components; I architect **Design Systems**.

My expertise lies in **Tailwind CSS**, **Shadcn UI (Radix Primitives)**, and **Framer Motion**. I prioritize **Accessibility (WCAG 2.1)**, **Core Web Vitals** (LCP/CLS), and "perceived performance" through optimistic UI patterns.

## When to use this skill

- **Component Architecture:** When creating reusable, typed components that need to be flexible (using Slots/Composition) but consistent.
- **Complex Layouts:** Implementing responsive grids, container queries, or dashboard layouts that work from mobile to 4k screens.
- **Micro-interactions:** Adding polish with `framer-motion` (entry/exit animations, layout transitions) to make the app feel "native."
- **AI User Experience:** Designing streaming interfaces (streaming text effects, skeleton loaders during RAG processing, optimistic chat bubbles).
- **Accessibility Audits:** Ensuring semantic HTML, proper ARIA attributes, and keyboard navigation support.

## Skill Level Standards

1.  **A11y First:** Interactive elements must be keyboard accessible and screen-reader friendly. No `div` buttons; use semantic HTML.
2.  **Zero Layout Shift:** Layouts must be stable. Skeletons matches the dimensions of the final content to prevent Cumulative Layout Shift (CLS).
3.  **Theming:** Strict adherence to CSS variables/Tailwind config for colors and spacing. No "magic numbers" or hardcoded hex values in components.
4.  **Mobile-First:** All CSS is written mobile-first (`class`, then `md:class`, then `lg:class`).

## How to use it

### 1. Styling Strategy (Tailwind + Shadcn)

- **Utility First:** Use Tailwind utility classes for layout and spacing.
- **CN Utility:** Always use the `cn()` helper (clsx + tailwind-merge) to allow props to override default styles safely.
- **Dark Mode:** Implement dark mode using CSS variables (e.g., `bg-background` text-foreground`) rather than hardcoded `dark:` modifiers on every element.

### 2. Interaction & Animation

- **Framer Motion:** Use `AnimatePresence` for mounting/unmounting components (modals, toasts).
- **Layout Animations:** Use `layout` prop in Framer Motion for smooth list reordering.
- **Feedback:** Every user action (click, submit) requires immediate visual feedback (ripple, scale down, or optimistic state update).

### 3. UX Patterns for Data & AI

- **Streaming UI:** When rendering AI responses, use a "streaming" cursor effect.
- **Optimistic UI:** When a user mutates data (e.g., "Like" a post), update the UI _instantly_ via React state, then reconcile with the server response.
- **Empty & Error States:** Always account for the "unhappy paths." Design distinct UI for `loading`,
