const CSS_STYLING = `
:root {
  /* Font Family Tokens */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', SFMono-Regular, Consolas, monospace;

  /* Spacing baseline: 4px grid */
  --spacing-xxs: 4px;
  --spacing-xs: 8px;
  --spacing-sm: 12px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* Default Border Radius values */
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 8px;

  /* Motion */
  --motion-duration-fast: 100ms;
  --motion-duration-normal: 150ms;
  --motion-duration-layout: 200ms;
  --motion-duration-page: 250ms;
  --motion-ease: cubic-bezier(0.16, 1, 0.3, 1);
}

/* Theme base variables */
html[data-theme="light"] {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f4f4f5;
  --color-border-subtle: #e4e4e7;
  --color-text-primary: #09090b;
  --color-text-muted: #71717a;
  
  --color-accent-solid: #1d4ed8;
  --color-accent-hover: #1e40af;
  
  --color-success-text: #047857;
  --color-warning-text: #b45309;
  --color-error-text: #be123c;
}

html[data-theme="dark"] {
  --color-bg-primary: #09090b;
  --color-bg-secondary: #18181b;
  --color-border-subtle: #27272a;
  --color-text-primary: #fafafa;
  --color-text-muted: #a1a1aa;
  
  --color-accent-solid: #2563eb;
  --color-accent-hover: #3b82f6;
  
  --color-success-text: #10b981;
  --color-warning-text: #f59e0b;
  --color-error-text: #f43f5e;
}

/* Accent Overrides */
html[data-accent="steel"][data-theme="light"] {
  --color-accent-solid: #475569;
  --color-accent-hover: #334155;
}
html[data-accent="steel"][data-theme="dark"] {
  --color-accent-solid: #94a3b8;
  --color-accent-hover: #cbd5e1;
}

html[data-accent="emerald"][data-theme="light"] {
  --color-accent-solid: #047857;
  --color-accent-hover: #065f46;
}
html[data-accent="emerald"][data-theme="dark"] {
  --color-accent-solid: #10b981;
  --color-accent-hover: #34d399;
}

html[data-accent="gray"][data-theme="light"] {
  --color-accent-solid: #18181b;
  --color-accent-hover: #27272a;
}
html[data-accent="gray"][data-theme="dark"] {
  --color-accent-solid: #fafafa;
  --color-accent-hover: #f4f4f5;
}

/* Density Overrides */
html[data-density="condensed"] {
  --spacing-xxs: 2px;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;
}

/* Accessibility and resets */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-sans);
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

/* Focus outline standard */
*:focus-visible {
  outline: 2px solid var(--color-accent-solid);
  outline-offset: 2px;
}

/* Skeleton animation keyframes */
@keyframes pos-pulse {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
}

.pos-skeleton {
  animation: pos-pulse 2000ms var(--motion-ease) infinite;
  background-color: var(--color-border-subtle);
  border-radius: var(--radius-sm);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
`;

export function injectStyles(): void {
  if (typeof window === "undefined") return;
  const styleId = "placementos-design-system-styles";
  if (document.getElementById(styleId)) return;

  const styleEl = document.createElement("style");
  styleEl.id = styleId;
  styleEl.textContent = CSS_STYLING;
  document.head.appendChild(styleEl);
}
