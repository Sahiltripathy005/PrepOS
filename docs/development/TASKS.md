# Engineering Backlog: PlacementOS

This document logs all engineering tasks in the backlog.

---

## 🚀 Bootstrap (`BOOT`)

### [BOOT-001] Repository Bootstrap
* **Priority:** Critical
- **Dependencies:** None
- **Acceptance Criteria:** pnpm workspace initialized; apps/api, apps/web, and packages structured; configs established.
- **Status:** 🟢 Complete

### [BOOT-002] Shared Foundation
* **Priority:** Critical
- **Dependencies:** BOOT-001
- **Acceptance Criteria:** `@placementos/types` package initialized; standard types for models, API pagination, and audit trails defined.
- **Status:** 🟢 Complete

### [BOOT-003] Database Foundation
* **Priority:** Critical
- **Dependencies:** BOOT-002
- **Acceptance Criteria:** Prisma ORM integrated; migrations created; audit logging interceptors and soft-delete engine ready.
- **Status:** 🟢 Complete

### [BOOT-004] API Foundation
* **Priority:** Critical
- **Dependencies:** BOOT-003
- **Acceptance Criteria:** Express middleware registry, rate limiters, logging, storage, and pagination utilities validated.
- **Status:** 🟢 Complete

### [BOOT-005] Shared UI Foundation
* **Priority:** Critical
- **Dependencies:** BOOT-002
- **Acceptance Criteria:** CSS custom tokens, theme controls, layout slots, standard badges/inputs, and dynamic provider engines running.
- **Status:** 🟢 Complete

---

## 🔒 Authentication (`AUTH`)

### [AUTH-001] JWT Auth & Session Store
* **Priority:** Critical
- **Dependencies:** BOOT-004
- **Acceptance Criteria:**
  - Login and sign-up controller endpoints in `apps/api`.
  - Secure http-only cookie token distribution.
  - Verification tests in API and UI layer.

### [AUTH-002] Roles & Permissions Middleware
* **Priority:** High
- **Dependencies:** AUTH-001
- **Acceptance Criteria:**
  - Guards on routing controllers restricting paths to specific user roles.
  - Forbidden/unauthorized standard responses.

---

## 👤 User Profile Management (`USER`)

### [USER-001] Profile Updates & Settings
* **Priority:** Medium
- **Dependencies:** AUTH-001
- **Acceptance Criteria:**
  - Endpoint to update candidate bio, links, and avatar.
  - Frontend card utilizing `BaseInput` and profile picture upload interface.

---

## 📚 Study Guides & Concept Collections (`KNOWLEDGE`)

### [KNOWLEDGE-001] Markdown Concept Viewer
* **Priority:** Low
- **Dependencies:** BOOT-005
- **Acceptance Criteria:**
  - Dynamic route to fetch study guide content.
  - Markdown-to-HTML parser component with code highlighting.

---

## 💻 Practice Sandbox (`PRACTICE`)

### [PRACTICE-001] Code Execution Sandbox
* **Priority:** High
- **Dependencies:** BOOT-004
- **Acceptance Criteria:**
  - Secure runtime environment to evaluate user code submission.
  - Real-time compilation and execution statistics feed.

---

## 🔁 Spaced Repetition (`REVISION`)

### [REVISION-001] Leitner Memory Scheduler
* **Priority:** High
- **Dependencies:** PRACTICE-001
- **Acceptance Criteria:**
  - Memory decay scheduling algorithm based on success/failure history.
  - Queue generator producing daily lists.

---

## 🏢 Company Pipeline Tracker (`COMPANY`)

### [COMPANY-001] CRM Board
* **Priority:** Medium
- **Dependencies:** AUTH-001
- **Acceptance Criteria:**
  - Add/edit target company applications.
  - Drag-and-drop card columns tracking application states.

---

## 📊 Performance Analytics (`ANALYTICS`)

### [ANALYTICS-001] Analytics Feed
* **Priority:** Medium
- **Dependencies:** REVISION-001
- **Acceptance Criteria:**
  - API generating metrics logs and charts.
  - Weekly success rate calculation.

---

## 🎛️ Unified Dashboard (`DASHBOARD`)

### [DASHBOARD-001] Portal Widgets
* **Priority:** Medium
- **Dependencies:** COMPANY-001, REVISION-001
- **Acceptance Criteria:**
  - Render revision card stack and next target interview details.
  - Display progress bars using `BaseProgress`.
