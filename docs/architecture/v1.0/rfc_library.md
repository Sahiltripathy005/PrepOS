# PlacementOS: Architectural RFC Library
**Document Version:** 1.0.0  
**Status:** Approved  
**Author:** Staff Architecture Review Board & Director of Engineering  

---

## Executive Summary
This document serves as the permanent record of architectural decisions (ADRs/RFCs) for PlacementOS. It compiles 25 architectural RFCs tracking choices across systems, database configurations, and testing boundaries, establishing a historical context for future developers.

---

## RFC-001: Monorepo Architecture
* **Owner:** Principal Build Engineer  
* **Status:** Approved  

### Problem
Managing split repositories for frontend client applications and backend APIs causes configuration drift, slows down cross-tier features development, and complicates testing.

### Context
PlacementOS is built using React for the client app and Express for the API server. In a multi-repo setup, database model changes require updating the backend, publishing changes, and updating dependency packages on the frontend.

### Alternatives Considered
* **Multi-Repo Layout:** Distinct repositories for `placementos-web` and `placementos-api`.

### Pros & Cons of Alternatives

#### Multi-Repo Layout
* **Pros:** Simpler initial Git checkouts; isolated CI/CD pipelines.
* **Cons:** Hard to sync schema modifications; duplicate linting setups.

### Decision
Implement a single monorepo using **pnpm workspaces**.

### Trade-offs
* **Cost:** Initial configuration of workspace compilers is more complex.
* **Benefit:** Local packages (such as typescript declarations) update immediately without npm publishing steps.

### Rejected Options
* **Git Submodules:** Rejected due to developer workflow complexity during commits.

### Future Migration Strategy
If teams grow significantly, specific applications under `/apps` can be moved to dedicated repositories without restructuring internal imports.

### Success Metrics
* Time to compile local workspaces: Under 30 seconds.
* PR review cycles: One unified PR covering both client and server changes.

---

## RFC-002: ERN Architecture Pattern (Express, React, Node)
* **Owner:** Principal Software Architect  
* **Status:** Approved  

### Problem
Choosing a technical stack that is developer-friendly, stable, and capable of scaling over a 10-year period.

### Context
The application needs to handle high-frequency user actions, complex database transactions, and real-time updates (like revision scheduling).

### Alternatives Considered
* **Go + Next.js + PostgreSQL**
* **Next.js (Monolithic Serverless SSR)**

### Pros & Cons of Alternatives

#### Go + Next.js
* **Pros:** Faster execution times; smaller backend binaries.
* **Cons:** Requires managing two language runtimes; slows down onboarding.

#### Next.js Monolith
* **Pros:** Unified framework; built-in routing.
* **Cons:** High execution times in serverless environments; complex API setups.

### Decision
Standardize on the **ERN (Express, React, Node)** stack using TypeScript.

### Trade-offs
* **Cost:** Node.js consumes more memory than compiled binary runtimes like Go.
* **Benefit:** Unified language (TypeScript) across frontend and backend.

### Rejected Options
* **Next.js Server Actions:** Rejected to maintain a strict separation between UI pages and business logic.

### Future Migration Strategy
The Express API server can be containerized and scaled horizontally behind a load balancer without modifying client code.

### Success Metrics
* Onboarding time: New developers can run the system locally in under 15 minutes.

---

## RFC-003: REST API Contract
* **Owner:** API Design Architect  
* **Status:** Approved  

### Problem
Ad-hoc API structures lead to inconsistent response payloads, making client-side error handling complex and error-prone.

### Context
Multiple UI views need access to clean data catalogs (problems, attempts) and transactional updates (submitting stage updates).

### Alternatives Considered
* **GraphQL**
* **gRPC-Web**

### Pros & Cons of Alternatives

#### GraphQL
* **Pros:** Client-specified payloads prevent over-fetching.
* **Cons:** Hard to cache locally; complex rate limiting configurations.

### Decision
Standardize on **JSON REST APIs** versioned under `/api/v1/` routes.

### Trade-offs
* **Cost:** Over-fetching can occur on list endpoints when the client only needs key fields.
* **Benefit:** Simple to cache, test, and implement rate limits.

### Rejected Options
* **GraphQL:** Rejected due to caching complexity and developer overhead.

### Future Migration Strategy
New endpoints can be added under `/api/v2/` without breaking existing clients.

### Success Metrics
* API response consistency: 100% of endpoints conform to standard JSON schemas.

---

## RFC-004: PostgreSQL Database
* **Owner:** Database Architect  
* **Status:** Approved  

### Problem
Storing relational data (users, applications, logs) requires strong transactional integrity, relational checks, and high query performance.

### Context
Spaced repetition queues and stages history tracking require complex queries across tables.

### Alternatives Considered
* **MongoDB (Document Store)**
* **MySQL**

### Pros & Cons of Alternatives

#### MongoDB
* **Pros:** Dynamic schemas; simple horizontal scaling.
* **Cons:** Lacks relational enforcement; complex multi-row transactions.

### Decision
Standardize on **PostgreSQL** as the primary datastore.

### Trade-offs
* **Cost:** Schema changes require database migration scripts.
* **Benefit:** Reliable ACID transaction compliance and support for JSONB fields.

### Rejected Options
* **MongoDB:** Rejected to ensure database-level relational constraints.

### Future Migration Strategy
Write database adapters to allow migrations to distributed relational databases (like CockroachDB) if scale warrants.

### Success Metrics
* Query times for problem lists: Under 50ms.

---

## RFC-005: Prisma ORM
* **Owner:** Staff Backend Engineer  
* **Status:** Approved  

### Problem
Writing raw SQL queries directly in repositories leads to code duplication, SQL vulnerability risks, and syntax errors.

### Context
Database schemas must remain clean and documented, serving as the source of truth for TypeScript types.

### Alternatives Considered
* **Kysely (Type-safe SQL query builder)**
* **TypeORM**

### Pros & Cons of Alternatives

#### Kysely
* **Pros:** High query performance; compile-time checks.
* **Cons:** Requires writing raw schema definitions manually.

### Decision
Adopt **Prisma ORM** for database access.

### Trade-offs
* **Cost:** Prisma has a larger runtime memory footprint than query builders like Kysely.
* **Benefit:** Automated migration generation and out-of-the-box TypeScript types.

### Rejected Options
* **TypeORM:** Rejected due to complex mapping decorators and maintenance issues.

### Future Migration Strategy
If query performance bottleneck points emerge, specific routes can bypass Prisma and run queries using Kysely.

### Success Metrics
* Schema sync: 100% type safety between DB models and backend code.

---

## RFC-006: JWT Authentication
* **Owner:** Security Engineer  
* **Status:** Approved  

### Problem
Session storage models (like Redis) require database lookups on every API request, slowing down server response times.

### Context
User requests must be validated across multiple API endpoints without adding database lookup latency.

### Alternatives Considered
* **Stateful Sessions (Redis session store)**
* **API Keys**

### Pros & Cons of Alternatives

#### Stateful Sessions
* **Pros:** Simple to revoke sessions immediately.
* **Cons:** Database lookup required on every incoming API request.

### Decision
Implement **Stateless JWT Access Tokens** for request authentication.

### Trade-offs
* **Cost:** Revoking active tokens immediately requires token blacklists.
* **Benefit:** Local, in-memory token checks take under 2ms.

### Rejected Options
* **API Keys:** Rejected for user auth due to token storage security risks.

### Future Migration Strategy
Support OAuth tokens (Google, GitHub) by modifying only the verification service.

### Success Metrics
* Authenticated request latency overhead: Under 5ms.

---

## RFC-007: Refresh Token Rotation
* **Owner:** Security Architect  
* **Status:** Approved  

### Problem
Stateless JWT access tokens have short lifespans. Re-authenticating users frequently degrades the user experience, but long-lived tokens pose security risks.

### Context
Refresh tokens stored in cookies are vulnerable to XSS and token theft.

### Alternatives Considered
* **Long-Lived Access Tokens (24h+)**
* **Standard Refresh Tokens (Without Rotation)**

### Pros & Cons of Alternatives

#### Long-Lived Access Tokens
* **Pros:** No token management overhead.
* **Cons:** High risk if a token is stolen.

### Decision
Implement **Refresh Token Rotation (RTR)**.

### Trade-offs
* **Cost:** Requires managing token status changes in the database.
* **Benefit:** If a token is reused, the server revokes the user's entire session list.

### Rejected Options
* **Non-rotating Refresh Tokens:** Rejected due to the risk of undetected token theft.

### Future Migration Strategy
Can be upgraded to WebAuthn or passkey verification flows without modifying route middlewares.

### Success Metrics
* Compromised session response: Sessions are revoked within 1 second of double-token detection.

---

## RFC-008: Repository Pattern
* **Owner:** Staff Software Architect  
* **Status:** Approved  

### Problem
Allowing controllers or services to access database objects directly tightly couples application logic to specific database drivers.

### Context
The application contains complex business rules that must remain independent of PostgreSQL implementation details.

### Alternatives Considered
* **Direct Active Record queries inside services**

### Pros & Cons of Alternatives

#### Direct Active Record queries
* **Pros:** Faster feature prototyping.
* **Cons:** Mocking database calls during testing is complex.

### Decision
Enforce the **Repository Pattern** for database access.

### Trade-offs
* **Cost:** Requires writing query interfaces for every database model.
* **Benefit:** Isolates business logic, making it simpler to run tests in isolation.

### Rejected Options
* **Direct Queries:** Rejected to ensure the testability of service components.

### Future Migration Strategy
The repository layer can be rewritten to query different databases without modifying service logic.

### Success Metrics
* Code coverage: Mocking repository interfaces allows 100% test coverage of service layers.

---

## RFC-009: Service Layer Pattern
* **Owner:** Senior Technical Lead  
* **Status:** Approved  

### Problem
Mixing business rules with route handling logic makes controllers bloated, hard to maintain, and difficult to test.

### Context
Domain modules (like Spaced Repetition) require coordination across multiple operations (e.g. updating decay values and logs).

### Alternatives Considered
* **Transaction Script Pattern (Fat Controllers)**

### Pros & Cons of Alternatives

#### Transaction Script
* **Pros:** Simpler code path setup.
* **Cons:** Business logic cannot be reused across different controllers.

### Decision
Implement a dedicated **Service Layer** to manage business rules.

### Trade-offs
* **Cost:** Adds an additional layer to the request lifecycle.
* **Benefit:** Business logic remains clean, reusable, and easy to test.

### Rejected Options
* **Fat Controllers:** Rejected to keep controllers focused solely on request parsing.

### Future Migration Strategy
Services can be refactored into independent worker processes if background queues are required.

### Success Metrics
* Test isolation: Services can be tested using mock databases in under 10ms.

---

## RFC-010: Feature-First Architecture
* **Owner:** Principal Architect  
* **Status:** Approved  

### Problem
Standard structures (grouping all controllers together, all views together) become hard to navigate as the codebase grows.

### Context
PlacementOS modules (Auth, Practice Log, Analytics) need to be self-contained to support independent development.

### Alternatives Considered
* **Layer-First Layout (Controllers/, Views/, Models/)**

### Pros & Cons of Alternatives

#### Layer-First Layout
* **Pros:** Standard structure for simple projects.
* **Cons:** Developers must navigate multiple directories to update a single feature.

### Decision
Implement a **Feature-First** folder structure under `/domains`.

### Trade-offs
* **Cost:** Requires managing path configurations to handle shared utilities.
* **Benefit:** A feature can be added or deleted by modifying a single folder.

### Rejected Options
* **Layer-First Layout:** Rejected to support modular scaling.

### Future Migration Strategy
Individual features can be exported as standalone packages if needed for scaling.

### Success Metrics
* Code navigation: Developers can locate all files for a feature inside a single folder.

---

## RFC-011: Tailwind CSS
* **Owner:** Principal UI Architect  
* **Status:** Approved  

### Problem
Writing custom CSS files leads to large stylesheets, class name conflicts, and styling inconsistencies.

### Context
The user interface must conform to design token guidelines (accent colors, spacing values) and support light/dark modes.

### Alternatives Considered
* **CSS Modules**
* **Styled Components**

### Pros & Cons of Alternatives

#### CSS Modules
* **Pros:** Scope isolation prevents class conflicts.
* **Cons:** Stylesheet size grows linearly with the codebase.

### Decision
Adopt **Tailwind CSS v4** for all UI components.

### Trade-offs
* **Cost:** Component files contain long lists of Tailwind classes in their markup.
* **Benefit:** Styling configurations are fast and stylesheet file sizes remain small.

### Rejected Options
* **Styled Components:** Rejected to prevent CSS-in-JS runtime overhead.

### Future Migration Strategy
Can be migrated to other utility libraries by updating common components.

### Success Metrics
* Production stylesheet file size: Pinned under 100KB.

---

## RFC-012: React Router
* **Owner:** Senior Frontend Lead  
* **Status:** Approved  

### Problem
Managing route transitions manually in single-page apps is complex, error-prone, and breaks browser history navigation.

### Context
Users must be able to bookmark pages (like specific practice logs) and experience smooth page transitions.

### Alternatives Considered
* **Vite-plugin-pages (File-system routing)**
* **Custom State Routing**

### Pros & Cons of Alternatives

#### Custom Routing
* **Pros:** Small bundle size footprint.
* **Cons:** Lacks nested layouts, query parsers, and history tracking.

### Decision
Standardize on **React Router** for frontend route management.

### Trade-offs
* **Cost:** Adds routing setup files to the initial bundle.
* **Benefit:** Built-in support for code splitting, route guards, and nested layouts.

### Rejected Options
* **File-system Routing plugins:** Rejected to keep route mappings explicit.

### Future Migration Strategy
V1 routes can be wrapped in sub-routers if the application is split into multiple sub-pages.

### Success Metrics
* Page navigation response: Route transitions complete in under 5ms.

---

## RFC-013: TanStack Query
* **Owner:** Senior UI Developer  
* **Status:** Approved  

### Problem
Managing server state in local React state variables leads to duplicate API requests and out-of-sync UI views.

### Context
Data elements (like the problems list) must be cached, updated, and re-fetched without manual useEffect configurations.

### Alternatives Considered
* **Redux Toolkit Query**
* **Manual useEffect fetches**

### Pros & Cons of Alternatives

#### Redux Toolkit Query
* **Pros:** Unified global state store.
* **Cons:** Complex configuration boilerplate.

### Decision
Adopt **TanStack Query** for client-side server state management.

### Trade-offs
* **Cost:** Increases the initial bundle size of the client application.
* **Benefit:** Out-of-the-box caching, background updates, and request deduplication.

### Rejected Options
* **Manual Fetches:** Rejected to prevent state management bugs in components.

### Future Migration Strategy
Can be configured to fetch data from GraphQL endpoints without changing component markup.

### Success Metrics
* Duplicate API requests: Reduced by 90% using query deduplication.

---

## RFC-014: Zustand
* **Owner:** Tech Lead  
* **Status:** Approved  

### Problem
React context triggers full tree re-renders, making it unsuitable for high-frequency state updates.

### Context
Global layout states (like user profiles and settings) must be accessible across components without performance drops.

### Alternatives Considered
* **Redux**
* **React Context**

### Pros & Cons of Alternatives

#### Redux
* **Pros:** Highly structured debug logging.
* **Cons:** High configuration boilerplate.

### Decision
Adopt **Zustand** for global client state management.

### Trade-offs
* **Cost:** Lacks the structured tracking tools of large libraries like Redux.
* **Benefit:** Minimal configuration boilerplate and high rendering performance.

### Rejected Options
* **Redux:** Rejected to keep state configurations lightweight and simple.

### Future Migration Strategy
Zustand stores can be refactored into React context providers if state requirements change.

### Success Metrics
* Component re-renders: Limited to components directly subscribed to modified state fields.

---

## RFC-015: Design Token System
* **Owner:** Design Systems Lead  
* **Status:** Approved  

### Problem
Hardcoding theme styles leads to visual inconsistencies and makes global style changes difficult to implement.

### Context
PlacementOS must adhere to strict visual guidelines (such as supporting comfortable/condensed view modes) and accessibility rules.

### Alternatives Considered
* **Ad-hoc tailwind utility classes**
* **CSS Custom Properties (Variables) inside stylesheets**

### Pros & Cons of Alternatives

#### Ad-hoc Tailwind
* **Pros:** Fast setup.
* **Cons:** Hard to maintain consistent spacing and sizing globally.

### Decision
Implement a **Central Design Token System** under `packages/design-tokens`.

### Trade-offs
* **Cost:** Requires defining token JSON files before writing component markup.
* **Benefit:** Ensures design consistency; visual updates are managed from a single config file.

### Rejected Options
* **Ad-hoc CSS:** Rejected to prevent styling inconsistencies across features.

### Future Migration Strategy
Tokens can compile to variables for CSS-in-JS libraries if UI frameworks are updated.

### Success Metrics
* Styling consistency: 100% of custom UI components use design system token variables.

---

## RFC-016: Evidence-Based Metrics Model
* **Owner:** Principal Architect  
* **Status:** Approved  

### Problem
Estimation metrics (like user readiness scores) are subjective, hard to verify, and can lead to frustration.

### Context
PlacementOS aims to provide objective, audit-grade tracking profiles for developers and companies.

### Alternatives Considered
* **Readiness scores based on algorithmic estimations**

### Pros & Cons of Alternatives

#### Readiness Scores
* **Pros:** Simple to show on dashboards.
* **Cons:** Lacks clear criteria, making progress hard to verify.

### Decision
Standardize on **Evidence-Based Metrics** (such as logging actual practice times and accuracy rates).

### Trade-offs
* **Cost:** Requires collecting detailed practice attempts data.
* **Benefit:** Provides verifiable logs that can be shared with recruiters.

### Rejected Options
* **Estimated Readiness Scores:** Rejected to prevent showing unverified progress scores.

### Future Migration Strategy
Add validation checks to verify practice logs against external platforms (like GitHub commits).

### Success Metrics
* Log integrity: All metrics can be traced back to verified practice logs.

---

## RFC-017: No Readiness Percentage Philosophy
* **Owner:** Director of Engineering  
* **Status:** Approved  

### Problem
Fuzzy readiness metrics (e.g., "75% ready") mislead users and lack clear, actionable steps.

### Context
The application must provide actionable data to help developers identify their weak areas.

### Alternatives Considered
* **Fuzzy progress bars**

### Pros & Cons of Alternatives

#### Fuzzy Progress Bars
* **Pros:** Common in dashboard designs.
* **Cons:** Vague; does not show what areas need improvement.

### Decision
Enforce a **No Readiness Percentage** rule across the product.

### Trade-offs
* **Cost:** Requires designing alternative visual layouts to show progress.
* **Benefit:** Users receive objective data showing exactly what topics need practice.

### Rejected Options
* **Fuzzy Metrics:** Rejected to maintain product objectivity.

### Future Migration Strategy
Create specialized report views to summarize completed milestones for recruiters.

### Success Metrics
* UI Clarity: Progress is shown as completed tasks and actual practice hours.

---

## RFC-018: Domain-Driven Design Boundaries
* **Owner:** Staff Architect  
* **Status:** Approved  

### Problem
Tightly coupling business domains makes the codebase difficult to refactor and maintain.

### Context
Core modules (Practice Log, Applications, Analytics) have distinct responsibilities and database tables.

### Alternatives Considered
* **Monolithic database tables with shared foreign key queries**

### Pros & Cons of Alternatives

#### Relational Joins across domains
* **Pros:** Simple to write queries.
* **Cons:** Changes to one table can cause unintended issues in unrelated domains.

### Decision
Define explicit **Domain-Driven Design (DDD) Bounded Contexts**.

### Trade-offs
* **Cost:** Requires writing domain-specific interfaces to share data across domains.
* **Benefit:** Clear domain boundaries; modules are isolated and easy to update.

### Rejected Options
* **Relational Joins:** Direct cross-domain SQL joins are prohibited.

### Future Migration Strategy
Bounded contexts can be extracted into separate microservices if scaling requirements change.

### Success Metrics
* Domain isolation: Features do not import database models from other domains.

---

## RFC-019: Module Isolation Guardrails
* **Owner:** Senior Tech Lead  
* **Status:** Approved  

### Problem
Without strict checks, developers may import code across feature directories, creating circular dependencies.

### Context
The workspace must enforce domain isolation at the compiler level.

### Alternatives Considered
* **Manual code reviews**
* **Modular compiler structures (TS project references)**

### Pros & Cons of Alternatives

#### Manual Code Reviews
* **Pros:** No setup overhead.
* **Cons:** Human error can miss invalid import statements.

### Decision
Enforce module boundaries using **ESLint import constraints**.

### Trade-offs
* **Cost:** Requires writing custom rules to block cross-folder imports.
* **Benefit:** Automatically blocks invalid import configurations during builds.

### Rejected Options
* **Manual Reviews:** Rejected due to the risk of configuration drift.

### Future Migration Strategy
Compile rules can be integrated with build tools (like Turborepo) to speed up compile times.

### Success Metrics
* Import violations: Zero cross-domain import statements pass code verification checks.

---

## RFC-020: Testing Strategy
* **Owner:** QA Director  
* **Status:** Approved  

### Problem
Unbalanced testing (e.g., relying solely on end-to-end tests) leads to slow build pipelines and hard-to-debug test failures.

### Context
Testing must run quickly while validating both unit logic and complete user journeys.

### Alternatives Considered
* **E2E Testing Monolith**
* **Unit Testing only**

### Pros & Cons of Alternatives

#### E2E Testing Monolith
* **Pros:** Verifies complete system paths.
* **Cons:** Slow execution times; brittle test cases.

### Decision
Implement a **Multi-Tier Testing Strategy** (Unit, Integration, and E2E).

### Trade-offs
* **Cost:** Requires configuring multiple test runners (Vitest, Playwright).
* **Benefit:** Quick test runs; coverage checks identify failures early.

### Rejected Options
* **E2E Monoliths:** Rejected due to slow build execution times.

### Future Migration Strategy
Tests can run in parallel on cloud runners to speed up build pipelines.

### Success Metrics
* Unit test execution speed: Under 5 seconds.
* Code coverage: Pinned to at least 80% coverage on core services.

---

## RFC-021: Docker Environment Setup
* **Owner:** DevOps Engineer  
* **Status:** Approved  

### Problem
Inconsistent local development environments lead to bugs that only appear on specific machines.

### Context
Developers must run databases and background queues locally matching production setups.

### Alternatives Considered
* **Manual local system setups**

### Pros & Cons of Alternatives

#### Local System Setups
* **Pros:** Runs faster with no container overhead.
* **Cons:** Version mismatches cause database and library issues.

### Decision
Package the database and services in **Docker Containers**.

### Trade-offs
* **Cost:** Containers consume additional system memory on developer machines.
* **Benefit:** Identical runtime environments across all systems.

### Rejected Options
* **Manual Setups:** Rejected to prevent environment configuration drift.

### Future Migration Strategy
The compose configuration can deploy to Kubernetes clusters for production runs.

### Success Metrics
* Environment setup time: Container builds run in under 2 minutes.

---

## RFC-022: CI/CD Automation Flow
* **Owner:** DevOps Architect  
* **Status:** Approved  

### Problem
Manual deployment steps are slow, error-prone, and lack verification checks.

### Context
Code changes must pass all tests and build successfully before being deployed to production.

### Alternatives Considered
* **Manual script-based deployments**

### Pros & Cons of Alternatives

#### Script-Based Deployments
* **Pros:** Simple to write.
* **Cons:** Lacks verification checks; key credentials must be saved locally.

### Decision
Implement automated pipelines using **GitHub Actions**.

### Trade-offs
* **Cost:** Requires writing workflow YAML files.
* **Benefit:** Automates checks, builds, and deployments on every push.

### Rejected Options
* **Manual Deployments:** Rejected due to security and reliability risks.

### Future Migration Strategy
Pipelines can execute tasks in parallel on cloud runners if build times increase.

### Success Metrics
* Build pipeline duration: Runs complete in under 10 minutes.

---

## RFC-023: Structured Logging
* **Owner:** Tech Lead  
* **Status:** Approved  

### Problem
Unstructured logs (such as raw text or console logs) are difficult to query and parse on production servers.

### Context
API errors, system events, and transactions must be tracked and analyzed.

### Alternatives Considered
* **Text files using standard console logs**

### Pros & Cons of Alternatives

#### Console Logs
* **Pros:** Simple to write.
* **Cons:** Hard to filter; lacks critical context (like timestamps or request IDs).

### Decision
Standardize on structured JSON logs using the **Pino** library.

### Trade-offs
* **Cost:** Logging data in JSON format makes it harder to read logs locally without formatting tools.
* **Benefit:** Logs are simple to parse, filter, and load into monitoring systems.

### Rejected Options
* **Console Logs:** Rejected due to performance and filtering limitations.

### Future Migration Strategy
Logs can be forwarded to central search tools (like Datadog or ELK stack) for analysis.

### Success Metrics
* Query parsing speed: Production logs format and load immediately in monitoring tools.

---

## RFC-024: Observability Metrics Engine
* **Owner:** Senior Tech Lead  
* **Status:** Approved  

### Problem
Without real-time system monitoring, performance drops and application errors go unnoticed.

### Context
API response times and query counts must be tracked to maintain system health.

### Alternatives Considered
* **Manual log searches on error reports**

### Pros & Cons of Alternatives

#### Log Searches
* **Pros:** No setup overhead.
* **Cons:** Reactive; issues are only found after users report them.

### Decision
Implement a **Core Metrics Collection Engine**.

### Trade-offs
* **Cost:** Adds minimal tracking overhead to request lifecycles.
* **Benefit:** Real-time data shows performance issues before they affect users.

### Rejected Options
* **Reactive Logs:** Rejected to support proactive system monitoring.

### Future Migration Strategy
System metrics can be exported in Prometheus format for custom dashboards.

### Success Metrics
* Tracking overhead: Adds under 1ms to API request lifecycles.

---

## RFC-025: Future Microservices Strategy
* **Owner:** Engineering Director  
* **Status:** Approved  

### Problem
Monolithic architectures can limit scaling options if specific services experience high loads.

### Context
PlacementOS must scale to handle large volumes of practice logs and scheduling events.

### Alternatives Considered
* **Microservices from day one**

### Pros & Cons of Alternatives

#### Microservices from day one
* **Pros:** Independent service scaling.
* **Cons:** High development overhead; complex network configurations.

### Decision
Start with a **Modular Monolith** and design a path to transition to microservices if needed.

### Trade-offs
* **Cost:** Requires writing domain logic using strict interfaces.
* **Benefit:** Keeps the codebase simple to start while allowing services to scale independently.

### Rejected Options
* **Initial Microservices:** Rejected due to high development overhead.

### Future Migration Strategy
Extract isolated domains (like Spaced Repetition) into independent services behind an API gateway.

### Success Metrics
* Service separation duration: Domain extractions can complete in under 2 weeks.

---

## Summary (RFC Context Matrix)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                   PlacementOS Architectural Decisions                    │
├──────────────────────────────────────────────────────────────────────────┤
│ Workspace: Monorepo (pnpm) • Styling: Tailwind v4 • DB: Postgres         │
│ APIs: Versioned REST (/api/v1/) • Auth: Stateless JWT with Cookie RTR   │
│ Quality: Domain Bounded Contexts • Pino logs • Multi-tier tests          │
├──────────────────────────────────────────────────────────────────────────┤
│                            ARCHITECTURAL LAWS                            │
│ 1. All changes must be tracked in RFC records.                           │
│ 2. Direct database joins across domains are prohibited.                  │
│ 3. UI logic must remain separate from database access services.          │
│ 4. System progress is shown using verified logs instead of percentages.  │
│ 5. API response payloads must match standard JSON schemas.               │
│ 6. Access tokens are stored in memory to prevent CSRF vulnerabilities.   │
└──────────────────────────────────────────────────────────────────────────┘
```

---
*End of RFC Library.*
