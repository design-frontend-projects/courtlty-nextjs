name: PostgreSQL Database Skills
description: Core and advanced PostgreSQL database design, optimization, security, and operations skills for building scalable, secure, and multi-tenant applications.

---

# PostgreSQL Database Skills

This skill enables an agent to design, implement, optimize, secure, and maintain PostgreSQL databases for real-world applications, from MVPs to large-scale enterprise systems.

It covers schema design, advanced SQL, performance tuning, security (RLS), multi-tenancy, migrations, and operational best practices.

---

## When to use this skill

Use this skill when the task involves:

- Designing relational database schemas (OLTP systems)
- Creating ERD-based PostgreSQL tables
- Writing complex SQL queries (joins, CTEs, window functions)
- Implementing **Row Level Security (RLS)**
- Designing **multi-tenant architectures**
- Creating stored procedures, triggers, and functions (PL/pgSQL)
- Optimizing database performance
- Managing roles, permissions, and access control
- Integrating PostgreSQL with backend frameworks (NestJS, Spring Boot, Supabase)
- Preparing production-ready SQL scripts

This skill is especially helpful for:

- SaaS platforms
- Multi-tenant systems
- Financial, logistics, ERP, POS, HR, and school systems
- Supabase-backed applications
- Systems requiring strong data isolation and security

---

## How to use it

Follow these steps and conventions when applying PostgreSQL Database Skills:

### 1. Requirements Analysis

- Identify entities, relationships, and business rules
- Determine tenancy model (single-tenant, schema-per-tenant, row-based tenant_id)
- Identify security, auditing, and compliance needs

### 2. Schema Design

- Use normalized schemas (3NF by default)
- Prefer UUIDs for distributed systems
- Use clear naming conventions:
  - `snake_case` for tables and columns
  - Singular table names (e.g., `order`, `invoice`)
- Separate concerns:
  - `core` / `public` schema for shared data
  - `tenant_*` schemas if using schema-based tenancy

### 3. Data Integrity

- Always define:
  - Primary keys
  - Foreign keys
  - Unique constraints
  - Check constraints
- Use `NOT NULL` aggressively where applicable
- Prefer database-level validation over application-only validation

### 4. Advanced SQL Usage

- Use:
  - CTEs (`WITH`)
  - Window functions (`ROW_NUMBER`, `RANK`, `SUM OVER`)
  - JSONB for semi-structured data
- Avoid unnecessary subqueries when joins are clearer
- Use `EXPLAIN ANALYZE` to validate performance

### 5. Security & Access Control

- Use PostgreSQL roles properly:
  - Application role
  - Admin role
  - Read-only role
- Implement **Row Level Security (RLS)**:
  - Enable RLS explicitly
  - Write explicit policies for SELECT, INSERT, UPDATE, DELETE
- In Supabase:
  - Use `auth.uid()` and `auth.role()`
  - Never trust client-side filters

### 6. Multi-Tenancy Patterns

- Choose tenancy strategy:
  - `tenant_id` column (row-based)
  - Schema-per-tenant
- Enforce tenant isolation at database level
- Use dynamic SQL carefully for cross-schema operations
- Avoid shared mutable state between tenants

### 7. Functions, Triggers & Automation

- Use PL/pgSQL for:
  - Business rules
  - Auditing
  - Data synchronization
- Keep functions:
  - Small
  - Deterministic when possible
- Use triggers sparingly and document them clearly

### 8. Performance Optimization

- Index:
  - Foreign keys
  - Frequently filtered columns
- Use partial indexes when applicable
- Avoid over-indexing
- Monitor:
  - Slow queries
  - Lock contention
  - Vacuum behavior

### 9. Migrations & Versioning

- Use migration tools or versioned SQL files
- Never modify production tables manually
- Make migrations:
  - Idempotent when possible
  - Reversible if feasible

### 10. Documentation & Maintainability

- Comment:
  - Tables
  - Columns
  - Functions
- Keep SQL readable and consistent
- Provide ERDs and example queries where possible

---

## Output Expectations

When using this skill, the agent should produce:

- Clean, valid PostgreSQL SQL scripts
- Secure-by-default schemas
- Clear explanations of design decisions
- Production-ready solutions (not demo-only)
- Explicit assumptions and constraints

---

## Common Anti-Patterns to Avoid

- No primary keys
- Business logic only in application layer
- Overusing JSONB instead of relations
- Disabling RLS for convenience
- Hardcoding tenant IDs
- Granting excessive privileges

---

## Skill Level

**Advanced**

This skill assumes familiarity with:

- SQL fundamentals
- Relational database concepts
- Backend application integration

It is suitable for:

- Senior engineers
- Backend developers
- Database architects
- AI agents building backend systems
