---
name: Advanced Git, GitHub & Code Review Strategy
description: Expert management of version control, CI/CD pipelines, and high-leverage code review processes to ensure codebase health and team velocity.
skill_level: Lead / Engineering Manager
---

# My Skill

I treat the version control history as a **deployable documentation** of the product. I move beyond basic `commit` and `push` to enforce **linear histories**, **atomic commits**, and automated quality gates.

I view Code Review not just as bug catching, but as a knowledge-sharing session and an architectural alignment tool.

## When to use this skill

- **Workflow Setup:** Defining branching strategies (GitHub Flow vs. Trunk Based Development) for a new team.
- **History Hygiene:** Cleaning up messy PRs using interactive rebase (`git rebase -i`) before merging.
- **Conflict Resolution:** Handling complex merge conflicts in long-lived feature branches.
- **CI/CD Integration:** Setting up GitHub Actions to block merges if tests or linting fail.
- **Review:** Conducting deep architectural reviews for critical PRs.

## Skill Level Standards

1.  **Linear History:** I prioritize `rebase` over `merge` to maintain a straight line of history. No "Merge branch 'main' into 'feature'" commits polluting the log.
2.  **Conventional Commits:** All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) spec (e.g., `feat:`, `fix:`, `chore:`) to enable automated changelog generation.
3.  **Atomic Commits:** Each commit must be a working state. I reject PRs containing "WIP" or "Fix typo" commits; these must be squashed.
4.  **Shift Left:** Style, formatting, and basic errors are caught by CI (ESLint, Prettier, Tests), not humans. Human review focuses on logic and architecture.

## How to use it

### 1. Advanced Git Operations

- **Interactive Rebase:** Use `git rebase -i HEAD~n` to squash, reword, or drop commits before opening a PR.
- **Reflog Recovery:** Use `git reflog` to recover "lost" commits after a bad rebase.
- **Bisect:** Use `git bisect` to mathematically identify the exact commit that introduced a regression.

### 2. GitHub Configuration

- **Branch Protection:** Enforce:
  - Require status checks to pass before merging.
  - Require linear history.
  - Require at least 1 approval.
- **CODEOWNERS:** Use a `CODEOWNERS` file to automatically assign reviewers based on the directory modified (e.g., Database changes -> Backend Leads).
- **Template:** Use `.github/pull_request_template.md` to force engineers to explain _Why_ a change was made, not just _What_.

### 3. Code Review Protocol

- **The "Nit" Rule:** Distinguish between blocking issues and "nits" (minor suggestions). Label comments explicitly: `[NIT]`, `[BLOCKER]`, `[QUESTION]`.
- **Tone:** Critique the code, not the coder.
  - _Bad:_ "You didn't close the connection."
  - _Good:_ "This connection seems to remain open. Should we use a `finally` block here to ensure it closes?"
- **Speed:** PRs under 400 lines are reviewed within 4 hours. Larger PRs must be broken down.

### Example Request Format

> "Review this PR description for a new feature. Ensure it adheres to Conventional Commits. Also, generate a GitHub Action workflow file that runs Jest tests and blocks the merge if coverage is below 80%."
