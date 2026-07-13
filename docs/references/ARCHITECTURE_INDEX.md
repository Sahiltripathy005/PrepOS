# Architecture Index: v1.0 (Frozen)

This document is the index of all frozen v1.0 system architecture blueprints.

---

## 📚 Document Index

### 1. [Software Architecture](file:///d:/Final%20-%20Projects/PrepOS/docs/architecture/v1.0/software_architecture.md)
* **Purpose:** High-level architectural patterns, monorepo workspace configurations, and interaction diagrams.
* **Dependencies:** None
* **When to Read:** At the start of any new project module to understand service integration patterns.
* **Related Documents:** `repository_structure.md`

### 2. [Database Architecture](file:///d:/Final%20-%20Projects/PrepOS/docs/architecture/v1.0/database_architecture.md)
* **Purpose:** Entity-Relationship diagrams, indexing rules, soft-delete operations, and auditing interceptors.
* **Dependencies:** None
* **When to Read:** When designing migrations, repository queries, or adding fields to models.
* **Related Documents:** `software_architecture.md`

### 3. [Design System](file:///d:/Final%20-%20Projects/PrepOS/docs/architecture/v1.0/design_system.md)
* **Purpose:** Spacing specifications, typography tokens, component layouts, and animation details.
* **Dependencies:** None
* **When to Read:** Before developing UI components or styling layouts.
* **Related Documents:** `repository_structure.md`

### 4. [API Specification](file:///d:/Final%20-%20Projects/PrepOS/docs/architecture/v1.0/api_specification.md)
* **Purpose:** REST conventions, serialization rules, structured pagination metrics, and file-upload schemes.
* **Dependencies:** `software_architecture.md`
* **When to Read:** Before implementing routing endpoints or modifying middleware controllers.
* **Related Documents:** `auth_specification.md`

### 5. [Auth Specification](file:///d:/Final%20-%20Projects/PrepOS/docs/architecture/v1.0/auth_specification.md)
* **Purpose:** JWT protocols, token lifetimes, role guards, and browser cookie parameters.
* **Dependencies:** `api_specification.md`
* **When to Read:** Before modifying session verification middleware.
* **Related Documents:** `auth_tdd.md`

### 6. [Auth TDD](file:///d:/Final%20-%20Projects/PrepOS/docs/architecture/v1.0/auth_tdd.md)
* **Purpose:** Test-Driven Development scenarios, login validations, and session expiration assertions.
* **Dependencies:** `auth_specification.md`
* **When to Read:** When configuring or updating tests for authorization handlers.
* **Related Documents:** `auth_specification.md`

### 7. [Bootstrap Specification](file:///d:/Final%20-%20Projects/PrepOS/docs/architecture/v1.0/bootstrap_specification.md)
* **Purpose:** Step-by-step guidelines for initializing repositories, packages, tools, and testing systems.
* **Dependencies:** `software_architecture.md`
* **When to Read:** When onboarding to build core components.
* **Related Documents:** `engineering_handbook.md`

### 8. [Engineering Handbook](file:///d:/Final%20-%20Projects/PrepOS/docs/architecture/v1.0/engineering_handbook.md)
* **Purpose:** Development guidelines, code organization standards, and deployment pipelines.
* **Dependencies:** None
* **When to Read:** Daily reference for coding patterns and workspace setup.
* **Related Documents:** `engineering_backlog.md`

### 9. [Engineering Backlog](file:///d:/Final%20-%20Projects/PrepOS/docs/architecture/v1.0/engineering_backlog.md)
* **Purpose:** Detailed milestones, sprint allocations, and task ids.
* **Dependencies:** `prd_product_foundation.md`
* **When to Read:** When planning new feature sprints.
* **Related Documents:** `engineering_handbook.md`

### 10. [PRD Product Foundation](file:///d:/Final%20-%20Projects/PrepOS/docs/architecture/v1.0/prd_product_foundation.md)
* **Purpose:** Core objectives, target users, modules (Practice, CRM, Analytics, Revision), and business requirements.
* **Dependencies:** None
* **When to Read:** To understand the product strategy, features, and context.
* **Related Documents:** `engineering_backlog.md`

### 11. [Repository Structure](file:///d:/Final%20-%20Projects/PrepOS/docs/architecture/v1.0/repository_structure.md)
* **Purpose:** Detailed workspace configuration, file names, import/export mappings, and packaging formats.
* **Dependencies:** `software_architecture.md`
* **When to Read:** When structuring new shared folders or apps.
* **Related Documents:** `software_architecture.md`

### 12. [RFC Library](file:///d:/Final%20-%20Projects/PrepOS/docs/architecture/v1.0/rfc_library.md)
* **Purpose:** Historic design proposals and architectural design records (ADRs).
* **Dependencies:** None
* **When to Read:** To understand why specific infrastructure structures were designed.
* **Related Documents:** `software_architecture.md`
