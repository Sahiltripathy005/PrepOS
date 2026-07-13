# PlacementOS: Design System & UI Architecture
**Document Version:** 1.0.0  
**Status:** Approved  
**Author:** Principal Product Designer & Design Systems Architect  

---

## Table of Contents
1. [Design Philosophy](#1-design-philosophy)
2. [Design Principles](#2-design-principles)
3. [Design Token Specification](#3-design-token-specification)
4. [Typography System](#4-typography-system)
5. [Color System](#5-color-system)
6. [Spacing System](#6-spacing-system)
7. [Layout Architecture](#7-layout-architecture)
8. [Navigation Architecture](#8-navigation-architecture)
9. [Component Hierarchy](#9-component-hierarchy)
10. [Reusable Module Library](#10-reusable-module-library)
11. [Dashboard Framework](#11-dashboard-framework)
12. [Widget System](#12-widget-system)
13. [Motion Guidelines](#13-motion-guidelines)
14. [Accessibility Guidelines](#14-accessibility-guidelines)
15. [Responsive Guidelines](#15-responsive-guidelines)
16. [Customization Architecture](#16-customization-architecture)
17. [Theme Engine](#17-theme-engine)
18. [UI Folder Structure](#18-ui-folder-structure)
19. [Component Naming Conventions](#19-component-naming-conventions)
20. [Design Checklist](#20-design-checklist)
21. [Future Design Evolution Strategy](#21-future-design-evolution-strategy)
22. [Summary (One-Page Design System Card)](#22-summary-one-page-design-system-card)

---

## 1. Design Philosophy

PlacementOS rejects the aesthetics of "AI hype" in favor of **Aesthetics of Utility**. The visual system is built around high information density, structural layout rules, low-contrast neutral tones, and keyboard-first workflows. It is modeled on high-performance developer workspaces like VS Code, Obsidian, GitHub, and Linear.

### The "Anti-AI Hype" Guardrails
* **No Synthetic Percentages:** Never display readiness estimations without listing the underlying formula and audit trail.
* **No Glowing Artifacts:** Floating glassmorphic card layers, neon pink-to-purple background gradients, and abstract animated particle canvases are strictly forbidden.
* **Density over White Space:** Keep spacing tight. Design the screen real estate to show critical preparation details clearly without requiring extensive scrolling.
* **Visual Timelessness:** Rely on monospaced labels, thin, pixel-perfect borders, and clear neutral grays.

---

## 2. Design Principles

* **Utilitarian Information Density:** UI elements are spaced to fit dense, structured data blocks (DSA logs, application queues) on a single screen without causing cognitive overload.
* **Explainable Visual Evidence:** Charts, indicators, and color states correspond directly to logged database records. If a progress bar shows amber, a tooltip must explain the calculation (e.g., *"Decayed by 12% due to 8 idle days"*).
* **Speed & Responsiveness:** Interactive modules must respond to keystrokes in under 50ms, with transitions completing in under 200ms to preserve a snappy, professional feel.
* **Keyboard-First Ergonomics:** UI navigation is structured to support keyboard shortcuts. Every interactive element requires a clear, high-contrast focus state.
* **Decoupled Themes:** The presentation layer is decoupled from the component engine. Custom layout presets, borders, and color scales are controlled via global CSS token properties.

---

## 3. Design Token Specification

Design tokens are structured as a JSON schema. Rather than hardcoding styles within components, developers reference these CSS variables:

```json
{
  "theme": {
    "colors": {
      "bg-primary": "var(--color-bg-primary)",
      "bg-secondary": "var(--color-bg-secondary)",
      "border-subtle": "var(--color-border-subtle)",
      "text-primary": "var(--color-text-primary)",
      "text-muted": "var(--color-text-muted)",
      "accent-solid": "var(--color-accent-solid)",
      "accent-hover": "var(--color-accent-hover)"
    },
    "spacing": {
      "xxs": "var(--spacing-xxs)",
      "xs": "var(--spacing-xs)",
      "sm": "var(--spacing-sm)",
      "md": "var(--spacing-md)",
      "lg": "var(--spacing-lg)"
    },
    "radius": {
      "none": "0px",
      "sm": "var(--radius-sm)",
      "md": "var(--radius-md)",
      "lg": "var(--radius-lg)"
    },
    "font": {
      "sans": "var(--font-sans)",
      "mono": "var(--font-mono)"
    },
    "motion": {
      "duration-fast": "var(--motion-duration-fast)",
      "duration-normal": "var(--motion-duration-normal)",
      "ease": "var(--motion-ease)"
    }
  }
}
```

---

## 4. Typography System

The typography scale enforces hierarchical order by pairing clean sans-serif UI elements with precise monospace metadata readouts:

* **Primary Sans-Serif Font (UI, Controls):** `Inter`, system-ui, sans-serif
* **Monospace Font (Code blocks, Metrics, Dates, Lists):** `JetBrains Mono`, SFMono-Regular, monospace

### Typography Token Scale

| Token Name | Font Family | Size (rem/px) | Line Height | Weight | Application |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `font-size-micro` | Monospace | 0.70rem (11.2px) | 1.00rem (16px) | 500 (Medium) | Small table metrics, timestamps |
| `font-size-sm` | Sans-Serif | 0.81rem (13px) | 1.15rem (18.4px) | 400 (Regular) | Standard grid data, labels |
| `font-size-body` | Sans-Serif | 0.87rem (14px) | 1.25rem (20px) | 400 (Regular) | Primary UI text, settings inputs |
| `font-size-meta` | Monospace | 0.87rem (14px) | 1.25rem (20px) | 500 (Medium) | Problem status badges, runtimes |
| `font-size-h3` | Sans-Serif | 1.00rem (16px) | 1.40rem (22.4px) | 600 (Semibold) | Sidebar headers, widget titles |
| `font-size-h2` | Sans-Serif | 1.25rem (20px) | 1.60rem (25.6px) | 600 (Semibold) | Main module title layouts |
| `font-size-h1` | Sans-Serif | 1.50rem (24px) | 1.85rem (29.6px) | 600 (Semibold) | Analytics summaries, dialog titles |

---

## 5. Color System

The color system uses neutral gray/zinc scales for backgrounds and structural borders, pairing them with functional highlight colors to represent status codes:

### Light Mode vs. Dark Mode Mapping

| Semantic Value | Dark Theme Variable (HEX) | Light Theme Variable (HEX) | Target UI Elements |
| :--- | :--- | :--- | :--- |
| `bg-primary` | `#09090b` (Zinc 950) | `#ffffff` (White) | Window background |
| `bg-secondary` | `#18181b` (Zinc 900) | `#f4f4f5` (Zinc 100) | Sidebar, card backgrounds |
| `border-subtle` | `#27272a` (Zinc 800) | `#e4e4e7` (Zinc 200) | Grid borders, dividers |
| `text-primary` | `#fafafa` (Zinc 50) | `#09090b` (Zinc 950) | Title headings, input text |
| `text-muted` | `#a1a1aa` (Zinc 400) | `#71717a` (Zinc 500) | Helper text, secondary metrics |
| `accent-solid` | `#2563eb` (Blue 600) | `#1d4ed8` (Blue 700) | Action buttons, focus indicators |
| `success-text` | `#10b981` (Emerald 500)| `#047857` (Emerald 700)| Solved problems, active alerts |
| `warning-text` | `#f59e0b` (Amber 500) | `#b45309` (Amber 700) | Revision decay reminders |
| `error-text` | `#f43f5e` (Rose 500) | `#be123c` (Rose 700) | Failed attempts, scheduling clashes|

---

## 6. Spacing System

PlacementOS uses a strict **4px baseline grid** to ensure consistent layout density across all views:

* `spacing-xxs` (4px): Inner component padding (e.g., checkbox margins, tag paddings).
* `spacing-xs` (8px): Micro spacing (e.g., input labels to input boxes, layout detail rows).
* `spacing-sm` (12px): Standard inner card padding, item list spacing.
* `spacing-md` (16px): Layout grid gaps, dashboard widget inner margins, header groups.
* `spacing-lg` (24px): Primary window layout paddings, sidebar column spacing.
* `spacing-xl` (32px): Empty space containers, structural dividers.

---

## 7. Layout Architecture

The viewport layout coordinates navigation, content areas, and context drawers using a responsive grid:

```
┌────────────────────────────────────────────────────────────────────────┐
│  Sidebar (Nav, Quick Search, User Info)                                │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │  Topbar (Breadcrumbs, Command Palette Trigger, Notifications)    │  │
│  │  ├─────────────────────────────────┬──────────────────────────┤  │  │
│  │  │                                 │                          │  │  │
│  │  │                                 │                          │  │  │
│  │  │  Workspace Area                 │  Right Context Drawer    │  │  │
│  │  │  (Dynamic Grid Widgets)         │  (Help, Filters, Notes)  │  │  │
│  │  │                                 │                          │  │  │
│  │  │                                 │                          │  │  │
│  │  └─────────────────────────────────┴──────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Layout Variants
* **Workspace View:** Focuses on code documentation, revision queues, and note editors. Minimizes distractions by hiding active sidebars.
* **Dashboard View:** Displays a high-density collection of modular information widgets.
* **Split View:** Divides the workspace vertically (50/50 or 60/40), enabling users to take notes in one panel while referencing code structures or problem logs in the other.
* **Focus Mode:** Hides sidebars and topbars entirely, presenting a distraction-free view for timing algorithms or running simulated interviews.

---

## 8. Navigation Architecture

Navigation is optimized for power users, enabling fast movement across the application using both keyboard shortcuts and search menus:

```
[Cmd + K] ──► [Command Palette] ──► [Jump to Practice Log]
                                 ├──► [Toggle Sidebar Navigation]
                                 └──► [Quick Search for Company Tracker]
```

* **Command Palette (Cmd+K):** A search menu containing index lists for all pages, search tools, and common actions (e.g., *"Log new attempt,"* *"Open calendar"*).
* **Sidebar:** A persistent collapsible bar (left side) displaying primary domains (Practice, Revision, Knowledge, Companies).
* **Navigation Path (Breadcrumbs):** Top-level path indicators (`practice / trees / LCA-of-binary-tree`) that double as navigation drop-downs.
* **Keyboard Shortcuts:**
  * `g` then `p`: Go to Practice Log.
  * `g` then `r`: Go to Revision Queue.
  * `c`: Create new attempt log.
  * `esc`: Close active modal, drawer, or search panel.

---

## 9. Component Hierarchy

Components are structured systematically to maintain clean separation of logic and presentation:

```
[Design Tokens] ──► [Primitives] ──► [Composites] ──► [Feature Modules] ──► [Pages]
```

1. **Primitives (Atomic UI elements):**
   * *Examples:* `BaseButton`, `BaseInput`, `BaseBadge`, `BaseSpinner`, `BaseCheckbox`.
   * *Constraints:* Style-only wrappers; they have no connection to domain state or business logic.
2. **Composites (Combined layout components):**
   * *Examples:* `FormGroup`, `ModalWrapper`, `CardLayout`, `DropdownMenu`.
   * *Constraints:* Combine primitives to form layout containers. Can manage transient visual states (e.g., dropdown open/closed states).
3. **Feature Modules (Domain-specific elements):**
   * *Examples:* `ProblemHistoryRow`, `STARAnswerEditor`, `CompanyStatusDropdown`.
   * *Constraints:* Bound to domain hooks (Zustand or TanStack Query mutations).
4. **Page Layers (Routing views):**
   * *Examples:* `DashboardView`, `CompanyKanbanBoard`, `KnowledgeLeafNodeView`.
   * *Constraints:* Define routing paths and coordinate component arrangements.

---

## 10. Reusable Module Library

Every module in the application is structured for reuse, defining clear props, styling variants, and fallback states:

* **Metric Card:**
  * *Purpose:* Displays a single, verifiable metric (e.g., Accuracy Rate: 72%).
  * *Variants:* Default (Medium), Compact (Small), Warning (Highlighted amber).
  * *State:* Hover details exposing calculation logic: `(solved_first_pass / total_attempts) * 100`.
* **Evidence Card:**
  * *Purpose:* Displays an audit log entry for user activity.
  * *Variants:* Success (Problem solved), Warning (Decayed review), Alert (Mock test fail).
  * *Interactive States:* Clicking opens a side panel detailing the database records for that entry.
* **Timeline:**
  * *Purpose:* Renders a vertical feed tracking historical logs (e.g., interview stage transitions, resume revisions).
* **Progress Block:**
  * *Purpose:* Displays relative values (e.g., 14 out of 20 solved) using a clean horizontal meter.
* **Coverage Indicator:**
  * *Purpose:* Renders conceptual coverage progress using nested grid blocks.
* **Activity Feed:**
  * *Purpose:* Displays chronological event streams (e.g., completed attempts, mock logs).
* **Revision Queue:**
  * *Purpose:* Lists items due for review, sorted by decay severity.
* **Heatmap:**
  * *Purpose:* An interactive grid showing consistent practice habits over time.
* **Calendar:**
  * *Purpose:* Tracks scheduled interview milestones and revision tasks.
* **Knowledge Tree:**
  * *Purpose:* Renders a hierarchical, collapsible folder navigation view of markdown study guides.
* **Topic Card:**
  * *Purpose:* Displays key stats for specific subjects (e.g., Heap Sort: 12 Solved, 2 Decaying).
* **Interview Card:**
  * *Purpose:* Captures details and interviewer feedback from mock test sessions.
* **Company Card:**
  * *Purpose:* Represents application progress within Kanban pipeline grids.
* **Project Card:**
  * *Purpose:* Tracks development progress using checklists and verified deployment links.
* **Statistics Panel:**
  * *Purpose:* Displays historical performance trends and logs.
* **Recommendation Panel:**
  * *Purpose:* Lists pending preparation targets, with tooltips explaining the recommendation logic.
* **Alert & Info Banners:**
  * *Purpose:* Highlights critical issues (e.g., scheduling clashes) or informational updates.
* **Fallback States (Empty, Loading, Error):**
  * *Purpose:* Displays consistent, user-friendly layouts when data is loading, missing, or fails to fetch.
* **Search Bar & Command Palette:**
  * *Purpose:* Keyboard-driven global search and action menus.
* **Quick Actions:**
  * *Purpose:* Radial or context menus for common shortcuts (e.g., logging a new attempt).
* **Context Menu:**
  * *Purpose:* Displays target options (e.g., delete, archive) on right-click.
* **Breadcrumbs & Tabs:**
  * *Purpose:* Horizontal navigation markers.
* **Side Panels:**
  * *Purpose:* Sliding context panels containing detail views, notes, or filter controls.

---

## 11. Dashboard Framework

The dashboard focuses on answering actionable questions rather than presenting generic metric summaries:

```
┌────────────────────────────────────────────────────────────────────────┐
│  PlacementOS Dashboard                                                 │
├────────────────────────────────────────────────────────────────────────┤
│  [Question: What needs my immediate attention today?]                   │
│  ┌───────────────────────────┬──────────────────────────────────────┐  │
│  │ Overdue Revision (3 Items)│ Next Interview: Company X (2 Days)   │  │
│  └───────────────────────────┴──────────────────────────────────────┘  │
│                                                                        │
│  [Question: How consistent has my practice been this month?]           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ [Heatmap: 24 Solved Attempts across 18 Active Days]              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  [Question: What are my primary algorithmic blind spots?]              │
│  ┌───────────────────────────┬──────────────────────────────────────┐  │
│  │ Weak Topic: Graphs        │ Top Error: Off-By-One (Array Loops)  │  │
│  │ (38% Avg First-Pass Acc)  │ (14 Logged Instances)                │  │
│  └───────────────────────────┴──────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

* **Overdue Revision Widget:** Displays items sorted by decay severity, answering: *"What concepts am I at risk of forgetting today?"*
* **Active Interview Pipeline Widget:** Displays the next active application step, answering: *"What is my next mock target?"*
* **Error Diagnosis Widget:** Lists the user's most common error tags, answering: *"What mistakes do I keep repeating?"*
* **Audit Trail Link:** Every widget includes an info icon. Clicking it opens a panel detailing the data behind the metric.

---

## 12. Widget System

Dashboard components use a modular design, enabling users to customize and resize widgets on their workspace:

```text
┌─────────────────────────┐   ┌─────────────────────────┐
│     Widget (1x1)        │   │      Widget (2x1)       │
│  • Title                │   │  • Title                │
│  • Main Metric          │   │  • Primary Chart        │
│  • Label                │   │  • Meta details         │
└─────────────────────────┘   └─────────────────────────┘
```

* **Standard Grid Sizing:** Widgets conform to a grid using one of four layouts: `1x1` (Small metrics), `2x1` (Horizontal lists), `2x2` (Charts, Kanban sections), or `Full-Width` (Heatmaps, Calendar tables).
* **Grid Placement:** Layout positions are saved to the user's settings profile in the database as layout coordinate objects.
* **Variant Theme Support:** Every widget supports two display densities:
  * *Default:* Standard spacing for high readability.
  * *Condensed:* Low-contrast, tight layout maximizing data density for power users.

---

## 13. Motion Guidelines

Animations are quick and functional, designed to improve spatial awareness rather than serve as decorative elements:

* **Easing Function:** `cubic-bezier(0.16, 1, 0.3, 1)` (Ultra-smooth Ease-Out Expo).
* **Timing Standards:**
  * *100ms (Immediate):* Hover states, button clicks, tooltips.
  * *150ms (Normal):* Dropdown menus, checkbox transitions, error banners.
  * *200ms (Layout):* Side panels sliding in, tab content cross-fades.
  * *250ms (Page):* Full page transitions.
* **Skeleton Loaders:** Skeleton states use a subtle pulsing animation (`opacity: 0.4` to `0.8`) with a `2000ms` cycle, avoiding distracting flashes.

---

## 14. Accessibility Guidelines

PlacementOS is designed to meet WCAG 2.1 AA accessibility standards:

* **Keyboard Navigation:** Every interactive element has a visible, high-contrast focus outline (`2px solid var(--color-accent-solid)`). Focus order follows logical layouts using standard tab indexes.
* **Contrast Compliance:** Text-to-background contrast ratios must meet or exceed **4.5:1** for standard body text and **3.0:1** for metadata tags.
* **Screen Reader Support:** All components use descriptive semantic tags or ARIA labels (e.g., `aria-expanded`, `aria-live="polite"`).
* **Color Independence:** Status changes do not rely on color alone. Status tags include descriptive text labels or distinct icons alongside color states (e.g., an amber warning badge is labeled *"Review Overdue"*).
* **Reduced Motion:** Respects user preferences. When `prefers-reduced-motion` is active, layout transitions are bypassed:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

---

## 15. Responsive Guidelines

The UI uses a responsive layout grid, adapting density and component configurations across different screen sizes:

* **Desktop Range (>1280px):** Full multi-panel layout showing the left navigation sidebar, main workspace, and right context panel simultaneously.
* **Tablet Range (768px - 1279px):**
  * The right context panel collapses into a sliding drawer toggle.
  * Multi-column lists convert into search-filtered tables.
  * Split views stack vertically.
* **Mobile Range (<767px):**
  * The left navigation sidebar collapses into a slide-out drawer menu.
  * Workspace grids scale to single-column layouts.
  * Large calendars transition to compact daily agenda views.

---

## 16. Customization Architecture

Themes and visual styles are controlled via CSS custom properties attached to the root document wrapper, enabling design changes without altering React components:

```text
[Theme Store (Zustand)] ──► [Applies Class/Data-Theme] ──► [CSS Custom Properties]
```

To update the style of the application:
1. **User Action:** The user updates a theme configuration (e.g., changing the border-radius).
2. **State Update:** The Zustand store updates, saving the preference and applying the configuration values.
3. **Property Injection:** Values are written as attributes on the `<html>` node:

```html
<html data-theme="dark" data-density="condensed" style="--radius-md: 2px;">
```

Components read these global tokens natively:
```css
.card {
  border-radius: var(--radius-md);
  background-color: var(--color-bg-secondary);
}
```

---

## 17. Theme Engine

The Theme Engine manages user preferences locally and supports standard layout configurations:

```typescript
interface IThemeSettings {
  themeMode: 'dark' | 'light' | 'system';
  accentScale: 'blue' | 'steel' | 'emerald' | 'gray';
  densityMode: 'comfortable' | 'condensed';
  borderRadiusPx: number;
}
```

### Preconfigured Styles
* **Slate Developer (Default):** Zinc grays, thin borders, blue highlights.
* **Forest Console:** Emerald highlights, warm backgrounds, high-contrast monospace text.
* **Monochrome Ink:** Pure black and white design, no colors except red system error alerts.

---

## 18. UI Folder Structure

UI components are organized by domain, separating common layout components from domain-specific features:

```text
/frontend/src
├── /components               # Shared, state-free UI components
│   ├── /ui
│   │   ├── Button.tsx
│   │   ├── Checkbox.tsx
│   │   └── Input.tsx
│   └── /layout
│       ├── Sidebar.tsx
│       └── Topbar.tsx
└── /domains                  # Domain-specific modules
    ├── /practice
    │   ├── /components       # Practice-specific components
    │   │   ├── AttemptLoggerModal.tsx
    │   │   └── PracticeHistoryList.tsx
    │   ├── /hooks
    │   │   └── usePracticeHistory.ts
    │   └── /stores
    │       └── practiceStore.ts
    └── /revision
        ├── /components
        │   ├── RevisionQueueCard.tsx
        │   └── DecayMeter.tsx
        └── /stores
            └── revisionStore.ts
```

---

## 19. Component Naming Conventions

* **Common Primitives:** Prefix with `Base` to identify shared, state-free UI elements (e.g., `BaseButton`, `BaseBadge`, `BaseModal`).
* **Domain Elements:** Prefix with the domain name (e.g., `PracticeLogCard`, `InterviewSTARBox`, `CompanyKanbanBox`).
* **Interactive Layout Containers:** Prefix with the view context (e.g., `WorkspaceSplitter`, `DashboardWidgetContainer`).
* **Form Schemas:** Suffix with `Schema` (e.g., `createAttemptFormSchema`).

---

## 20. Design Checklist

Before releasing a new UI component, verify it meets the following criteria:

- [ ] **Token Compliance:** Component uses CSS custom properties; no hardcoded styling values.
- [ ] **Contrast Check:** Text elements meet WCAG AA contrast standards.
- [ ] **Focus Indicator:** Interactive elements display outline focus rings on tab selection.
- [ ] **Theme Support:** Contrast and color hierarchy verified in both light and dark modes.
- [ ] **Reduced Motion:** Component respects system reduced motion settings.
- [ ] **Screen Reader Support:** Semantic HTML structures and appropriate ARIA attributes are defined.

---

## 21. Future Design Evolution Strategy

As the design system grows, use these guidelines to maintain structure:

* **Token Version Control:** Design tokens are versioned. Major token updates (e.g., changes to base spacing units) require updating token maps to prevent layouts from breaking.
* **Figma-to-Code Pipeline:** Ensure token variables share identical keys in Figma collections and CSS libraries, enabling future automated exports.
* **Performance Checks:** Verify dashboard layouts perform well on lower-spec machines by keeping re-renders minimal.

---

## 22. Summary (One-Page Design System Card)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        PlacementOS Design System                         │
├──────────────────────────────────────────────────────────────────────────┤
│ Fonts: Inter (UI Sans) • JetBrains Mono (Data Monospace)                 │
│ Theme Properties: --color-bg-primary • --color-border-subtle • --radius  │
│ Grid System: 4px baseline layout grid (4px / 8px / 12px / 16px / 24px)   │
├──────────────────────────────────────────────────────────────────────────┤
│                           CORE DESIGN SYSTEM RULES                       │
│ 1. Zero hardcoded colors/radii. Always reference design tokens.          │
│ 2. Use high information density. Avoid empty space or giant banners.     │
│ 3. Key actions must be keyboard-accessible (Cmd+K).                      │
│ 4. Widgets must show the source of their data via tooltips.              │
│ 5. Ensure components render correctly in both Dark and Light modes.      │
│ 6. No synthetic metrics. Color alerts must map directly to activity logs.│
└──────────────────────────────────────────────────────────────────────────┘
```

---
*End of Phase 1 Design System & UI Architecture Document.*
