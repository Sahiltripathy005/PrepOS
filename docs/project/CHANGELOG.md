# Changelog: PlacementOS

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0-alpha] - 2026-07-14

### Added
- **Repository Architecture (v1.0):** Established locked design system specifications, API structures, database models, and repository mappings.
- **Shared Foundation (@placementos/types):** Common TypeScript types, data pagination standards, audit configurations, and client abstractions.
- **Database Engine (Prisma):** Multi-tenant transactional framework, soft-delete hooks, and performance logging interceptors.
- **API Runtime (@placementos/api):** Security hardening middleware, rate-limiting handlers, cursor-based pagination, and S3/local file uploading tools.
- **UI Platform (@placementos/ui):** Dynamic theme-engine (Light, Dark, System preferences), accessible icon registry, grid layout slots (AppShell, SplitView), and custom theme selectors.
- **Verification Environment:** Interactive showcase layout, query-client integrations, and validation testing suites.

---

## [0.1.0-planning] - 2026-06-25

### Added
- **Architecture Blueprints:** Set of specifications under `docs/architecture/v1.0/` defining database schemas, auth protocols, and system guidelines.
- **Milestone Backlog:** Engineering roadmap planning.
