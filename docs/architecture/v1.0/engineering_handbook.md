# PlacementOS: Engineering Standards & Development Handbook
**Document Version:** 1.0.0  
**Status:** Approved  
**Author:** Principal Engineer & Staff Software Architect  

---

## Table of Contents
1. [Repository Standards](#1-repository-standards)
2. [TypeScript Standards](#2-typescript-standards)
3. [React Standards](#3-react-standards)
4. [Express Standards](#4-express-standards)
5. [Prisma Standards](#5-prisma-standards)
6. [Git Standards](#6-git-standards)
7. [Documentation Standards](#7-documentation-standards)
8. [Testing Standards](#8-testing-standards)
9. [Logging Standards](#9-logging-standards)
10. [Security Standards](#10-security-standards)
11. [Performance Standards](#11-performance-standards)
12. [Error Handling Standards](#12-error-handling-standards)
13. [Code Review Checklist](#13-code-review-checklist)
14. [Definition of Done](#14-definition-of-done)
15. [Repository Folder Structure](#15-repository-folder-structure)
16. [Coding Anti-Patterns (100 Rules)](#16-coding-anti-patterns-100-rules)
17. [Engineering Principles](#17-engineering-principles)
18. [Future Contributor Guide](#18-future-contributor-guide)
19. [Architecture Guardrails](#19-architecture-guardrails)
20. [Summary (One-Page Engineering Handout)](#20-summary-one-page-engineering-handout)

---

## 1. Repository Standards

* **Folder Organization:** Feature-first structure. Files belonging to a domain module (e.g. `PracticeLog`) must live together under `/domains/practice`. Sharing across modules is only permitted via shared folder paths.
* **Naming System:**
  * Directories: `kebab-case` (e.g., `practice-log`).
  * React Component Files: `PascalCase` (e.g., `AttemptCard.tsx`).
  * TypeScript Code Files: `camelCase` (e.g., `usePracticeAttempt.ts`).
* **Import Rules:** 
  * Avoid relative imports (`../../../../components/Button`).
  * Enforce path aliases (e.g., `@components/*` or `@practice/*`) defined in `tsconfig.json`.
* **Export Rules:** 
  * Export components as named exports rather than default exports.
  * *Reasoning:* Named exports prevent name mismatches during imports and simplify refactoring in code editors.
* **Dependency Controls:**
  * Zero cross-domain direct imports.
  * Communication between domain features is restricted to shared services.

---

## 2. TypeScript Standards

TypeScript is configured in strict mode. All types must be defined explicitly:

```typescript
// Strict type assertion rules:
export type AttemptStatus = 'PASS' | 'FAIL' | 'OPTIMIZED';

export interface IPracticeAttempt {
  readonly id: string;
  readonly userId: string;
  readonly durationSeconds: number;
  readonly status: AttemptStatus;
}
```

* **Never Use `any`:** Code changes containing `any` will fail automated lint checks. If a type is unknown, developers must use `unknown` and implement type guard checks.
* **Use `readonly`:** Declare interface fields as `readonly` by default to prevent accidental data changes in helper methods.
* **Avoid Enums:** Use Union types (`'PASS' | 'FAIL'`) instead of TypeScript enums.
  * *Reasoning:* TypeScript enums compile to bloated helper functions in the JavaScript bundle, whereas union types compile to native primitives.

---

## 3. React Standards

* **Component Structure:** Keep components focused on a single task. If a component exceeds 150 lines, split it into smaller sub-components.
* **Data Fetching:** Fetching data inside components using `useEffect` is forbidden. Components read data through custom hooks powered by TanStack Query.
* **State Management:** Keep state local to the component whenever possible. Use Zustand stores for global layout variables (e.g., sidebar collapse state, current theme settings).
* **Memoization Strategy:**
  * Do not wrap every variable in `useMemo` or `useCallback`.
  * *Rules for useMemo:* Only use `useMemo` for high-overhead calculations (e.g., compiling analytics tables) or when passing objects as array keys in dependency charts.
* **Error Boundaries:** Wrap domain pages in dedicated React Error Boundaries, preventing single-component rendering crashes from breaking the entire application.

---

## 4. Express Standards

Express layers enforce separation of concerns across the request lifecycle:

```
[Route Handler] ──► [Zod Middleware Validator] ──► [Controller Layer] ──► [Service Layer] ──► [Repository Layer]
```

* **Controllers:** Extract request parameters, validate session tokens, and route calls to the appropriate service. Do not write business logic in controllers.
* **Services:** Coordinate business logic and call repository methods. Services do not interact with the database directly.
* **Repositories:** Manage database operations using Prisma.
* **Validation Middleware:** Validate request bodies using Zod schemas before routing to controller methods.
* **Transactions:** Database updates affecting multiple tables must run inside Prisma transactional blocks (`$transaction`), ensuring updates succeed or fail as a single unit.

---

## 5. Prisma Standards

* **Naming Conventions:** Use camelCase for schema field names and PascalCase for model structures. Map model names to snake_case database tables:
  ```prisma
  model JobApplication {
    id        String   @id @default(uuid())
    userId    String
    createdAt DateTime @default(now())

    @@map("job_applications")
  }
  ```
* **Explicit Indexes:** Define indexes explicitly for columns that are queried frequently (e.g. `@@index([userId, currentStage])`).
* **Seeds:** Seed scripts must remain idempotent. Running `npm run db:seed` should refresh default reference values without creating duplicate records.
* **Migrations:** Avoid editing migration files manually. Any manual database edits must be scripted in SQL within a migration directory to prevent schema drift.

---

## 6. Git Standards

* **Branch Naming:**
  * Feature branch: `feat/[domain-name]/[short-description]` (e.g., `feat/practice/add-attempt-log`).
  * Bugfix branch: `fix/[domain-name]/[bug-description]`.
* **Commit Conventions (Conventional Commits):**
  * Format: `[type]([scope]): [short description]`
  * *Examples:* `feat(practice): add duration tracking validations`, `fix(auth): update refresh token rotation limits`.
* **Merge Strategy:** Merge branches using the squash-and-merge method. This keeps the main commit history clean and easy to read.
* **Release Tagging:** Tag releases using Semantic Versioning (SemVer): `v[Major].[Minor].[Patch]` (e.g. `v1.0.2`).

---

## 7. Documentation Standards

* **Comments:** Write code comments only to explain *why* a complex logic block was written, not *what* the code does. Code structure should be self-explanatory.
* **Decisions Log (ADR):** Document major technical changes as Architecture Decision Records (ADRs) under `/docs/adr/`.
* **Architecture Sync:** Keep system documents updated when adding new domains to the codebase.
* **README files:** Every sub-folder must contain a `README.md` file explaining the folder's purpose, files list, and interface boundaries.

---

## 8. Testing Standards

* **Unit Testing:** Write unit tests for business utilities, data validation functions, and calculations. Aim for a minimum of 80% coverage on these files.
* **Integration Testing:** Test domain services by mocking database operations to verify that state updates execute correctly.
* **E2E Testing:** Write E2E tests for core user paths (e.g. Login -> Solving a Problem -> Verifying the Analytics update).
* **Test File Placement:** Group test files next to the code files they test, naming files with a `.test.ts` suffix.

---

## 9. Logging Standards

* **Logger Engine:** Use Pino for backend logging.
* **Levels:**
  * `info`: Log system events (e.g., server starts, completed migrations).
  * `warn`: Log minor issues (e.g., token refresh failures, validation warnings).
  * `error`: Log system exceptions, including call stacks.
* **Correlation IDs:** Attach a unique `x-correlation-id` to every request. This ID is passed to downstream services and logged with every event to make debugging easier.
* **Security Logs:** Do not log sensitive user data (e.g., passwords, credentials, JWT values).

---

## 10. Security Standards

* **Password Security:** Hash passwords using `bcrypt` with a minimum cost factor of 10.
* **Token Lifecycles:**
  * Access Tokens: Valid for 2 hours.
  * Refresh Tokens: Valid for 7 days (stored as hashed strings in the database).
* **Headers:** Configure Helmet middleware to block standard vulnerabilities (like Clickjacking and XSS).
* **CORS Limits:** Block requests from non-local ports during development.
* **Secret Management:** Never commit passwords, API keys, or JWT secrets to repository files. Load secrets from environment variables checked by Zod schemas during startup.

---

## 11. Performance Standards

* **React Rendering:**
  * Keep React re-renders to a minimum.
  * Avoid creating inline function definitions in component props, which triggers child component re-renders:
    ```tsx
    // Incorrect:
    <Button onClick={() => handleClick()} />
    // Correct:
    <Button onClick={handleClick} />
    ```
* **Database Queries:** Avoid the N+1 query problem. When fetching related records, query data in single queries using Prisma relations (`include` or `select`).
* **Database Caching:** Cache static parameters (such as problem lists) in memory to reduce database query load.

---

## 12. Error Handling Standards

* **Custom Exception Class:** All errors must extend a base custom error class:
  ```typescript
  export class AppError extends Error {
    constructor(
      public readonly code: string,
      public readonly statusCode: number,
      message: string
    ) {
      super(message);
    }
  }
  ```
* **Target Handlers:**
  * Route validation errors trigger a `VALIDATION_FAILED` (400) code.
  * Database constraint issues (such as foreign key failures) trigger a `DATABASE_ERROR` (500) code.
  * Unhandled exceptions trigger an `INTERNAL_SERVER_ERROR` (500) code.

---

## 13. Code Review Checklist

Reviewers should verify these checkpoints before approving a Pull Request:

- [ ] **TypeScript Strictness:** Verify that no types default to `any` or use bypass tags.
- [ ] **Architecture Boundaries:** Ensure there are no cross-domain folder imports.
- [ ] **Testing Coverage:** Confirm that new logic utilities include accompanying test files.
- [ ] **Database Integrity:** Verify that migrations do not contain destructive operations.
- [ ] **State Fetching:** Ensure components fetch data using custom hooks rather than inline queries.

---

## 14. Definition of Done

A feature is considered complete when:

- [ ] **Tests Pass:** All unit and integration test files run successfully.
- [ ] **Lint and Build Check:** Compilation runs with zero TypeScript compiler errors.
- [ ] **Migrations Configured:** Prisma schema files and SQL migrations are set up.
- [ ] **API Documented:** OpenAPI files are updated with any new endpoint paths.
- [ ] **Code Approved:** The pull request is approved by at least one Tech Lead.

---

## 15. Repository Folder Structure

PlacementOS is structured as a monorepo containing distinct `/frontend` and `/backend` directories:

```text
/
├── /frontend               # React UI Client application
│   ├── /src
│   │   ├── /components     # Shared UI Primitives
│   │   ├── /domains        # Domain Feature Modules
│   │   ├── /hooks          # Shared Hooks
│   │   └── main.tsx
│   ├── vite.config.ts
│   └── tsconfig.json
├── /backend                # Express API application
│   ├── /src
│   │   ├── /domains        # Domain Logic Modules
│   │   ├── /middlewares    # Express Middlewares
│   │   └── server.ts
│   ├── /prisma
│   │   └── schema.prisma
│   └── tsconfig.json
├── package.json            # Monorepo configuration file
└── README.md
```

---

## 16. Coding Anti-Patterns (100 Rules)

### General Code Quality (1–15)
1. **Never use magic numbers:** Define numbers as constants (e.g., `const REVISION_INTERVAL_DAYS = 3`).
2. **Never duplicate business logic:** Consolidate repeat logic inside helper functions.
3. **Never write functions longer than 30 lines:** Break long functions into smaller, focused utilities.
4. **Never comment out unused code:** Delete unused code; version history is tracked by Git.
5. **Never commit console logs:** Use Pino logger inside feature modules instead of `console.log`.
6. **Never leave TODO comments in production code:** Track pending tasks in your project planning system.
7. **Never name variables with single characters:** Use descriptive names (e.g., `index` instead of `i`).
8. **Never nestedternary operators:** Use clean if-else statements or switch blocks.
9. **Never write classes without a single responsibility:** Do not create "god classes."
10. **Never mix formatting styles:** Enforce code formatting using Prettier.
11. **Never run code without error catching:** Wrap unsafe operations in try-catch blocks.
12. **Never use global mutable variables:** Enforce state isolation across modules.
13. **Never use structural type casting blindly:** Avoid casting types using `as` assertions.
14. **Never write circular dependencies:** Ensure import paths follow a clean, unidirectional flow.
15. **Never import code from testing folders into production files:** Keep test utilities isolated.

### TypeScript Strictness (16–30)
16. **Never use `any`:** Code changes containing `any` will fail automated lint checks.
17. **Never disable TypeScript strict mode:** Keep strict compiler options active.
18. **Never use `ts-ignore` comments:** Fix typing errors instead of silencing the compiler.
19. **Never use `as unknown as T` casting:** Declare explicit type conversions.
20. **Never declare functions without typing their return values:** Typings must be explicit.
21. **Never export types that are only used internally:** Keep interface scopes local.
22. **Never define duplicate interfaces:** Reuse shared models instead of recreating them.
23. **Never use implicit type conversions:** Write explicit conversions (e.g., use `Number(str)` instead of `+str`).
24. **Never default to null values for optional properties:** Use `undefined` for optional properties.
25. **Never use string indexers on strict structures:** Define property maps instead of using `Record<string, string>`.
26. **Never write types without validation schemas:** Match type definitions with corresponding Zod schemas.
27. **Never mutate readonly configurations:** Keep configuration objects frozen.
28. **Never reference ambient global variables without typing them:** Ensure global declarations are typed.
29. **Never use namespaces:** Use standard ES Modules for namespaces.
30. **Never bypass compiler warnings:** Address compiler warnings before building.

### React Rendering & State (31–45)
31. **Never fetch data inside component effects:** Use custom hooks powered by TanStack Query.
32. **Never mutate props inside child components:** Keep props immutable.
33. **Never use index values as keys in loops:** Use unique database IDs as keys.
34. **Never build components exceeding 150 lines:** Split complex UI views into smaller sub-components.
35. **Never write inline arrow functions in component props:** Pass referentially stable functions.
36. **Never store derived state in React state hooks:** Calculate values dynamically on render.
37. **Never use Context for high-frequency state updates:** Use Zustand stores instead.
38. **Never pass state down more than three component levels:** Use component composition or state stores.
39. **Never mix presentation components with business logic:** Keep presentational primitives clean.
40. **Never define components inside other components:** Declare components in isolation.
41. **Never leave DOM elements unclosed:** Ensure HTML rendering is valid.
42. **Never use raw style properties:** Use design system classes or tailwind tokens.
43. **Never initialize state with unvalidated props:** Validate props before seeding state.
44. **Never reference DOM nodes directly:** Use React `useRef` hooks instead of `document.getElementById`.
45. **Never use dangerouslySetInnerHTML without sanitizing:** Sanitize html inputs to prevent XSS.

### Express API Layer (46–60)
46. **Never query databases directly inside controllers:** Route requests through services.
47. **Never return raw database errors to clients:** Map exceptions to custom API error objects.
48. **Never route requests without validating payloads:** Run Zod schemas inside middleware routes.
49. **Never bypass JWT signature checks on private routes:** Validate sessions.
50. **Never hardcode HTTP response status codes:** Reference standard constants (e.g., `HttpStatus.OK`).
51. **Never write route logic without correlation IDs:** Trace requests using middleware IDs.
52. **Never configure route handlers without error middleware:** Route errors using `next(error)`.
53. **Never set CORS properties to wildcard values:** Define explicit allowed origins.
54. **Never save session tokens in local memory:** Use JWT tokens.
55. **Never run database updates without transactions:** Wrap multi-row updates in transactional blocks.
56. **Never block the event loop with synchronous calls:** Use asynchronous methods (e.g., use `fs.promises` instead of `fs.readFileSync`).
57. **Never run controllers without logging request metadata:** Log incoming calls.
58. **Never return HTML payloads from REST endpoints:** Return JSON responses.
59. **Never configure route files manually:** Use automated route loaders or standard module exports.
60. **Never pass raw passwords in service logs:** Filter sensitive properties.

### Database & Prisma (61–75)
61. **Never write raw SQL queries inside repositories:** Use Prisma methods instead.
62. **Never commit schema changes without migration scripts:** Run migration scripts for database changes.
63. **Never reference tables without explicit foreign keys:** Enforce integrity.
64. **Never query tables without checking deletedAt fields:** Filter out soft-deleted records.
65. **Never run database migrations against production directly:** Run tests on dry-run instances first.
66. **Never load full tables into memory:** Use offset or cursor pagination.
67. **Never index columns with low data variety:** Optimize index performance.
68. **Never use database triggers for business logic:** Keep business logic inside service layers.
69. **Never create migrations that rename tables directly:** Create new tables and copy data to prevent downtime.
70. **Never close database connection pools on every request:** Reuse pools.
71. **Never hardcode database URLs:** Load configurations from environment variables.
72. **Never use circular relationships in database models:** Simplify schemas.
73. **Never bypass foreign key constraints in tests:** Run tests against validated databases.
74. **Never seed production with test profiles:** Keep production databases clean.
75. **Never leave connection errors unhandled:** Log connection errors.

### Testing & Verification (76–85)
76. **Never write code without unit tests:** Test helper functions.
77. **Never use real database connections in unit tests:** Mock repository layers.
78. **Never assert test cases with vague checks:** Avoid generic checks like `expect(true).toBe(true)`.
79. **Never check in failing tests to the repository:** Ensure all tests pass.
80. **Never use arbitrary timeouts in E2E tests:** Wait for elements to load.
81. **Never share state across test suites:** Reset mocks before running tests.
82. **Never mock everything in integration tests:** Test component integrations.
83. **Never bypass lint checks in pull requests:** Run tests during automated checks.
84. **Never ignore test coverage reports:** Maintain test coverage.
85. **Never skip writing tests for edge cases:** Verify error handling code paths.

### Security & Compliance (86–95)
86. **Never store passwords in plain text:** Hash passwords using `bcrypt`.
87. **Never expose database IDs in client URLs:** Use secure UUID v4 tokens.
88. **Never commit API keys to repositories:** Use environment variables.
89. **Never skip validating JWT expiration claims:** Verify expiration dates.
90. **Never return full stack trace details to client calls:** Hide exception details.
91. **Never trust user inputs without sanitization:** Validate inputs to prevent SQL Injection.
92. **Never store refresh tokens without hashing them:** Secure tokens.
93. **Never use outdated dependencies:** Keep dependencies updated.
94. **Never deploy services without security headers:** Use Helmet middleware.
95. **Never skip rate limiting on auth endpoints:** Protect login routes from brute force attacks.

### Git & DevOps (96–100)
96. **Never merge code without reviewer approvals:** Require approvals.
97. **Never commit code changes to main branches directly:** Use pull requests.
98. **Never push commits with generic names:** Write clear commit messages.
99. **Never leave branches open without merging them:** Clean up merged branches.
100. **Never tag releases without matching changelogs:** Document release notes.

---

## 17. Engineering Principles

* **Consistency over Preference:** Follow the repository's coding style guidelines even if you prefer a different formatting approach.
* **Keep Code Simple:** Write simple, readable code rather than overly complex solutions.
* **Design for Easy Replacement:** Structure modules so they can be replaced or rewritten without affecting other parts of the application.
* **Evidence-Based Metrics:** UI progress indicators must map to verifiable database logs rather than estimated values.

---

## 18. Future Contributor Guide

### 1. Environment Setup
1. Clone the repository and install dependencies using npm:
   ```bash
   npm install
   ```
2. Copy the sample environment file and configure your database settings:
   ```bash
   cp .env.example .env
   ```
3. Run the migrations to set up your local database:
   ```bash
   npx prisma migrate dev
   ```
4. Start the frontend client and backend API servers:
   ```bash
   npm run dev
   ```

### 2. Adding a New Feature
1. **Define Schema:** Update the Prisma schema and run migrations.
2. **Create Repository:** Add database queries within the domain's repository folder.
3. **Build Service:** Implement business logic in the service layer.
4. **Expose Endpoints:** Add routes and controller methods, validating inputs using Zod.
5. **Create UI Components:** Connect frontend components to the new endpoints using custom hooks.

---

## 19. Architecture Guardrails

* **Strict Unidirectional Flow:** Code communication must flow in one direction:
  `UI Component ➔ Custom Hook ➔ API Route ➔ Controller ➔ Service ➔ Repository ➔ Database`
* **Zero Cross-Domain Database Joins:** Do not write database joins across different domain tables. Fetch data from each domain separately and combine them in the service layer.
* **Required Path Validation:** All routes must validate request inputs using Zod before calling controller methods.

---

## 20. Summary (One-Page Engineering Handout)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      PlacementOS Engineering Handbook                    │
├──────────────────────────────────────────────────────────────────────────┤
│ Stack: React 19 • Vite • TS • Tailwind v4 • Node • Express • Prisma • PG │
│ Coding Flow: Controller ➔ Service ➔ Repository ➔ Prisma ➔ Postgres       │
│ Git Flow: feat/domain/detail • Squash & Merge • Conventional Commits     │
├──────────────────────────────────────────────────────────────────────────┤
│                         KEY REPOSITORY RULES                             │
│ 1. No `any` or `ts-ignore` allowed. TS must run in strict mode.          │
│ 2. Do not write inline fetch queries in components; use TanStack Query.  │
│ 3. All endpoint routes must validate inputs using Zod schemas.           │
│ 4. Wrap database updates affecting multiple tables in transactions.      │
│ 5. Feature code must live under its respective `/domains` folder.        │
│ 6. Verify that no credentials or secrets are committed to the repo.      │
└──────────────────────────────────────────────────────────────────────────┘
```

---
*End of Engineering Standards & Development Handbook.*
