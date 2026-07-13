# Contributing Guide: PlacementOS

Welcome! This document outlines coding standards, commit structures, and testing criteria to maintain the highest code quality.

---

## 🛠️ Repository Setup

### Prerequisites
* **Node.js:** v20+
* **pnpm:** v9+

### Initial Setup
```bash
# Install all dependencies across workspaces
pnpm install

# Run database migrations and generate schema
pnpm --filter @placementos/api run prisma:generate

# Build the workspaces
pnpm run build

# Verify all unit tests pass
pnpm run test
```

---

## 💅 Coding Standards

1. **Strict TypeScript:**
   * Never use `any`. Always specify types or interface properties.
   * Avoid disabling compiler flags like `strictNullChecks` or `noImplicitAny`.
2. **ESLint & Prettier:**
   * Code formatting is verified on every build. Run `pnpm run lint` to review quality before committing.
3. **Unused Code:**
   * Avoid unused imports, parameters, or variables.
4. **Preserve Comments:**
   * Maintain existing comments, descriptions, and file annotations.

---

## 📂 Folder Conventions
* **`apps/`:** Applications (e.g. `web` for UI frontend, `api` for Backend server).
* **`packages/`:** Reusable shared workspaces (e.g. `@placementos/ui`, `@placementos/types`).
* **`configs/`:** Shared configurations (e.g. `tsconfig.settings.json`, ESLint rules).

---

## 🔤 Branch & Commit Naming

### Branch Naming
- Features: `feature/AUTH-001-description`
- Bugfixes: `bugfix/issue-description`

### Commit Message Format
We follow Conventional Commits guidelines:
`type(scope): description`
* **feat:** A new feature (e.g. `feat(ui): add BaseSelect component`)
* **fix:** A bug fix (e.g. `fix(api): prevent uncaught exception on file upload`)
* **docs:** Documentation changes (e.g. `docs(roadmap): add v1.1 scope`)
* **chore:** Maintenance tasks (e.g. `chore(deps): upgrade prisma`)

---

## 🏁 Definition of Done (DoD)
A task is considered complete when:
1. **Compilation:** Code compiles with no errors.
2. **Quality:** `pnpm run lint` yields zero warnings or errors.
3. **Tests:** All tests pass successfully.
4. **Build:** `pnpm run build` runs successfully.
5. **Documentation:** Any changes to APIs, components, or DB schemas are documented.
6. **No Placeholders:** Stub files, hardcoded endpoints, or empty structures are not allowed.
