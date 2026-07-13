# Repository Overview: PlacementOS

A guide to the monorepo structure, folder organization, and design layers.

---

## 📁 Monorepo Workspace Directory Tree

```
PlacementOS/
├── apps/
│   ├── api/            # Express Backend REST API
│   └── web/            # Vite + React Frontend Application
├── packages/
│   ├── api-client/     # Axios-based REST Client bindings
│   ├── design-tokens/  # Standard UI tokens (spacing, typography, animations)
│   ├── types/          # Shared TypeScript type definitions
│   └── ui/             # Reusable UI component library (BaseButton, AppShell, etc.)
├── configs/
│   ├── tsconfig.settings.json   # Common TypeScript settings
│   └── .eslintrc.json           # Common ESLint configurations
├── docker/
│   └── docker-compose.yml       # Local database & redis infrastructure setup
└── scripts/
    └── database-seed.ts         # Seeding configurations
```

---

## 🎯 Purpose of Workspace Folder Layers

### 1. `apps/`
* **`api/`:** Standard Express bootstrap. Responsible for database connections, routing, request validation, authentication checks, and transactional business logic.
* **`web/`:** Client-facing web app built with React, Vite, and React Query. Connects to backend services via `@placementos/api-client`.

### 2. `packages/`
* **`types/`:** Shared database schemas, API query structures, validation models, and response formats.
* **`design-tokens/`:** Constant values mapping color palettes, spacing metrics (4px baseline), and animation configurations.
* **`ui/`:** Visual foundation library. Provides layouts, buttons, forms, and alerts using CSS variables. Doesn't hold any business domain logic.
* **`api-client/`:** Auto-resolves endpoints, serializes payloads, and provides API connectors to the React UI views.

### 3. `configs/`
* Houses shared rules for compilers and quality checkers (TypeScript, ESLint) to ensure code consistency across all packages.
