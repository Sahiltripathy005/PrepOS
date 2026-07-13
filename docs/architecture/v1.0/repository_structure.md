# PlacementOS: Repository Structure & Monorepo Blueprint
**Document Version:** 1.0.0  
**Status:** Approved  
**Author:** Principal Software Architect & Monorepo Lead  

---

## Table of Contents
1. [Repository Philosophy](#1-repository-philosophy)
2. [Monorepo Justification](#2-monorepo-justification)
3. [Top-Level Folder Structure](#3-top-level-folder-structure)
4. [Frontend Folder Structure](#4-frontend-folder-structure)
5. [Backend Folder Structure](#5-backend-folder-structure)
6. [Shared Packages](#6-shared-packages)
7. [Configuration Strategy](#7-configuration-strategy)
8. [Environment Strategy](#8-environment-strategy)
9. [Docker Strategy](#9-docker-strategy)
10. [GitHub Strategy](#10-github-strategy)
11. [Automation Strategy](#11-automation-strategy)
12. [Package Management](#12-package-management)
13. [Documentation Strategy](#13-documentation-strategy)
14. [Testing Folder Structure](#14-testing-folder-structure)
15. [CI/CD Pipeline](#15-ci-cd-pipeline)
16. [Development Workflow](#16-development-workflow)
17. [Release Strategy](#17-release-strategy)
18. [Future Scaling](#18-future-scaling)
19. [Repository Tree (Complete & Unabridged)](#19-repository-tree-complete--unabridged)
20. [Engineering Summary (One-Page Blueprint Card)](#20-engineering-summary-one-page-blueprint-card)

---

## 1. Repository Philosophy

PlacementOS uses a **Feature-First Monorepo** architecture designed to support a 10-year codebase lifecycle. Development is guided by three principles:
* **Strict Feature Isolation:** Domain modules (e.g. `PracticeLog`, `RevisionEngine`) must bundle their components, state, and test files inside a single directory. They can only expose interface APIs to other features.
* **Write Once, Configure Anywhere:** Shared utilities, styling configurations, API clients, and TypeScript type declarations are managed as independent, version-controlled packages.
* **Replaceable Units:** Code structure is organized so features can be completely rewritten or deleted without breaking unrelated domains.

---

## 2. Monorepo Justification

Using a monorepo rather than multiple repositories provides the following advantages and trade-offs:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Monorepo vs. Multi-Repo                         │
├───────────────────────────────────┬────────────────────────────────────┤
│ Advantages                        │ Trade-offs / Costs                 │
├───────────────────────────────────┼────────────────────────────────────┤
│ • Atomic edits across FE/BE       │ • High setup configuration cost    │
│ • Code reuse via packages         │ • Large initial git clone sizes    │
│ • Simplified dependency tracking  │ • Complex CI build cache logic     │
└───────────────────────────────────┴────────────────────────────────────┘
```

### Advantages
* **Atomic Commits:** Database model updates, API contracts, and frontend component changes are tracked in a single, unified commit.
* **Unified Workspace:** Reduces configuration drift by sharing ESLint, Prettier, TypeScript configs, and build scripts across all sub-projects.
* **Local Package Linking:** Changes made within local shared packages (such as `@placementos/types`) update the frontend and backend apps immediately without requiring npm publishing.

### Trade-offs
* **CI Cache Complexity:** Requires setting up build tools (like Turborepo) to prevent simple frontend style changes from triggering full backend test pipelines.

---

## 3. Top-Level Folder Structure

The root directory coordinates apps, shared configurations, and developer tools:

* `/apps`: Executable applications, containing the client frontend, backend API server, and future CLI utilities.
* `/packages`: Shared, local npm packages linked via workspaces (e.g., configurations, type definitions).
* `/docs`: System specifications, Architecture Decision Records (ADRs), and user guides.
* `/scripts`: Build, seeding, and database reset orchestration scripts.
* `/docker`: Container configurations, including development compose files and production multi-stage Dockerfiles.
* `/configs`: Shared, root-level linting and compiler configurations.

---

## 4. Frontend Folder Structure

The React application under `/apps/web` is organized into a modular layout:

* `/src/app`: Application entry point, containing route setups, global stylesheet sheets, and providers:
  * `/providers`: TanStack Query client, Zustand stores, and Toast alert providers.
* `/src/pages`: Router-bound page layouts mapping to entry paths. Pages compose features together; they contain no inline database requests or direct logic.
* `/src/layouts`: Frame layouts (e.g., Sidebar, Topbar) defining split layouts and focus views.
* `/src/widgets`: Custom dashboard widgets conforming to grid layout coordinates.
* `/src/domains`: Feature components, state stores, and domain hooks grouped by business module (e.g., `practice`, `revision`).

---

## 5. Backend Folder Structure

The Express server under `/apps/api` separates controllers, validation logic, and database repositories:

* `/src/domains`: Feature sub-folders organizing logic by domain:
  * `/controllers`: Route handlers that validate incoming requests and call services.
  * `/services`: Business logic coordinators.
  * `/repositories`: Database queries using Prisma.
* `/src/middlewares`: Global Express middleware (e.g., auth, rate-limiting, request tracing).
* `/src/shared`: Common helper utilities and string formatting tools.
* `/src/database`: Prisma schema files, migrations, and seed scripts.

---

## 6. Shared Packages

Shared packages live under `/packages` and are published internally using pnpm workspaces:

```text
/packages
├── /types                  # Shared TypeScript interfaces (compiled for FE & BE)
├── /ui                     # Raw UI components (state-free primitives)
├── /design-tokens          # Raw JSON design tokens (colors, margins, layouts)
├── /api-client             # Central Axios/Fetch wrappers using type-safe paths
├── /shared-validation      # Zod validation schemas shared by client and server
├── /eslint-config          # Shared linter rules
└── /tsconfig               # Base compiler options configurations
```

* **Ownership Rule:** Packages are owned by the repository core. Feature modules can consume shared packages but are not allowed to write data to them directly.

---

## 7. Configuration Strategy

Config files are shared across workspaces to prevent configuration drift:

* **ESLint:** Configured in `/packages/eslint-config`. Apps and packages extend this base configuration in their local `.eslintrc.js` files:
  ```javascript
  module.exports = { extends: ["@placementos/eslint-config/react"] };
  ```
* **TypeScript:** Base compiler options are defined in `/packages/tsconfig/base.json`. Sub-projects extend this in their local `tsconfig.json`:
  ```json
  { "extends": "@placementos/tsconfig/base.json" }
  ```
* **Tailwind v4:** A unified design theme is configured in `/packages/design-tokens` and imported into the Tailwind entry stylesheets.

---

## 8. Environment Strategy

Environment variables are validated on startup using Zod schemas to catch configuration errors early:

* **Separation Rules:**
  * `.env.development`: Targets local PostgreSQL databases and development hosts.
  * `.env.test`: Connects to clean database instances to run test suites.
  * Production: Loaded from secure system host runners (such as AWS Secret Manager or GitHub Secret stores).
* **Validation Example:**
  ```typescript
  import { z } from "zod";
  const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(32)
  });
  export const env = envSchema.parse(process.env);
  ```

---

## 9. Docker Strategy

Containers are configured for both local development and production deployments:

* **Local Development Compose (`docker-compose.dev.yml`):**
  * Configures a local PostgreSQL service on port `5432`.
  * Runs pgAdmin on port `5050` to assist with database debugging.
  * Mounts data volumes to ensure PostgreSQL records persist across restarts.
* **Production Multi-Stage Build (`Dockerfile`):**
  * *Stage 1 (Builder):* Installs pnpm, copies package maps, runs dependencies, and compiles build files.
  * *Stage 2 (Runner):* Copies compiled files into a minimal Node.js image to keep production container sizes small.

---

## 10. GitHub Strategy

GitHub workflows are defined in `.github/` to coordinate testing and deployment tasks:

* **Branch Protection Rules:**
  * Commits cannot be pushed to the `main` branch directly.
  * Pull requests require at least one approved review.
  * Merges are blocked if automated status checks (lint, typecheck, tests) fail.
* **Automation Workflow:**
  * Triggered on pull requests and branch updates.
  * Executes lint checks, typecheck compiles, and unit test suites across all workspaces in parallel.

---

## 11. Automation Strategy

Workspaces implement standardized scripts to automate daily development tasks:

* `npm run dev`: Starts the React client application and Express API server in parallel.
* `npm run build`: Compiles all packages and apps for production deployment.
* `npm run test`: Runs unit and integration test suites.
* `npm run lint`: Runs ESLint check parameters.
* `npm run typecheck`: Runs TypeScript compiler diagnostics across all workspaces.
* `npm run db:reset`: Resets the local PostgreSQL database, runs migrations, and applies seed data.

---

## 12. Package Management

The monorepo uses **pnpm** and workspace protocols to coordinate dependencies:

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

* **Workspace Protocol:** Internal dependencies are linked in `package.json` configurations using the workspace protocol:
  `"@placementos/types": "workspace:*"`
* **Dependency Rules:** Apps can import shared packages, but shared packages are not allowed to import from apps or other packages to prevent circular dependency issues.

---

## 13. Documentation Strategy

System documentation is stored alongside the codebase to ensure it remains updated:

* `/docs/adr`: Contains Architecture Decision Records (ADRs) tracking technical decisions chronologically.
* `/docs/rfc`: Request for Comments (RFCs) detailing planned features before they are implemented.
* `/docs/api`: OpenAPI files detailing API routes and payload schemas.

---

## 14. Testing Folder Structure

Test files are grouped next to the code files they verify, while global testing utilities live in a shared directory:

```text
/apps/web/src/domains/practice
├── /components
│   ├── AttemptCard.tsx
│   └── AttemptCard.test.tsx      # Unit test next to component file
/apps/web/tests
├── /e2e
│   └── practice-flow.spec.ts     # End-to-end user path test
└── /fixtures
    └── mockProblems.json         # Mock data for test suites
```

---

## 15. CI/CD Pipeline

The build pipeline verifies code health and builds assets sequentially:

```
[Trigger Commit] ──► [Stage 1: Lint & Compile Check] ──► [Stage 2: Run Tests]
                                                               │
[Deployment] ◄── [Stage 4: Build Images] ◄── [Stage 3: Build Assets] ◄┘
```

1. **Lint & Compile Check:** Runs ESLint and checks for TypeScript compile errors.
2. **Run Tests:** Executes unit and integration tests.
3. **Build Assets:** Compiles the React client application and Express API server.
4. **Build Images:** Builds production Docker images and pushes them to the repository container registry.
5. **Deployment:** Deploys update packages to production servers.

---

## 16. Development Workflow

Onboarding and feature deployment follow a standardized lifecycle:

1. **Setup Workspace:** Clone the repository, configure environmental keys, and run `pnpm install`.
2. **Start Servers:** Run `pnpm dev` to launch the client application and API server.
3. **Create Branch:** Create a feature branch matching conventions (e.g. `feat/practice/duration-tracker`).
4. **Build & Test Feature:** Implement your changes and write unit tests for new logic.
5. **Verify Quality:** Run lint checks and build code locally to confirm everything passes.
6. **Submit PR:** Push changes, open a Pull Request, and assign reviewers.
7. **Merge:** Once tests pass and approvals are received, squash-and-merge changes into the `main` branch.

---

## 17. Release Strategy

* **Version Management:** Releases use Semantic Versioning (SemVer). Version updates are calculated automatically by analyzing conventional commits.
* **Auto Changelog:** Releases generate markdown summaries listing bug fixes, new features, and breaking changes.
* **Tagging:** Releases push a Git tag to the repository matching the version number (e.g. `v1.2.0`).

---

## 18. Future Scaling

* **Migrating to Microservices:** Keep domain logic encapsulated within `/domains/` directories. If a service load increases, developers can extract the domain folder and deploy it as an independent microservice.
* **Task Queues:** Heavy tasks (such as compiling evidence reports) are offloaded to background workers using Redis and BullMQ queues.
* **Multi-Platform Support:** Native mobile apps (React Native) or desktop applications (Tauri) are added as separate workspaces under `/apps/mobile` or `/apps/desktop`, reusing existing shared packages (`@placementos/api-client`, `@placementos/types`).

---

## 19. Repository Tree (Complete & Unabridged)

The complete folder structure and configuration layout of PlacementOS is defined below:

```text
/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   └── cd.yml
│   ├── issue_template/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── pull_request_template.md
├── docker/
│   ├── development/
│   │   ├── docker-compose.yml
│   │   └── pg_init.sql
│   └── production/
│       ├── Dockerfile.web
│       └── Dockerfile.api
├── docs/
│   ├── adr/
│   │   ├── 0001-init-architecture.md
│   │   └── 0002-postgres-development.md
│   ├── rfc/
│   │   └── 0001-spaced-repetition-decay.md
│   └── api/
│       └── openapi.yaml
├── scripts/
│   ├── db-reset.ts
│   ├── db-seed.ts
│   └── build-all.sh
├── apps/
│   ├── web/                     # React 19 Frontend App
│   │   ├── public/
│   │   │   └── favicon.ico
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── providers/
│   │   │   │   │   ├── QueryClientProvider.tsx
│   │   │   │   │   └── ThemeProvider.tsx
│   │   │   │   ├── routes/
│   │   │   │   │   └── AppRoutes.tsx
│   │   │   │   ├── main.tsx
│   │   │   │   └── index.css
│   │   │   ├── components/      # State-free UI Primitives
│   │   │   │   ├── ui/
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Input.tsx
│   │   │   │   │   └── Checkbox.tsx
│   │   │   │   └── layout/
│   │   │   │       ├── Sidebar.tsx
│   │   │   │       └── Topbar.tsx
│   │   │   ├── pages/           # Page Containers
│   │   │   │   ├── DashboardPage.tsx
│   │   │   │   ├── PracticePage.tsx
│   │   │   │   └── SettingsPage.tsx
│   │   │   ├── widgets/         # Dashboard Widgets
│   │   │   │   ├── RevisionQueueWidget.tsx
│   │   │   │   └── MetricsWidget.tsx
│   │   │   └── domains/         # Bounded Context Domains
│   │   │       ├── practice/
│   │   │       │   ├── components/
│   │   │       │   │   ├── AttemptLogger.tsx
│   │   │       │   │   └── AttemptHistory.tsx
│   │   │       │   ├── hooks/
│   │   │       │   │   └── useAttempts.ts
│   │   │       │   └── stores/
│   │   │       │       └── practiceStore.ts
│   │   │       └── revision/
│   │   │           ├── components/
│   │   │           │   └── RevisionCard.tsx
│   │   │           └── hooks/
│   │   │               └── useRevision.ts
│   │   │   ├── index.html
│   │   │   ├── vite.config.ts
│   │   │   ├── tsconfig.json
│   │   │   └── package.json
│   └── api/                     # Express Backend App
│       ├── src/
│       │   ├── domains/         # Domain Modules
│       │   │   ├── auth/
│       │   │   │   ├── auth.controller.ts
│       │   │   │   ├── auth.service.ts
│       │   │   │   └── auth.routes.ts
│       │   │   ├── practice/
│       │   │   │   ├── practice.controller.ts
│       │   │   │   ├── practice.service.ts
│       │   │   │   ├── practice.repository.ts
│       │   │   │   └── practice.routes.ts
│       │   │   └── revision/
│       │   │       ├── revision.controller.ts
│       │   │       ├── revision.service.ts
│       │   │       ├── revision.repository.ts
│       │   │       └── revision.routes.ts
│       │   ├── middlewares/
│       │   │   ├── auth.middleware.ts
│       │   │   ├── error.middleware.ts
│       │   │   └── rate-limiter.middleware.ts
│       │   ├── shared/
│       │   │   └── utils.ts
│       │   ├── config/
│       │   │   └── env.ts
│       │   └── server.ts
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── migrations/
│       │   └── seed.ts
│       ├── tsconfig.json
│       └── package.json
├── packages/
│   ├── types/                   # Shared TypeScript models
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── ui/                      # Shared Primitives components
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── design-tokens/           # Design System tokens
│   │   ├── tokens.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── api-client/              # API Fetch wrappers
│       ├── src/
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── configs/
│   ├── .eslintrc.json
│   ├── tsconfig.settings.json
│   └── prettier.config.js
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

---

## 20. Engineering Summary (One-Page Blueprint Card)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      PlacementOS Workspace Blueprint                     │
├──────────────────────────────────────────────────────────────────────────┤
│ Manager: pnpm workspaces  •  Build: Vite / TSC Compile                   │
│ Apps: apps/web (React 19) • apps/api (Express API Server)                │
│ Shared Packages: packages/types • packages/ui • packages/api-client      │
├──────────────────────────────────────────────────────────────────────────┤
│                         WORKSPACE CONFIG RULES                           │
│ 1. Zero cross-app imports. Apps must communicate via shared packages.    │
│ 2. Feature modules must group components, hooks, and tests in one folder.│
│ 3. Load database configs from validated environment variables.           │
│ 4. Build pipelines are triggered on pull requests to the main branch.     │
│ 5. Merge branches using squash-and-merge to keep Git history clean.      │
│ 6. Shared configurations are extended locally from core config folders.  │
└──────────────────────────────────────────────────────────────────────────┘
```

---
*End of Repository Structure & Monorepo Blueprint.*
