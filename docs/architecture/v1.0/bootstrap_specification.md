# PlacementOS: Repository Bootstrap Specification
**Document Version:** 1.0.0  
**Status:** Approved  
**Author:** Principal Build Systems Engineer & Staff DevOps Architect  

---

## Table of Contents
1. [Bootstrap Philosophy](#1-bootstrap-philosophy)
2. [Development Environment](#2-development-environment)
3. [Repository Initialization](#3-repository-initialization)
4. [Workspace Configuration](#4-workspace-configuration)
5. [Root package.json](#5-root-packagejson)
6. [Shared Configurations](#6-shared-configurations)
7. [Environment Files](#7-environment-files)
8. [Docker Bootstrap](#8-docker-bootstrap)
9. [Database Bootstrap](#9-database-bootstrap)
10. [Logging Bootstrap](#10-logging-bootstrap)
11. [Shared Tooling](#11-shared-tooling)
12. [Code Quality Pipeline](#12-code-quality-pipeline)
13. [Testing Bootstrap](#13-testing-bootstrap)
14. [GitHub Bootstrap](#14-github-bootstrap)
15. [Scripts Catalog](#15-scripts-catalog)
16. [Developer Onboarding](#16-developer-onboarding)
17. [Verification Checklist](#17-verification-checklist)
18. [Bootstrap Folder Tree](#18-bootstrap-folder-tree)
19. [Architecture Guardrails](#19-architecture-guardrails)
20. [Definition of Bootstrap Complete](#20-definition-of-bootstrap-complete)

---

## 1. Bootstrap Philosophy

This repository is built using an **Infrastructure-First** approach. Before implementing product features (such as Authentication or Dashboards), the core development workflow is bootstrapped and verified.

### Why Isolate the Bootstrap Phase?
* **Zero Configuration Drift:** Prevents developers from adding arbitrary configs, lint bypasses, or conflicting dev tools.
* **Hermetic Builds:** Ensures that builds run identical compilers, lint parameters, and testing pipelines across local, containerized, and CI environments.
* **Deterministic Scaling:** Creates clean extension points for subsequent developer feature work.

---

## 2. Development Environment

To ensure consistency across the development team, the environment is pinned to the following core engines:

* **Node.js:** `v22.11.0` (LTS Active)
* **pnpm:** `v9.12.2`
* **TypeScript:** `v5.4.5`
* **OS Target:** POSIX compliance (macOS, Linux, or Windows WSL2).
* **Git Config:** Line endings are pinned to LF via root `.gitattributes` to prevent cross-OS code churn:
  `* text=auto eol=lf`

---

## 3. Repository Initialization

The repository is initialized step-by-step from an empty directory using the following sequence:

```bash
# 1. Initialize Git and Package Manager
git init
pnpm init

# 2. Setup Monorepo Workspace Structure
mkdir apps packages configs scripts docker .github
mkdir apps/web apps/api
mkdir packages/types packages/ui packages/api-client packages/design-tokens

# 3. Create Shared Workspaces Configuration Files
touch pnpm-workspace.yaml
touch configs/.eslintrc.json configs/tsconfig.settings.json configs/prettier.config.js
touch .gitignore .npmrc .editorconfig

# 4. Initialize Sub-Applications
cd apps/web && pnpm init && cd ../..
cd apps/api && pnpm init && cd ../..

# 5. Link Configuration Packages and Run Local Installation
pnpm install
```

---

## 4. Workspace Configuration

Monorepo paths are configured using `pnpm-workspace.yaml`:

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

### Workspace Dependency Rules
* **No Direct App-to-App Dependencies:** `apps/web` must never list `apps/api` inside its local `package.json` file.
* **Shared-to-Shared Import Rules:** Packages under `/packages` can reference other configurations (e.g. `@placementos/tsconfig`) but cannot import application-level features.

---

## 5. Root package.json

Coordinates the monorepo workspace dependencies, scripts, and runtime engines:

```json
{
  "name": "placement-os-monorepo",
  "version": "1.0.0",
  "private": true,
  "engines": {
    "node": ">=22.11.0",
    "pnpm": ">=9.12.2"
  },
  "packageManager": "pnpm@9.12.2",
  "scripts": {
    "dev": "pnpm --filter \"@placementos/*\" run dev --parallel",
    "build": "pnpm --filter \"@placementos/*\" run build",
    "test": "pnpm --filter \"@placementos/*\" run test",
    "lint": "pnpm --filter \"@placementos/*\" run lint",
    "format": "prettier --write \"**/*.{ts,tsx,js,json,md}\"",
    "typecheck": "pnpm --filter \"@placementos/*\" run typecheck",
    "db:migrate": "pnpm --filter api run db:migrate",
    "db:seed": "pnpm --filter api run db:seed",
    "db:reset": "pnpm --filter api run db:reset",
    "docker:up": "docker compose -f docker/development/docker-compose.yml up -d",
    "docker:down": "docker compose -f docker/development/docker-compose.yml down",
    "clean": "pnpm -r exec rm -rf node_modules dist .turbo"
  },
  "devDependencies": {
    "prettier": "^3.2.5",
    "typescript": "^5.4.5"
  }
}
```

---

## 6. Shared Configurations

Config files are shared across workspaces to prevent configuration drift:

* **TypeScript (`configs/tsconfig.settings.json`):** Defines strict mode parameters and compilation outputs:
  ```json
  {
    "compilerOptions": {
      "target": "ES2022",
      "module": "NodeNext",
      "moduleResolution": "NodeNext",
      "strict": true,
      "noImplicitAny": true,
      "strictNullChecks": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true
    }
  }
  ```
* **Linting (`configs/.eslintrc.json`):** Sets up standard code rules and import limits:
  ```json
  {
    "root": true,
    "parser": "@typescript-eslint/parser",
    "plugins": ["@typescript-eslint"],
    "extends": [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended"
    ]
  }
  ```
* **Formatting (`configs/prettier.config.js`):** Defines spacing and formatting parameters:
  `module.exports = { semi: true, singleQuote: false, tabWidth: 2, trailingComma: "none", endOfLine: "lf" };`

---

## 7. Environment Files

Standardizes configurations across development, testing, and production environments:

### Environment Schema Spec (.env.example)
```ini
# Database Connection Settings
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/placementos?schema=public"

# Session Security Configuration
JWT_SECRET="generate-a-secure-random-32-character-secret"

# Express API Port
PORT=4000

# Client Configuration
CLIENT_URL="http://localhost:5173"
```

### Environment Settings

| Variable Name | Dev Value | Test Value | Production Source |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://.../placementos` | `postgresql://.../test_db` | Cloud DB secret key |
| `JWT_SECRET` | `dev-local-secret-32-chars-long`| `test-secret-32-chars-long` | Server host vault key |
| `PORT` | `4000` | `4001` | Server host config parameter |
| `CLIENT_URL` | `http://localhost:5173` | `http://localhost:5173` | Production client domains |

---

## 8. Docker Bootstrap

Coordinates services, database runtimes, and local networking:

### Development Compose (`docker/development/docker-compose.yml`)
```yaml
version: '3.8'

services:
  database:
    image: postgres:16-alpine
    container_name: placementos-postgres-dev
    environment:
      POSTGRES_DB: placementos
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - placementos-net

  pgadmin:
    image: dpage/pgadmin4
    container_name: placementos-pgadmin-dev
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@placementos.local
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - database
    networks:
      - placementos-net

volumes:
  pgdata:
    driver: local

networks:
  placementos-net:
    driver: bridge
```

---

## 9. Database Bootstrap

* **Prisma Schema Location:** Rooted under `apps/api/prisma/schema.prisma`.
* **Prisma Initialization Command:**
  `npx prisma init --datasource-provider postgresql`
* **Migration Command:**
  `npx prisma migrate dev --name init_database_tables`
* **Seed Config:** Coordinates reference files via `apps/api/prisma/seed.ts`. Seeding runs inside transactional blocks to ensure it remains idempotent.

---

## 10. Logging Bootstrap

* **Logger Engine:** Pino is installed in `apps/api` and wrapped in a core logging utility:
  ```typescript
  import pino from "pino";
  export const logger = pino({
    level: process.env.LOG_LEVEL || "info",
    timestamp: pino.stdTimeFunctions.isoTime
  });
  ```
* **Pretty Logging:** Uses `pino-pretty` to format logs during development. Production builds output raw, structured JSON logs.
* **Correlation IDs:** Middleware injects `x-correlation-id` into header logs to trace requests across the system.

---

## 11. Shared Tooling

* **Path Aliases:** Configured inside app compilation settings files:
  ```json
  // apps/web/tsconfig.json
  {
    "compilerOptions": {
      "baseUrl": ".",
      "paths": {
        "@components/*": ["src/components/*"],
        "@domains/*": ["src/domains/*"]
      }
    }
  }
  ```
* **Build Targets:** The compiler compiles TypeScript files to static ES2022 configurations under `/dist` directories.

---

## 12. Code Quality Pipeline

* **Pre-commit Hooks:** Configured using Husky. Commits run checks on modified files before they are accepted:
  ```bash
  # .husky/pre-commit
  npx lint-staged
  ```
* **Lint-Staged Setup:** Configured in `package.json` to only run checks on modified files:
  ```json
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
  ```
* **CI Validation:** Pipelines compile code, run tests, and confirm that lint checks pass on every Pull Request.

---

## 13. Testing Bootstrap

* **Frontend Unit Tests:** Built using Vitest and React Testing Library.
* **Backend Integration Tests:** Powered by Vitest and Supertest to verify routes and responses:
  ```typescript
  import request from "supertest";
  // Sample route validation test
  ```
* **E2E Tests:** Set up inside `/apps/web/tests/e2e` using Playwright.
* **Test Configurations:** Test config files (`vitest.config.ts`, `playwright.config.ts`) extend base configurations from the shared configurations directory.

---

## 14. GitHub Bootstrap

* **Issue Templates:** Configured in `.github/issue_template/` using YAML schema formats.
* **PR Templates:** Saved at `.github/pull_request_template.md` to format PR descriptions:
  ```markdown
  ## Changes Details
  - [ ] Lint checks passed
  - [ ] Test coverage verified
  ```
* **Branch Protection Policies:** Branch checks run automatically on pull requests to the `main` branch.

---

## 15. Scripts Catalog

Standard scripts are configured to automate common development tasks:

* `pnpm run dev`: Launches the client application and API server in parallel development mode.
* `pnpm run build`: Compiles all packages and apps into target `/dist` outputs.
* `pnpm run lint`: Checks for linting errors across the codebase.
* `pnpm run format`: Formats all files to match styles defined in Prettier config files.
* `pnpm run typecheck`: Runs TypeScript compiler diagnostics across all workspaces.
* `pnpm run db:migrate`: Applies migrations to the local PostgreSQL database.
* `pnpm run db:seed`: seeds the local database with reference data.
* `pnpm run db:reset`: Resets the local database, applies migrations, and seeds references.
* `pnpm run docker:up`: Starts development database and pgAdmin containers.
* `pnpm run docker:down`: Stops local Docker database containers.
* `pnpm run clean`: Deletes `node_modules` and compiled build folders.

---

## 16. Developer Onboarding

Onboarding and setting up the development workspace follows a standardized workflow:

```
[Clone Repository] ──► [Run pnpm install] ──► [Run pnpm run docker:up]
                                                    │
[Run pnpm run dev] ◄── [Run pnpm run db:reset] ◄────┘
```

1. **Clone Repository:** Clone the repository locally.
2. **Install Dependencies:** Run `pnpm install` to set up workspace dependencies.
3. **Start Database:** Run `pnpm run docker:up` to spin up your local database container.
4. **Reset Database:** Run `pnpm run db:reset` to apply migrations and seed data.
5. **Start Servers:** Launch the application locally by running `pnpm run dev`.

---

## 17. Verification Checklist

Verify the repository is healthy before beginning feature development by running these checks:

- [ ] **Dependency Install:** Run `pnpm install` to verify packages install successfully.
- [ ] **TypeScript Compile:** Run `pnpm run typecheck` to confirm there are no compiler errors.
- [ ] **Lint Checks:** Run `pnpm run lint` to verify that lint checks pass.
- [ ] **Database Setup:** Confirm local PostgreSQL migrations apply successfully.
- [ ] **Build Check:** Run `pnpm run build` to confirm output files compile.

---

## 18. Bootstrap Folder Tree

The directory layout below shows all boilerplate and infrastructure files:

```text
/
├── .github/
│   ├── workflows/
│   │   └── ci.yml
│   └── pull_request_template.md
├── configs/
│   ├── .eslintrc.json
│   ├── prettier.config.js
│   └── tsconfig.settings.json
├── docker/
│   └── development/
│       └── docker-compose.yml
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── routes/
│   │   │   │   └── main.tsx
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   └── index.css
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── api/
│       ├── src/
│       │   ├── middlewares/
│       │   ├── shared/
│       │   ├── config/
│       │   └── server.ts
│       ├── prisma/
│       │   └── schema.prisma
│       ├── tsconfig.json
│       └── package.json
├── packages/
│   ├── types/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── ui/
│       ├── package.json
│       └── tsconfig.json
├── .editorconfig
├── .gitignore
├── .npmrc
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

---

## 19. Architecture Guardrails

* **Explicit Imports:** Avoid importing local types from application directories into shared packages.
* **No Direct Schema Updates:** Database schema changes must run through migration scripts; direct database edits are prohibited.
* **Required Input Validation:** All API routes must define and run Zod validators before calling controller methods.

---

## 20. Definition of Bootstrap Complete

The bootstrap phase is complete and ready for feature implementation when:

- [ ] **Build Completes:** Code compile runs successfully with zero errors.
- [ ] **Tests Pass:** Pre-commit checks and test runners pass locally.
- [ ] **Database Ready:** PostgreSQL migrations apply and seed data loads.
- [ ] **Lint Status Clean:** Verification checks run with zero formatting or lint warnings.

---
*End of Repository Bootstrap Specification.*
