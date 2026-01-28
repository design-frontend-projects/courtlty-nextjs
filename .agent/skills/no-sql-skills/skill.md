---
name: NoSQL and Redis Database Skills
description: This skill enables the agent to design, query, optimize, and operate NoSQL databases and Redis for high‑performance, scalable systems.
---

---

# My Skill

This skill equips the agent with practical and architectural knowledge of **NoSQL databases** (document, key–value, wide‑column, and graph) and **Redis** as an in‑memory data store. The agent can help design schemas, choose the right database type, write efficient queries, optimize performance, and apply best practices for scalability, availability, and security.

The skill is suitable for modern web applications, microservices, real‑time systems, and cloud‑native architectures.

---

## When to use this skill

Use this skill when:

- Designing systems that require **high scalability**, **low latency**, or **flexible schemas**
- Choosing between SQL and NoSQL based on access patterns and business requirements
- Working with **Redis** for caching, sessions, queues, rate limiting, or pub/sub
- Modeling data for document stores like MongoDB or key–value stores
- Improving performance of read‑heavy or write‑heavy workloads
- Building distributed systems that need eventual consistency
- Migrating from relational databases to NoSQL solutions

This skill is especially helpful for:

- Backend and full‑stack developers
- System architects and technical leads
- Microservices and event‑driven architectures
- Real‑time dashboards, chat apps, gaming, IoT, and analytics

---

## How to use it

The agent should follow these steps and conventions:

### 1. Understand the use case

- Identify the problem: caching, real‑time data, large‑scale reads/writes, schema flexibility
- Clarify access patterns (read vs write heavy, random vs sequential)
- Define consistency, availability, and latency requirements

### 2. Choose the right NoSQL model

- **Key–Value** (Redis, DynamoDB): fast lookups, caching, sessions
- **Document** (MongoDB): flexible JSON‑like structures
- **Wide‑Column** (Cassandra): large‑scale distributed data
- **Graph** (Neo4j): relationships and traversals

Explain trade‑offs clearly and justify the choice.

### 3. Data modeling best practices

- Design based on **queries**, not entities
- Avoid joins; embed or denormalize when appropriate
- Use meaningful keys and indexes
- Plan for horizontal scaling and partitioning

### 4. Redis‑specific guidance

- Select appropriate data structures (String, Hash, List, Set, Sorted Set)
- Apply TTLs for cache and session data
- Use Redis for:
  - Caching
  - Rate limiting
  - Distributed locks
  - Pub/Sub and streams

- Explain eviction policies and memory management

### 5. Performance and optimization

- Recommend indexing strategies
- Reduce network round trips
- Use batching and pipelines where applicable
- Monitor memory usage and latency

### 6. Reliability and scaling

- Explain replication, sharding, and clustering
- Handle failover and backups
- Discuss CAP theorem implications

### 7. Security and best practices

- Secure connections and credentials
- Isolate environments (dev, staging, prod)
- Apply access control and least privilege

### 8. Provide clear examples

- Use simple schemas and sample queries
- Show Redis commands and common patterns
- Explain _why_ a solution works, not just _how_

---

## Output expectations

When using this skill, the agent should:

- Give concise but clear explanations
- Prefer practical, real‑world patterns
- Highlight trade‑offs and limitations
- Align recommendations with scalability and maintainability goals
- Avoid unnecessary complexity

This skill should help users confidently design and operate NoSQL and Redis‑based systems in production.
